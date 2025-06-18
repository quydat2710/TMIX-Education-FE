import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import { commonStyles } from "../../utils/styles";
import DashboardLayout from '../../components/layouts/DashboardLayout';

const ParentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  const handleOpenDialog = (parent = null) => {
    setSelectedParent(parent);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedParent(null);
    setOpenDialog(false);
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý phụ huynh
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm phụ huynh
            </Button>
          </Box>

          <Paper sx={commonStyles.searchContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm phụ huynh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={commonStyles.searchField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Quan hệ</InputLabel>
                  <Select label="Quan hệ" sx={commonStyles.filterSelect}>
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="father">Bố</MenuItem>
                    <MenuItem value="mother">Mẹ</MenuItem>
                    <MenuItem value="guardian">Người giám hộ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select label="Trạng thái" sx={commonStyles.filterSelect}>
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="active">Đang hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="25%">Họ và tên</TableCell>
                  <TableCell width="25%">Email</TableCell>
                  <TableCell width="20%">Số điện thoại</TableCell>
                  <TableCell width="20%">Quyền xem thông tin giáo viên</TableCell>
                  <TableCell width="10%" align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Dữ liệu sẽ được thêm sau khi có API */}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle sx={commonStyles.dialogTitle}>
              {selectedParent ? 'Chỉnh sửa thông tin phụ huynh' : 'Thêm phụ huynh mới'}
            </DialogTitle>
            <DialogContent sx={commonStyles.dialogContent}>
              <Grid container spacing={2} sx={commonStyles.formGrid}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Họ và tên" required sx={commonStyles.formField} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" type="email" required sx={commonStyles.formField} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mật khẩu" type="password" required sx={commonStyles.formField} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={commonStyles.formField}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số điện thoại" required sx={commonStyles.formField} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Địa chỉ" required sx={commonStyles.formField} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={commonStyles.formField}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select label="Giới tính" required>
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={commonStyles.formField}>
                    <InputLabel>Quyền xem thông tin giáo viên</InputLabel>
                    <Select label="Quyền xem thông tin giáo viên" required>
                      <MenuItem value={true}>Có</MenuItem>
                      <MenuItem value={false}>Không</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={commonStyles.formActions}>
              <Button onClick={handleCloseDialog} sx={commonStyles.secondaryButton}>
                Hủy
              </Button>
              <Button
                variant="contained"
                sx={commonStyles.primaryButton}
              >
                {selectedParent ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ParentManagement;
