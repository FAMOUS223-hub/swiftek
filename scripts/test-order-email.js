require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const orderStatusCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'css', 'email-order-status.css'), 'utf8');

const badgeColor = '#30d158';
const badgeIcon = '✓';
const heading = 'Order Confirmed';
const message = 'Good news! Your order has been confirmed and is being processed.';

const itemsList = `
<tr><td class="os-item-cell">iPhone 15 Pro Case<br><span class="os-item-specs">Matte Black, MagSafe</span></td><td class="os-item-qty">x2</td><td class="os-item-price">GH₵ 1,200.00</td></tr>
<tr><td class="os-item-cell">Tempered Glass Screen Protector</td><td class="os-item-qty">x3</td><td class="os-item-price">GH₵ 450.00</td></tr>
<tr><td class="os-item-cell">USB-C Fast Charger<br><span class="os-item-specs">20W, White</span></td><td class="os-item-qty">x1</td><td class="os-item-price">GH₵ 850.50</td></tr>
`;

const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${orderStatusCss}</style>
</head>
<body>
  <table class="os-outer-table" role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td class="os-wrapper" align="center">
        <table class="os-container" role="presentation" width="520" cellpadding="0" cellspacing="0">
          <tr>
            <td class="os-header">
              <table class="os-logo-table" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="os-logo-cell" align="center">S</td>
                  <td class="os-logo-gap"></td>
                  <td align="left" valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr><td class="os-brand-name">SwifTek</td></tr>
                      <tr><td class="os-brand-sub">Accessories</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div class="os-divider"></div>
            </td>
          </tr>
          <tr>
            <td class="os-content">
              <table class="os-badge-table" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="os-badge-cell" align="center" style="background:${badgeColor}20;">
                    <span class="os-badge-icon" style="color:${badgeColor};">${badgeIcon}</span>
                  </td>
                </tr>
              </table>
              <h1 class="os-heading">${heading}</h1>
              <p class="os-message">${message}</p>
              <table class="os-info-card" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="os-info-padding">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td class="os-info-label">Order Reference</td>
                        <td class="os-info-value">SWF-A1B2C-D3</td>
                      </tr>
                      <tr>
                        <td class="os-info-label-top">Date</td>
                        <td class="os-info-value-plain-top">12 June 2026</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h3 class="os-items-title">Items Ordered</h3>
              <table class="os-items-table" role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${itemsList}
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="os-total-border">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td class="os-total-label">Total</td>
                        <td class="os-total-amount">GH₵ 2,500.50</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p class="os-footer-text">SwifTek Accessories &mdash; Premium Tech Store</p>
              <p class="os-footer-sub">Accra, Ghana &middot; Built by Famous Tech</p>
              <p class="os-footer-link">Need help? Contact us on <a href="https://wa.me/22545277534">WhatsApp</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'SwifTek Accessories <nganbewuborijaamos@gmail.com>',
    to: 'nganbewuborijaamos@gmail.com',
    subject: 'Order Confirmed — SWF-A1B2C-D3 — SwifTek Accessories (TEST)',
    html: emailHtml
  });

  console.log('Test email sent:', info.messageId);
  console.log('Check your inbox at nganbewuborijaamos@gmail.com');
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
