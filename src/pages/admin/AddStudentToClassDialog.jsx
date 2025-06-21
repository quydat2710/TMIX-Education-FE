import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getAllStudentsAPI, enrollStudentAPI } from '../../services/api';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const AddStudentToClassDialog = ({ open, onClose, classData, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const existingStudentIds = classData.students?.map(s => s.id) || [];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingList(true);
      try {
        const params = { limit: 1000, search: searchQuery };
        const response = await getAllStudentsAPI(params);
        // Filter out students who are already in the class
        const availableStudents = (response.data || []).filter(
          student => !existingStudentIds.includes(student.id)
        );
        setAllStudents(availableStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingList(false);
      }
    };

    const debounceFetch = setTimeout(() => {
        fetchStudents();
    }, 500); // Debounce search query

    return () => clearTimeout(debounceFetch);
  }, [searchQuery, classData]);

  const handleToggleStudent = (studentId) => {
    const currentIndex = selectedStudents.indexOf(studentId);
    const newSelected = [...selectedStudents];

    if (currentIndex === -1) {
      newSelected.push(studentId);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedStudents(newSelected);
  };

  const handleAddStudents = async () => {
    setLoading(true);
    try {
      await enrollStudentAPI(classData.id, { studentIds: selectedStudents });
      setNotification({ open: true, message: 'Thêm học sinh vào lớp thành công!', severity: 'success' });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Lỗi khi thêm học sinh.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const remainingSlots = classData.maxStudents - (classData.students?.length || 0);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Thêm học sinh vào lớp "{classData.name}"
          <Typography variant="body2" color="textSecondary">
            Số chỗ còn lại: {remainingSlots} - Đã chọn: {selectedStudents.length}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            placeholder="Tìm kiếm học sinh theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ height: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
            {loadingList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {allStudents.length > 0 ? (
                  allStudents.map((student) => (
                    <ListItem
                      key={student.id}
                      button
                      onClick={() => handleToggleStudent(student.id)}
                      disabled={selectedStudents.length >= remainingSlots && !selectedStudents.includes(student.id)}
                    >
                      <Checkbox
                        edge="start"
                        checked={selectedStudents.indexOf(student.id) !== -1}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText
                        primary={student.userId?.name || 'N/A'}
                        secondary={student.userId?.email || 'N/A'}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ p: 2, textAlign: 'center' }}>
                    Không tìm thấy học sinh phù hợp hoặc tất cả đã ở trong lớp.
                  </Typography>
                )}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            onClick={handleAddStudents}
            variant="contained"
            disabled={loading || selectedStudents.length === 0 || selectedStudents.length > remainingSlots}
          >
            {loading ? <CircularProgress size={24} /> : 'Thêm đã chọn'}
          </Button>
        </DialogActions>
      </Dialog>
      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default AddStudentToClassDialog;
