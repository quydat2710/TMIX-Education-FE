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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
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

// Mock data cho thanh toán
const mockPaymentData = {
  parentId: 'parent-001',
  children: [
    {
      id: 'child-001',
      name: 'Nguyễn Thị B',
      invoices: [
        {
          id: 'inv-001',
          invoiceCode: 'INV-2024-001',
          childName: 'Nguyễn Thị B',
          className: 'Lớp TOEIC 550+',
          month: 'Tháng 1/2024',
          originalAmount: 1500000,
          discountPercent: 10,
          discountAmount: 150000,
          finalAmount: 1350000,
          status: 'unpaid',
          dueDate: '15/01/2024',
          createdAt: '01/01/2024',
          description: 'Học phí tháng 1/2024 - Lớp TOEIC 550+',
          paymentHistory: []
        },
        {
          id: 'inv-002',
          invoiceCode: 'INV-2024-002',
          childName: 'Nguyễn Thị B',
          className: 'Lớp TOEIC 550+',
          month: 'Tháng 2/2024',
          originalAmount: 1500000,
          discountPercent: 10,
          discountAmount: 150000,
          finalAmount: 1350000,
          status: 'unpaid',
          dueDate: '15/02/2024',
          createdAt: '01/02/2024',
          description: 'Học phí tháng 2/2024 - Lớp TOEIC 550+',
          paymentHistory: []
        },
        {
          id: 'inv-003',
          invoiceCode: 'INV-2024-003',
          childName: 'Nguyễn Thị B',
          className: 'Tiếng Anh Giao Tiếp Cơ Bản',
          month: 'Tháng 2/2024',
          originalAmount: 1200000,
          discountPercent: 0,
          discountAmount: 0,
          finalAmount: 1200000,
          status: 'unpaid',
          dueDate: '15/02/2024',
          createdAt: '01/02/2024',
          description: 'Học phí tháng 2/2024 - Lớp Giao Tiếp',
          paymentHistory: []
        },
        {
          id: 'inv-004',
          invoiceCode: 'INV-2023-012',
          childName: 'Nguyễn Thị B',
          className: 'Lớp TOEIC 550+',
          month: 'Tháng 12/2023',
          originalAmount: 1500000,
          discountPercent: 10,
          discountAmount: 150000,
          finalAmount: 1350000,
          status: 'paid',
          dueDate: '15/12/2023',
          createdAt: '01/12/2023',
          description: 'Học phí tháng 12/2023 - Lớp TOEIC 550+',
          paymentHistory: [
            {
              id: 'pay-001',
              amount: 1350000,
              paymentDate: '10/12/2023',
              paymentMethod: 'Chuyển khoản',
              reference: 'TK123456789'
            }
          ]
        }
      ]
    },
    {
      id: 'child-002',
      name: 'Nguyễn Văn E',
      invoices: [
        {
          id: 'inv-005',
          invoiceCode: 'INV-2024-004',
          childName: 'Nguyễn Văn E',
          className: 'Tiếng Anh Thiếu Nhi',
          month: 'Tháng 3/2024',
          originalAmount: 800000,
          discountPercent: 15,
          discountAmount: 120000,
          finalAmount: 680000,
          status: 'unpaid',
          dueDate: '15/03/2024',
          createdAt: '01/03/2024',
          description: 'Học phí tháng 3/2024 - Lớp Thiếu Nhi',
          paymentHistory: []
        },
        {
          id: 'inv-006',
          invoiceCode: 'INV-2024-005',
          childName: 'Nguyễn Văn E',
          className: 'Tiếng Anh Thiếu Nhi',
          month: 'Tháng 2/2024',
          originalAmount: 800000,
          discountPercent: 15,
          discountAmount: 120000,
          finalAmount: 680000,
          status: 'paid',
          dueDate: '15/02/2024',
          createdAt: '01/02/2024',
          description: 'Học phí tháng 2/2024 - Lớp Thiếu Nhi',
          paymentHistory: [
            {
              id: 'pay-002',
              amount: 680000,
              paymentDate: '12/02/2024',
              paymentMethod: 'Tiền mặt',
              reference: 'TM20240212'
            }
          ]
        }
      ]
    }
  ]
};

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState(mockPaymentData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sử dụng mock data
      setLoading(true);
    setTimeout(() => {
        setLoading(false);
    }, 1000);
  }, []);

  const handleOpenDialog = (invoice = null) => {
    setSelectedInvoice(invoice);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedInvoice(null);
    setOpenDialog(false);
  };

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

    paymentData.children.forEach(child => {
      child.invoices.forEach(invoice => {
        if (invoice.status === 'paid') {
          totalPaid += invoice.finalAmount;
          paidInvoices++;
        } else {
          totalUnpaid += invoice.finalAmount;
          unpaidInvoices++;
        }
        totalDiscount += invoice.discountAmount;
      });
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
  const allInvoices = paymentData.children.flatMap(child => child.invoices);
  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.className.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === 0) return matchesSearch; // Tất cả
    if (selectedTab === 1) return matchesSearch && invoice.status === 'unpaid'; // Chưa thanh toán
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
    return status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán';
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã hóa đơn</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Con</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tháng</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số tiền gốc</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Giảm giá</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số tiền cuối</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hạn thanh toán</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {invoice.invoiceCode}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        {invoice.childName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                        {invoice.className}
                            </Box>
                          </TableCell>
                    <TableCell>{invoice.month}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.originalAmount)}</TableCell>
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
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(invoice.finalAmount)}
                          </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleOpenDialog(invoice)}
                        color="primary"
                        size="small"
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

        {filteredInvoices.length === 0 && !loading && (
          <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            Không tìm thấy hóa đơn nào.
          </Typography>
        )}

        {/* Invoice Detail Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ReceiptIcon color="primary" />
              <Box>
                <Typography variant="h6">
          Chi tiết hóa đơn
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInvoice?.invoiceCode}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedInvoice && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Thông tin hóa đơn
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Mã hóa đơn"
                          secondary={selectedInvoice.invoiceCode}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Học sinh"
                          secondary={selectedInvoice.childName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Lớp học"
                          secondary={selectedInvoice.className}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Tháng"
                          secondary={selectedInvoice.month}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Ngày tạo"
                          secondary={selectedInvoice.createdAt}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Hạn thanh toán"
                          secondary={selectedInvoice.dueDate}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Chi tiết thanh toán
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Số tiền gốc:</Typography>
                        <Typography>{formatCurrency(selectedInvoice.originalAmount)}</Typography>
                      </Box>
                      {selectedInvoice.discountAmount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Giảm giá ({selectedInvoice.discountPercent}%):</Typography>
                          <Typography color="success.main">
                            -{formatCurrency(selectedInvoice.discountAmount)}
                          </Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Số tiền cần thanh toán:
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          {formatCurrency(selectedInvoice.finalAmount)}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(selectedInvoice.status)}
                        color={getStatusColor(selectedInvoice.status)}
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                </Grid>
              </Grid>

                {/* Payment History */}
                {selectedInvoice.paymentHistory.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Lịch sử thanh toán
                </Typography>
                    <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                            <TableCell>Ngày thanh toán</TableCell>
                            <TableCell>Phương thức</TableCell>
                            <TableCell>Tham chiếu</TableCell>
                            <TableCell align="right">Số tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                          {selectedInvoice.paymentHistory.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.paymentDate}</TableCell>
                              <TableCell>{payment.paymentMethod}</TableCell>
                              <TableCell>{payment.reference}</TableCell>
                              <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Mô tả:</strong> {selectedInvoice.description}
                  </Typography>
                </Box>
          )}
        </DialogContent>
          <DialogActions>
            {selectedInvoice?.status === 'unpaid' && (
              <Button variant="contained" color="primary">
                  Thanh toán ngay
            </Button>
          )}
            <Button onClick={handleCloseDialog}>
              Đóng
            </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Payments;
