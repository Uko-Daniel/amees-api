// src/lib/emailTemplates.ts
//
// AMEES email templates. Six templates, three distinct looks:
//
//   FORMAL (corporate letter)       buildFormalTemplate
//   SEMI-FORMAL (retro window)      buildSemiFormalTemplate, buildOtpTemplate, buildSponsorEnquiryTemplate
//   INFORMAL (loud, caution tape)   buildInformalTemplate, buildLiveEventTemplate
//
// Everything that is a name, address, link, colour or wording default lives in
// `config` below. Nothing is hard-coded inside the templates. Call
// `configureEmail({...})` once at start-up to override the defaults.
//
// Safety: every plain-text field is HTML-escaped. Links are limited to
// https, http, mailto and site-relative paths. `bodyContent` is plain text
// (blank line = new paragraph); never put raw HTML in it.

// ---------------------------------------------------------------
// Config (the only place brand strings live)
// ---------------------------------------------------------------
export interface EmailConfig {
  /** Short brand name, shown as the wordmark. */
  name: string;
  /** Full organisation name, shown in letterheads and footers. */
  fullName: string;
  /** Second line of the letterhead, e.g. the university. */
  institution: string;
  /** Postal address line for formal footers (optional). */
  address: string;
  /** Default tape / tagline text. */
  tagline: string;
  /** Site origin, no trailing slash. Relative links are resolved against it. */
  siteUrl: string;
  /** Logo path or full URL. Served from /public. */
  logoPath: string;
  logoWidth: number;
  logoHeight: number;
  /** Show the text wordmark next to the logo (turn off if the logo already contains it). */
  showWordmark: boolean;
  /** Where people can write when the sender is a no-reply address. */
  supportEmail: string;
  /** Show a "this is a no-reply address" line in footers. */
  noReply: boolean;
  /** Who a formal letter is sent on behalf of. */
  signatory: string;
  /** IANA time zone for dates and times. */
  timeZone: string;
  /** Links shown in footers. Paths are resolved against siteUrl. */
  footerLinks: { label: string; path: string }[];
}

export const config: EmailConfig = {
  name: 'AMEES',
  fullName: 'Association of Mechatronics and Electrical and Electronics Engineering Students',
  institution: 'Lead City University, Ibadan',
  address: '',
  tagline: 'Connecting minds through innovation',
  siteUrl: 'https://amees.com.ng',
  logoPath: '/logo-email.svg',
  logoWidth: 40,
  logoHeight: 40,
  showWordmark: true,
  supportEmail: 'info@amees.com.ng',
  noReply: true,
  signatory: 'AMEES Executive Council',
  timeZone: 'Africa/Lagos',
  footerLinks: [
    { label: 'Website', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'Calendar', path: '/calendar' },
  ],
};

export function configureEmail(patch: Partial<EmailConfig>): void {
  Object.assign(config, patch);
}

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
export interface Detail { label: string; value: string }

interface BaseData {
  subject: string;
  /** Plain text. A blank line starts a new paragraph. */
  bodyContent?: string;
  details?: Detail[];
  ctaUrl?: string;
  ctaLabel?: string;
  /** Shown in the header. Defaults to today's date in config.timeZone. */
  date?: string;
  /** Hidden inbox preview text. Defaults to the start of the body. */
  preheader?: string;
}

export interface SemiFormalData extends BaseData {
  /** Title-bar label, e.g. "AMEES · Notice". */
  headerLabel?: string;
  /** Small label above the heading. */
  kicker?: string;
  /** Top-right label, e.g. "Notice no. 7". Hidden when empty. */
  refNumber?: string;
  /** Optional numbered list. */
  agendaTitle?: string;
  agenda?: string[];
  /** Optional dashed note box. */
  noteTitle?: string;
  noteText?: string;
  /** Sign-off lines, one per line. */
  signoff?: string;
  tapeText?: string;
  footerNote?: string;
}

export interface FormalData extends BaseData {
  refNumber?: string;
  recipientName?: string;
  recipientOrg?: string;
  recipientAddress?: string;
  salutation?: string;
  closingText?: string;
  senderName?: string;
  senderRole?: string;
  senderEmail?: string;
  enclosures?: string;
  copyTo?: string;
}

export interface InformalData extends BaseData {
  kicker?: string;
  /** Small green tag top-right, e.g. "Signal: strong". Hidden when empty. */
  statusTag?: string;
  tapeText?: string;
  checklistTitle?: string;
  checklist?: string[];
  signoff?: string;
  unsubscribeUrl?: string;
  footerNote?: string;
}

