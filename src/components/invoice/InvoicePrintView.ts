/**
 * InvoicePrintView — Pure printable invoice component
 * Generates invoice HTML string from payment data.
 * No API calls, no state management — purely data → HTML.
 */

import logoUrl from '../../assets/logo_tmix.png';
export interface InvoicePaymentData {
  id: string;
  referenceCode?: string;
  month: number;
  year: number;
  totalLessons: number;
  paidAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  student: { id?: string; name: string; email?: string; phone?: string };
  class: { id?: string; name: string };
  histories?: Array<{
    amount: number;
    method: string;
    note: string | null;
    date?: string;
    createdAt?: string;
  }>;
}

const BANK_CODE = import.meta.env.VITE_PAYMENT_BANK || 'MBBank';
const BANK_ACCOUNT = import.meta.env.VITE_PAYMENT_ACC || '';

const formatCurrency = (amount: number): string =>
  amount.toLocaleString('vi-VN') + ' ₫';

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'paid': return 'ĐÃ THANH TOÁN';
    case 'partial': return 'THANH TOÁN MỘT PHẦN';
    default: return 'CHƯA THANH TOÁN';
  }
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'paid': return 'status-paid';
    case 'partial': return 'status-partial';
    default: return 'status-pending';
  }
};

const getMethodText = (method: string): string => {
  switch (method) {
    case 'cash': return 'Tiền mặt';
    case 'bank_transfer': return 'Chuyển khoản';
    case 'card': return 'Thẻ';
    default: return method;
  }
};

/**
 * Generate invoice number from referenceCode
 * Format: INV-YYYY-XXXXXX
 */
const generateInvoiceNumber = (data: InvoicePaymentData): string => {
  if (data.referenceCode) {
    return `INV-${data.year}-${data.referenceCode.slice(-6).toUpperCase()}`;
  }
  return `INV-${data.year}-${data.id.slice(0, 6).toUpperCase()}`;
};

/**
 * Build VietQR URL for remaining payment
 * Content must match backend webhook matching: "{studentName} {className} {referenceCode}"
 */
const buildQrUrl = (amount: number, data: InvoicePaymentData): string | null => {
  if (amount <= 0 || !BANK_ACCOUNT) return null;
  const refCode = data.referenceCode || '';
  const content = `${data.student?.name || ''} ${data.class?.name || ''} ${refCode}`.trim();
  const info = encodeURIComponent(content);
  return `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACCOUNT}-compact.png?amount=${amount}&addInfo=${info}&accountName=TMIX%20Education`;
};

/**
 * Generate the full invoice HTML string
 */
export const generateInvoiceHtml = (data: InvoicePaymentData): string => {
  const finalAmount = (data.totalAmount || 0) - (data.discountAmount || 0);
  const remaining = finalAmount - (data.paidAmount || 0);
  const invoiceNumber = generateInvoiceNumber(data);
  const now = new Date();
  const printDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const qrUrl = buildQrUrl(remaining, data);

  // Payment history rows
  const historyRows = (data.histories || []).map(h => `
    <tr>
      <td>${formatDate(h.createdAt || h.date as any)}</td>
      <td>${getMethodText(h.method)}</td>
      <td class="amount">${formatCurrency(h.amount)}</td>
      <td>${h.note || '—'}</td>
    </tr>
  `).join('');

  return `
    <div class="invoice">
      <!-- Header -->
      <div class="header">
        <div class="brand">
          <div style="display:flex;align-items:center;gap:8px">
            <img src="${logoUrl}" alt="TMIX" style="height:36px;width:auto;object-fit:contain" />
            <div>
              <h1 style="margin:0">TMIX Education</h1>
              <div class="subtitle">Trung tâm Anh ngữ TMIX</div>
            </div>
          </div>
        </div>
        <div class="brand-info">
          📞 Hotline: 0346 857 241<br/>
          📧 contact@tmix.edu.vn<br/>
          📍 TP. Hà Nội, Việt Nam
        </div>
      </div>

      <!-- Invoice Title -->
      <div class="invoice-title">
        <h2>Hóa Đơn Học Phí</h2>
        <div class="invoice-code">${invoiceNumber} &nbsp;|&nbsp; Tháng ${data.month}/${data.year}</div>
      </div>

      <!-- Student & Class Info -->
      <div class="info-grid">
        <div class="info-box">
          <div class="label">Học sinh</div>
          <div class="value">${data.student?.name || 'N/A'}</div>
        </div>
        <div class="info-box">
          <div class="label">Lớp học</div>
          <div class="value">${data.class?.name || 'N/A'}</div>
        </div>
        <div class="info-box">
          <div class="label">Kỳ thanh toán</div>
          <div class="value">Tháng ${data.month}/${data.year}</div>
        </div>
        <div class="info-box">
          <div class="label">Trạng thái</div>
          <div class="value"><span class="status-badge ${getStatusClass(data.status)}">${getStatusText(data.status)}</span></div>
        </div>
      </div>

      <!-- Billing Table -->
      <table class="billing-table">
        <thead>
          <tr>
            <th>Mô tả</th>
            <th class="amount">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Học phí (${data.totalLessons || 0} buổi)</td>
            <td class="amount">${formatCurrency(data.totalAmount || 0)}</td>
          </tr>
          ${data.discountAmount > 0 ? `
          <tr>
            <td>Giảm giá</td>
            <td class="amount" style="color:#16a34a">- ${formatCurrency(data.discountAmount)}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td>Tổng cộng</td>
            <td class="amount">${formatCurrency(finalAmount)}</td>
          </tr>
          <tr>
            <td>Đã thanh toán</td>
            <td class="amount paid">${formatCurrency(data.paidAmount || 0)}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Còn lại</strong></td>
            <td class="amount remaining"><strong>${formatCurrency(remaining > 0 ? remaining : 0)}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Payment History -->
      ${data.histories && data.histories.length > 0 ? `
      <div class="history-section">
        <h3>Lịch sử thanh toán</h3>
        <table class="history-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Phương thức</th>
              <th style="text-align:right">Số tiền</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>${historyRows}</tbody>
        </table>
      </div>` : ''}

      <!-- QR Payment -->
      ${qrUrl && remaining > 0 ? `
      <div class="qr-section">
        <div class="qr-amount">Còn thiếu: ${formatCurrency(remaining)}</div>
        <img src="${qrUrl}" alt="QR Thanh toán" />
        <div class="qr-label">Quét mã QR để thanh toán qua ${BANK_CODE}</div>
      </div>` : ''}

      <!-- Footer -->
      <div class="footer">
        <div class="signatures">
          <div class="sig-box">
            <div class="sig-title">Phụ huynh / Học sinh</div>
            <div class="sig-line">(Ký, ghi rõ họ tên)</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">Trung tâm TMIX</div>
            <div class="sig-line">(Ký, đóng dấu)</div>
          </div>
        </div>
        <div class="footer-meta">
          <span>Mã: ${invoiceNumber}</span>
          <span>In lúc: ${printDate}</span>
        </div>
      </div>
    </div>
  `;
};
