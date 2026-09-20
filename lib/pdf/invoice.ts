import PDFDocument from 'pdfkit';
import path from 'path';

const GOLD = '#bfa054';
const DARK = '#09090b';
const MUTED = '#71717a';
const BORDER = '#e4e4e7';

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Renders a paid-ride invoice as a PDF buffer, attached to the
 * ride-completed email sent to the passenger.
 */
export function generateInvoicePdf(
  booking: any,
  contact?: { phoneDisplay?: string; dispatchEmail?: string }
): Promise<Buffer> {
  const phoneDisplay = contact?.phoneDisplay || '(617) 784-0264';
  const dispatchEmail = contact?.dispatchEmail || 'info@gmlimoservices.com';

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const tipAmount = Number(booking.tipAmount) || 0;
    const total = Number(booking.estimatedPrice) || 0;
    const baseFare = Math.max(total - tipAmount, 0);

    // ── Header ───────────────────────────────────────────────
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
    try {
      doc.image(logoPath, 50, 40, { width: 110 });
    } catch {
      // Fall back to text-only header if the logo asset is unavailable.
      doc
        .fillColor(DARK)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('GM LIMO SERVICES', 50, 50);
      doc
        .fillColor(MUTED)
        .fontSize(9)
        .font('Helvetica')
        .text('Boston Luxury Chauffeur Services', 50, 74);
    }

    doc
      .fillColor(DARK)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('INVOICE', 0, 50, { align: 'right' });
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font('Helvetica')
      .text(`Invoice #: ${booking.confirmationNumber}`, { align: 'right' })
      .text(`Date: ${new Date().toLocaleDateString('en-US')}`, { align: 'right' });
    doc
      .fillColor('#166534')
      .font('Helvetica-Bold')
      .text('PAID', { align: 'right' });

    doc.moveTo(50, 120).lineTo(545, 120).strokeColor(GOLD).lineWidth(1.5).stroke();

    // ── Bill To ──────────────────────────────────────────────
    doc
      .fillColor(DARK)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Bill To', 50, 138);
    doc
      .fillColor('#334155')
      .fontSize(10)
      .font('Helvetica')
      .text(booking.fullName || 'Valued Passenger', 50, 155)
      .text(booking.email || '', 50, 170)
      .text(booking.phone || '', 50, 185);

    // ── Trip Details ─────────────────────────────────────────
    let y = 220;
    doc
      .fillColor(DARK)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Trip Details', 50, y);
    y += 20;

    const detailRow = (label: string, value: string) => {
      doc
        .fillColor('#334155')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(label, 50, y, { width: 140 })
        .font('Helvetica')
        .text(value, 200, y, { width: 345 });
      y += 18;
    };

    detailRow('Service:', booking.serviceType || 'Chauffeur Transfer');
    if (booking.vehicleSlug) {
      detailRow('Fleet Tier:', String(booking.vehicleSlug).replace(/-/g, ' '));
    }
    detailRow('Pickup Date:', `${booking.pickupDate} at ${booking.pickupTime}`);
    detailRow('Pickup Location:', booking.pickupLocation || '');
    if (booking.dropoffLocation) {
      detailRow('Drop-off:', booking.dropoffLocation);
    }
    detailRow('Passengers / Bags:', `${booking.passengers ?? 1} Passengers, ${booking.luggage ?? 1} Luggage`);

    // ── Charges ──────────────────────────────────────────────
    y += 15;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(BORDER).lineWidth(1).stroke();
    y += 20;

    doc
      .fillColor(DARK)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Charges', 50, y);
    y += 20;

    const chargeRow = (label: string, value: string, bold = false) => {
      doc
        .fillColor('#334155')
        .fontSize(10)
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .text(label, 50, y)
        .text(value, 0, y, { align: 'right' });
      y += 18;
    };

    chargeRow('Base Fare', money(baseFare));
    if (tipAmount > 0) {
      chargeRow('Chauffeur Gratuity', money(tipAmount));
    }

    y += 5;
    doc.moveTo(350, y).lineTo(545, y).strokeColor(BORDER).lineWidth(1).stroke();
    y += 12;

    doc
      .fillColor(GOLD)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Total Paid', 50, y)
      .text(money(total), 0, y, { align: 'right' });

    // ── Footer ───────────────────────────────────────────────
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font('Helvetica')
      .text(
        `Thank you for riding with GM Limo Services. For questions about this invoice, contact 24/7 dispatch at ${phoneDisplay} or ${dispatchEmail}.`,
        50,
        740,
        { width: 495, align: 'center' }
      );

    doc.end();
  });
}