export interface LiveEventData extends BaseData {
  eventName?: string;
  /** Shown top-right in the title bar, e.g. "7:26 AM WAT". */
  time?: string;
  /** Label next to the LED. Defaults to "Live now". */
  statusLabel?: string;
  tapeText?: string;
  footerNote?: string;
}

export interface OtpTemplateOptions {
  /** Name to greet. Omit to say "Hi,". */
  name?: string;
  /** What the code is for, e.g. "Workbench", "Admin panel". */
  purpose?: string;
  /** Shown in the "For" row. Defaults to the purpose. */
  forLabel?: string;
  /** How long the code is valid. Defaults to 10. */
  expiresInMinutes?: number;
  /** When it was requested. Defaults to now. */
  requestedAt?: Date;
  /** Optional button. */
  actionUrl?: string;
  actionLabel?: string;
  /** Override the "did not ask for this" warning. */
  securityNote?: string;
}

// ---------------------------------------------------------------
// Design tokens (match the site)
// ---------------------------------------------------------------
const C = {
  bg: '#FBF2E1', grid: '#D5DCF1', fg: '#1B0F4B', blue: '#2F57D1', yellow: '#F6D44B',
  green: '#6FE0A5', muted: '#5A5683', card: '#FFF7EA', panel: '#FCE6CB', tint: '#E3E9FA', white: '#FFFFFF',
  paper: '#EEF0F6',
} as const;
const FONT = "'Space Grotesk','Helvetica Neue',Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
const GRID = `background-image:linear-gradient(${C.grid} 1px,transparent 1px),linear-gradient(90deg,${C.grid} 1px,transparent 1px);background-size:28px 28px;`;

// ---------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------
const esc = (s: unknown): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const nl = (s: unknown): string => esc(s).replace(/\r?\n/g, '<br>');

const abs = (u: string): string =>
  /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : config.siteUrl.replace(/\/+$/, '') + (u.startsWith('/') ? u : '/' + u);

/** Allow only http(s), mailto and site-relative links. Anything else becomes "#". */
const url = (u?: string): string => {
  const v = (u ?? '').trim();
  if (!v) return '#';
  if (/^(https?:\/\/|mailto:)/i.test(v)) return esc(v);
  if (v.startsWith('/') && !v.startsWith('//')) return esc(abs(v));
  return '#';
};

const paragraphs = (t?: string): string[] =>
  (t ?? '').split(/\r?\n\s*\r?\n|\r?\n/).map((s) => s.trim()).filter(Boolean);

const cleanDetails = (d?: Detail[]): Detail[] =>
  (d ?? []).filter((x) => x && String(x.label ?? '').trim() && String(x.value ?? '').trim());

const fmtDate = (d = new Date()): string =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: config.timeZone }).format(d);

const fmtDateTime = (d = new Date()): string =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: config.timeZone })
    .format(d).replace(/ /g, ' ');

const wat = (): string => {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: config.timeZone, timeZoneName: 'short' }).formatToParts(new Date()).find((x) => x.type === 'timeZoneName');
  return p?.value && !/^GMT/.test(p.value) ? p.value : config.timeZone === 'Africa/Lagos' ? 'WAT' : '';
};

const preheaderOf = (d: BaseData): string =>
  d.preheader ?? (paragraphs(d.bodyContent)[0] ?? d.subject).slice(0, 110);

const spacer = (h: number): string => `<div style="height:${h}px;line-height:${h}px;font-size:0">&nbsp;</div>`;
const ZW = '&zwnj;&nbsp;'.repeat(40);

