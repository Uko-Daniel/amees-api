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