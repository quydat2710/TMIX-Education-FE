import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Helper function to get status color and icon
const getStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return {
        color: 'success',
        icon: <CheckCircleIcon />,
        label: 'Đã thanh toán'
      };
    case 'pending':
    case 'processing':
      return {
        color: 'warning',
        icon: <PendingIcon />,
        label: 'Đang xử lý'
      };
    case 'failed':
    case 'cancelled':
      return {
        color: 'error',
        icon: <CancelIcon />,
        label: 'Thất bại'
      };
    case 'partial':
      return {
        color: 'info',
        icon: <PaymentIcon />,
        label: 'Thanh toán một phần'
      };
    default:
      return {
        color: 'default',
        icon: <ScheduleIcon />,
        label: status || 'Không xác định'
      };
  }
};

// Helper function to get payment method label
const getPaymentMethodLabel = (method) => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return 'Tiền mặt';
    case 'bank_transfer':
      return 'Chuyển khoản';
    case 'credit_card':
      return 'Thẻ tín dụng';
    case 'debit_card':
      return 'Thẻ ghi nợ';
    case 'momo':
      return 'Ví MoMo';
    case 'vnpay':
      return 'VNPay';
    case 'zalopay':
      return 'ZaloPay';
    default:
      return method || 'Không xác định';
  }
};

const PaymentHistoryModal = ({
  open,
  onClose,
  paymentData, // Direct payment data instead of paymentId
  title = "Lịch sử thanh toán",
  showPaymentDetails = true // Whether to show payment details at the top
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (open && paymentData) {
      // Extract data from paymentData
      setPaymentHistory(paymentData.paymentHistory || []);

      if (showPaymentDetails) {
        setPaymentDetails({
          paymentCode: `INV-${paymentData.month}/${paymentData.year}-${paymentData.id?.slice(-6)}`,
          totalAmount: paymentData.totalAmount || 0,
          paidAmount: paymentData.paidAmount || 0,
          remainingAmount: paymentData.remainingAmount || 0,
          finalAmount: paymentData.finalAmount || 0,
          discountAmount: paymentData.discountAmount || 0,
          status: paymentData.status,
          month: paymentData.month,
          year: paymentData.year,
          className: paymentData.classId?.name || 'N/A',
          studentName: paymentData.studentId?.userId?.name || 'N/A'
        });
      }
    }
  }, [open, paymentData, showPaymentDetails]);

  const handleClose = () => {
    setPaymentHistory([]);
    setPaymentDetails(null);
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{
        ...commonStyles.dialogTitle,
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
        color: 'white',
        textAlign: 'center',
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: 1, color: 'black' }}>
          Lịch sử thanh toán
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <ReceiptIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Payment Details Section */}
            {showPaymentDetails && paymentDetails && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary, fontWeight: 600 }}>
                  Thông tin thanh toán
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Học sinh: {paymentDetails.studentName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Lớp học: {paymentDetails.className}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Tháng/Năm: {paymentDetails.month}/{paymentDetails.year}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Số tiền gốc: {formatCurrency(paymentDetails.totalAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Giảm giá: {formatCurrency(paymentDetails.discountAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Số tiền cuối: {formatCurrency(paymentDetails.finalAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Đã thanh toán: {formatCurrency(paymentDetails.paidAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Còn lại: {formatCurrency(paymentDetails.remainingAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Trạng thái:
                        <Chip
                          label={getStatusInfo(paymentDetails.status).label}
                          color={getStatusInfo(paymentDetails.status).color}
                          size="small"
                          icon={getStatusInfo(paymentDetails.status).icon}
                          variant="outlined"
                        />
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Payment History Table */}
            <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary, fontWeight: 600 }}>
              Lịch sử giao dịch
            </Typography>

            {paymentHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  Chưa có lịch sử thanh toán
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                        Thời gian
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                        Số tiền
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                        Phương thức
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                        Ghi chú
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistory.map((transaction, index) => {
                      const statusInfo = getStatusInfo(transaction.status || 'completed'); // Default to completed since paymentHistory items are usually completed
                      return (
                        <TableRow key={transaction.id || index} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(transaction.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: transaction.amount > 0 ? 'success.main' : 'error.main'
                              }}
                            >
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getPaymentMethodLabel(transaction.method)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {transaction.note || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Summary Section */}
            {paymentHistory.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Tổng giao dịch: <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                          {paymentHistory.length}
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Tổng đã thanh toán: <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {formatCurrency(
                            paymentHistory.reduce((sum, t) => sum + (t.amount || 0), 0)
                          )}
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Giao dịch thành công: <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {paymentHistory.length}
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentHistoryModal;
