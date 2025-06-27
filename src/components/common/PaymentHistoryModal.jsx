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
  paymentId,
  fetchPaymentHistoryAPI, // API function to fetch payment history
  title = "Lịch sử thanh toán",
  showPaymentDetails = true // Whether to show payment details at the top
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (open && paymentId) {
      fetchPaymentHistory();
    }
  }, [open, paymentId]);

  const fetchPaymentHistory = async () => {
    if (!paymentId || !fetchPaymentHistoryAPI) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetchPaymentHistoryAPI(paymentId);

      if (response.data) {
        setPaymentHistory(response.data.paymentHistory || []);
        if (showPaymentDetails) {
          setPaymentDetails(response.data.paymentDetails || null);
        }
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(err?.response?.data?.message || 'Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

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
        py: 2
      }}>
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
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Mã thanh toán
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {paymentDetails.paymentCode || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Tổng số tiền
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.primary }}>
                        {formatCurrency(paymentDetails.totalAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Đã thanh toán
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                        {formatCurrency(paymentDetails.paidAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                        Còn lại
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                        {formatCurrency((paymentDetails.totalAmount || 0) - (paymentDetails.paidAmount || 0))}
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
                      const statusInfo = getStatusInfo(transaction.status);
                      return (
                        <TableRow key={transaction.id || index} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(transaction.paymentDate)}
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
                              {getPaymentMethodLabel(transaction.paymentMethod)}
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
                      <Typography variant="caption" color="textSecondary">
                        Tổng giao dịch
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {paymentHistory.length}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Tổng đã thanh toán
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(
                          paymentHistory
                            .filter(t => t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'paid')
                            .reduce((sum, t) => sum + (t.amount || 0), 0)
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Giao dịch thành công
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {paymentHistory.filter(t =>
                          t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'paid'
                        ).length}
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
