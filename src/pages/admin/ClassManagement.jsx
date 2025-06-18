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
  Chip,
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
import AddClassForm from './AddClassForm';

const ClassManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const handleAddClass = (data) => {
    console.log('Dữ liệu gửi lên API:', data);
    handleCloseDialog();
  };

  // Dữ liệu thực tế sẽ được lấy từ API
  const classList = [];

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
          Quản lý lớp học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
        >
          Thêm lớp học
        </Button>
      </Box>

          <Paper sx={commonStyles.searchContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm lớp học..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Trình độ</InputLabel>
                  <Select label="Trình độ" sx={commonStyles.filterSelect}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="a1">A1</MenuItem>
                <MenuItem value="a2">A2</MenuItem>
                <MenuItem value="b1">B1</MenuItem>
                <MenuItem value="b2">B2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
                  <Select label="Trạng thái" sx={commonStyles.filterSelect}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="active">Đang học</MenuItem>
                <MenuItem value="inactive">Đã kết thúc</MenuItem>
                <MenuItem value="pending">Chưa khai giảng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
                  <TableCell width="20%">Tên lớp</TableCell>
                  <TableCell width="15%">Giáo viên</TableCell>
                  <TableCell width="10%">Năm học</TableCell>
                  <TableCell width="10%">Số lượng học sinh</TableCell>
                  <TableCell width="15%">Thời gian học</TableCell>
                  <TableCell width="15%">Trạng thái</TableCell>
                  <TableCell width="15%" align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                {classList.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls.teacher}</TableCell>
                    <TableCell>{cls.schoolYear}</TableCell>
                    <TableCell>{cls.studentCount}</TableCell>
                    <TableCell>{cls.schedule}</TableCell>
                    <TableCell>
                      <Chip
                        label={cls.status}
                        color={
                          cls.status === 'Đang học'
                            ? 'success'
                            : cls.status === 'Đã kết thúc'
                            ? 'default'
                            : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton title="Xem chi tiết">
                        <ViewIcon />
                      </IconButton>
                      <IconButton title="Chỉnh sửa" onClick={() => handleOpenDialog(cls)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton title="Kết thúc lớp học" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
          {selectedClass ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
        </DialogTitle>
            <DialogContent sx={commonStyles.dialogContent}>
              <AddClassForm onSubmit={handleAddClass} onCancel={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ClassManagement;
