/**
 * useInvoicePrint — Custom hook for printing invoices
 * Opens a separate print window with invoice HTML + print CSS
 */
export const useInvoicePrint = () => {
  const printInvoice = (invoiceHtml: string, size: 'A5' | 'A4' = 'A5') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Trình duyệt đã chặn cửa sổ mới. Vui lòng cho phép popup.');
      return;
    }

    const pageWidth = size === 'A5' ? '148mm' : '210mm';
    const pageHeight = size === 'A5' ? '210mm' : '297mm';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Hóa đơn học phí — TMIX Education</title>
        <style>
          @page {
            size: ${size} portrait;
            margin: 8mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice {
            width: ${pageWidth};
            min-height: ${pageHeight};
            margin: 0 auto;
            padding: 6mm;
          }

          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px; margin-bottom: 10px; }
          .brand h1 { font-size: 18px; color: #1e3a5f; margin: 0; letter-spacing: 1px; }
          .brand .subtitle { font-size: 10px; color: #64748b; }
          .brand-info { font-size: 9px; color: #64748b; text-align: right; line-height: 1.6; }

          /* Invoice title */
          .invoice-title { text-align: center; margin: 12px 0 10px; }
          .invoice-title h2 { font-size: 16px; text-transform: uppercase; color: #1e3a5f; letter-spacing: 2px; }
          .invoice-code { font-size: 10px; color: #64748b; margin-top: 2px; }

          /* Info grid */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; }
          .info-box .label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
          .info-box .value { font-size: 12px; font-weight: 700; margin-top: 2px; }

          /* Billing table */
          .billing-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
          .billing-table th { background: #1e3a5f; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
          .billing-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
          .billing-table tr:nth-child(even) { background: #f8fafc; }
          .billing-table .amount { text-align: right; font-weight: 600; }
          .billing-table .total-row { background: #f1f5f9 !important; font-weight: 700; border-top: 2px solid #1e3a5f; }
          .billing-table .total-row td { padding: 8px; }
          .billing-table .remaining { color: #dc2626; }
          .billing-table .paid { color: #16a34a; }

          /* History table */
          .history-section { margin-bottom: 12px; }
          .history-section h3 { font-size: 11px; color: #1e3a5f; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
          .history-table { width: 100%; border-collapse: collapse; font-size: 10px; }
          .history-table th { background: #f1f5f9; padding: 5px 8px; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #cbd5e1; }
          .history-table td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }

          /* Status badge — B&W print friendly */
          .status-badge { display: inline-block; padding: 3px 10px; border: 1.5px solid #333; border-radius: 3px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .status-paid { border-color: #16a34a; color: #16a34a; }
          .status-partial { border-color: #d97706; color: #d97706; }
          .status-pending { border-color: #64748b; color: #64748b; }

          /* QR section */
          .qr-section { text-align: center; margin: 10px 0; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 6px; }
          .qr-section img { width: 120px; height: 120px; }
          .qr-section .qr-label { font-size: 9px; color: #64748b; margin-top: 4px; }
          .qr-section .qr-amount { font-size: 12px; font-weight: 700; color: #dc2626; }

          /* Footer */
          .footer { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 16px; }
          .sig-box { text-align: center; width: 40%; }
          .sig-box .sig-title { font-size: 10px; font-weight: 700; margin-bottom: 40px; }
          .sig-box .sig-line { border-top: 1px dotted #94a3b8; padding-top: 4px; font-size: 9px; color: #94a3b8; }
          .footer-meta { display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; margin-top: 8px; }

          @media print {
            body { background: #fff; }
            .invoice { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${invoiceHtml}
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
          window.onafterprint = function() { window.close(); };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return { printInvoice };
};
