// src/lib/emailTemplates.ts

const SITE_COLORS = {
  bg: '#FBF2E1',
  fg: '#1B0F4B',
  blue: '#2F57D1',
  yellow: '#F6D44B',
  green: '#6FE0A5',
  muted: '#5A5683',
  panel: '#FFF7EA',
  panel2: '#FCE6CB',
  line: '#1B0F4B',
};

const FONT = "'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const BASE_HEAD = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="x-apple-disable-message-reformatting">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body { margin:0; padding:0; -webkit-text-size-adjust:100% }
      a { color: ${SITE_COLORS.blue} }
      @media (max-width:620px) {
        .w { width:100%!important }
        .px { padding-left:14px!important; padding-right:14px!important }
        .st { display:block!important; width:100%!important; padding:0 0 10px!important }
      }
    </style>
  </head>
`;

const buildButton = (href: string, label: string, bgColor = SITE_COLORS.blue, textColor = '#FFFFFF') => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px">
    <tr>
      <td style="background:${SITE_COLORS.fg}">
        <table role="presentation" cellpadding="0" cellspacing="0" style="padding:0 5px 5px 0">
          <tr>
            <td bgcolor="${bgColor}" style="background:${bgColor};border:3px solid ${SITE_COLORS.fg}">
              <a href="${href}" style="display:inline-block;padding:14px 24px;font:700 14px/1 ${FONT};letter-spacing:.06em;text-transform:uppercase;color:${textColor};text-decoration:none">${label}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const buildTape = (text: string, color: string) => `
  <div style="background:${color};background-image:repeating-linear-gradient(-45deg,rgba(27,15,75,.16) 0,rgba(27,15,75,.16) 10px,transparent 10px,transparent 20px);border-top:3px solid ${SITE_COLORS.fg};border-bottom:3px solid ${SITE_COLORS.fg};padding:8px 0;overflow:hidden;white-space:nowrap;font:700 11px/1 ${FONT};letter-spacing:.18em;text-transform:uppercase;color:${SITE_COLORS.fg}">
    ${text} &nbsp;&bull;&nbsp; ${text} &nbsp;&bull;&nbsp; ${text}
  </div>
