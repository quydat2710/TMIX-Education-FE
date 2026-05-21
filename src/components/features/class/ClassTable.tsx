import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  ListItemIcon,
  ListItemText,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  WarningAmber as WarningIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CalendarViewWeek as DaysIcon
} from '@mui/icons-material';
import { Class } from '../../../types';
import { getClassByIdAPI } from '../../../services/classes';

interface ClassTableProps {
  classes: Class[];
  onEdit: (classItem: Class) => void;
  onDelete: (classId: string) => void;
  onViewDetails: (classItem: Class) => void;
  onViewStudents: (classItem: Class) => void;
  onViewSchedule: (classItem: Class) => void;
  loading?: boolean;
}

interface ClassDetailsModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
}

const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  onEdit,
  onDelete,
  onViewStudents,
  onViewSchedule,
  loading = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const openDetailsWithData = (data: any) => {
    // Normalize response structure: prefer data.data if exists
    const classData = data?.data?.data ?? data?.data ?? data;
    setSelectedClass(classData as Class);
    setDetailsModalOpen(true);
  };

  const fetchAndOpenDetails = async (classItem: Class) => {
    try {
      const res = await getClassByIdAPI(classItem.id);
      openDetailsWithData(res);
    } catch (e) {
      // Fallback: show existing item if fetch fails
      setSelectedClass(classItem);
      setDetailsModalOpen(true);
    }
  };

  const handleViewDetails = () => {
    if (selectedClass) {
      fetchAndOpenDetails(selectedClass);
    }
    handleMenuClose();
  };

  const handleViewStudents = () => {
    if (selectedClass) {
      onViewStudents(selectedClass);
    }
    handleMenuClose();
  };

  const handleViewSchedule = () => {
    if (selectedClass) {
      onViewSchedule(selectedClass);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedClass) {
      onEdit(selectedClass);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedClass) {
      setClassToDelete(selectedClass);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (classToDelete) {
      await onDelete(classToDelete.id);
    }
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'active': '#2e7d32',      // green
      'upcoming': '#f9a825',    // yellow
      'closed': '#c62828'       // red
    };
    return statusColors[status] || 'inherit';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Đang hoạt động',
      'upcoming': 'Sắp mở',
      'closed': 'Đã kết thúc'
    };
    return statusMap[status] || status;
  };

  const getDaysOfWeekText = (days: string[]): string => {
    const dayNames: { [key: string]: string } = {
      '0': 'CN',
      '1': 'T2',
      '2': 'T3',
      '3': 'T4',
      '4': 'T5',
      '5': 'T6',
      '6': 'T7'
    };
    return days.map(day => dayNames[day] || day).join(', ');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Typography color="text.secondary" variant="h6">
          {loading ? 'Đang tải...' : 'Không có lớp học nào'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        p: { xs: 1, sm: 2 }
      }}>
        <TableContainer sx={{
          bgcolor: 'transparent',
          boxShadow: 'none',
          border: 'none',
          '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
          }
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tên lớp</TableCell>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Giáo viên</TableCell>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Năm học</TableCell>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Học phí mỗi buổi</TableCell>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Lịch học</TableCell>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Phòng học</TableCell>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', textAlign: 'center' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id} sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.6)', transform: 'translateY(-1px)' }
                }}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="700" color="primary.main">
                      {classItem.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classItem.teacher?.email || classItem.teacher?.userId?.email || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {classItem.year}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {classItem.feePerLesson?.toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {classItem.schedule?.days_of_week?.length > 0
                          ? getDaysOfWeekText(classItem.schedule.days_of_week)
                          : 'Chưa có lịch'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classItem.schedule?.time_slots
                          ? `${classItem.schedule.time_slots.start_time} - ${classItem.schedule.time_slots.end_time}`
                          : 'Chưa có thời gian'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {classItem.room}
                    </Typography>
                  </TableCell>
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
                        color: getStatusColor(classItem.status),
                        border: `1px solid ${getStatusColor(classItem.status)}`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {getStatusText(classItem.status)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => fetchAndOpenDetails(classItem)}
                        sx={{ color: 'grey.600' }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(classItem)}
                        sx={{ color: 'grey.600' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => { setClassToDelete(classItem); setDeleteDialogOpen(true); }}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewStudents}>
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem học sinh</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewSchedule}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem lịch học</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Class Details Modal */}
      <ClassDetailsModal
        classItem={selectedClass}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />



      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
          color: 'white', py: 2.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 0.8, display: 'flex' }}>
              <WarningIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>Xác nhận xóa lớp học</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.78rem' }}>Xác nhận hành động</Typography>
            </Box>
          </Box>
          <IconButton onClick={handleDeleteCancel} sx={{ color: 'rgba(255,255,255,0.7)' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3, bgcolor: '#fafafa' }}>
          <Typography sx={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xóa lớp học <strong>"{classToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(0,0,0,0.06)', gap: 1.5 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" sx={{
            borderColor: '#e2e8f0', color: '#64748b', fontWeight: 600, px: 3, borderRadius: 2, textTransform: 'none',
            '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
          }}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" startIcon={<DeleteIcon />} sx={{
            bgcolor: '#dc2626', fontWeight: 600, px: 3, borderRadius: 2, textTransform: 'none',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            '&:hover': { bgcolor: '#b91c1c', boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)' },
          }}>Xóa lớp học</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Class Details Modal Component
