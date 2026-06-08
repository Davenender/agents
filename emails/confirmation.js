/**
 * Gibt das HTML für die Bestellbestätigungsmail zurück.
 * @param {object} params
 * @param {string} params.customerName  - Name des Käufers (oder "Kunde" als Fallback)
 * @param {string} params.productName   - Name des Produkts
 * @param {string} params.amount        - Formatierter Betrag, z.B. "29,99 €"
 * @param {string} params.orderId       - Stripe Session ID (als Bestellnummer)
 */
function confirmationEmail({ customerName, productName, amount, orderId }) {
  return {
    subject: `Deine Bestellung: ${productName} ✅`,
    html: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#635bff;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:white;font-size:24px;font-weight:700;">Vielen Dank für deinen Kauf! 🎉</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;">
                Hallo <strong>${customerName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                deine Zahlung war erfolgreich. Wir haben deine Bestellung erhalten und bestätigt.
              </p>

              <!-- Bestellübersicht -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Bestellübersicht</p>
                    <table width="100%">
                      <tr>
                        <td style="color:#374151;font-size:15px;padding-bottom:8px;">${productName}</td>
                        <td style="color:#374151;font-size:15px;font-weight:700;text-align:right;padding-bottom:8px;">${amount}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;">
                          <span style="color:#9ca3af;font-size:12px;">Bestellnr.: ${orderId.slice(-12).toUpperCase()}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Bei Fragen antworte einfach auf diese E-Mail — wir helfen dir gerne weiter.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://deine-domain.de" style="display:inline-block;background:#635bff;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                      Zum Kundenbereich →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                © ${new Date().getFullYear()} ${productName} · Du erhältst diese Mail, weil du ein Produkt gekauft hast.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

module.exports = { confirmationEmail };
