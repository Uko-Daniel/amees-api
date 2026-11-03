// src/lib/emailTemplates.ts

const LOGO_URL = 'https://www.amees.com.ng/logo-email.png';
const BRAND_COLOR = '#0a0a0a'; // AMEES dark theme color
const ACCENT_COLOR = '#2563eb'; // Replace with your actual brand blue/green

// Neutral scale used across the templates
const TEXT_COLOR = '#27272a';
const MUTED_COLOR = '#71717a';
const LINE_COLOR = '#e4e4e7';
const SURFACE_COLOR = '#f4f4f5';

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO_STACK =
  "'SF Mono', SFMono-Regular, ui-monospace, Menlo, Consolas, 'Courier New', monospace";

interface BaseTemplateOptions {
  /** Short summary shown next to the subject line in the inbox list. */
  preheader?: string;
  /** Replaces the default line at the bottom of the footer. */
  footerNote?: string;
}

export function buildBaseTemplate(
  title: string,
  content: string,
  options: BaseTemplateOptions = {}
): string {
  const preheader = options.preheader
    ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all; font-size: 1px; line-height: 1px; color: ${SURFACE_COLOR};">${options.preheader}${'&nbsp;&zwnj;'.repeat(40)}</div>`
    : '';
  const footerNote =
    options.footerNote ?? 'This is an automated message, so replies to this address are not monitored.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>${title}</title>
      <style>
        @media only screen and (max-width: 620px) {
          .outer { padding: 16px 10px !important; }
          .body-cell { padding: 32px 22px !important; }
          .footer-cell { padding: 24px 22px !important; }
          .code { font-size: 30px !important; letter-spacing: 6px !important; padding: 16px 20px !important; }
          .stack { display: block !important; width: 100% !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${SURFACE_COLOR}; font-family: ${FONT_STACK}; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
      ${preheader}
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${SURFACE_COLOR};">
        <tr>
          <td align="center" class="outer" style="padding: 40px 20px;">
            <!--[if mso]><table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid ${LINE_COLOR};">

              <!-- Header -->
              <tr>
                <td align="center" style="padding: 36px 24px 32px 24px; background-color: ${BRAND_COLOR};">
                  <img src="${LOGO_URL}" alt="AMEES" width="150" style="display: block; width: 150px; max-width: 150px; height: auto; border: 0;" />
                </td>
              </tr>
              <tr>
                <td style="height: 4px; line-height: 4px; font-size: 4px; background-color: ${ACCENT_COLOR};">&nbsp;</td>
              </tr>

              <!-- Content -->
              <tr>
                <td class="body-cell" style="padding: 44px 40px 40px 40px; color: ${TEXT_COLOR}; line-height: 1.65; font-size: 16px;">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="footer-cell" align="center" style="padding: 28px 40px 32px 40px; background-color: #fafafa; border-top: 1px solid ${LINE_COLOR}; color: ${MUTED_COLOR}; font-size: 13px; line-height: 1.6;">
                  <p style="margin: 0 0 4px 0; color: ${TEXT_COLOR}; font-weight: 600;">AMEES</p>
                  <p style="margin: 0 0 4px 0;">Association of Mechatronics and Electrical &amp; Electronics Engineering Students</p>
                  <p style="margin: 0 0 18px 0;">Lead City University, Ibadan, Nigeria</p>
                  <p style="margin: 0 0 18px 0;">
                    <a href="https://www.amees.com.ng" style="color: ${ACCENT_COLOR}; text-decoration: none; font-weight: 600;">Website</a>
                    <span style="color: ${LINE_COLOR}; padding: 0 10px;">|</span>
                    <a href="https://www.amees.com.ng/sponsors" style="color: ${ACCENT_COLOR}; text-decoration: none; font-weight: 600;">Sponsorship</a>
                    <span style="color: ${LINE_COLOR}; padding: 0 10px;">|</span>
                    <a href="https://www.amees.com.ng/about" style="color: ${ACCENT_COLOR}; text-decoration: none; font-weight: 600;">About us</a>
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                    ${footerNote}
                  </p>
                </td>
              </tr>

            </table>
            <!--[if mso]></td></tr></table><![endif]-->
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function buildOtpTemplate(code: string): string {
  const content = `
    <h1 style="margin: 0 0 12px 0; color: ${BRAND_COLOR}; font-size: 26px; line-height: 1.25; font-weight: 700; letter-spacing: -0.3px;">Your sign-in code</h1>
    <p style="margin: 0 0 32px 0; color: ${TEXT_COLOR};">Enter this code to finish signing in to your AMEES account. It works for the next 10 minutes.</p>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 0 0 12px 0;">
          <span class="code" style="display: inline-block; padding: 20px 28px 20px 36px; background-color: ${SURFACE_COLOR}; border: 1px solid ${LINE_COLOR}; border-bottom: 3px solid ${ACCENT_COLOR}; border-radius: 10px; font-family: ${MONO_STACK}; font-size: 36px; line-height: 1; font-weight: 700; letter-spacing: 10px; color: ${BRAND_COLOR}; -webkit-user-select: all; user-select: all;">${code}</span>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0 0 32px 0; font-size: 13px; color: ${MUTED_COLOR};">
          Expires in 10 minutes. Tap or double-click the code to copy it.
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding: 16px 18px; background-color: #fafafa; border-left: 3px solid ${LINE_COLOR}; border-radius: 4px; font-size: 14px; line-height: 1.6; color: ${MUTED_COLOR};">
          <strong style="color: ${TEXT_COLOR};">Didn&rsquo;t ask for this code?</strong><br />
          You can ignore this email. No one can sign in without the code, and we will never ask you to share it.
        </td>
      </tr>
    </table>
  `;
  return buildBaseTemplate('Your AMEES Login Code', content, {
    preheader: `${code} is your AMEES sign-in code. It expires in 10 minutes.`,
  });
}

export function buildSponsorEnquiryTemplate(org: string, name: string, email: string, tier: string, msg: string, ip: string): string {
  const labelStyle = `padding: 0 0 4px 0; font-size: 13px; color: ${MUTED_COLOR};`;
  const valueStyle = `padding: 0 0 20px 0; font-size: 16px; line-height: 1.4; color: ${BRAND_COLOR}; font-weight: 600;`;

  const message = msg
    ? `<p style="margin: 0; white-space: pre-wrap; color: ${TEXT_COLOR};">${msg}</p>`
    : `<p style="margin: 0; color: ${MUTED_COLOR}; font-style: italic;">No message provided.</p>`;

  const content = `
    <h1 style="margin: 0 0 12px 0; color: ${BRAND_COLOR}; font-size: 26px; line-height: 1.25; font-weight: 700; letter-spacing: -0.3px;">New sponsorship enquiry</h1>
    <p style="margin: 0 0 28px 0;"><strong>${org}</strong> has just reached out through the sponsorship page on the AMEES website.</p>

    <!-- Details -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 0; margin: 0 0 8px 0; border-top: 1px solid ${LINE_COLOR};">
      <tr>
        <td style="padding: 24px 0 0 0;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td class="stack" width="50%" valign="top" style="padding-right: 12px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr><td style="${labelStyle}">Organisation</td></tr>
                  <tr><td style="${valueStyle}">${org}</td></tr>
                </table>
              </td>
              <td class="stack" width="50%" valign="top">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr><td style="${labelStyle}">Contact name</td></tr>
                  <tr><td style="${valueStyle}">${name}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="stack" width="50%" valign="top" style="padding-right: 12px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr><td style="${labelStyle}">Email</td></tr>
                  <tr><td style="${valueStyle}"><a href="mailto:${email}" style="color: ${ACCENT_COLOR}; text-decoration: none; word-break: break-all;">${email}</a></td></tr>
                </table>
              </td>
              <td class="stack" width="50%" valign="top">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr><td style="${labelStyle}">Tier of interest</td></tr>
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <span style="display: inline-block; padding: 4px 12px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; font-size: 14px; line-height: 1.4; font-weight: 600; color: ${ACCENT_COLOR};">${tier}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Message -->
    <p style="margin: 0 0 8px 0; font-size: 13px; color: ${MUTED_COLOR};">Their message</p>
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 18px 20px; background-color: #fafafa; border: 1px solid ${LINE_COLOR}; border-left: 4px solid ${ACCENT_COLOR}; border-radius: 6px; font-size: 15px; line-height: 1.65;">
          ${message}
        </td>
      </tr>
    </table>

    <!-- Call to action -->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 8px auto;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: ${ACCENT_COLOR};">
          <a href="mailto:${email}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px;">Reply to ${name}</a>
        </td>
      </tr>
    </table>
    <p style="margin: 12px 0 28px 0; text-align: center; font-size: 13px; color: ${MUTED_COLOR};">Opens a new email addressed to ${email}</p>

    <p style="margin: 0; padding-top: 16px; border-top: 1px solid ${LINE_COLOR}; font-size: 12px; color: #a1a1aa;">Submitted from IP address <span style="font-family: ${MONO_STACK};">${ip}</span></p>
  `;
  return buildBaseTemplate('New Sponsor Enquiry', content, {
    preheader: `${name} from ${org} is interested in the ${tier} tier.`,
    footerNote: 'This notification was sent by the AMEES website. Use the button above to reply to the sender.',
  });
}