// ---------------------------------------------------------------
// Shared building blocks (plain pieces, not looks)
// ---------------------------------------------------------------
function head(title: string, dark: { grid: boolean }): string {
  const darkGrid = dark.grid
    ? 'background-image:linear-gradient(#26236A 1px,transparent 1px),linear-gradient(90deg,#26236A 1px,transparent 1px)!important;'
    : 'background-image:none!important;';
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
<style>
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table,td{mso-table-lspace:0;mso-table-rspace:0}
body{margin:0!important;padding:0!important;width:100%!important}
a{color:${C.blue}}
.eq{height:132px}.eqc{height:66px}
@media (max-width:620px){
  .w{width:100%!important}
  .px{padding-left:18px!important;padding-right:18px!important}
  .stack{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}
  .h1{font-size:30px!important;line-height:1.08!important}
  .hide{display:none!important}
  .full{width:100%!important}
  .eq,.eqc{height:auto!important}
}
@media (prefers-color-scheme:dark){
  .bg{background-color:#130F31!important;${darkGrid}}
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
</head>`;
}

function page(title: string, preheader: string, inner: string, opts: { bg: string; grid: boolean }): string {
  const g = opts.grid ? GRID : '';
  return `${head(title, { grid: opts.grid })}
<body class="bg" style="margin:0;padding:0;background-color:${opts.bg};${g}">
<div role="article" aria-roledescription="email" lang="en">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${opts.bg}">${esc(preheader)}${ZW}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="bg" bgcolor="${opts.bg}" style="background-color:${opts.bg};${g}"><tr><td align="center" style="padding:28px 12px 40px">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="w" style="width:600px;max-width:600px">
${inner}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</div>
</body>
</html>`;
}

const row = (inner: string, pad = '0'): string => `<tr><td style="padding:${pad}">${inner}</td></tr>\n`;

/** Logo from /public. SVG is not shown by Gmail or Outlook; point config.logoPath at a PNG if you need those. */
function logo(h = config.logoHeight, w = config.logoWidth): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="${w}" height="${h}" bgcolor="${C.blue}" style="width:${w}px;height:${h}px;background-color:${C.blue}">` +
    `<img src="${esc(abs(config.logoPath))}" width="${w}" height="${h}" alt="${esc(config.name)}" style="display:block;border:0;outline:none;width:${w}px;height:${h}px;font:700 11px/${h}px ${FONT};color:#FFFFFF;text-align:center"></td></tr></table>`;
}

function brandRow(right: string, size = 40): string {
  const w = Math.round((config.logoWidth / config.logoHeight) * size);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="${w + 4}" valign="middle">${logo(size, w)}</td>` +
    (config.showWordmark ? `<td valign="middle" style="padding-left:12px"><span class="fg" style="font:700 18px/1 ${FONT};letter-spacing:.14em;color:${C.fg}">${esc(config.name)}</span></td>` : '<td></td>') +
    (right ? `<td align="right" valign="middle" class="mu" style="font:700 11px/1.4 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${C.muted}">${esc(right)}</td>` : '<td></td>') +
    '</tr></table>';
}

const shadow = (inner: string, c = 4): string =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td class="ln" style="border-right:${c}px solid ${C.fg};border-bottom:${c}px solid ${C.fg}">${inner}</td></tr></table>`;

function tape(text: string, bg: string = C.yellow): string {
  const t = `${esc(text)} &bull; `.repeat(6);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed"><tr>` +
    `<td height="32" bgcolor="${bg}" align="center" style="height:32px;background-image:repeating-linear-gradient(-45deg,rgba(27,15,75,.16) 0,rgba(27,15,75,.16) 10px,transparent 10px,transparent 20px);font:700 12px/32px ${FONT};letter-spacing:.18em;text-transform:uppercase;color:${C.fg};white-space:nowrap;overflow:hidden;border-top:3px solid ${C.fg};border-bottom:3px solid ${C.fg}">${t}</td></tr></table>`;
}

const label = (t: string, color: string = C.muted, cls = 'mu'): string =>
  `<span class="${cls}" style="font:700 11px/1.4 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${color}">${esc(t)}</span>`;

function button(href: string, text: string, o: { bg?: string; fg?: string; cls?: string; width?: number } = {}): string {
  const bg = o.bg ?? C.blue, fg = o.fg ?? C.white;
  const inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td class="${o.cls ?? 'btn'}" bgcolor="${bg}" align="center" style="border:3px solid ${C.fg};text-align:center">` +
    `<a href="${url(href)}" style="display:block;padding:15px 22px;font:700 14px/1 ${FONT};letter-spacing:.07em;text-transform:uppercase;color:${fg};text-decoration:none">${esc(text)}</a></td></tr></table>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${o.width ? ` width="${o.width}"` : ''} class="full"><tr><td>${shadow(inner)}</td></tr></table>`;
}

function dashedFacts(rows: Detail[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">` + rows.map((r, i) => {
    const top = i ? `border-top:2px dashed ${C.fg};` : '';
    return `<tr><td class="hair mu" width="96" valign="top" style="${top}padding:10px 12px 10px 0;font:700 11px/1.7 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${C.muted}">${esc(r.label)}</td>` +
      `<td class="hair fg" valign="top" style="${top}padding:10px 0;font:400 15px/1.5 ${FONT};color:${C.fg}">${nl(r.value)}</td></tr>`;
  }).join('') + '</table>';
}

function noteBox(title: string, text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="panel ln" bgcolor="${C.panel}" style="padding:14px 16px;border:3px dashed ${C.fg};background-color:${C.panel}">` +
    `<div class="fg" style="font:700 12px/1.4 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${C.fg}">${esc(title)}</div>` +
    `<div class="fg" style="margin-top:4px;font:400 14px/1.6 ${FONT};color:${C.fg}">${nl(text)}</div></td></tr></table>`;
}

function steps(items: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` + items.map((t, i) =>
    `<tr><td width="34" valign="top" style="padding:6px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="26" height="26" bgcolor="${C.blue}" class="btn" align="center" style="width:26px;height:26px;border:2px solid ${C.fg};font:700 12px/22px ${FONT};color:#FFFFFF">${i + 1}</td></tr></table></td>` +
    `<td class="fg" valign="top" style="padding:7px 0 7px 6px;font:400 15px/1.5 ${FONT};color:${C.fg}">${esc(t)}</td></tr>`).join('') + '</table>';
}

function checks(items: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` + items.map((t) =>
    `<tr><td width="34" valign="top" style="padding:7px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="22" height="22" bgcolor="${C.card}" class="card ln" style="width:22px;height:22px;border:3px solid ${C.fg};font-size:0;line-height:0">&nbsp;</td></tr></table></td>` +
    `<td class="fg" valign="middle" style="padding:7px 0 7px 6px;font:700 16px/1.4 ${FONT};color:${C.fg}">${esc(t)}</td></tr>`).join('') + '</table>';
}

function windowBox(title: string, right: string, body: string, o: { led?: boolean } = {}): string {
  const led = o.led ? `<td width="14" height="14" style="width:14px;height:14px;background-color:${C.green};border:2px solid #FFFFFF;font-size:1px">&nbsp;</td><td style="width:10px;font-size:0">&nbsp;</td>` : '';
  const inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="ln" style="border:3px solid ${C.fg}">` +
    `<tr><td class="bar" bgcolor="${C.fg}" style="padding:9px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${led}<td style="font:700 12px/1.2 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#FFFFFF">${esc(title)}</td></tr></table></td>` +
    `<td align="right" style="font:400 12px/1.2 ${FONT};letter-spacing:.06em;color:#FFFFFF">${esc(right)}</td></tr></table></td></tr>` +
    `<tr><td class="card px" bgcolor="${C.card}" style="padding:24px 26px;background-color:${C.card}">${body}</td></tr></table>`;
  return shadow(inner, 5);
}

const para = (t: string, o: { serif?: boolean; size?: number; mb?: number; color?: string } = {}): string =>
  `<p class="fg" style="margin:0 0 ${o.mb ?? 14}px;font:400 ${o.size ?? 16}px/1.65 ${o.serif ? SERIF : FONT};color:${o.color ?? C.fg}">${nl(t)}</p>`;

function footerLines(extra?: string): string {
  const links = config.footerLinks.map((l) => `<a class="lk" href="${url(l.path)}" style="color:${C.blue}">${esc(l.label)}</a>`).join(' &nbsp;&middot;&nbsp; ');
  const lines = [links, esc(`${config.name} · ${config.institution}`)];
  if (extra) lines.push(nl(extra));
  if (config.noReply) lines.push(`This is an automated address and replies are not monitored. Need help? Write to <a class="lk" href="mailto:${esc(config.supportEmail)}" style="color:${C.blue}">${esc(config.supportEmail)}</a>.`);
  return `<div class="mu" style="text-align:center;font:400 12px/1.8 ${FONT};color:${C.muted}">${lines.join('<br>')}</div>`;
}

// ===============================================================
// FORMAL: corporate letter
// ===============================================================
export function buildFormalTemplate(data: FormalData): string {
  const bg = C.paper;
  const date = data.date ?? fmtDate();
  const addr = [data.recipientName, data.recipientOrg, data.recipientAddress].filter(Boolean) as string[];
  const rows = cleanDetails(data.details);
  const letterhead = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td width="${config.logoWidth + 6}" valign="middle">${logo(46, Math.round((config.logoWidth / config.logoHeight) * 46))}</td>` +
    `<td valign="middle" style="padding-left:14px"><div class="fg" style="font:700 22px/1 ${FONT};letter-spacing:.14em;color:${C.fg}">${esc(config.name)}</div>` +
    `<div class="mu" style="margin-top:6px;font:400 11px/1.4 ${FONT};letter-spacing:.04em;color:${C.muted}">${esc(config.fullName)}<br>${esc(config.institution)}</div></td>` +
    `<td class="hide mu" align="right" valign="top" style="font:400 12px/1.6 ${FONT};color:${C.muted}">${data.refNumber ? `Ref: ${esc(data.refNumber)}<br>` : ''}${esc(date)}</td></tr></table>`;
  const ruler = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="ln" height="14" style="height:14px;font-size:0;line-height:0;border-bottom:2px solid ${C.fg};background-image:repeating-linear-gradient(90deg,${C.fg} 0,${C.fg} 1px,transparent 1px,transparent 12px);background-size:100% 7px;background-repeat:no-repeat;background-position:0 100%">&nbsp;</td></tr></table>`;
  const details = rows.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="panel" bgcolor="${C.tint}" style="background-color:${C.tint};border-left:4px solid ${C.blue}"><tr><td style="padding:6px 22px">` +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` + rows.map((r, i) =>
        `<tr><td class="hair mu" width="96" valign="top" style="${i ? 'border-top:1px solid #C7CFEA;' : ''}padding:10px 12px 10px 0;font:700 11px/1.7 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${C.muted}">${esc(r.label)}</td>` +
        `<td class="hair fg" valign="top" style="${i ? 'border-top:1px solid #C7CFEA;' : ''}padding:10px 0;font:400 15px/1.5 ${FONT};color:${C.fg}">${nl(r.value)}</td></tr>`).join('') +
      `</table></td></tr></table>` : '';
  const cta = data.ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="full"><tr><td class="bar" bgcolor="${C.fg}" align="center" style="border:2px solid ${C.fg}"><a href="${url(data.ctaUrl)}" style="display:block;padding:14px 30px;font:700 13px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#FFFFFF;text-decoration:none">${esc(data.ctaLabel ?? 'Open')}</a></td></tr></table>` : '';
  const body = paragraphs(data.bodyContent).map((t) => para(t, { serif: true })).join('');
  const sender = [data.senderName, data.senderRole].filter(Boolean);
  let letter = `<tr><td bgcolor="${C.fg}" class="bar" height="6" style="height:6px;font-size:0;line-height:0">&nbsp;</td></tr>\n`;
  letter += row(letterhead, '30px 44px 18px').replace('<td style', '<td class="px" style');
  letter += row(ruler, '0 44px').replace('<td style', '<td class="px" style');
  if (addr.length) letter += row(`${label('Addressed to')}<div class="fg" style="margin-top:6px;font:400 15px/1.6 ${SERIF};color:${C.fg}">${addr.map(esc).join('<br>')}</div>`, '28px 44px 0').replace('<td style', '<td class="px" style');
  letter += row(`${label('Subject')}<div class="fg" style="margin-top:6px;font:700 24px/1.2 ${FONT};color:${C.fg}">${esc(data.subject)}</div>`, '26px 44px 4px').replace('<td style', '<td class="px" style');
  letter += row(para(data.salutation ?? 'Dear Sir or Madam,', { serif: true }) + body, '20px 44px 0').replace('<td style', '<td class="px" style');
  if (details) letter += row(details, '4px 44px 0').replace('<td style', '<td class="px" style');
  if (cta) letter += row(cta, '24px 44px 0').replace('<td style', '<td class="px" style');
  letter += row(
    (data.closingText ? para(data.closingText, { serif: true, mb: 26 }) : '') +
    para('Yours faithfully,', { serif: true, mb: 40 }) +
    (sender.length ? `<div class="fg" style="font:700 16px/1.4 ${SERIF};color:${C.fg}">${esc(data.senderName ?? '')}</div><div class="mu" style="font:400 14px/1.6 ${SERIF};color:${C.muted}">${[data.senderRole, config.signatory ? `On behalf of the ${config.signatory}` : ''].filter(Boolean).map(esc).join('<br>')}${data.senderEmail ? `<br><a class="lk" href="mailto:${esc(data.senderEmail)}" style="color:${C.blue}">${esc(data.senderEmail)}</a>` : ''}</div>` : ''),
    '28px 44px 30px').replace('<td style', '<td class="px" style');
  if (data.enclosures || data.copyTo)
    letter += row(`<div class="hair mu" style="border-top:1px solid #D8DCEA;padding-top:14px;font:400 12px/1.7 ${FONT};color:${C.muted}">${data.enclosures ? `<b>Enclosure:</b> ${esc(data.enclosures)}<br>` : ''}${data.copyTo ? `<b>Copy:</b> ${esc(data.copyTo)}` : ''}</div>`, '0 44px 28px').replace('<td style', '<td class="px" style');
  letter += `<tr><td class="px panel" bgcolor="#F6F7FB" style="padding:22px 44px;background-color:#F6F7FB;border-top:1px solid #D8DCEA">` +
    `<div class="fg" style="font:700 12px/1.6 ${FONT};letter-spacing:.08em;text-transform:uppercase;color:${C.fg}">${esc(config.name)} &middot; ${esc(config.institution)}</div>` +
    `<div class="mu" style="margin-top:6px;font:400 12px/1.7 ${FONT};color:${C.muted}">${config.address ? esc(config.address) + '<br>' : ''}<a class="lk" href="${url('/')}" style="color:${C.blue};font-weight:700">${esc(config.siteUrl.replace(/^https?:\/\//, ''))}</a>${config.supportEmail ? ` &nbsp;&middot;&nbsp; <a class="lk" href="mailto:${esc(config.supportEmail)}" style="color:${C.blue}">${esc(config.supportEmail)}</a>` : ''}</div>` +
    `<div class="mu" style="margin-top:12px;font:400 11px/1.6 ${FONT};color:${C.muted}">This message and any attachment are intended for the named recipient only. If you received it by mistake, please tell the sender and delete it.</div></td></tr>\n`;
  const inner = row(`<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="card" bgcolor="#FFFFFF" style="background-color:#FFFFFF">${letter}</table>`) +
    row(`<div class="mu" style="padding:16px 8px 0;text-align:center;font:400 11px/1.6 ${FONT};color:${C.muted}">Sent by the ${esc(config.signatory)}</div>`);
  return page(data.subject, preheaderOf(data), inner, { bg, grid: false });
}

// ===============================================================
// SEMI-FORMAL: retro window notice
// ===============================================================
export function buildSemiFormalTemplate(data: SemiFormalData): string {
  const rows = cleanDetails(data.details);
  const date = data.date ?? fmtDate();
  let b = data.kicker ? label(data.kicker, C.blue, 'lk') : '';
  b += `<h1 class="h1 fg" style="margin:8px 0 14px;font:700 34px/1.05 ${FONT};letter-spacing:-.01em;text-transform:uppercase;color:${C.fg}">${esc(data.subject)}</h1>`;
  b += paragraphs(data.bodyContent).map((t) => para(t)).join('');
  if (rows.length) b += spacer(8) + dashedFacts(rows);
  if (data.agenda?.length) b += spacer(22) + label(data.agendaTitle ?? 'Agenda') + `<div style="margin-top:10px">${steps(data.agenda.filter(Boolean))}</div>`;
  if (data.ctaUrl) b += spacer(24) + button(data.ctaUrl, data.ctaLabel ?? 'Open', { width: 260 });
  if (data.noteText) b += spacer(22) + noteBox(data.noteTitle ?? 'Note', data.noteText);
  if (data.signoff) b += spacer(24) + para(data.signoff, { mb: 0 });
  const inner = row(tape(data.tapeText ?? 'Notice') ) + row(spacer(22)) +
    row(brandRow(data.refNumber ?? ''), '0 4px 20px') +
    row(windowBox(data.headerLabel ?? `${config.name} · Notice`, date, b)) + row(spacer(26)) +
    row(footerLines(data.footerNote), '0 8px');
  return page(data.subject, preheaderOf(data), inner, { bg: C.bg, grid: true });
}

// ===============================================================
// SEMI-FORMAL, system variant: one-time code
// ===============================================================
export function buildOtpTemplate(code: string, opts: OtpTemplateOptions = {}): string {
  const digits = String(code ?? '').replace(/\s+/g, '').split('');
  const purpose = opts.purpose ?? 'Sign in';
  const expires = opts.expiresInMinutes ?? 10;
  const when = `${fmtDateTime(opts.requestedAt)} ${wat()}`.trim();
  const cells = digits.map((d, i) => `<td width="46" height="58" class="bar" bgcolor="${C.fg}" align="center" style="width:46px;height:58px;border:3px solid ${C.fg};font:700 32px/52px ${FONT};color:#FFFFFF">${esc(d)}</td>` + (i < digits.length - 1 ? '<td width="6" style="width:6px;font-size:0">&nbsp;</td>' : '')).join('');
  let b = label('One-time code', C.blue, 'lk');
  b += `<h1 class="h1 fg" style="margin:8px 0 14px;font:700 34px/1.05 ${FONT};text-transform:uppercase;color:${C.fg}">Your sign-in code</h1>`;
  b += para(`${opts.name ? `Hi ${opts.name}, use` : 'Use'} this code to continue with ${purpose}. It works once and expires in ${expires} minutes.`, { mb: 20 });
  b += `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left"><tr>${cells}</tr></table><div style="clear:both;height:1px;line-height:1px;font-size:0">&nbsp;</div>` + spacer(22);
  if (opts.actionUrl) b += button(opts.actionUrl, opts.actionLabel ?? 'Continue', { width: 270 }) + spacer(22);
  b += dashedFacts([{ label: 'Requested', value: when }, { label: 'Expires', value: `In ${expires} minutes` }, { label: 'For', value: opts.forLabel ?? purpose }]) + spacer(22);
  b += noteBox('Did not ask for this?', opts.securityNote ?? `Ignore this message. Nobody can sign in without the code. Never share it, and ${config.name} will never ask you for it.`);
  const inner = row(tape('Automated message • Do not reply')) + row(spacer(22)) +
    row(brandRow(purpose), '0 4px 20px') +
    row(windowBox(`${config.name} · ${purpose}`, 'One-time code', b)) + row(spacer(26)) +
    row(footerLines(), '0 8px');
  return page(`Your ${config.name} sign-in code`, `Your ${config.name} code is ${digits.join(' ')}. It expires in ${expires} minutes.`, inner, { bg: C.bg, grid: true });
}

// ===============================================================
// SEMI-FORMAL, internal notification: sponsor enquiry
// ===============================================================
export function buildSponsorEnquiryTemplate(org: string, name: string, email: string, tier: string, msg: string, ip: string): string {
  const safeEmail = esc(email);
  const rows: Detail[] = [{ label: 'Organisation', value: org }, { label: 'Contact', value: name }, { label: 'Reply-to', value: email }, { label: 'Tier', value: tier || 'Not sure yet' }];
  const facts = dashedFacts(rows).replace(nl(email), `<a href="mailto:${safeEmail}" class="lk" style="color:${C.blue};text-decoration:underline">${nl(email)}</a>`);
  let b = label('From the website', C.blue, 'lk');
  b += `<h1 class="h1 fg" style="margin:8px 0 14px;font:700 30px/1.1 ${FONT};text-transform:uppercase;color:${C.fg}">${esc(org)}</h1>`;
  b += para(`${name} reached out about the ${tier || 'sponsorship'} tier.`, { mb: 20 }) + facts + spacer(22);
  b += noteBox('Their message', msg ? msg : '(none)') + spacer(22);
  b += button(`mailto:${email}?subject=${encodeURIComponent('Re: Sponsorship enquiry')}`, `Reply to ${name}`, { width: 270 });
  const inner = row(tape('Internal notification • Sponsor enquiry', C.green)) + row(spacer(22)) +
    row(brandRow('Sponsorship'), '0 4px 20px') +
    row(windowBox(`${config.name} · Sponsorship`, 'New enquiry', b)) + row(spacer(26)) +
    row(`<div class="mu" style="text-align:center;font:400 12px/1.7 ${FONT};color:${C.muted}">Submitted via ${esc(config.siteUrl.replace(/^https?:\/\//, ''))} from IP <strong class="fg" style="color:${C.fg}">${esc(ip)}</strong>. Use the Reply button above. Replying to this email does not reach the sender.</div>`, '0 8px');
  return page('New sponsor enquiry', `New sponsor enquiry from ${org} (${tier || 'tier not chosen'}). Reply-to: ${email}.`, inner, { bg: C.bg, grid: true });
}

// ===============================================================
// INFORMAL: loud promo
// ===============================================================
function chips(rows: Detail[]): string {
  const cell = (r: Detail) => `<td class="stack" width="33%" valign="top" style="padding:0 8px 12px 0">` + shadow(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#FFFFFF" class="ln eqc" height="66" valign="top" style="padding:12px 14px;border:3px solid ${C.fg}">` +
    `<div style="font:700 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${C.fg};opacity:.8">${esc(r.label)}</div>` +
    `<div style="margin-top:6px;font:700 20px/1.15 ${FONT};color:${C.fg}">${nl(r.value)}</div></td></tr></table>`) + `</td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed"><tr>${rows.slice(0, 3).map(cell).join('')}</tr></table>`;
}


export function buildInformalTemplate(data: InformalData): string {
  const rows = cleanDetails(data.details);
  const tag = data.statusTag ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr><td bgcolor="${C.green}" style="border:3px solid ${C.fg};padding:5px 10px;font:700 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${C.fg}">${esc(data.statusTag)}</td></tr></table>` : '';
  const hero = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="ln" style="border:3px solid ${C.fg}"><tr><td bgcolor="${C.blue}" class="btn px" style="padding:30px 28px 28px;background-color:${C.blue}">` +
    (data.kicker ? `<div style="font:700 12px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${C.yellow}">${esc(data.kicker)}</div>` : '') +
    `<h1 class="h1" style="margin:12px 0 0;font:700 46px/1 ${FONT};letter-spacing:-.02em;text-transform:uppercase;color:#FFFFFF">${esc(data.subject)}</h1>` +
    paragraphs(data.bodyContent).map((t, i) => `<div style="margin-top:${i ? 10 : 16}px;font:400 17px/1.55 ${FONT};color:#FFFFFF">${nl(t)}</div>`).join('') +
    `</td></tr></table>`;
  const tp = data.tapeText ?? config.tagline;
  let inner = row(tape(tp)) + row(spacer(24)) +
    row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>${brandRow('')}</td><td align="right" width="40%">${tag}</td></tr></table>`, '0 4px 18px') +
    row(shadow(hero, 6)) + row(spacer(26));
  if (rows.length) inner += row(chips(rows)) + row(spacer(14));
  if (data.checklist?.length) inner += row(windowBox(data.checklistTitle ?? 'Checklist', `${data.checklist.length} items`, checks(data.checklist.filter(Boolean)))) + row(spacer(28));
  if (data.ctaUrl) inner += row(button(data.ctaUrl, data.ctaLabel ?? 'Learn more', { bg: C.yellow, fg: C.fg, width: 250, cls: 'yl' })) + row(spacer(26));
  if (data.signoff) inner += row(`<div class="fg" style="font:700 18px/1.5 ${FONT};color:${C.fg}">${nl(data.signoff)}</div>`) + row(spacer(26));
  inner += row(tape(tp));
  const unsub = data.unsubscribeUrl ? `<br><a class="lk" href="${url(data.unsubscribeUrl)}" style="color:${C.blue}">Unsubscribe</a>` : '';
  inner += row(`<div style="padding-top:16px">${footerLines(data.footerNote)}${unsub ? `<div class="mu" style="text-align:center;font:400 12px/1.8 ${FONT};color:${C.muted}">${unsub.slice(4)}</div>` : ''}</div>`, '0 8px');
  return page(data.subject, preheaderOf(data), inner, { bg: C.bg, grid: true });
}

// ===============================================================
// INFORMAL, live variant: green tape, LED
// ===============================================================
export function buildLiveEventTemplate(data: LiveEventData): string {
  const rows = cleanDetails(data.details);
  const hero = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="ln" style="border:3px solid ${C.fg}">` +
    `<tr><td class="bar" bgcolor="${C.fg}" style="padding:10px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="14" height="14" style="width:14px;height:14px;background-color:${C.green};border:2px solid #FFFFFF;font-size:1px">&nbsp;</td><td style="padding-left:10px;font:700 13px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:#FFFFFF">${esc(data.statusLabel ?? 'Live now')}</td></tr></table></td>` +
    `<td align="right" style="font:400 12px/1 ${FONT};letter-spacing:.06em;color:#FFFFFF">${esc(data.time ?? '')}</td></tr></table></td></tr>` +
    `<tr><td bgcolor="${C.blue}" class="btn px" style="padding:26px 28px;background-color:${C.blue}">` +
    (data.eventName ? `<div style="font:700 12px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${C.yellow}">${esc(data.eventName)}</div>` : '') +
    `<h1 class="h1" style="margin:12px 0 0;font:700 44px/1 ${FONT};letter-spacing:-.02em;text-transform:uppercase;color:#FFFFFF">${esc(data.subject)}</h1>` +
    paragraphs(data.bodyContent).map((t, i) => `<div style="margin-top:${i ? 10 : 16}px;font:400 17px/1.55 ${FONT};color:#FFFFFF">${nl(t)}</div>`).join('') +
    `</td></tr></table>`;
  const tp = data.tapeText ?? 'Live now';
  let inner = row(tape(tp, C.green)) + row(spacer(24)) + row(brandRow(''), '0 4px 18px') + row(shadow(hero, 6)) + row(spacer(26));
  if (rows.length) inner += row(chips(rows)) + row(spacer(14));
  if (data.ctaUrl) inner += row(button(data.ctaUrl, data.ctaLabel ?? 'Open', { bg: C.green, fg: C.fg, width: 250, cls: 'yl' })) + row(spacer(26));
  inner += row(tape(tp, C.green)) + row(`<div style="padding-top:16px">${footerLines(data.footerNote)}</div>`, '0 8px');
  return page(data.subject, preheaderOf(data), inner, { bg: C.bg, grid: true });
}