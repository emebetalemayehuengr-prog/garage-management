const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const money = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const dateTime = (value) =>
  new Date(value || Date.now()).toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const profileHeader = (profile) => `
  <header class="company-header">
    <div class="brand">
      ${profile?.logo ? `<img class="logo" src="${profile.logo}" alt="Company logo" />` : ''}
      <div>
        <h1>${escapeHtml(profile?.companyName || 'Company profile not configured')}</h1>
        <p>${escapeHtml(profile?.address || '')}</p>
        <p>${escapeHtml([profile?.phone, profile?.email].filter(Boolean).join(' • '))}</p>
        ${profile?.taxNumber ? `<p><strong>Tax/VAT:</strong> ${escapeHtml(profile.taxNumber)}</p>` : ''}
        ${profile?.registrationNumber ? `<p><strong>License:</strong> ${escapeHtml(profile.registrationNumber)}</p>` : ''}
      </div>
    </div>
  </header>`;

const documentStyles = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #172033; background: #eef2f7; font-family: Arial, Helvetica, sans-serif; }
  .sheet { position: relative; width: 210mm; min-height: 297mm; margin: 16px auto; padding: 14mm 14mm 12mm; background: white; box-shadow: 0 8px 30px rgba(15,23,42,.14); overflow: hidden; }
  .company-header { border-bottom: 3px solid #173b67; padding-bottom: 11px; }
  .brand { display: flex; align-items: flex-start; gap: 14px; }
  .logo { width: 78px; height: 78px; object-fit: contain; }
  h1 { margin: 0 0 3px; color: #102f55; font-size: 25px; letter-spacing: .3px; text-transform: uppercase; }
  .company-header p { margin: 2px 0; font-size: 11px; color: #42536a; }
  .document-title { margin: 18px 0 13px; text-align: center; font-size: 22px; color: #111827; text-transform: uppercase; letter-spacing: 1px; }
  .meta-grid { display: grid; grid-template-columns: 1.25fr .9fr; gap: 12px; margin-bottom: 14px; }
  .info-box { border: 1px solid #7b8798; }
  .info-box h3 { margin: 0; padding: 6px 8px; background: #e8eef5; color: #173b67; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
  .info-row { display: grid; grid-template-columns: 105px 1fr; min-height: 24px; border-top: 1px solid #b9c0ca; font-size: 10.5px; }
  .info-row b, .info-row span { padding: 5px 7px; }
  .info-row b { border-right: 1px solid #b9c0ca; background: #fafbfc; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  th, td { border: 1px solid #778393; padding: 6px 5px; vertical-align: top; }
  th { background: #e2e8f0; color: #172033; text-align: center; font-weight: 700; }
  td.number { text-align: right; white-space: nowrap; }
  td.center { text-align: center; }
  .summary { display: grid; grid-template-columns: 1fr 270px; gap: 20px; margin-top: 14px; align-items: start; }
  .payment-info { font-size: 10.5px; line-height: 1.6; }
  .bank { margin-top: 8px; padding: 8px; border: 1px solid #c5ccd5; white-space: pre-line; }
  .totals td:first-child { font-weight: 700; background: #f8fafc; }
  .totals .grand td { border-top: 2px solid #173b67; background: #e2e8f0; font-size: 12px; font-weight: 800; }
  .stamp-signatures { position: relative; display: grid; grid-template-columns: 1fr 150px 1fr; gap: 18px; align-items: end; min-height: 130px; margin-top: 20px; }
  .stamp { display: flex; align-items: center; justify-content: center; }
  .stamp img { max-width: 140px; max-height: 125px; object-fit: contain; }
  .signature { padding-top: 42px; border-bottom: 1px solid #374151; font-size: 10px; text-align: center; }
  .footer { position: absolute; right: 14mm; bottom: 10mm; left: 14mm; border-top: 1px solid #9ca3af; padding-top: 7px; font-size: 9.5px; color: #596579; text-align: center; white-space: pre-line; }
  .watermark { position: absolute; top: 45%; left: 50%; z-index: 5; transform: translate(-50%,-50%) rotate(-28deg); border: 8px solid rgba(185,28,28,.13); padding: 12px 24px; color: rgba(185,28,28,.13); font-size: 70px; font-weight: 900; letter-spacing: 7px; pointer-events: none; }
  .receipt-amount { margin: 18px 0; padding: 14px; border: 2px solid #173b67; background: #f1f5f9; text-align: center; }
  .receipt-amount span { display: block; font-size: 10px; text-transform: uppercase; }
  .receipt-amount strong { display: block; margin-top: 4px; color: #102f55; font-size: 26px; }
  .receipt-sheet { width: 148mm; min-height: 210mm; padding: 9mm; }
  .receipt-sheet .meta-grid { grid-template-columns: 1fr; gap: 8px; }
  .receipt-sheet .stamp-signatures { grid-template-columns: 1fr 100px 1fr; min-height: 90px; margin-top: 12px; }
  .receipt-sheet .stamp img { max-width: 95px; max-height: 85px; }
  .receipt-sheet .footer { right: 9mm; bottom: 7mm; left: 9mm; }
  @media print {
    body { background: white; }
    .sheet { width: auto; min-height: 273mm; margin: 0; padding: 0; box-shadow: none; }
    .footer { right: 0; bottom: 0; left: 0; }
  }
`;

const shell = (title, content) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${documentStyles}</style></head><body>${content}</body></html>`;

const infoRow = (label, value) =>
  `<div class="info-row"><b>${escapeHtml(label)}</b><span>${escapeHtml(value || 'N/A')}</span></div>`;

const normalizedInvoiceItems = (invoice) => {
  const services = invoice.serviceItems?.length
    ? invoice.serviceItems.map((item) => ({ ...item, type: 'Service', partNumber: '' }))
    : invoice.serviceCharge
      ? [
          {
            description: 'Service and labor charge',
            quantity: 1,
            unitPrice: invoice.serviceCharge,
            type: 'Service',
            partNumber: '',
          },
        ]
      : [];
  const parts = invoice.partItems?.length
    ? invoice.partItems.map((item) => ({ ...item, type: 'Part' }))
    : invoice.partsCost
      ? [
          {
            description: 'Spare parts',
            quantity: 1,
            unitPrice: invoice.partsCost,
            type: 'Part',
            partNumber: '',
          },
        ]
      : [];
  return [...services, ...parts];
};

export const buildInvoiceHtml = ({
  invoice,
  jobCard,
  customer,
  vehicle,
  profile,
  isDuplicate = false,
}) => {
  const items = normalizedInvoiceItems(invoice);
  const rawSubtotal = invoice.subtotal ?? invoice.totalAmount ?? 0;
  const tax = invoice.taxAmount ?? 0;
  const grandTotal = invoice.totalAmount ?? rawSubtotal + tax;
  const balance = Math.max(0, grandTotal - (invoice.paidAmount || 0));
  return shell(
    `Invoice INV-${invoice.id}`,
    `
    <main class="sheet">
      ${isDuplicate ? '<div class="watermark">DUPLICATE</div>' : ''}
      ${profileHeader(profile)}
      <h2 class="document-title">Tax Invoice</h2>
      <section class="meta-grid">
        <div class="info-box"><h3>Bill to</h3>
          ${infoRow('Customer', customer?.name)}${infoRow('Phone', customer?.phone)}${infoRow('Address', customer?.address)}
          ${infoRow('Vehicle', [vehicle?.manufacturer, vehicle?.model, vehicle?.year].filter(Boolean).join(' '))}${infoRow('Plate No.', vehicle?.plateNumber)}
        </div>
        <div class="info-box"><h3>Invoice details</h3>
          ${infoRow('Invoice No.', `INV-${invoice.id}`)}${infoRow('Date & time', dateTime(invoice.createdAt))}
          ${infoRow('Job card', jobCard?.id ? `JOB-${jobCard.id}` : 'N/A')}${infoRow('Payment status', String(invoice.status || 'pending').toUpperCase())}
          ${infoRow('Description', jobCard?.problemDescription)}
        </div>
      </section>
      <table><thead><tr><th style="width:34px">#</th><th>Type</th><th>Description</th><th>Part No.</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
        <tbody>${items.map((item, index) => `<tr><td class="center">${index + 1}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.description)}</td><td>${escapeHtml(item.partNumber || '—')}</td><td class="center">${money(item.quantity)}</td><td class="number">${money(item.unitPrice)}</td><td class="number">${money(item.quantity * item.unitPrice)}</td></tr>`).join('') || '<tr><td colspan="7" class="center">No line items</td></tr>'}</tbody>
      </table>
      <section class="summary"><div class="payment-info">
        <p><strong>Payment method:</strong> ${escapeHtml(invoice.paymentMethod || 'Not recorded')}</p>
        ${profile?.bankInformation ? `<div class="bank"><strong>Bank / payment information</strong><br>${escapeHtml(profile.bankInformation)}</div>` : ''}
      </div><table class="totals">
        <tr><td>Subtotal</td><td class="number">ETB ${money(rawSubtotal + (invoice.discount || 0))}</td></tr>
        <tr><td>Discount</td><td class="number">ETB ${money(invoice.discount)}</td></tr>
        <tr><td>VAT (${money(invoice.vatRate)}%)</td><td class="number">ETB ${money(tax)}</td></tr>
        <tr class="grand"><td>Grand Total</td><td class="number">ETB ${money(grandTotal)}</td></tr>
        <tr><td>Paid</td><td class="number">ETB ${money(invoice.paidAmount)}</td></tr><tr><td>Balance</td><td class="number">ETB ${money(balance)}</td></tr>
      </table></section>
      <section class="stamp-signatures"><div class="signature">Prepared by: ${escapeHtml(profile?.ownerManagerName || '')}</div>
        <div class="stamp">${profile?.stamp ? `<img src="${profile.stamp}" alt="Company stamp" />` : ''}</div><div class="signature">Customer signature</div></section>
      <footer class="footer">${escapeHtml(profile?.invoiceFooter || 'Thank you for your business.')}</footer>
    </main>`
  );
};

export const buildReceiptHtml = ({
  invoice,
  payment,
  customer,
  vehicle,
  profile,
  isDuplicate = false,
}) => {
  const remaining = Math.max(0, (invoice.totalAmount || 0) - (invoice.paidAmount || 0));
  const content = `
    <main class="sheet receipt-sheet">
      ${isDuplicate ? '<div class="watermark">DUPLICATE</div>' : ''}${profileHeader(profile)}
      <h2 class="document-title">Payment Receipt</h2>
      <section class="meta-grid"><div class="info-box"><h3>Received from</h3>
        ${infoRow('Customer', customer?.name)}${infoRow('Phone', customer?.phone)}${infoRow('Address', customer?.address)}
        ${infoRow('Vehicle', [vehicle?.manufacturer, vehicle?.model, vehicle?.year].filter(Boolean).join(' '))}${infoRow('Plate No.', vehicle?.plateNumber)}
      </div><div class="info-box"><h3>Receipt details</h3>
        ${infoRow('Receipt No.', payment.receiptNumber)}${infoRow('Invoice No.', `INV-${invoice.id}`)}${infoRow('Payment date', dateTime(payment.paidAt))}${infoRow('Payment method', payment.paymentMethod)}
      </div></section>
      <div class="receipt-amount"><span>Amount received</span><strong>ETB ${money(payment.amount)}</strong></div>
      <table class="totals"><tr><td>Invoice total</td><td class="number">ETB ${money(invoice.totalAmount)}</td></tr><tr><td>Total paid to date</td><td class="number">ETB ${money(invoice.paidAmount)}</td></tr><tr class="grand"><td>Remaining balance</td><td class="number">ETB ${money(remaining)}</td></tr></table>
      ${profile?.bankInformation ? `<div class="bank"><strong>Payment information</strong><br>${escapeHtml(profile.bankInformation)}</div>` : ''}
      <section class="stamp-signatures"><div class="signature">Received by: ${escapeHtml(profile?.ownerManagerName || '')}</div><div class="stamp">${profile?.stamp ? `<img src="${profile.stamp}" alt="Company stamp" />` : ''}</div><div class="signature">Customer signature</div></section>
      <footer class="footer">${escapeHtml(profile?.invoiceFooter || 'Payment received with thanks.')}</footer>
    </main>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(`Receipt ${payment.receiptNumber}`)}</title><style>${documentStyles}\n@page { size: A5 portrait; margin: 8mm; }\n@media print { .receipt-sheet { min-height: 194mm; } }</style></head><body>${content}</body></html>`;
};

const openDocument = (html, shouldPrint = false) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('Pop-up blocked. Please allow pop-ups to view the document.');
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  if (shouldPrint)
    printWindow.addEventListener('load', () => setTimeout(() => printWindow.print(), 250), {
      once: true,
    });
};

export const previewInvoice = (data) => openDocument(buildInvoiceHtml(data));
export const printInvoice = (data) => openDocument(buildInvoiceHtml(data), true);
export const previewReceipt = (data) => openDocument(buildReceiptHtml(data));
export const printReceipt = (data) => openDocument(buildReceiptHtml(data), true);

export const downloadDocumentPdf = async (html, filename, options = {}) => {
  const { format = 'a4', width = 210, windowWidth = 794 } = options;
  const [{ jsPDF }] = await Promise.all([import('jspdf'), import('html2canvas')]);
  const frame = document.createElement('iframe');
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${windowWidth}px;height:1123px;border:0`;
  document.body.appendChild(frame);
  frame.contentDocument.open();
  frame.contentDocument.write(html);
  frame.contentDocument.close();
  await new Promise((resolve) => setTimeout(resolve, 350));
  const pdf = new jsPDF({ unit: 'mm', format, orientation: 'portrait' });
  await pdf.html(frame.contentDocument.querySelector('.sheet'), {
    html2canvas: { scale: 0.75, useCORS: true },
    margin: [0, 0, 0, 0],
    autoPaging: 'text',
    width,
    windowWidth,
  });
  pdf.save(filename);
  frame.remove();
};

export const downloadInvoicePdf = (data) =>
  downloadDocumentPdf(buildInvoiceHtml(data), `INV-${data.invoice.id}.pdf`);
export const downloadReceiptPdf = (data) =>
  downloadDocumentPdf(buildReceiptHtml(data), `${data.payment.receiptNumber}.pdf`, {
    format: 'a5',
    width: 148,
    windowWidth: 559,
  });

export const previewCompanyProfile = (profile) =>
  previewInvoice({
    profile,
    invoice: {
      id: 'PREVIEW',
      createdAt: new Date().toISOString(),
      status: 'pending',
      serviceItems: [
        { description: 'Vehicle inspection and service', quantity: 1, unitPrice: 1500 },
      ],
      partItems: [{ description: 'Oil filter', partNumber: 'OF-001', quantity: 1, unitPrice: 450 }],
      subtotal: 1950,
      vatRate: 15,
      taxAmount: 292.5,
      totalAmount: 2242.5,
      paidAmount: 0,
    },
    jobCard: { id: 'PREVIEW', problemDescription: 'Routine service and inspection' },
    customer: { name: 'Sample Customer', phone: '+251 900 000 000', address: 'Addis Ababa' },
    vehicle: { manufacturer: 'Toyota', model: 'Corolla', year: 2020, plateNumber: 'AA-00000' },
  });

export const printJobCard = (jobCard, customer, vehicle) => {
  const html = shell(
    `Job Card #${jobCard.id}`,
    `<main class="sheet"><h2 class="document-title">Job Card #${escapeHtml(jobCard.id)}</h2><section class="meta-grid"><div class="info-box"><h3>Customer</h3>${infoRow('Name', customer?.name)}${infoRow('Phone', customer?.phone)}${infoRow('Address', customer?.address)}</div><div class="info-box"><h3>Vehicle</h3>${infoRow('Plate', vehicle?.plateNumber)}${infoRow('Vehicle', [vehicle?.manufacturer, vehicle?.model, vehicle?.year].filter(Boolean).join(' '))}${infoRow('Status', jobCard.status)}</div></section><div class="info-box"><h3>Problem description</h3><p style="padding:10px;font-size:12px">${escapeHtml(jobCard.problemDescription || 'N/A')}</p></div></main>`
  );
  openDocument(html, true);
};
