import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, ToggleButtonGroup, ToggleButton,
  CircularProgress, IconButton
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon, Description as DescIcon } from '@mui/icons-material';
import { useInvoicePrint } from '../../hooks/useInvoicePrint';
import { generateInvoiceHtml, type InvoicePaymentData } from './InvoicePrintView';

interface Props {
  open: boolean;
  onClose: () => void;
  paymentData: InvoicePaymentData | null;
}

const InvoicePreviewDialog: React.FC<Props> = ({ open, onClose, paymentData }) => {
  const [paperSize, setPaperSize] = useState<'A5' | 'A4'>('A5');
  const { printInvoice } = useInvoicePrint();

  if (!paymentData) return null;

  const invoiceHtml = generateInvoiceHtml(paymentData);

  const handlePrint = () => {
    printInvoice(invoiceHtml, paperSize);
  };

  const statusColor = paymentData.status === 'paid' ? '#16a34a' : paymentData.status === 'partial' ? '#d97706' : '#64748b';
  const statusText = paymentData.status === 'paid' ? 'Đã thanh toán' : paymentData.status === 'partial' ? 'Một phần' : 'Chưa thanh toán';
  const finalAmount = (paymentData.totalAmount || 0) - (paymentData.discountAmount || 0);
  const remaining = finalAmount - (paymentData.paidAmount || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #3D5A80 100%)',
        color: 'white',
        py: 2.5,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescIcon />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Xem trước hóa đơn
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {paymentData.student?.name} — {paymentData.class?.name} — T{paymentData.month}/{paymentData.year}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
        {/* Summary cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Tổng cộng', value: finalAmount, color: '#1e3a5f' },
            { label: 'Đã đóng', value: paymentData.paidAmount || 0, color: '#16a34a' },
            { label: 'Còn thiếu', value: remaining > 0 ? remaining : 0, color: '#dc2626' },
          ].map((item, i) => (
            <Box key={i} sx={{
              flex: 1, minWidth: 140, bgcolor: 'white', borderRadius: 2, p: 2,
              border: '1px solid #e2e8f0', textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                {item.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: item.color, mt: 0.5 }}>
                {item.value.toLocaleString('vi-VN')} ₫
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: 1,
            border: `1.5px solid ${statusColor}`, color: statusColor,
            fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5
          }}>
            {statusText}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {paymentData.histories?.length || 0} lần thanh toán
          </Typography>
        </Box>

        {/* Invoice preview (scaled iframe-like) */}
        <Box sx={{
          bgcolor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          p: 2,
          maxHeight: 400,
          overflow: 'auto',
          '& .invoice': { transform: 'scale(0.85)', transformOrigin: 'top center' }
        }}>
          <div dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
        </Box>

        {/* Paper size selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Khổ giấy:
          </Typography>
          <ToggleButtonGroup
            value={paperSize}
            exclusive
            onChange={(_, v) => v && setPaperSize(v)}
            size="small"
          >
            <ToggleButton value="A5" sx={{ px: 2, fontWeight: 700 }}>A5</ToggleButton>
            <ToggleButton value="A4" sx={{ px: 2, fontWeight: 700 }}>A4</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Đóng
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          startIcon={<PrintIcon />}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3,
            bgcolor: '#1E3A5F',
            '&:hover': { bgcolor: '#2E4A6F' }
          }}
        >
          In hóa đơn ({paperSize})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
