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
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';

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
      <Box>
        <Typography variant="h4" gutterBottom>
          Quản lý học phí
        </Typography>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Quản lý thanh toán
          </Typography>

          <Grid container spacing={3}>
            {/* Card thông tin tổng quan */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin thanh toán
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Tổng số tiền đã thanh toán:</Typography>
                      <Typography>{summary.totalPaid.toLocaleString('vi-VN')} VNĐ</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Số tiền còn nợ:</Typography>
                      <Typography>{summary.totalDue.toLocaleString('vi-VN')} VNĐ</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Hóa đơn chưa thanh toán:</Typography>
                      <Typography>{summary.unpaidInvoices} hóa đơn</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Danh sách hóa đơn */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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
                    />
                  </Grid>
                </Grid>
              </Paper>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã hóa đơn</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell>Học viên</TableCell>
                      <TableCell>Lớp học</TableCell>
                      <TableCell>Số tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.invoiceCode}</TableCell>
                        <TableCell>{payment.createdAt}</TableCell>
                        <TableCell>{payment.studentName}</TableCell>
                        <TableCell>{payment.className}</TableCell>
                        <TableCell>{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
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
            </Grid>
          </Grid>

          {/* Dialog xem chi tiết hóa đơn */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              Chi tiết hóa đơn
            </DialogTitle>
            <DialogContent>
              {selectedPayment && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin hóa đơn
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Mã hóa đơn:</Typography>
                        <Typography>{selectedPayment.invoiceCode}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Ngày tạo:</Typography>
                        <Typography>{selectedPayment.createdAt}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Học viên:</Typography>
                        <Typography>{selectedPayment.studentName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Lớp học:</Typography>
                        <Typography>{selectedPayment.className}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Chi tiết thanh toán
                    </Typography>
                    <TableContainer>
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
                            <TableRow key={item.id}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unitPrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                              <TableCell>{item.total.toLocaleString('vi-VN')} VNĐ</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Typography variant="h6">
                        Tổng cộng: {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                sx={{ bgcolor: COLORS.primary }}
              >
                Tải hóa đơn
              </Button>
              {selectedPayment?.status !== 'paid' && (
                <Button
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  sx={{ bgcolor: COLORS.primary }}
                >
                  Thanh toán
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