`;

// ---------------------------------------------------------
// 1. SEMI-FORMAL (Exec Notice)
// ---------------------------------------------------------
export function buildSemiFormalTemplate(data: any) {
  return `
    ${BASE_HEAD}
    <body style="margin:0;padding:0;background:${SITE_COLORS.bg}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.bg}">
        <tr><td align="center" class="px" style="padding:18px 12px">
          <table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%">
            <tr><td>${buildTape('Connecting minds through innovation', SITE_COLORS.yellow)}</td></tr>
            
            <tr><td style="padding:18px 0 16px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" height="36" align="center" bgcolor="${SITE_COLORS.blue}" style="background:${SITE_COLORS.blue};color:#fff;font:700 20px/36px ${FONT};width:36px;height:36px">A</td>
                        <td style="padding-left:12px;font:700 15px/1 ${FONT};letter-spacing:.18em;color:${SITE_COLORS.fg}">AMEES</td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="font:700 11px/1.3 ${FONT};letter-spacing:.14em;color:${SITE_COLORS.muted};text-transform:uppercase">Notice No. ${data.refNumber || '07'}</td>
                </tr>
              </table>
            </td></tr>

            <tr><td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.fg}">
                <tr><td style="padding:0 6px 6px 0">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.panel};border:3px solid ${SITE_COLORS.fg}">
                    <tr><td style="padding:0">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:${SITE_COLORS.fg};padding:11px 18px;font:700 12px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#fff">${data.headerLabel || 'AMEES · Notice'}</td>
                          <td align="right" style="background:${SITE_COLORS.fg};padding:11px 18px;font:400 12px/1 ${FONT};letter-spacing:.06em;text-transform:uppercase;color:#fff">${data.date}</td>
                        </tr>
                      </table>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr><td style="background:${SITE_COLORS.panel};padding:22px 22px 24px">
                          <div style="font:700 11px/1.6 ${FONT};color:${SITE_COLORS.blue};letter-spacing:.14em;text-transform:uppercase">${data.kicker || 'Executive meeting'}</div>
                          <div style="font:700 28px/1.2 ${FONT};color:${SITE_COLORS.fg};text-transform:uppercase;margin:8px 0 16px">${data.subject}</div>
                          
                          <div style="font:400 15px/1.6 ${FONT};color:${SITE_COLORS.fg};margin-bottom:16px">${data.bodyContent}</div>
                          
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0">
                            ${data.details.map((d: any) => `
                              <tr>
                                <td width="90" valign="top" style="padding:10px 0;border-bottom:2px dashed ${SITE_COLORS.fg};font:700 11px/1.6 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${SITE_COLORS.muted}">${d.label}</td>
                                <td valign="top" style="padding:10px 0;border-bottom:2px dashed ${SITE_COLORS.fg};font:400 15px/1.5 ${FONT};color:${SITE_COLORS.fg}">${d.value}</td>
                              </tr>
                            `).join('')}
                          </table>

                          ${data.ctaUrl ? buildButton(data.ctaUrl, data.ctaLabel || 'Add to calendar') : ''}
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>

            <tr><td style="padding:22px 0 0">${buildTape('Connecting minds through innovation', SITE_COLORS.yellow)}</td></tr>
            <tr><td align="center" style="padding:14px 8px 10px;font:400 12px/1.7 ${FONT};color:${SITE_COLORS.muted}">
              <div><a href="https://amees.com.ng" style="color:${SITE_COLORS.blue};margin:0 7px">amees.com.ng</a><a href="https://amees.com.ng/calendar" style="color:${SITE_COLORS.blue};margin:0 7px">Calendar</a></div>
              <div>AMEES · Lead City University, Ibadan</div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>
  `;
}

// ---------------------------------------------------------
// 2. LIVE EVENT (Live Alerts)
// ---------------------------------------------------------
export function buildLiveEventTemplate(data: any) {
  return `
    ${BASE_HEAD}
    <body style="margin:0;padding:0;background:${SITE_COLORS.bg}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.bg}">
        <tr><td align="center" class="px" style="padding:18px 12px">
          <table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%">
            <tr><td>${buildTape('Live alerts from AMEES', SITE_COLORS.green)}</td></tr>
            
            <tr><td style="padding:18px 0 16px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" height="36" align="center" bgcolor="${SITE_COLORS.blue}" style="background:${SITE_COLORS.blue};color:#fff;font:700 20px/36px ${FONT};width:36px;height:36px">A</td>
                        <td style="padding-left:12px;font:700 15px/1 ${FONT};letter-spacing:.18em;color:${SITE_COLORS.fg}">AMEES</td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="font:700 11px/1.3 ${FONT};letter-spacing:.14em;color:${SITE_COLORS.muted};text-transform:uppercase">Live update</td>
                </tr>
              </table>
            </td></tr>

            <tr><td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.fg}">
                <tr><td style="padding:0 6px 6px 0">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.panel};border:3px solid ${SITE_COLORS.fg}">
                    <tr><td style="padding:0">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:${SITE_COLORS.fg};padding:10px 16px">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="14" height="14" style="width:14px;height:14px;background:${SITE_COLORS.green};border:2px solid #fff;font-size:1px">&nbsp;</td>
                                <td style="padding-left:10px;font:700 13px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#fff">Live now</td>
                              </tr>
                            </table>
                          </td>
                          <td align="right" style="background:${SITE_COLORS.fg};padding:10px 16px;font:400 12px/1 ${FONT};color:#fff;letter-spacing:.06em">${data.time}</td>
                        </tr>
                      </table>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr><td style="background:${SITE_COLORS.panel};padding:22px">
                          <div style="font:700 11px/1.6 ${FONT};color:${SITE_COLORS.blue};letter-spacing:.14em;text-transform:uppercase">${data.eventName}</div>
                          <div style="font:700 30px/1.2 ${FONT};color:${SITE_COLORS.fg};text-transform:uppercase;margin:8px 0 12px">${data.subject}</div>
                          <div style="font:400 17px/1.6 ${FONT};color:${SITE_COLORS.fg};margin-bottom:12px">${data.bodyContent}</div>
                          
                          ${data.details.map((d: any) => `
                            <div style="font:400 15px/1.6 ${FONT};color:${SITE_COLORS.fg}"><b style="color:${SITE_COLORS.muted};font-size:11px;letter-spacing:.1em;text-transform:uppercase">${d.label}</b> &nbsp; ${d.value}</div>
                          `).join('')}
                          
                          ${data.ctaUrl ? buildButton(data.ctaUrl, data.ctaLabel || 'Open the live page') : ''}
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>
            
            <tr><td style="padding:22px 0 0">${buildTape('Live alerts from AMEES', SITE_COLORS.green)}</td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>
  `;
}

// ---------------------------------------------------------
// 3. FORMAL (Letterhead & Invitation)
// ---------------------------------------------------------
export function buildFormalTemplate(data: any) {
  return `
    ${BASE_HEAD}
    <body style="margin:0;padding:0;background:#F3F4FA">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4FA">
        <tr><td align="center" class="px" style="padding:18px 12px">
          <table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%">
            <tr><td style="padding-top:18px"></td></tr>
            <tr><td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-top:4px solid ${SITE_COLORS.fg}">
                
                <!-- FORMAL LETTERHEAD -->
                <tr><td style="padding:32px 36px 8px">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="top">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td valign="top" width="44">
                              <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr><td width="44" height="44" align="center" bgcolor="${SITE_COLORS.blue}" style="background:${SITE_COLORS.blue};color:#fff;font:700 24px/44px ${FONT};width:44px;height:44px">A</td></tr>
                              </table>
                            </td>
                            <td valign="top" style="padding-left:14px">
                              <div style="font:700 20px/1.2 ${FONT};letter-spacing:.14em;color:${SITE_COLORS.fg}">AMEES</div>
                              <div style="font:400 11px/1.5 ${FONT};color:${SITE_COLORS.muted}">Association of Mechatronics and Electrical and Electronics Engineering Students<br>Lead City University, Ibadan</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" valign="top" style="font:400 11px/1.6 ${FONT};color:${SITE_COLORS.muted}">
                        ${data.refNumber || 'AMEES/EXEC/2026/014'}<br>${data.date}
                      </td>
                    </tr>
                  </table>
                  <div style="height:8px;margin-top:16px;border-bottom:2px solid ${SITE_COLORS.fg};background-image:repeating-linear-gradient(90deg,${SITE_COLORS.fg} 0,${SITE_COLORS.fg} 1px,transparent 1px,transparent 8px)"></div>
                </td></tr>

                <!-- FORMAL BODY -->
                <tr><td style="padding:12px 36px 8px">
                  <div style="font:700 10px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${SITE_COLORS.muted};margin-bottom:6px">Addressed to</div>
                  <div style="font:400 14px/1.7 Georgia,'Times New Roman',serif;color:#222233;line-height:1.5">${data.recipientName || 'The Chief Executive Officer'}</div>
                  <div style="font:400 14px/1.7 Georgia,'Times New Roman',serif;color:#222233;line-height:1.5">${data.recipientOrg || 'Organisation name'}</div>
                  
                  <div style="height:18px"></div>
                  <div style="font:700 10px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${SITE_COLORS.muted};margin-bottom:6px">Subject</div>
                  <div style="font:700 20px/1.3 ${FONT};color:${SITE_COLORS.fg}">${data.subject}</div>
                  
                  <div style="height:16px"></div>
                  <div style="font:400 15px/1.7 Georgia,'Times New Roman',serif;color:#222233;margin-bottom:10px">Dear Sir or Madam,</div>
                  
                  <div style="font:400 15px/1.7 Georgia,'Times New Roman',serif;color:#222233;margin-bottom:12px">${data.bodyContent}</div>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;background:#E3E9FA;border-left:3px solid ${SITE_COLORS.blue}">
                    <tr><td style="padding:10px 18px">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${data.details.map((d: any) => `
                          <tr>
                            <td width="80" valign="top" style="padding:9px 0;border-bottom:1px solid #C9D3F0;font:700 10px/1.9 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${SITE_COLORS.muted}">${d.label}</td>
                            <td valign="top" style="padding:9px 0;border-bottom:1px solid #C9D3F0;font:400 14px/1.5 ${FONT};color:${SITE_COLORS.fg}">${d.value}</td>
                          </tr>
                        `).join('')}
                      </table>
                    </td></tr>
                  </table>

                  ${data.ctaUrl ? buildButton(data.ctaUrl, data.ctaLabel || 'Confirm attendance', SITE_COLORS.fg) : ''}

                  <div style="height:14px"></div>
                  <div style="font:400 15px/1.7 Georgia,'Times New Roman',serif;color:#222233;margin-bottom:14px">${data.closingText || 'We look forward to welcoming you.'}</div>
                  <div style="font:400 15px/1.7 Georgia,'Times New Roman',serif;color:#222233;margin-bottom:34px">Yours faithfully,</div>
                  
                  <div style="font:700 15px/1.4 Georgia,'Times New Roman',serif;color:#222233">${data.senderName || 'Full name'}</div>
                  <div style="font:400 13px/1.7 Georgia,'Times New Roman',serif;color:${SITE_COLORS.muted}">${data.senderRole || 'President, AMEES'}</div>
                </td></tr>

                <tr><td style="padding:18px 36px 26px">
                  <div style="border-top:1px solid #DDE0EE;padding-top:12px;font:400 12px/1.7 ${FONT};color:${SITE_COLORS.muted}">
                    ${data.enclosures ? `<div><b style="color:${SITE_COLORS.fg}">Enclosure:</b> ${data.enclosures}</div>` : ''}
                    <div><b style="color:${SITE_COLORS.fg}">Sent by:</b> AMEES Executive Council</div>
                  </div>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>
  `;
}

// ---------------------------------------------------------
// 4. INFORMAL (General Announcement)
// ---------------------------------------------------------
export function buildInformalTemplate(data: any) {
  return `
    ${BASE_HEAD}
    <body style="margin:0;padding:0;background:${SITE_COLORS.bg}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.bg}">
        <tr><td align="center" class="px" style="padding:18px 12px">
          <table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%">
            <tr><td>${buildTape('Connecting minds through innovation', SITE_COLORS.yellow)}</td></tr>
            
            <tr><td style="padding:18px 0 16px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" height="36" align="center" bgcolor="${SITE_COLORS.blue}" style="background:${SITE_COLORS.blue};color:#fff;font:700 20px/36px ${FONT};width:36px;height:36px">A</td>
                        <td style="padding-left:12px;font:700 15px/1 ${FONT};letter-spacing:.18em;color:${SITE_COLORS.fg}">AMEES</td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="font:700 11px/1.3 ${FONT};letter-spacing:.14em;color:${SITE_COLORS.muted};text-transform:uppercase">Signal: strong</td>
                </tr>
              </table>
            </td></tr>

            <tr><td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.fg}">
                <tr><td style="padding:0 6px 6px 0">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.blue};border:3px solid ${SITE_COLORS.fg}">
                    <tr><td style="padding:24px">
                      <div style="font:700 12px/1.6 ${FONT};color:${SITE_COLORS.yellow};letter-spacing:.14em;text-transform:uppercase">${data.kicker || 'Hardware bootcamp'}</div>
                      <div style="font:700 38px/1.1 ${FONT};color:#fff;text-transform:uppercase;margin:10px 0 14px">${data.subject}</div>
                      <div style="font:400 16px/1.6 ${FONT};color:#fff;">${data.bodyContent}</div>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>

            <tr><td style="height:20px;font-size:1px">&nbsp;</td></tr>
            
            <tr><td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${data.details.slice(0, 3).map((d: any) => `
                    <td class="st" width="33%" valign="top" style="padding-right:10px">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SITE_COLORS.fg}">
                        <tr><td style="padding:0 6px 6px 0">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:3px solid ${SITE_COLORS.fg}">
                            <tr><td style="padding:10px 12px">
                              <div style="font:700 10px/1.6 ${FONT};color:${SITE_COLORS.muted};letter-spacing:.12em;text-transform:uppercase">${d.label}</div>
                              <div style="font:700 16px/1.3 ${FONT};color:${SITE_COLORS.fg}">${d.value}</div>
                            </td></tr>
                          </table>
                        </td></tr>
                      </table>
                    </td>
                  `).join('')}
                </tr>
              </table>
            </td></tr>

            <tr><td style="height:20px;font-size:1px">&nbsp;</td></tr>
            
            <tr><td>
               ${data.ctaUrl ? buildButton(data.ctaUrl, data.ctaLabel || 'Save my seat', SITE_COLORS.yellow, SITE_COLORS.fg) : ''}
            </td></tr>

            <tr><td style="padding:22px 0 0">${buildTape('Connecting minds through innovation', SITE_COLORS.yellow)}</td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>
  `;
}

// ---------------------------------------------------------
// 5. OTP / Sign-in code (semi-corporate, system variant)
// ---------------------------------------------------------

// Richer head used only by the OTP template (keeps the original BASE_HEAD
// untouched so the other four templates don't change look).
const RICH_BASE_HEAD = `
  <!doctype html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Your AMEES sign-in code</title>
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
      table,td{mso-table-lspace:0;mso-table-rspace:0}
      body{margin:0!important;padding:0!important;width:100%!important}
      a{color:${SITE_COLORS.blue}}
      @media (max-width:620px){
        .w{width:100%!important}
        .px{padding-left:18px!important;padding-right:18px!important}
        .stack{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}
        .h1{font-size:30px!important;line-height:1.08!important}
        .hide{display:none!important}
        .full{width:100%!important}
        .eq,.eqc{height:auto!important}
      }
      .eq{height:132px}.eqc{height:66px}
      @media (prefers-color-scheme:dark){
        .bg{background-color:#130F31!important;background-image:linear-gradient(#26236A 1px,transparent 1px),linear-gradient(90deg,#26236A 1px,transparent 1px)!important;}
        .card{background-color:#262063!important}
        .panel{background-color:#1E1950!important}
        .tint{background-color:#2B2A7A!important}
        .fg,.fg a{color:#EDEAFF!important}
        .mu{color:#A9A5D8!important}
        .ln{border-color:#8A94F5!important}
        .bar{background-color:#3340C9!important}
        .btn{background-color:#4C66F0!important}
        .lk{color:#93A8FF!important}
        .hair{border-color:#3A3680!important}
      }
    </style>
  </head>
`;

const escHtml = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface OtpTemplateOptions {
  /** First name / display name to greet. Defaults to "there". */
  name?: string;
  /** Where the code is for, e.g. "Workbench", "Admin Panel", "Student Portal". */
  purpose?: string;
  /** Shown in the "For" row. Defaults to the purpose. */
  forLabel?: string;
  /** How long the code is valid, in minutes. Defaults to 10. */
  expiresInMinutes?: number;
  /** CTA href. Defaults to https://amees.com.ng/workbench */
  actionUrl?: string;
  /** CTA label. Defaults to "Open the Workbench". */
  actionLabel?: string;
}

export function buildOtpTemplate(code: string, opts: OtpTemplateOptions = {}) {
  const digits = String(code || '').padStart(6, '0').slice(0, 6).split('');
  const displayCode = digits.join(' ');
  const name = escHtml(opts.name ?? 'there');
  const purpose = escHtml(opts.purpose ?? 'Workbench');
  const purposeLower = purpose.toLowerCase();
  const forLabel = escHtml(opts.forLabel ?? purpose);
  const expiresIn = opts.expiresInMinutes ?? 10;
  const actionUrl = opts.actionUrl ?? 'https://amees.com.ng/workbench';
  const actionLabel = escHtml(opts.actionLabel ?? 'Open the Workbench');

  const digitCells = digits
    .map(
      (d, i) =>
        `<td width="46" height="58" class="bar" bgcolor="${SITE_COLORS.fg}" align="center" style="width:46px;height:58px;border:3px solid ${SITE_COLORS.fg};font:700 32px/52px 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:#FFFFFF">${d}</td>` +
        (i < digits.length - 1 ? `<td width="6" style="width:6px;font-size:0">&nbsp;</td>` : '')
    )
    .join('');

  const dashedRow = (label: string, value: string, withTop = true) => `
    <tr>
      <td class="hair mu" width="96" valign="top" style="${withTop ? `border-top:2px dashed ${SITE_COLORS.fg};` : ''}padding:10px 12px 10px 0;font:700 11px/1.7 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${SITE_COLORS.muted}">${label}</td>
      <td class="hair fg" valign="top" style="${withTop ? `border-top:2px dashed ${SITE_COLORS.fg};` : ''}padding:10px 0;font:400 15px/1.5 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.fg}">${value}</td>
    </tr>`;

  return `
    ${RICH_BASE_HEAD}
    <body class="bg" style="margin:0;padding:0;background-color:${SITE_COLORS.bg};background-image:linear-gradient(#D5DCF1 1px,transparent 1px),linear-gradient(90deg,#D5DCF1 1px,transparent 1px);background-size:28px 28px;">
    <div role="article" aria-roledescription="email" lang="en">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="bg" bgcolor="${SITE_COLORS.bg}" style="background-color:${SITE_COLORS.bg};background-image:linear-gradient(#D5DCF1 1px,transparent 1px),linear-gradient(90deg,#D5DCF1 1px,transparent 1px);background-size:28px 28px;">
      <tr><td align="center" style="padding:28px 12px 40px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="w" style="width:600px;max-width:600px">

          <!-- hidden preheader -->
          <tr><td style="padding:0">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${SITE_COLORS.bg}">Your AMEES ${purpose} sign-in code is ${displayCode}. It expires in ${expiresIn} minutes.&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
          </td></tr>

          <!-- yellow tape -->
          <tr><td style="padding:0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed">
              <tr><td height="32" bgcolor="${SITE_COLORS.yellow}" style="height:32px;background-image:repeating-linear-gradient(-45deg,rgba(27,15,75,.16) 0,rgba(27,15,75,.16) 10px,transparent 10px,transparent 20px);font:700 12px/32px 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${SITE_COLORS.fg};white-space:nowrap;overflow:hidden;border-top:3px solid ${SITE_COLORS.fg};border-bottom:3px solid ${SITE_COLORS.fg}" align="center">Automated message &bull; Do not reply &bull; Automated message &bull; Do not reply &bull; Automated message &bull; Do not reply &bull; Automated message &bull; Do not reply &bull; </td></tr>
            </table>
          </td></tr>

          <tr><td style="padding:0"><div style="height:22px;line-height:22px;font-size:0">&nbsp;</div></td></tr>

          <!-- logo row -->
          <tr><td style="padding:0 4px 20px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="40" valign="middle">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr><td width="38" height="38" bgcolor="${SITE_COLORS.blue}" align="center" valign="middle" style="width:38px;height:38px;font:700 22px/38px 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:#FFFFFF;text-align:center">A</td></tr>
                  </table>
                </td>
                <td valign="middle" style="padding-left:12px" class="fg">
                  <span class="fg" style="font:700 18px/1 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.14em;color:${SITE_COLORS.fg}">AMEES</span>
                </td>
                <td align="right" class="mu" style="font:700 11px/1.4 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${SITE_COLORS.muted}">${purpose}</td>
              </tr>
            </table>
          </td></tr>

          <!-- card -->
          <tr><td style="padding:0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td class="ln" style="border-right:5px solid ${SITE_COLORS.fg};border-bottom:5px solid ${SITE_COLORS.fg}">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="ln" style="border:3px solid ${SITE_COLORS.fg}">
                    <tr>
                      <td class="bar" bgcolor="${SITE_COLORS.fg}" style="padding:9px 14px;font:700 12px/1.2 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FFFFFF">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font:700 12px/1.2 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FFFFFF">AMEES &middot; ${purpose}</td>
                            <td align="right" style="font:400 12px/1.2 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.06em;color:#FFFFFF;opacity:.85">One-time code</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="card px" bgcolor="${SITE_COLORS.panel}" style="padding:24px 26px">
                        <span class="lk" style="font:700 11px/1.4 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${SITE_COLORS.blue}">Sign in</span>
                        <h1 class="h1 fg" style="margin:8px 0 14px;font:700 34px/1.05 'Space Grotesk','Helvetica Neue',Arial,sans-serif;text-transform:uppercase;color:${SITE_COLORS.fg}">Your sign-in code</h1>
                        <p class="fg" style="margin:0 0 20px;font:400 16px/1.65 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.fg}">Hi ${name}, use this code to open your ${purposeLower}. It works once and expires in ${expiresIn} minutes.</p>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left">
                          <tr>${digitCells}</tr>
                        </table>
                        <div style="clear:both;height:1px;line-height:1px;font-size:0">&nbsp;</div>
                        <div style="height:22px;line-height:22px;font-size:0">&nbsp;</div>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="270" class="full">
                          <tr><td>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr><td class="ln" style="border-right:4px solid ${SITE_COLORS.fg};border-bottom:4px solid ${SITE_COLORS.fg}">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr><td class="btn" bgcolor="${SITE_COLORS.blue}" style="border:3px solid ${SITE_COLORS.fg};text-align:center" align="center">
                                    <a href="${actionUrl}" style="display:block;padding:15px 22px;font:700 14px/1 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#FFFFFF;text-decoration:none">${actionLabel}</a>
                                  </td></tr>
                                </table>
                              </td></tr>
                            </table>
                          </td></tr>
                        </table>

                        <div style="height:22px;line-height:22px;font-size:0">&nbsp;</div>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          ${dashedRow('Requested', 'Just now (WAT)', false)}
                          ${dashedRow('Expires', `In ${expiresIn} minutes`)}
                          ${dashedRow('For', forLabel)}
                        </table>

                        <div style="height:22px;line-height:22px;font-size:0">&nbsp;</div>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr><td class="panel ln" bgcolor="${SITE_COLORS.panel2}" style="padding:14px 16px;border:3px dashed ${SITE_COLORS.fg};background-color:${SITE_COLORS.panel2}">
                            <div class="fg" style="font:700 12px/1.4 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${SITE_COLORS.fg}">Did not ask for this?</div>
                            <div class="fg" style="margin-top:4px;font:400 14px/1.6 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.fg}">Ignore this message. Nobody can sign in without the code. Never share it, and AMEES will never ask you for it.</div>
                          </td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>

          <tr><td style="padding:0"><div style="height:26px;line-height:26px;font-size:0">&nbsp;</div></td></tr>

          <tr><td style="padding:0 8px">
            <div class="mu" style="text-align:center;font:400 12px/1.7 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.muted}">This is an automated message from <a class="lk" href="https://amees.com.ng" style="color:${SITE_COLORS.blue};font-weight:700;text-decoration:underline">amees.com.ng</a>. Replies are not monitored. Need help? Write to <a class="lk" href="mailto:info@amees.com.ng" style="color:${SITE_COLORS.blue}">info@amees.com.ng</a>.</div>
          </td></tr>

        </table>
      </td></tr>
    </table>
    </div>
    </body>
    </html>
  `;
}

// ---------------------------------------------------------
// 6. Sponsor enquiry (internal notification)
// ---------------------------------------------------------

export function buildSponsorEnquiryTemplate(
  org: string,
  name: string,
  email: string,
  tier: string,
  msg: string,
  ip: string
) {
  const safeOrg = escHtml(org);
  const safeName = escHtml(name);
  const safeEmail = escHtml(email);
  const safeTier = escHtml(tier || 'Not sure yet');
  const safeMsg = escHtml(msg).replace(/\n/g, '<br>');
  const safeIp = escHtml(ip);

  const row = (label: string, value: string, withTop = true) => `
    <tr>
      <td class="hair mu" width="96" valign="top" style="${withTop ? `border-top:2px dashed ${SITE_COLORS.fg};` : ''}padding:10px 12px 10px 0;font:700 11px/1.7 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${SITE_COLORS.muted}">${label}</td>
      <td class="hair fg" valign="top" style="${withTop ? `border-top:2px dashed ${SITE_COLORS.fg};` : ''}padding:10px 0;font:400 15px/1.5 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.fg}">${value}</td>
    </tr>`;

  return `
    ${RICH_BASE_HEAD}
    <body class="bg" style="margin:0;padding:0;background-color:${SITE_COLORS.bg};background-image:linear-gradient(#D5DCF1 1px,transparent 1px),linear-gradient(90deg,#D5DCF1 1px,transparent 1px);background-size:28px 28px;">
    <div role="article" aria-roledescription="email" lang="en">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="bg" bgcolor="${SITE_COLORS.bg}" style="background-color:${SITE_COLORS.bg};background-image:linear-gradient(#D5DCF1 1px,transparent 1px),linear-gradient(90deg,#D5DCF1 1px,transparent 1px);background-size:28px 28px;">
      <tr><td align="center" style="padding:28px 12px 40px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="w" style="width:600px;max-width:600px">

          <tr><td style="padding:0">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${SITE_COLORS.bg}">New sponsor enquiry from ${safeOrg} (${safeTier}). Reply-to: ${safeEmail}.&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
          </td></tr>

          <tr><td style="padding:0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed">
              <tr><td height="32" bgcolor="${SITE_COLORS.green}" style="height:32px;background-image:repeating-linear-gradient(-45deg,rgba(27,15,75,.16) 0,rgba(27,15,75,.16) 10px,transparent 10px,transparent 20px);font:700 12px/32px 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${SITE_COLORS.fg};white-space:nowrap;overflow:hidden;border-top:3px solid ${SITE_COLORS.fg};border-bottom:3px solid ${SITE_COLORS.fg}" align="center">Internal notification &bull; Sponsor enquiry &bull; Internal notification &bull; Sponsor enquiry &bull; Internal notification &bull; Sponsor enquiry &bull; </td></tr>
            </table>
          </td></tr>

          <tr><td style="padding:0"><div style="height:22px;line-height:22px;font-size:0">&nbsp;</div></td></tr>

          <tr><td style="padding:0 4px 20px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="40" valign="middle">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr><td width="38" height="38" bgcolor="${SITE_COLORS.blue}" align="center" valign="middle" style="width:38px;height:38px;font:700 22px/38px 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:#FFFFFF;text-align:center">A</td></tr>
                  </table>
                </td>
                <td valign="middle" style="padding-left:12px" class="fg">
                  <span class="fg" style="font:700 18px/1 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.14em;color:${SITE_COLORS.fg}">AMEES</span>
                </td>
                <td align="right" class="mu" style="font:700 11px/1.4 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${SITE_COLORS.muted}">Sponsorship</td>
              </tr>
            </table>
          </td></tr>

          <tr><td style="padding:0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td class="ln" style="border-right:5px solid ${SITE_COLORS.fg};border-bottom:5px solid ${SITE_COLORS.fg}">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="ln" style="border:3px solid ${SITE_COLORS.fg}">
                    <tr>
                      <td class="bar" bgcolor="${SITE_COLORS.fg}" style="padding:9px 14px;font:700 12px/1.2 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FFFFFF">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font:700 12px/1.2 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FFFFFF">AMEES &middot; Sponsorship</td>
                            <td align="right" style="font:400 12px/1.2 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.06em;color:#FFFFFF;opacity:.85">New enquiry</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="card px" bgcolor="${SITE_COLORS.panel}" style="padding:24px 26px">
                        <span class="lk" style="font:700 11px/1.4 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${SITE_COLORS.blue}">From the website</span>
                        <h1 class="h1 fg" style="margin:8px 0 14px;font:700 30px/1.1 'Space Grotesk','Helvetica Neue',Arial,sans-serif;text-transform:uppercase;color:${SITE_COLORS.fg}">${safeOrg}</h1>
                        <p class="fg" style="margin:0 0 20px;font:400 16px/1.65 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.fg}">${safeName} reached out about the <strong>${safeTier}</strong> tier.</p>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          ${row('Organisation', safeOrg, false)}
                          ${row('Contact', safeName)}
                          ${row('Reply-to', `<a href="mailto:${safeEmail}" style="color:${SITE_COLORS.blue};text-decoration:underline">${safeEmail}</a>`)}
                          ${row('Tier', safeTier)}
                        </table>

                        <div style="height:22px;line-height:22px;font-size:0">&nbsp;</div>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr><td class="panel ln" bgcolor="${SITE_COLORS.panel2}" style="padding:14px 16px;border:3px dashed ${SITE_COLORS.fg};background-color:${SITE_COLORS.panel2}">
                            <div class="fg" style="font:700 12px/1.4 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${SITE_COLORS.fg}">Their message</div>
                            <div class="fg" style="margin-top:6px;font:400 15px/1.6 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.fg}">${safeMsg || '<em>(none)</em>'}</div>
                          </td></tr>
                        </table>

                        <div style="height:22px;line-height:22px;font-size:0">&nbsp;</div>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="270" class="full">
                          <tr><td>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr><td class="ln" style="border-right:4px solid ${SITE_COLORS.fg};border-bottom:4px solid ${SITE_COLORS.fg}">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr><td class="btn" bgcolor="${SITE_COLORS.blue}" style="border:3px solid ${SITE_COLORS.fg};text-align:center" align="center">
                                    <a href="mailto:${safeEmail}?subject=Re%3A%20Sponsorship%20enquiry" style="display:block;padding:15px 22px;font:700 14px/1 'Space Grotesk','Helvetica Neue',Arial,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#FFFFFF;text-decoration:none">Reply to ${safeName}</a>
                                  </td></tr>
                                </table>
                              </td></tr>
                            </table>
                          </td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>

          <tr><td style="padding:0"><div style="height:26px;line-height:26px;font-size:0">&nbsp;</div></td></tr>

          <tr><td style="padding:0 8px">
            <div class="mu" style="text-align:center;font:400 12px/1.7 'Space Grotesk','Helvetica Neue',Arial,sans-serif;color:${SITE_COLORS.muted}">Submitted via amees.com.ng from IP <strong style="color:${SITE_COLORS.fg}">${safeIp}</strong>. Reply goes directly to the contact — hitting reply on this email does not reach them.</div>
          </td></tr>

        </table>
      </td></tr>
    </table>
    </div>
    </body>
    </html>
  `;
}