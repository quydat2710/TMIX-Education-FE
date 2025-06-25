import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import { Person as PersonIcon, School as SchoolIcon } from '@mui/icons-material';
import { getAllTeachersAPI, assignTeacherAPI, unassignTeacherAPI } from '../../services/api';
import { COLORS } from '../../utils/colors';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const ClassTeacherManagement = ({ classData, onUpdate, onClose, onSuccessMessage }) => {
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Lấy object giáo viên hiện tại từ allTeachers nếu teacherId là string
  let currentTeacherObj = null;
  if (typeof classData?.teacherId === 'string' && allTeachers.length > 0) {
    currentTeacherObj = allTeachers.find(
      (t) => String(t.id || t._id) === classData.teacherId
    );
  } else if (typeof classData?.teacherId === 'object' && classData.teacherId) {
    currentTeacherObj = classData.teacherId;
  }

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getAllTeachersAPI({ limit: 1000 }); // Fetch all teachers
        setAllTeachers(response.data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    // Set the initial selected teacher if one is already assigned
    if (currentTeacherObj && (currentTeacherObj.id || currentTeacherObj._id)) {
      setSelectedTeacherId(String(currentTeacherObj.id || currentTeacherObj._id));
    } else {
      setSelectedTeacherId('');
    }
  }, [currentTeacherObj]);

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) {
      setNotification({ open: true, message: 'Vui lòng chọn một giáo viên.', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await assignTeacherAPI(classData.id, selectedTeacherId);
      if (onSuccessMessage) onSuccessMessage('Gán giáo viên thành công!', 'success');
      setNotification({ open: true, message: 'Gán giáo viên thành công!', severity: 'success' });
      onUpdate();
      if (onClose) onClose();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Lỗi khi gán giáo viên.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignTeacher = async () => {
    setLoading(true);
    try {
      await unassignTeacherAPI(classData.id);
      if (onSuccessMessage) onSuccessMessage('Hủy gán giáo viên thành công!', 'success');
      setNotification({ open: true, message: 'Hủy gán giáo viên thành công!', severity: 'success' });
      setSelectedTeacherId('');
      onUpdate();
      if (onClose) onClose();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Lỗi khi hủy gán giáo viên.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Current Teacher Info */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa, #e0e8f0)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.primary }}>
              Giáo viên hiện tại
            </Typography>
            {currentTeacherObj ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="action" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {currentTeacherObj.userId?.name || currentTeacherObj.name || 'Chưa có thông tin'}
                </Typography>
                <Chip label={currentTeacherObj.userId?.email || ''} size="small" />
              </Box>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Chưa có giáo viên nào được gán cho lớp này.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Assign Teacher Form */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.primary }}>
              {currentTeacherObj ? 'Thay đổi giáo viên' : 'Gán giáo viên mới'}
            </Typography>
            <FormControl fullWidth sx={{ my: 1 }}>
              <InputLabel>Chọn giáo viên</InputLabel>
              <Select
                value={selectedTeacherId || ''}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                label="Chọn giáo viên"
              >
                <MenuItem value="">
                  <em>Không chọn</em>
                </MenuItem>
                {allTeachers.map((teacher) => {
                  const teacherId = teacher.id || teacher._id;
                  if (!teacherId) return null;
                  return (
                    <MenuItem key={String(teacherId)} value={String(teacherId)}>
                    {teacher.userId?.name || 'Unnamed Teacher'} ({teacher.userId?.email})
                  </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {currentTeacherObj && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleUnassignTeacher}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Hủy gán giáo viên'}
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAssignTeacher}
                disabled={loading || selectedTeacherId === String(currentTeacherObj?.id || currentTeacherObj?._id)}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
};

export default ClassTeacherManagement;
