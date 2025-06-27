import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  MoneyOff as MoneyOffIcon,
  ReceiptLong as ReceiptLongIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AttachMoney as AttachMoneyIcon,
  Discount as DiscountIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import { getPaymentsByStudentAPI, getParentByIdAPI, getClassByIdAPI, payTuitionAPI } from '../../services/api';

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [paymentData, setPaymentData] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin phụ huynh và con cái
        const parentId = localStorage.getItem('parent_id');

        if (parentId) {
          const parentRes = await getParentByIdAPI(parentId);

          if (parentRes && parentRes.studentIds) {
            setChildren(parentRes.studentIds);

            // Fetch payment data cho từng học sinh
            const allPayments = [];
            for (const child of parentRes.studentIds) {
              try {
                const paymentRes = await getPaymentsByStudentAPI(child.id);

                if (paymentRes && paymentRes.data) {
                  // Thêm thông tin học sinh vào mỗi payment
                  const paymentsWithChildInfo = await Promise.all(paymentRes.data.map(async (payment) => {
                    // Fetch class information
                    let className = `Lớp ${payment.classId}`;
                    try {
                      const classRes = await getClassByIdAPI(payment.classId);
                      if (classRes && classRes.data) {
                        className = classRes.data.name || classRes.data.className || `Lớp ${payment.classId}`;
                      }
                    } catch (err) {
                      console.error('Error fetching class info for', payment.classId, ':', err);
                    }

                    return {
                      ...payment,
                      childName: child.userId.name,
                      childId: child.id,
                      invoiceCode: `INV-${payment.month}/${payment.year}-${payment.id.slice(-6)}`,
                      className: className,
                      month: `Tháng ${payment.month}/${payment.year}`,
                      originalAmount: payment.totalAmount,
                      finalAmount: payment.finalAmount,
                      dueDate: `${payment.month}/15/${payment.year}`,
                      createdAt: `${payment.month}/01/${payment.year}`,
                      description: `Học phí tháng ${payment.month}/${payment.year}`,
                    };
                  }));
                  allPayments.push(...paymentsWithChildInfo);
                }
              } catch (err) {
                console.error('Error fetching payments for child:', child.id, err);
              }
            }
            setPaymentData(allPayments);
          }
        }
      } catch (err) {
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Tính toán tổng quan
  const summary = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalDiscount = 0;
    let unpaidInvoices = 0;
    let paidInvoices = 0;

    paymentData.forEach(invoice => {
        if (invoice.status === 'paid') {
          totalPaid += invoice.finalAmount;
          paidInvoices++;
        } else {
          totalUnpaid += invoice.finalAmount;
          unpaidInvoices++;
        }
        totalDiscount += invoice.discountAmount;
    });

    return {
      totalPaid,
      totalUnpaid,
      totalDiscount,
      unpaidInvoices,
      paidInvoices,
      totalInvoices: unpaidInvoices + paidInvoices
    };
  }, [paymentData]);

  // Lọc hóa đơn theo tab
  const allInvoices = paymentData;
  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.className.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === 0) return matchesSearch; // Tất cả
    if (selectedTab === 1) return matchesSearch && invoice.status !== 'paid'; // Chưa thanh toán (pending, unpaid, etc.)
    if (selectedTab === 2) return matchesSearch && invoice.status === 'paid'; // Đã thanh toán

    return matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'success' : 'error';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'partial':
        return 'Đã thanh toán một phần';
      case 'pending':
        return 'Chờ thanh toán';
      case 'unpaid':
        return 'Chưa thanh toán';
      default:
        return 'Chưa thanh toán';
    }
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.remainingAmount.toString());
    setPaymentNote('');
    setPaymentMethod('cash');
    setPaymentError('');
    setPaymentSuccess('');
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentNote('');
    setPaymentMethod('cash');
    setPaymentError('');
    setPaymentSuccess('');
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoice || !paymentAmount) {
      setPaymentError('Vui lòng nhập số tiền thanh toán');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Số tiền thanh toán không hợp lệ');
      return;
    }

    if (amount > selectedInvoice.remainingAmount) {
      setPaymentError('Số tiền thanh toán không được vượt quá số tiền còn lại');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      console.log('Dữ liệu gửi đi khi thanh toán:', {
        paymentId: selectedInvoice.id,
        amount,
        method: paymentMethod,
        note: paymentNote || `Thanh toán học phí tháng ${selectedInvoice.month}`,
      });

      const response = await payTuitionAPI({
        paymentId: selectedInvoice.id,
        amount,
        method: paymentMethod,
        note: paymentNote || `Thanh toán học phí tháng ${selectedInvoice.month}`
      });
      setPaymentSuccess('Thanh toán thành công!');
      handleClosePaymentDialog();
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Typography variant="h4" gutterBottom>
              Quản lý học phí
      </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Xem và quản lý hóa đơn học phí của con bạn
              </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng hóa đơn"
              value={summary.totalInvoices}
              icon={<ReceiptIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã thanh toán"
              value={formatCurrency(summary.totalPaid)}
              icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chưa thanh toán"
              value={formatCurrency(summary.totalUnpaid)}
              icon={<MoneyOffIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng giảm giá"
              value={formatCurrency(summary.totalDiscount)}
              icon={<DiscountIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label={`Tất cả (${allInvoices.length})`} />
          <Tab label={`Chưa thanh toán (${summary.unpaidInvoices})`} />
          <Tab label={`Đã thanh toán (${summary.paidInvoices})`} />
        </Tabs>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                  fullWidth
            placeholder="Tìm kiếm theo mã hóa đơn, tên con, hoặc lớp học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
        </Paper>

        {/* Invoices Table */}
              {loading ? (
                <LinearProgress />
              ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Con</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tháng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số buổi đã học</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số tiền gốc</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Giảm giá</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số tiền cuối</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Đã thanh toán</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Còn lại</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                          <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {invoice.childName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{invoice.className}</Typography>
                          </TableCell>
                    <TableCell>{invoice.month}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${invoice.attendedLessons} buổi`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.originalAmount)}</Typography></TableCell>
                    <TableCell align="right">
                      {invoice.discountAmount > 0 ? (
                        <Chip
                          label={`-${formatCurrency(invoice.discountAmount)}`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.finalAmount)}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.paidAmount)}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.remainingAmount)}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {invoice.status !== 'paid' ? (
                        <Button
                          variant="contained"
                        color="primary"
                        size="small"
                          onClick={() => handlePayment(invoice)}
                        >
                          Thanh toán
                        </Button>
                      ) : (
                        <Chip
                          label="Đã thanh toán"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
              )}

        {filteredInvoices.length === 0 && !loading && (
          <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            Không tìm thấy hóa đơn nào.
          </Typography>
        )}

        {/* Payment Dialog */}
          <Dialog
          open={paymentDialogOpen}
          onClose={handleClosePaymentDialog}
          maxWidth="sm"
            fullWidth
          >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Thanh toán học phí
                </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedInvoice && (
              <Box sx={{ mt: 2 }}>
                {paymentError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {paymentError}
                  </Alert>
                )}
                {paymentSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {paymentSuccess}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thông tin hóa đơn
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Học sinh:</strong> {selectedInvoice.childName}
                    </Typography>
                      <Typography variant="body2">
                        <strong>Lớp học:</strong> {selectedInvoice.className}
                          </Typography>
                      <Typography variant="body2">
                        <strong>Tháng:</strong> {selectedInvoice.month}
                        </Typography>
                      <Typography variant="body2">
                        <strong>Số tiền còn lại:</strong> {formatCurrency(selectedInvoice.remainingAmount)}
                        </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số tiền thanh toán"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">VNĐ</InputAdornment>,
                      }}
                      helperText={`Tối đa: ${formatCurrency(selectedInvoice.remainingAmount)}`}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Phương thức thanh toán"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      sx={{ mt: 2 }}
                    >
                      <MenuItem value="cash">Tiền mặt</MenuItem>
                      <MenuItem value="bank">Chuyển khoản</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú (tuỳ chọn)"
                      value={paymentNote}
                      onChange={e => setPaymentNote(e.target.value)}
                      multiline
                      minRows={2}
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                </Grid>
                </Box>
          )}
        </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog} disabled={paymentLoading}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayment}
              variant="contained"
              color="primary"
              disabled={paymentLoading || !paymentAmount}
            >
              {paymentLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Payments;
