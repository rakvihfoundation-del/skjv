// Builds a one-page A4 PDF with the ID card front (top) and back (bottom) at real card size.
// Runs in the browser; no PDF library needed (the card faces are embedded as JPEG images).

const MM = 72 / 25.4; // points per millimetre
const PAGE_W = 210 * MM;
const PAGE_H = 297 * MM;
const CARD_W = 85.6 * MM; // standard ID-1 / CR80 card
const CARD_H = 54 * MM;
const CARD_R = 3.18 * MM; // standard corner radius

export type CardPdfInput = {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
  title: string; // e.g. organisation name (ASCII)
  memberNo: string;
  name: string;
  verifyUrl: string;
};

/** Paints a card face on white with rounded corners and returns JPEG bytes. */
function toJpeg(src: HTMLCanvasElement): { bytes: Uint8Array; w: number; h: number } {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  const r = (CARD_R / CARD_W) * c.width;
  ctx.beginPath();
  ctx.roundRect(0, 0, c.width, c.height, r);
  ctx.clip();
  ctx.drawImage(src, 0, 0);
  const b64 = c.toDataURL('image/jpeg', 0.93).split(',')[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, w: c.width, h: c.height };
}

/** PDF text: Latin-1 only (the standard Helvetica font), with ( ) \ escaped. */
const pdfText = (s: string) =>
  s.normalize('NFKD').replace(/[^\x20-\x7e]/g, '').replace(/\s+/g, ' ').trim().replace(/[\\()]/g, (m) => `\\${m}`);

/** Path for a rounded rectangle (x, y = bottom-left). */
function roundRect(x: number, y: number, w: number, h: number, r: number): string {
  const k = 0.5523 * r;
  const f = (n: number) => n.toFixed(2);
  return [
    `${f(x + r)} ${f(y)} m`,
    `${f(x + w - r)} ${f(y)} l`, `${f(x + w - r + k)} ${f(y)} ${f(x + w)} ${f(y + r - k)} ${f(x + w)} ${f(y + r)} c`,
    `${f(x + w)} ${f(y + h - r)} l`, `${f(x + w)} ${f(y + h - r + k)} ${f(x + w - r + k)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} c`,
    `${f(x + r)} ${f(y + h)} l`, `${f(x + r - k)} ${f(y + h)} ${f(x)} ${f(y + h - r + k)} ${f(x)} ${f(y + h - r)} c`,
    `${f(x)} ${f(y + r)} l`, `${f(x)} ${f(y + r - k)} ${f(x + r - k)} ${f(y)} ${f(x + r)} ${f(y)} c`, 'h',
  ].join('\n');
}

export function buildCardPdf(input: CardPdfInput): Blob {
  const front = toJpeg(input.front);
  const back = toJpeg(input.back);

  const x = (PAGE_W - CARD_W) / 2;
  const frontTop = PAGE_H - 52 * MM;
  const backTop = frontTop - CARD_H - 22 * MM;
  const measure = document.createElement('canvas').getContext('2d');
  const widthOf = (text: string, size: number, bold: boolean) => {
    if (!measure) return text.length * size * 0.5;
    measure.font = `${bold ? 'bold ' : ''}${size}px Helvetica, Arial, sans-serif`;
    return measure.measureText(text.replace(/\\(.)/g, '$1')).width;
  };
  const center = (size: number, text: string, bold = false) =>
    `BT /${bold ? 'F1' : 'F2'} ${size} Tf ${(PAGE_W / 2 - widthOf(text, size, bold) / 2).toFixed(2)} `;

  const title = pdfText(input.title);
  const sub = pdfText(`Member ID Card  -  ${input.memberNo}${input.name ? `  -  ${input.name}` : ''}`);
  const hint1 = pdfText('Print at 100% (Actual size) and cut along the grey outlines.');
  const hint2 = pdfText(`Scan the QR code or visit ${input.verifyUrl} to verify this card.`);

  const content = [
    '0.29 0.024 0.063 rg', // maroon
    `${center(15, title, true)}${(PAGE_H - 22 * MM).toFixed(2)} Td (${title}) Tj ET`,
    '0.35 0.25 0.25 rg',
    `${center(10.5, sub)}${(PAGE_H - 29 * MM).toFixed(2)} Td (${sub}) Tj ET`,
    '0.78 0.06 0.18 rg', // red labels
    `BT /F1 9 Tf ${x.toFixed(2)} ${(frontTop + 4 * MM).toFixed(2)} Td (FRONT) Tj ET`,
    `BT /F1 9 Tf ${x.toFixed(2)} ${(backTop + 4 * MM).toFixed(2)} Td (BACK) Tj ET`,
    `q ${CARD_W.toFixed(2)} 0 0 ${CARD_H.toFixed(2)} ${x.toFixed(2)} ${(frontTop - CARD_H).toFixed(2)} cm /Im1 Do Q`,
    `q ${CARD_W.toFixed(2)} 0 0 ${CARD_H.toFixed(2)} ${x.toFixed(2)} ${(backTop - CARD_H).toFixed(2)} cm /Im2 Do Q`,
    '0.72 0.72 0.72 RG 0.5 w',
    roundRect(x, frontTop - CARD_H, CARD_W, CARD_H, CARD_R), 'S',
    roundRect(x, backTop - CARD_H, CARD_W, CARD_H, CARD_R), 'S',
    '0.45 0.38 0.38 rg',
    `${center(8.5, hint1)}${(backTop - CARD_H - 14 * MM).toFixed(2)} Td (${hint1}) Tj ET`,
    `${center(8.5, hint2)}${(backTop - CARD_H - 19 * MM).toFixed(2)} Td (${hint2}) Tj ET`,
  ].join('\n');

  // ---- assemble the PDF ----
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (p: string | Uint8Array) => { const b = typeof p === 'string' ? enc.encode(p) : p; parts.push(b); length += b.length; };
  const obj = (n: number, body: string) => { offsets[n] = length; push(`${n} 0 obj\n${body}\nendobj\n`); };
  const image = (n: number, img: { bytes: Uint8Array; w: number; h: number }) => {
    offsets[n] = length;
    push(`${n} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`);
    push(img.bytes);
    push('\nendstream\nendobj\n');
  };

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] `
    + '/Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 6 0 R /Im2 7 0 R >> >> /Contents 8 0 R >>');
  obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  obj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  image(6, front);
  image(7, back);
  const stream = enc.encode(content);
  offsets[8] = length;
  push(`8 0 obj\n<< /Length ${stream.length} >>\nstream\n`);
  push(stream);
  push('\nendstream\nendobj\n');
  obj(9, `<< /Title (${pdfText(`${input.memberNo} ID card`)}) /Producer (SKJV website) >>`);

  const xref = length;
  push(`xref\n0 10\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`);
  push(`trailer\n<< /Size 10 /Root 1 0 R /Info 9 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  return new Blob(parts as BlobPart[], { type: 'application/pdf' });
}