const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  classItem,
  open,
  onClose
}) => {
  if (!classItem) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (num?: number) => {
    return (num ?? 0).toLocaleString('vi-VN') + ' VND';
  };

  const getStatusText = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Đang hoạt động',
      'inactive': 'Không hoạt động',
      'pending': 'Chờ khai giảng',
      'completed': 'Đã kết thúc',
      'closed': 'Đã đóng',
      'cancelled': 'Đã hủy',
    };
    return status ? (statusMap[status] || status) : 'Không xác định';
  };

  const getDayLabel = (d: string) => {
    const map: Record<string, string> = { '0': 'CN', '1': 'T2', '2': 'T3', '3': 'T4', '4': 'T5', '5': 'T6', '6': 'T7' };
    return map[d] || d;
  };

  const daysText = (classItem.schedule?.days_of_week || []).map(getDayLabel).join(', ');
  const timeRange = classItem.schedule?.time_slots
    ? `${classItem.schedule?.time_slots.start_time} - ${classItem.schedule?.time_slots.end_time}`
    : 'Chưa có thời gian';
  const studentCount = classItem.students?.length ?? 0;
  const maxStudents = classItem.max_student ?? classItem.maxStudents ?? 0;
  const isClassActive = classItem.status === 'active' || (classItem.status as string) === 'pending' || classItem.status === 'upcoming';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(30, 58, 95, 0.15)',
          overflow: 'hidden',
          bgcolor: '#f8fafc'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
        color: 'white',
        py: 3,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px' }}>
            Chi tiết lớp học
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
            Thông tin chi tiết về lớp học và học sinh
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 3,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1
          }}>
            <ViewIcon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3.5}>
            {/* Thông tin cơ bản */}
            <Box component={Paper} elevation={0} sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(30, 58, 95, 0.02)',
              height: '100%'
            }}>
              <Typography variant="h6" sx={{
                color: '#1E3A5F',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                mb: 2.5
              }}>
                <Box sx={{ width: 4, height: 16, bgcolor: '#D32F2F', borderRadius: 2 }} />
                Thông tin cơ bản
              </Typography>
              
              <Paper variant="outlined" sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
              }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box sx={{ borderBottom: '1px dashed #f1f5f9', pb: 1.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>TÊN LỚP</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#D32F2F', mt: 0.5 }}>{classItem.name}</Typography>
                  </Box>
                  <Box sx={{ borderBottom: '1px dashed #f1f5f9', pb: 1.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>GIÁO VIÊN PHỤ TRÁCH</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E3A5F', mt: 0.5 }}>
                      {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}
                      {classItem.teacher?.email || classItem.teacher?.userId?.email ? (
                        <Typography component="span" variant="body2" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                          {classItem.teacher?.email || classItem.teacher?.userId?.email}
                        </Typography>
                      ) : ''}
                    </Typography>
                  </Box>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} sx={{ pt: 0.5 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>NĂM HỌC</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mt: 0.5 }}>{classItem.year || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>KHỐI</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mt: 0.5 }}>{classItem.grade ? `Khối ${classItem.grade}` : '-'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ borderTop: '1px dashed #f1f5f9', pt: 1.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>PHÒNG HỌC</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mt: 0.5 }}>{classItem.room || '-'}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Thống kê lớp học */}
            <Box component={Paper} elevation={0} sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(30, 58, 95, 0.02)',
              height: '100%'
            }}>
              <Typography variant="h6" sx={{
                color: '#1E3A5F',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                mb: 2.5
              }}>
                <Box sx={{ width: 4, height: 16, bgcolor: '#D32F2F', borderRadius: 2 }} />
                Thống kê lớp học
              </Typography>
              
              <Paper variant="outlined" sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
              }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box sx={{ borderBottom: '1px dashed #f1f5f9', pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>SỐ LƯỢNG HỌC SINH</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A5F', mt: 0.5 }}>{studentCount} / {maxStudents || 0}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'rgba(30, 58, 95, 0.08)', color: '#1E3A5F', borderRadius: 2, px: 1.5, py: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Tối đa {maxStudents || 0}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ borderBottom: '1px dashed #f1f5f9', pb: 1.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>HỌC PHÍ MỖI BUỔI</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#7b1fa2', mt: 0.5 }}>{formatCurrency(classItem.feePerLesson)}</Typography>
                  </Box>
                  <Box sx={{ borderBottom: '1px dashed #f1f5f9', pb: 1.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>THỜI GIAN HỌC</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mt: 0.5 }}>{daysText || '-'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{timeRange}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>TRẠNG THÁI LỚP HỌC</Typography>
                    <Chip
                      label={getStatusText(classItem.status)}
                      sx={{
                        bgcolor: isClassActive ? '#e8f5e9' : '#fef2f2',
                        color: isClassActive ? '#2e7d32' : '#ef4444',
                        fontWeight: 700,
                        borderRadius: 2,
                        border: `1px solid ${isClassActive ? '#c8e6c9' : '#fee2e2'}`,
                        px: 1
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Lịch học chi tiết */}
          <Box component={Paper} elevation={0} sx={{
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(30, 58, 95, 0.02)'
          }}>
            <Typography variant="h6" sx={{
              color: '#1E3A5F',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              mb: 2.5
            }}>
              <Box sx={{ width: 4, height: 16, bgcolor: '#D32F2F', borderRadius: 2 }} />
              Lịch học chi tiết
            </Typography>
            
            <Grid container spacing={2}>
              {/* Ngày bắt đầu */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined" 
                  sx={{
                    p: 2,
                    borderRadius: 3.5,
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(30, 58, 95, 0.06)',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: '#d97706',
                  }} />
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#fffbeb',
                    color: '#d97706',
                    ml: 0.5,
                    flexShrink: 0
                  }}>
                    <CalendarIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '0.5px', display: 'block', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      BẮT ĐẦU
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 700, mt: 0.2, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {formatDate(classItem.schedule?.start_date)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Ngày kết thúc */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined" 
                  sx={{
                    p: 2,
                    borderRadius: 3.5,
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(30, 58, 95, 0.06)',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: '#166534',
                  }} />
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#f0fdf4',
                    color: '#166534',
                    ml: 0.5,
                    flexShrink: 0
                  }}>
                    <CalendarIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '0.5px', display: 'block', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      KẾT THÚC
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 700, mt: 0.2, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {formatDate(classItem.schedule?.end_date)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Thời gian */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined" 
                  sx={{
                    p: 2,
                    borderRadius: 3.5,
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(30, 58, 95, 0.06)',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: '#1d4ed8',
                  }} />
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#eff6ff',
                    color: '#1d4ed8',
                    ml: 0.5,
                    flexShrink: 0
                  }}>
                    <TimeIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '0.5px', display: 'block', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      GIỜ HỌC
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 700, mt: 0.2, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {timeRange}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Ngày trong tuần */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined" 
                  sx={{
                    p: 2,
                    borderRadius: 3.5,
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(30, 58, 95, 0.06)',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: '#7e22ce',
                  }} />
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#faf5ff',
                    color: '#7e22ce',
                    ml: 0.5,
                    flexShrink: 0
                  }}>
                    <DaysIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '0.5px', display: 'block', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      THỨ HỌC
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 700, mt: 0.2, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {daysText || '-'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Mô tả */}
          <Box component={Paper} elevation={0} sx={{
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(30, 58, 95, 0.02)'
          }}>
            <Typography variant="h6" sx={{
              color: '#1E3A5F',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              mb: 2.5
            }}>
              <Box sx={{ width: 4, height: 16, bgcolor: '#D32F2F', borderRadius: 2 }} />
              Mô tả lớp học
            </Typography>
            <Paper variant="outlined" sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
            }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
                {classItem.description || 'Không có mô tả cho lớp học này.'}
              </Typography>
            </Paper>
          </Box>

          {/* Danh sách học sinh */}
          <Box component={Paper} elevation={0} sx={{
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(30, 58, 95, 0.02)'
          }}>
            <Typography variant="h6" sx={{
              color: '#1E3A5F',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              mb: 2.5
            }}>
              <Box sx={{ width: 4, height: 16, bgcolor: '#D32F2F', borderRadius: 2 }} />
              Danh sách học sinh đăng ký ({studentCount})
            </Typography>
            
            <Paper variant="outlined" sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
            }}>
              <Grid container spacing={2}>
                {(classItem.students || []).map((s: any, idx: number) => (
                  <Grid item xs={12} sm={6} md={4} key={s.student?.id || s.id || idx}>
                    <Paper sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'white',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(30, 58, 95, 0.05)',
                        borderColor: '#cbd5e1'
                      }
                    }} variant="outlined">
                      <Typography variant="subtitle2" sx={{ color: '#1E3A5F', fontWeight: 700 }}>
                        {idx + 1}. {s.student?.name || s?.name || s?.userId?.name || 'Không tên'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Giảm giá: ${s.discountPercent || 0}%`} 
                          size="small" 
                          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.72rem', borderRadius: 1.5 }} 
                        />
                        <Chip 
                          label={s.isActive ? 'Đang học' : 'Đã nghỉ'} 
                          size="small" 
                          sx={{ 
                            bgcolor: s.isActive ? '#e8f5e9' : '#f1f5f9', 
                            color: s.isActive ? '#2e7d32' : '#64748b', 
                            fontWeight: 700, 
                            fontSize: '0.72rem',
                            borderRadius: 1.5,
                            border: `1px solid ${s.isActive ? '#c8e6c9' : '#cbd5e1'}` 
                          }} 
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
                {studentCount === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontWeight: 500 }}>
                        Chưa có học sinh đăng ký trong lớp học này.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', gap: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          startIcon={<CloseIcon />}
          sx={{
            px: 4,
            py: 1.25,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: '#D32F2F',
            color: 'white',
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
            '&:hover': { 
              bgcolor: '#b91c1c',
              boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)'
            },
            transition: 'all 0.2s'
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassTable;
