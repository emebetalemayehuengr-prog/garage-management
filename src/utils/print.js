export const printInvoice = (invoice, jobCard, customer, vehicle) => {
  const printWindow = window.open('', '_blank');
  
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${invoice.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-details div {
            flex: 1;
          }
          .invoice-details h3 {
            color: #1e40af;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .invoice-details p {
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #1e40af;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 14px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .total-section {
            margin-top: 20px;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            margin: 10px 0;
          }
          .total-row span {
            width: 150px;
            font-size: 14px;
          }
          .total-row strong {
            width: 150px;
            font-size: 14px;
          }
          .grand-total {
            font-size: 18px;
            color: #1e40af;
            font-weight: bold;
            border-top: 2px solid #1e40af;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
          }
          .status.pending { background: #fef3c7; color: #92400e; }
          .status.partial { background: #fed7aa; color: #c2410c; }
          .status.paid { background: #d1fae5; color: #065f46; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GARAGE MANAGEMENT SYSTEM</h1>
          <p>Invoice Receipt</p>
        </div>

        <div class="invoice-details">
          <div>
            <h3>Invoice Details</h3>
            <p><strong>Invoice #:</strong> ${invoice.id}</p>
            <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></p>
          </div>
          <div>
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${customer?.name || 'N/A'}</p>
            <p><strong>Phone:</strong> ${customer?.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${customer?.address || 'N/A'}</p>
          </div>
        </div>

        <div class="invoice-details">
          <div>
            <h3>Vehicle Information</h3>
            <p><strong>Plate:</strong> ${vehicle?.plateNumber || 'N/A'}</p>
            <p><strong>Make:</strong> ${vehicle?.manufacturer || 'N/A'}</p>
            <p><strong>Model:</strong> ${vehicle?.model || 'N/A'}</p>
          </div>
          <div>
            <h3>Job Card Details</h3>
            <p><strong>Job #:</strong> ${jobCard?.id || 'N/A'}</p>
            <p><strong>Status:</strong> ${jobCard?.status || 'N/A'}</p>
            <p><strong>Description:</strong> ${jobCard?.problemDescription || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (ETB)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Service Charge</td>
              <td>ETB ${invoice.serviceCharge?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <td>Parts Cost</td>
              <td>ETB ${invoice.partsCost?.toFixed(2) || '0.00'}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <strong>ETB ${invoice.totalAmount?.toFixed(2) || '0.00'}</strong>
          </div>
          <div class="total-row">
            <span>Paid Amount:</span>
            <strong>ETB ${invoice.paidAmount?.toFixed(2) || '0.00'}</strong>
          </div>
          <div class="total-row grand-total">
            <span>Balance Due:</span>
            <strong>ETB ${((invoice.totalAmount || 0) - (invoice.paidAmount || 0)).toFixed(2)}</strong>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const printJobCard = (jobCard, customer, vehicle) => {
  const printWindow = window.open('', '_blank');
  
  const jobCardHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Job Card #${jobCard.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .details div {
            flex: 1;
          }
          .details h3 {
            color: #1e40af;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .details p {
            margin: 5px 0;
            font-size: 14px;
          }
          .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
          }
          .status.created { background: #dbeafe; color: #1e40af; }
          .status.inspected { background: #fef3c7; color: #92400e; }
          .status.assigned { background: #f3e8ff; color: #6b21a8; }
          .status.diagnosed { background: #ffedd5; color: #c2410c; }
          .status.repairing { background: #fee2e2; color: #991b1b; }
          .status.quality_check { background: #e0e7ff; color: #3730a3; }
          .status.invoiced { background: #d1fae5; color: #065f46; }
          .status.paid { background: #d1fae5; color: #065f46; }
          .status.delivered { background: #10b981; color: white; }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GARAGE MANAGEMENT SYSTEM</h1>
          <p>Job Card</p>
        </div>

        <div class="details">
          <div>
            <h3>Job Card Details</h3>
            <p><strong>Job #:</strong> ${jobCard.id}</p>
            <p><strong>Created:</strong> ${new Date(jobCard.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status ${jobCard.status}">${jobCard.status.toUpperCase()}</span></p>
          </div>
          <div>
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${customer?.name || 'N/A'}</p>
            <p><strong>Phone:</strong> ${customer?.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${customer?.address || 'N/A'}</p>
          </div>
        </div>

        <div class="details">
          <div>
            <h3>Vehicle Information</h3>
            <p><strong>Plate:</strong> ${vehicle?.plateNumber || 'N/A'}</p>
            <p><strong>Make:</strong> ${vehicle?.manufacturer || 'N/A'}</p>
            <p><strong>Model:</strong> ${vehicle?.model || 'N/A'}</p>
            <p><strong>Year:</strong> ${vehicle?.year || 'N/A'}</p>
          </div>
          <div>
            <h3>Problem Description</h3>
            <p>${jobCard.problemDescription || 'N/A'}</p>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(jobCardHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
};
