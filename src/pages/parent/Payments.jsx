import React, { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  MoneyOff as MoneyOffIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalDue: 0,
    unpaidInvoices: 0,
  });

  useEffect(() => {
    // TODO: Fetch payments data from API
    const fetchPayments = async () => {
      setLoading(true);
      try {
        // const response = await api.get('/parent/payments');
        // setPayments(response.data.payments);
        // setSummary(response.data.summary);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleOpenDialog = (payment = null) => {
    setSelectedPayment(payment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedPayment(null);
    setOpenDialog(false);
  };

  const filteredPayments = payments.filter((payment) =>
    payment.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý học phí
      </Typography>
          </Box>

      <Grid container spacing={3}>
        {/* Card thông tin tổng quan */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Thông tin thanh toán
              </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WalletIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tổng số tiền đã thanh toán
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {summary.totalPaid.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyOffIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Số tiền còn nợ
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {summary.totalDue.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptLongIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hóa đơn chưa thanh toán
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {summary.unpaidInvoices} hóa đơn
                      </Typography>
                    </Box>
                  </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách hóa đơn */}
        <Grid item xs={12} md={8}>
              <Box sx={commonStyles.searchContainer}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm hóa đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={commonStyles.searchField}
                />
              </Box>

              {loading ? (
                <LinearProgress />
              ) : (
                <TableContainer component={Paper} sx={commonStyles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã hóa đơn</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Lớp học</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                        <TableCell align="center" sx={commonStyles.actionCell}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                        <TableRow key={payment.id} sx={commonStyles.tableRow}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                              {payment.invoiceCode}
                            </Box>
                          </TableCell>
                    <TableCell>{payment.createdAt}</TableCell>
                    <TableCell>{payment.studentName}</TableCell>
                    <TableCell>{payment.className}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {payment.amount.toLocaleString('vi-VN')} VNĐ
                          </TableCell>
                    <TableCell>
                      <Chip
                              label={payment.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        color={payment.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleOpenDialog(payment)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
              )}
        </Grid>
      </Grid>

      {/* Dialog xem chi tiết hóa đơn */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={commonStyles.dialogTitle}>
          Chi tiết hóa đơn
        </DialogTitle>
            <DialogContent sx={commonStyles.dialogContent}>
          {selectedPayment && (
                <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Thông tin hóa đơn
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Mã hóa đơn:</Typography>
                    <Typography>{selectedPayment.invoiceCode}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Ngày tạo:</Typography>
                    <Typography>{selectedPayment.createdAt}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Học viên:</Typography>
                    <Typography>{selectedPayment.studentName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Lớp học:</Typography>
                    <Typography>{selectedPayment.className}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Chi tiết thanh toán
                </Typography>
                    <TableContainer component={Paper} sx={commonStyles.tableContainer}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Số lượng</TableCell>
                        <TableCell>Đơn giá</TableCell>
                        <TableCell>Thành tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPayment.items?.map((item) => (
                            <TableRow key={item.id} sx={commonStyles.tableRow}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {item.total.toLocaleString('vi-VN')} VNĐ
                              </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 2,
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tổng cộng: {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
            <DialogActions sx={commonStyles.formActions}>
              <Button onClick={handleCloseDialog} sx={commonStyles.secondaryButton}>
                Đóng
          </Button>
          {selectedPayment?.status !== 'paid' && (
            <Button
              variant="contained"
                  sx={commonStyles.primaryButton}
              startIcon={<PaymentIcon />}
            >
                  Thanh toán ngay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Payments;
