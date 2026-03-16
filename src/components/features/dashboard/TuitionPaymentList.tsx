import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Pagination,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { getDashboardPaymentsAPI } from '../../../services/dashboard';

interface PaymentItem {
  id: string;
  name: string;
  paidAmount: number;
  totalAmount: number;
  discountPercent: number;
  status: string;
  month: number;
  year: number;
  totalLessons: number;
  className: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentEmail: string;
  studentPhone: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const TuitionPaymentList: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getDashboardPaymentsAPI({
        page,
        limit: 10,
        status,
        search: debouncedSearch,
      });
      const data = res?.data?.data || res?.data || {};
      setPayments(data.result || []);
      setMeta(data.meta || { page: 1, limit: 10, totalItems: 0, totalPages: 1 });
    } catch (err) {
      console.error('Error fetching dashboard payments:', err);
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  // Fetch when filters change
  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  // Auto-refresh every 30s
  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      fetchPayments(meta.page);
    }, 30000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchPayments, meta.page]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const getStatusColor = (s: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (s) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'paid': return 'Đã thanh toán';
      case 'partial': return 'Thanh toán một phần';
      case 'pending': return 'Chờ thanh toán';
      default: return s;
    }
  };

  const getRowBgColor = (s: string) => {
    switch (s) {
      case 'pending': return 'rgba(211, 47, 47, 0.04)';
      case 'partial': return 'rgba(255, 152, 0, 0.04)';
      default: return 'transparent';
    }
  };

  const getRemainingAmount = (p: PaymentItem) => {
    const discountAmount = (p.totalAmount * (p.discountPercent || 0)) / 100;
    return (p.totalAmount - discountAmount) - p.paidAmount;
  };

  const unpaidCount = payments.filter(p => p.status === 'pending' || p.status === 'partial').length;

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Thanh toán học phí
          </Typography>
          {meta.totalItems > 0 && (
            <Chip
              label={`${meta.totalItems} bản ghi`}
              size="small"
              sx={{ fontWeight: 500, bgcolor: '#e3f2fd', color: '#1565c0' }}
            />
          )}
        </Box>
        <Tooltip title="Làm mới dữ liệu">
          <IconButton
            onClick={() => fetchPayments(meta.page)}
            disabled={loading}
            sx={{
              bgcolor: 'rgba(211, 47, 47, 0.08)',
              '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.15)' },
            }}
          >
            {loading ? <CircularProgress size={20} /> : <RefreshIcon sx={{ color: '#D32F2F' }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Toolbar: Search + Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Tìm theo tên học viên hoặc phụ huynh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Badge
          badgeContent={status !== 'all' ? '!' : 0}
          color="error"
          variant="dot"
          invisible={status === 'all'}
        >
          <TextField
            select
            size="small"
            label="Trạng thái"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="pending">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#d32f2f' }} />
                Chờ thanh toán
              </Box>
            </MenuItem>
            <MenuItem value="partial">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800' }} />
                Thanh toán một phần
              </Box>
            </MenuItem>
            <MenuItem value="paid">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                Đã thanh toán
              </Box>
            </MenuItem>
          </TextField>
        </Badge>
      </Box>

      {/* Warning for unpaid */}
      {status === 'all' && unpaidCount > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          p: 1.5, mb: 2, borderRadius: 1.5,
          bgcolor: 'rgba(211, 47, 47, 0.06)',
          border: '1px solid rgba(211, 47, 47, 0.15)',
        }}>
          <Typography variant="body2" color="error.main" fontWeight={500}>
            ⚠️ Có {unpaidCount} học viên chưa hoàn thành thanh toán trong trang này
          </Typography>
          <Button
            size="small"
            color="error"
            variant="text"
            onClick={() => setStatus('pending')}
            sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600 }}
          >
            Xem ngay →
          </Button>
        </Box>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: 480, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Học viên</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Lớp</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Tháng</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Tổng HP</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Đã đóng</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Còn thiếu</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Đang tải...</Typography>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {debouncedSearch || status !== 'all'
                      ? 'Không tìm thấy kết quả phù hợp'
                      : 'Chưa có thanh toán nào'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow
                  key={p.id}
                  sx={{
                    bgcolor: getRowBgColor(p.status),
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => setSelectedPayment(p)}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      {p.parentName && p.parentName !== 'Chưa có' && (
                        <Typography variant="caption" color="text.secondary">
                          PH: {p.parentName}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.className}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{p.month}/{p.year}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{formatCurrency(p.totalAmount)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="success.main" fontWeight={500}>
                      {formatCurrency(p.paidAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={getRemainingAmount(p) > 0 ? 'error.main' : 'text.secondary'}
                    >
                      {formatCurrency(getRemainingAmount(p))}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(p.status)}
                      color={getStatusColor(p.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={meta.totalPages}
            page={meta.page}
            onChange={(_, p) => fetchPayments(p)}
            color="primary"
            size="small"
          />
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}>
          <Typography variant="h6" fontWeight={700}>Chi tiết thanh toán</Typography>
          <IconButton onClick={() => setSelectedPayment(null)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {selectedPayment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Student Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  👨‍🎓 Thông tin học viên
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>{selectedPayment.name}</Typography>
                  {selectedPayment.studentEmail && selectedPayment.studentEmail !== 'N/A' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <EmailIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">{selectedPayment.studentEmail}</Typography>
                    </Box>
                  )}
                  {selectedPayment.studentPhone && selectedPayment.studentPhone !== 'N/A' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">{selectedPayment.studentPhone}</Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* Parent Info - HIGHLIGHTED */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  👪 Thông tin phụ huynh
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: selectedPayment.status !== 'paid' ? '#D32F2F' : '#e0e0e0',
                    bgcolor: selectedPayment.status !== 'paid' ? 'rgba(211, 47, 47, 0.03)' : 'transparent',
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {selectedPayment.parentName || 'Chưa có'}
                  </Typography>
                  {selectedPayment.parentEmail && selectedPayment.parentEmail !== 'N/A' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <EmailIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography
                        variant="body2"
                        color="primary"
                        component="a"
                        href={`mailto:${selectedPayment.parentEmail}`}
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {selectedPayment.parentEmail}
                      </Typography>
                    </Box>
                  )}
                  {selectedPayment.parentPhone && selectedPayment.parentPhone !== 'N/A' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <PhoneIcon fontSize="small" sx={{ color: '#D32F2F', fontSize: 16 }} />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="#D32F2F"
                        component="a"
                        href={`tel:${selectedPayment.parentPhone}`}
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {selectedPayment.parentPhone}
                      </Typography>
                    </Box>
                  )}
                  {(!selectedPayment.parentName || selectedPayment.parentName === 'Chưa có') && (
                    <Typography variant="body2" color="warning.main" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      Học viên chưa được liên kết với phụ huynh
                    </Typography>
                  )}
                </Paper>
              </Box>

              {/* Class Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  📚 Lớp học
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>Lớp {selectedPayment.className}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tháng {selectedPayment.month}/{selectedPayment.year}
                  </Typography>
                  {selectedPayment.totalLessons > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Số buổi học: {selectedPayment.totalLessons}
                    </Typography>
                  )}
                </Paper>
              </Box>

              {/* Payment Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  💰 Chi tiết thanh toán
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tổng học phí:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(selectedPayment.totalAmount)}
                    </Typography>
                  </Box>
                  {(selectedPayment.discountPercent || 0) > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Giảm giá:</Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {selectedPayment.discountPercent}%
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Đã thanh toán:</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {formatCurrency(selectedPayment.paidAmount)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Còn lại:</Typography>
                    <Typography variant="body2" fontWeight={700} color="error.main">
                      {formatCurrency(getRemainingAmount(selectedPayment))}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      label={getStatusLabel(selectedPayment.status)}
                      color={getStatusColor(selectedPayment.status)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSelectedPayment(null)} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TuitionPaymentList;
