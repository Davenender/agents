require("dotenv").config();
const express = require("express");
const { Resend } = require("resend");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { confirmationEmail } = require("./emails/confirmation");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.static("public"));
app.use(express.json());

// ─── Stripe Checkout Session erstellen ───────────────────────────────────────
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: req.body.email || undefined, // optional: E-Mail vorab übergeben
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Produkt X",
              description: "Beschreibung von Produkt X",
              // images: ["https://deine-domain.de/produkt-bild.jpg"],
            },
            unit_amount: 2999, // Preis in Cent → 29,99 €
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // session_id wird an die Erfolgsseite übergeben → für Bestätigungsmail
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Fehler:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Bestätigungsmail nach Zahlung senden ────────────────────────────────────
app.post("/send-confirmation", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId fehlt" });
  }

  try {
    // Stripe Session abrufen und Zahlung verifizieren
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Zahlung noch nicht abgeschlossen" });
    }

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "Kunde";

    if (!customerEmail) {
      return res.status(400).json({ error: "Keine E-Mail-Adresse gefunden" });
    }

    // Betrag formatieren (Stripe liefert Cent)
    const amount = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: session.currency.toUpperCase(),
    }).format(session.amount_total / 100);

    // E-Mail-Template aufbauen
    const { subject, html } = confirmationEmail({
      customerName,
      productName: "Produkt X",
      amount,
      orderId: session.id,
    });

    // Mail über Resend versenden
    const { data, error } = await resend.emails.send({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: customerEmail,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Fehler:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Bestätigungsmail gesendet an ${customerEmail} (ID: ${data.id})`);
    res.json({ success: true, emailId: data.id });
  } catch (error) {
    console.error("Fehler beim Senden:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Server starten ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
