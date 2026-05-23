import React from 'react';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Pagination, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Card, CardContent, InputAdornment } from '@mui/material';
import FormDialog from '../../../../components/common/forms/FormDialog';
import { getAllTransactionsAPI, createTransactionAPI, updateTransactionAPI, deleteTransactionAPI, getAllTransactionCategoriesAPI, createTransactionCategoryAPI, getTransactionCategoryByIdAPI, updateTransactionCategoryAPI, deleteTransactionCategoryAPI, exportTransactionsReportAPI } from '../../../../services/transactions';
import { Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import ExcelJS from 'exceljs';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: { id: number; name: string; type: 'revenue' | 'expense' };
  transaction_at?: string;
  transactionAt?: string;
}

import type { GlobalTimeFilter } from '../../FinancialStatisticsPanel';

interface Props {
  globalTimeFilter?: GlobalTimeFilter;
}

const OtherTransactionsTab: React.FC<Props> = ({ globalTimeFilter }) => {
  const tf = globalTimeFilter || { periodType: 'year', selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1, selectedQuarter: 1, customStart: '', customEnd: '' };

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'revenue' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const [openTransactionDialog, setOpenTransactionDialog] = React.useState<boolean>(false);
  const [transactionForm, setTransactionForm] = React.useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [transactionLoading, setTransactionLoading] = React.useState<boolean>(false);
  const [openEditTransactionDialog, setOpenEditTransactionDialog] = React.useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = React.useState<Transaction | null>(null);
  const [editTransactionForm, setEditTransactionForm] = React.useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [editTransactionLoading, setEditTransactionLoading] = React.useState<boolean>(false);
  const [openDeleteTransactionDialog, setOpenDeleteTransactionDialog] = React.useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);
  const [deleteTransactionLoading, setDeleteTransactionLoading] = React.useState<boolean>(false);

  const [categories, setCategories] = React.useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState<boolean>(false);
  void categoriesLoading; // silence unused variable until used
  const [openCategoryManagementDialog, setOpenCategoryManagementDialog] = React.useState<boolean>(false);
  const [openCategoryDialog, setOpenCategoryDialog] = React.useState<boolean>(false);
  const [categoryForm, setCategoryForm] = React.useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [openEditCategoryDialog, setOpenEditCategoryDialog] = React.useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<any | null>(null);
  const [editCategoryForm, setEditCategoryForm] = React.useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [editCategoryLoading, setEditCategoryLoading] = React.useState<boolean>(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] = React.useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<any | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = React.useState<boolean>(false);
  const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);

  const fetchOtherTransactions = React.useCallback(async (pageNum = 1) => {
    // Build date range based on global time filter
    let startDate: string | undefined;
    let endDate: string | undefined;

    const toMDY = (y: number, m: number, d: number) => {
      const mm = m < 10 ? `0${m}` : `${m}`;
      const dd = d < 10 ? `0${d}` : `${d}`;
      return `${mm}/${dd}/${y}`;
    };

    if (tf.periodType === 'year') {
      startDate = toMDY(tf.selectedYear, 1, 1);
      endDate = toMDY(tf.selectedYear, 12, 31);
    } else if (tf.periodType === 'month') {
      const lastDay = new Date(tf.selectedYear, tf.selectedMonth, 0).getDate();
      startDate = toMDY(tf.selectedYear, tf.selectedMonth, 1);
      endDate = toMDY(tf.selectedYear, tf.selectedMonth, lastDay);
    } else if (tf.periodType === 'quarter') {
      const qMap: Record<number, { s: number; e: number }> = { 1: { s: 1, e: 3 }, 2: { s: 4, e: 6 }, 3: { s: 7, e: 9 }, 4: { s: 10, e: 12 } };
      const startMonth = qMap[tf.selectedQuarter].s;
      const endMonth = qMap[tf.selectedQuarter].e;
      const lastDay = new Date(tf.selectedYear, endMonth, 0).getDate();
      startDate = toMDY(tf.selectedYear, startMonth, 1);
      endDate = toMDY(tf.selectedYear, endMonth, lastDay);
    } else if (tf.periodType === 'custom') {
      if (tf.customStart) {
        const [y, m, d] = tf.customStart.split('-').map(Number);
        startDate = toMDY(y, m, d);
      }
      if (tf.customEnd) {
        const [y, m, d] = tf.customEnd.split('-').map(Number);
        endDate = toMDY(y, m, d);
      }
    }

    const params: any = { page: pageNum, limit: 10 };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (typeFilter !== 'all') params.type = typeFilter;

    const res = await getAllTransactionsAPI(params);
    const data = (res as any)?.data;
    if (data?.data?.result && Array.isArray(data.data.result)) {
      setTransactions(data.data.result);
      const meta = data.data.meta;
      setPagination({ page: meta?.page || pageNum, totalPages: meta?.totalPages || 1 });
    } else {
      setTransactions([]);
      setPagination({ page: 1, totalPages: 1 });
    }
  }, [tf.periodType, tf.selectedYear, tf.selectedMonth, tf.selectedQuarter, tf.customStart, tf.customEnd, typeFilter]);

  const fetchCategories = React.useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await getAllTransactionCategoriesAPI({ page: 1, limit: 1000 });
      let data: any[] = [];
      if ((res as any)?.data?.data && Array.isArray((res as any).data.data)) data = (res as any).data.data;
      else if ((res as any)?.data && Array.isArray((res as any).data)) data = (res as any).data;
      else if ((res as any)?.data?.data?.result && Array.isArray((res as any).data.data.result)) data = (res as any).data.data.result;
      else if ((res as any)?.data?.result && Array.isArray((res as any).data.result)) data = (res as any).data.result;
      setCategories(Array.isArray(data) ? data : []);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchOtherTransactions(1); /* fetchCategories(); */ }, [fetchOtherTransactions, fetchCategories]);
  React.useEffect(() => { fetchOtherTransactions(1); }, [tf.periodType, tf.selectedYear, tf.selectedMonth, tf.selectedQuarter, tf.customStart, tf.customEnd, typeFilter, fetchOtherTransactions]);
  const exportToExcel = async () => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    const toMDY = (y: number, m: number, d: number) => {
      const mm = m < 10 ? `0${m}` : `${m}`;
      const dd = d < 10 ? `0${d}` : `${d}`;
      return `${mm}/${dd}/${y}`;
    };
    if (tf.periodType === 'year') {
      startDate = toMDY(tf.selectedYear, 1, 1);
      endDate = toMDY(tf.selectedYear, 12, 31);
    } else if (tf.periodType === 'month') {
      const lastDay = new Date(tf.selectedYear, tf.selectedMonth, 0).getDate();
      startDate = toMDY(tf.selectedYear, tf.selectedMonth, 1);
      endDate = toMDY(tf.selectedYear, tf.selectedMonth, lastDay);
    } else if (tf.periodType === 'quarter') {
      const startMonth = tf.selectedQuarter === 1 ? 1 : tf.selectedQuarter === 2 ? 4 : tf.selectedQuarter === 3 ? 7 : 10;
      const endMonth = tf.selectedQuarter === 1 ? 3 : tf.selectedQuarter === 2 ? 6 : tf.selectedQuarter === 3 ? 9 : 12;
      const lastDay = new Date(tf.selectedYear, endMonth, 0).getDate();
      startDate = toMDY(tf.selectedYear, startMonth, 1);
      endDate = toMDY(tf.selectedYear, endMonth, lastDay);
    } else if (tf.periodType === 'custom') {
      if (tf.customStart) { const [y, m, d] = tf.customStart.split('-').map(Number); startDate = toMDY(y, m, d); }
      if (tf.customEnd) { const [y, m, d] = tf.customEnd.split('-').map(Number); endDate = toMDY(y, m, d); }
    }

    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (typeFilter !== 'all') params.type = typeFilter;

    const res = await exportTransactionsReportAPI(params);
    const payload = (res as any)?.data?.data || (res as any)?.data || {};
    const list = Array.isArray(payload.result) ? payload.result as Transaction[] : transactions;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'TMIX Education';
    const ws = wb.addWorksheet('Thu chi kh\u00E1c', { views: [{ state: 'frozen', ySplit: 2 }] });

    ws.mergeCells('A1:E1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `B\u00C1O C\u00C1O THU CHI KH\u00C1C \u2014 ${tf.periodType === 'month' ? `Th\u00E1ng ${tf.selectedMonth}/${tf.selectedYear}` : `N\u0103m ${tf.selectedYear}`}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E3A5F' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    const headers = ['M\u00F4 t\u1EA3', 'Lo\u1EA1i', 'Danh m\u1EE5c', 'S\u1ED1 ti\u1EC1n (\u20AB)', 'Ng\u00E0y th\u1EF1c hi\u1EC7n'];
    const headerRow = ws.addRow(headers);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FF94A3B8' } } };
    });

    let totalAmount = 0;
    list.forEach((t, i) => {
      totalAmount += t.amount || 0;
      const dateStr = (t.transactionAt || t.transaction_at) ? new Date(t.transactionAt || (t.transaction_at as string)).toLocaleDateString('vi-VN') : '-';
      const row = ws.addRow([t.description || '-', t.category?.type === 'revenue' ? 'Thu' : 'Chi', t.category?.name || '-', t.amount || 0, dateStr]);

      if (i % 2 === 1) row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; });
      const typeCell = row.getCell(2);
      typeCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: t.category?.type === 'revenue' ? 'FF16A34A' : 'FFDC2626' } };
      typeCell.alignment = { horizontal: 'center' };
      row.getCell(4).numFmt = '#,##0';
      row.getCell(4).alignment = { horizontal: 'right' };
    });

    const totalRow = ws.addRow(['T\u1ED4NG C\u1ED8NG', '', '', totalAmount, '']);
    totalRow.height = 24;
    totalRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E3A5F' } };
      cell.border = { top: { style: 'medium', color: { argb: 'FF1E3A5F' } } };
    });
    totalRow.getCell(4).numFmt = '#,##0';
    totalRow.getCell(4).alignment = { horizontal: 'right' };

    ws.columns = [{ width: 30 }, { width: 10 }, { width: 18 }, { width: 16 }, { width: 16 }];

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    a.href = url;
    a.download = `BaoCao_ThuChiKhac_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onPageChange = (p: number) => fetchOtherTransactions(p);
  const handleOpenTransactionDialog = async () => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setOpenTransactionDialog(true);
  };
  const handleCloseTransactionDialog = () => setOpenTransactionDialog(false);
  const handleChangeTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => setTransactionForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category_id) return;
    setTransactionLoading(true);
    try {
      await createTransactionAPI({ amount: Number(transactionForm.amount), category_id: transactionForm.category_id, description: transactionForm.description });
      setOpenTransactionDialog(false);
      setTransactionForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setTransactionToEdit(transaction);
    setEditTransactionForm({
      amount: transaction.amount.toString(),
      category_id: transaction.category.id.toString(),
      description: transaction.description || ''
    });
    setOpenEditTransactionDialog(true);
  };
  const handleCloseEditTransactionDialog = () => setOpenEditTransactionDialog(false);
  const handleChangeEditTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => setEditTransactionForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitEditTransaction = async () => {
    if (!transactionToEdit || !editTransactionForm.amount || !editTransactionForm.category_id) return;
    setEditTransactionLoading(true);
    try {
      await updateTransactionAPI(transactionToEdit.id, { amount: Number(editTransactionForm.amount), category_id: editTransactionForm.category_id, description: editTransactionForm.description });
      setOpenEditTransactionDialog(false);
      setTransactionToEdit(null);
      setEditTransactionForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
    } finally {
      setEditTransactionLoading(false);
    }
  };
  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setOpenDeleteTransactionDialog(true);
  };
  const handleCloseDeleteTransactionDialog = () => setOpenDeleteTransactionDialog(false);
  const handleConfirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    setDeleteTransactionLoading(true);
    try {
      await deleteTransactionAPI(transactionToDelete.id);
      setOpenDeleteTransactionDialog(false);
      setTransactionToDelete(null);
      await fetchOtherTransactions(1);
    } finally {
      setDeleteTransactionLoading(false);
    }
  };

  const handleOpenCategoryManagementDialog = async () => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setOpenCategoryManagementDialog(true);
  };
  const handleCloseCategoryManagementDialog = () => setOpenCategoryManagementDialog(false);
  const handleOpenCreateCategoryFromManagement = () => { setOpenCategoryManagementDialog(false); setOpenCategoryDialog(true); };
  const handleChangeCategoryField = (key: 'type' | 'name', value: string) => setCategoryForm(prev => ({ ...prev, [key]: value }));
  const handleCloseCategoryDialog = () => setOpenCategoryDialog(false);
  const handleSubmitCategory = async () => {
    if (!categoryForm.name || !categoryForm.type) return;
    setCategoryLoading(true);
    try {
      await createTransactionCategoryAPI({ type: categoryForm.type, name: categoryForm.name });
      setOpenCategoryDialog(false);
      setCategoryForm({ type: 'expense', name: '' });
      await fetchCategories();
      setOpenCategoryManagementDialog(true);
    } finally {
      setCategoryLoading(false);
    }
  };
  const handleCloseDeleteCategoryDialog = () => { setOpenDeleteCategoryDialog(false); setCategoryToDelete(null); };
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteCategoryLoading(true);
    try {
      await deleteTransactionCategoryAPI(categoryToDelete.id);
      setOpenDeleteCategoryDialog(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const handleAskDeleteCategory = (id: number | string, name: string) => {
    setCategoryToDelete({ id, name });
    setOpenDeleteCategoryDialog(true);
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Tìm mô tả..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }}
            sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField select label="Loại" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="revenue">Thu</MenuItem>
            <MenuItem value="expense">Chi</MenuItem>
          </TextField>
        </Box>
        <Box>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>Xuất Excel</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleOpenCategoryManagementDialog} sx={{ borderRadius: 2 }}>Quản lý danh mục</Button>
          <Button variant="outlined" onClick={handleOpenTransactionDialog} sx={{ borderRadius: 2 }}>Tạo hóa đơn</Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Danh mục</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Số tiền</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày thực hiện</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.filter((t) => {
              if (!searchTerm.trim()) return true;
              return (t.description || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) || (t.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase().trim());
            }).map((t, idx) => (
              <TableRow key={t.id || idx} hover>
                <TableCell><Typography variant="body2">{t.description || '-'}</Typography></TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: t.category?.type === 'revenue' ? '#2e7d32' : '#c62828',
                      border: `1px solid ${t.category?.type === 'revenue' ? '#2e7d32' : '#c62828'}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t.category?.type === 'revenue' ? 'Thu' : 'Chi'}
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2" fontWeight={500}>{t.category?.name || '-'}</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" color="text.primary">{t.amount ? t.amount.toLocaleString() : '0'} ₫</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{(t.transactionAt || t.transaction_at) ? new Date(t.transactionAt || (t.transaction_at as string)).toLocaleDateString('vi-VN') : '-'}</Typography></TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Chỉnh sửa"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => handleEditTransaction(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteTransaction(t)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, p) => onPageChange(p)} />
      </Box>

      {/* Dialog tạo thu chi khác */}
      <FormDialog
        open={openTransactionDialog}
        onClose={handleCloseTransactionDialog}
        title="Tạo thu/chi khác"
        subtitle="Nhập thông tin khoản thu/chi (tiền điện, nước, dịch vụ,...)"
        onSubmit={handleSubmitTransaction}
        loading={transactionLoading}
        submitText="Lưu"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Số tiền" type="number" fullWidth value={transactionForm.amount} onChange={(e) => handleChangeTransactionField('amount', e.target.value)} inputProps={{ min: 0 }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Danh mục" value={transactionForm.category_id} onChange={(e) => handleChangeTransactionField('category_id', e.target.value)}>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline minRows={2} value={transactionForm.description} onChange={(e) => handleChangeTransactionField('description', e.target.value)} />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog chỉnh sửa thu chi khác */}
      <FormDialog
        open={openEditTransactionDialog}
        onClose={handleCloseEditTransactionDialog}
        title="Chỉnh sửa thu/chi khác"
        subtitle="Cập nhật thông tin khoản thu/chi"
        onSubmit={handleSubmitEditTransaction}
        loading={editTransactionLoading}
        submitText="Cập nhật"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Số tiền" type="number" fullWidth value={editTransactionForm.amount} onChange={(e) => handleChangeEditTransactionField('amount', e.target.value)} inputProps={{ min: 0 }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Danh mục" value={editTransactionForm.category_id} onChange={(e) => handleChangeEditTransactionField('category_id', e.target.value)}>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline minRows={2} value={editTransactionForm.description} onChange={(e) => handleChangeEditTransactionField('description', e.target.value)} />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog tạo danh mục */}
      <FormDialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        title="Tạo danh mục"
        subtitle="Nhập thông tin danh mục thu/chi"
        onSubmit={handleSubmitCategory}
        loading={categoryLoading}
        submitText="Lưu"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Loại" value={categoryForm.type} onChange={(e) => handleChangeCategoryField('type', e.target.value)} required>
              <MenuItem value="revenue">Thu</MenuItem>
              <MenuItem value="expense">Chi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Tên danh mục" fullWidth value={categoryForm.name} onChange={(e) => handleChangeCategoryField('name', e.target.value)} required />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog quản lý danh mục - beautiful UI */}
      <Dialog open={openCategoryManagementDialog} onClose={handleCloseCategoryManagementDialog} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)', color: 'white', py: 4, px: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Quản lý danh mục</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>Quản lý các danh mục thu chi của hệ thống</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)', color: 'white', borderRadius: 3, boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>{Array.isArray(categories) ? categories.length : 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Tổng số danh mục</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: 3, boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>{Array.isArray(categories) ? categories.filter(c => c.type === 'revenue').length : 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Danh mục thu</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: 3, boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>{Array.isArray(categories) ? categories.filter(c => c.type === 'expense').length : 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Danh mục chi</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="#1e293b">Danh sách danh mục</Typography>
                  <Typography variant="body2" color="text.secondary">Quản lý và chỉnh sửa các danh mục thu chi</Typography>
                </Box>
                <Button variant="contained" onClick={handleOpenCreateCategoryFromManagement}
                  sx={{ borderRadius: 3, bgcolor: '#D32F2F', px: 3, py: 1, fontWeight: 600, '&:hover': { bgcolor: '#5a6fd8', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }, transition: 'all 0.2s ease' }}>
                  Tạo danh mục
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Tên danh mục</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Loại</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(categories) && categories.length > 0 ? categories.map((category, idx) => (
                      <TableRow key={category.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600} color="#1e293b">{category.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={category.type === 'revenue' ? 'Thu' : 'Chi'} color={category.type === 'revenue' ? 'success' : 'error'} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                            <Tooltip title="Chỉnh sửa danh mục">
                              <IconButton size="small" color="primary" onClick={async () => {
                                setCategoryToEdit(category);
                                try {
                                  const res = await getTransactionCategoryByIdAPI(String(category.id));
                                  const data = (res as any)?.data?.data || (res as any)?.data || {};
                                  setEditCategoryForm({ type: data.type || category.type, name: data.name || category.name });
                                } catch (_) {
                                  setEditCategoryForm({ type: category.type, name: category.name });
                                }
                                setOpenEditCategoryDialog(true);
                              }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa danh mục">
                              <IconButton size="small" color="error" onClick={() => handleAskDeleteCategory(category.id, category.name)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">Chưa có danh mục nào</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'flex-end' }}>
          <Button onClick={handleCloseCategoryManagementDialog} sx={{ borderRadius: 3, px: 4, py: 1.5, bgcolor: '#64748b', color: 'white', fontWeight: 600, '&:hover': { bgcolor: '#475569' } }}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa danh mục */}
      <FormDialog
        open={openEditCategoryDialog}
        onClose={() => setOpenEditCategoryDialog(false)}
        title="Chỉnh sửa danh mục"
        subtitle="Cập nhật thông tin danh mục"
        onSubmit={async () => {
          if (!categoryToEdit) return;
          setEditCategoryLoading(true);
          try {
            await updateTransactionCategoryAPI(String(categoryToEdit.id), { type: editCategoryForm.type, name: editCategoryForm.name });
            setOpenEditCategoryDialog(false);
            setCategoryToEdit(null);
            await fetchCategories();
          } finally {
            setEditCategoryLoading(false);
          }
        }}
        loading={editCategoryLoading}
        submitText="Cập nhật"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Loại" value={editCategoryForm.type} onChange={(e) => setEditCategoryForm(prev => ({ ...prev, type: e.target.value as 'revenue' | 'expense' }))} required>
              <MenuItem value="revenue">Thu</MenuItem>
              <MenuItem value="expense">Chi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Tên danh mục" fullWidth value={editCategoryForm.name} onChange={(e) => setEditCategoryForm(prev => ({ ...prev, name: e.target.value }))} required />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog xác nhận xóa hóa đơn */}
      <Dialog open={openDeleteTransactionDialog} onClose={handleCloseDeleteTransactionDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa hóa đơn "{transactionToDelete?.description || 'Không có mô tả'}" với số tiền {transactionToDelete?.amount ? transactionToDelete.amount.toLocaleString() : '0'} ₫?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteTransactionDialog} disabled={deleteTransactionLoading}>Hủy</Button>
          <Button onClick={handleConfirmDeleteTransaction} color="error" variant="contained" disabled={deleteTransactionLoading}>
            {deleteTransactionLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa danh mục */}
      <Dialog open={openDeleteCategoryDialog} onClose={handleCloseDeleteCategoryDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name || ''}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteCategoryDialog} disabled={deleteCategoryLoading}>Hủy</Button>
          <Button onClick={handleConfirmDeleteCategory} color="error" variant="contained" disabled={deleteCategoryLoading}>
            {deleteCategoryLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OtherTransactionsTab;
