import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ProductRepository } from '@/database/repositories/ProductRepository';
import { formatCurrency } from '@/utils/currency';

export async function exportToPDF(): Promise<void> {
  const products = await ProductRepository.getAll();

  // Calculate totals
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  // Generate HTML for PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 20px;
      color: #1e293b;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #4f46e5;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0 0 0;
      color: #64748b;
      font-size: 14px;
    }
    .summary {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-item .label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .summary-item .value {
      font-size: 24px;
      font-weight: bold;
      color: #4f46e5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    thead {
      background: #4f46e5;
      color: white;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    tbody tr:hover {
      background: #f8fafc;
    }
    .stock-low {
      color: #f59e0b;
      font-weight: 600;
    }
    .stock-out {
      color: #dc2626;
      font-weight: 600;
    }
    .stock-ok {
      color: #16a34a;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📦 ScanStock Inventory Report</h1>
    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="label">Total Products</div>
      <div class="value">${totalProducts}</div>
    </div>
    <div class="summary-item">
      <div class="label">Total Items</div>
      <div class="value">${totalItems}</div>
    </div>
    <div class="summary-item">
      <div class="label">Total Value</div>
      <div class="value">${formatCurrency(totalValue)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Barcode</th>
        <th style="text-align: right;">Price</th>
        <th style="text-align: right;">Stock</th>
        <th style="text-align: right;">Total Value</th>
      </tr>
    </thead>
    <tbody>
      ${products
        .map(
          product => `
        <tr>
          <td><strong>${escapeHtml(product.name)}</strong></td>
          <td>${product.barcode || '—'}</td>
          <td style="text-align: right;">${formatCurrency(product.price)}</td>
          <td style="text-align: right;" class="${
            product.stock === 0
              ? 'stock-out'
              : product.stock <= 5
                ? 'stock-low'
                : 'stock-ok'
          }">
            ${product.stock}
          </td>
          <td style="text-align: right;">${formatCurrency(
            product.price * product.stock
          )}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated with ScanStock — Inventory & Price List</p>
    <p>This is an automated report. All data is accurate as of generation time.</p>
  </div>
</body>
</html>
  `;

  // Generate PDF
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  // Share the PDF
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Export Inventory Report',
      UTI: 'com.adobe.pdf',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
