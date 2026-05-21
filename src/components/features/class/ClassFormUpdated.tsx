import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Autocomplete,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { Class, ClassFormData, ClassFormErrors } from '../../../types';
import { getClassByIdAPI } from '../../../services/classes';
import ClassTeacherManagement from '../../../pages/admin/ClassTeacherManagement';
import ClassStudentManagement from '../../../pages/admin/ClassStudentManagement';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (classData: ClassFormData) => Promise<void>;
  classItem?: Class | null;
  loading?: boolean;
}

const daysOfWeekOptions = [
  { value: '1', label: 'Thứ 2' },
  { value: '2', label: 'Thứ 3' },
  { value: '3', label: 'Thứ 4' },
  { value: '4', label: 'Thứ 5' },
  { value: '5', label: 'Thứ 6' },
  { value: '6', label: 'Thứ 7' },
  { value: '0', label: 'Chủ nhật' }
];

const initialFormData: ClassFormData = {
  name: '',
  grade: '' as any,
  section: 1,
  year: new Date().getFullYear(),
  description: '',
  feePerLesson: '' as any,
  status: 'active',
  max_student: '' as any,
  room: '',
  schedule: {
    start_date: '',
    end_date: '',
    days_of_week: [],
    time_slots: {
      start_time: '',
      end_time: ''
    }
  }
};

const ClassForm: React.FC<ClassFormProps> = ({
  open,
  onClose,
  onSubmit,
  classItem,
  loading = false
}) => {
  const [formData, setFormData] = useState<ClassFormData>(initialFormData);
  const [errors, setErrors] = useState<ClassFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<any | null>(null);
  const [studentsInfo, setStudentsInfo] = useState<Array<any>>([]);

  const [activeTab, setActiveTab] = useState(0);

  // Initialize form data when classItem changes
  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name || '',
        grade: classItem.grade || 1,
        section: classItem.section || 1,
        year: classItem.year || new Date().getFullYear(),
        description: classItem.description || '',
        feePerLesson: classItem.feePerLesson || 0,
        status: classItem.status || 'active',
        max_student: classItem.max_student || classItem.maxStudents || 30,
        room: classItem.room || '',
        schedule: {
          start_date: classItem.schedule?.start_date ?
            new Date(classItem.schedule.start_date).toISOString().split('T')[0] : '',
          end_date: classItem.schedule?.end_date ?
            new Date(classItem.schedule.end_date).toISOString().split('T')[0] : '',
          days_of_week: classItem.schedule?.days_of_week || [],
          time_slots: {
            start_time: classItem.schedule?.time_slots?.start_time || '',
            end_time: classItem.schedule?.time_slots?.end_time || ''
          }
        }
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [classItem, open]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (classItem && open) {
        try {
          const res = await getClassByIdAPI(classItem.id);
          const data = res?.data?.data || res?.data;
          if (data) {
            setTeacherInfo(data.teacher || null);
            setStudentsInfo(data.students || []);
          }
        } catch (e) {
        }
      } else {
        setTeacherInfo(null);
        setStudentsInfo([]);
      }
    };
    fetchDetails();
  }, [classItem, open]);

  const handleInputChange = (field: string, value: any) => {
    // Handle deeply nested time_slots fields FIRST (before generic dot handler)
    if (field === 'schedule.time_slots.start_time' || field === 'schedule.time_slots.end_time') {
      const timeField = field.split('.')[2];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          time_slots: {
            ...prev.schedule.time_slots,
            [timeField]: value
          }
        }
      }));
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ClassFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error for this field
    if (errors[field as keyof ClassFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    // Bỏ validation - luôn return true
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate year from end date
      const endDate = new Date(formData.schedule.end_date);
      const year = endDate.getFullYear();

      // Determine status based on dates
      const now = new Date();
      const startDate = new Date(formData.schedule.start_date);
      let status: 'active' | 'upcoming' | 'closed' = 'active';

      if (startDate > now) {
        status = 'upcoming';
      } else if (endDate < now) {
        status = 'closed';
      }

      const submitData = {
        ...formData,
        grade: parseInt(formData.grade.toString()) || 1,
        section: parseInt(formData.section.toString()) || 1,
        feePerLesson: parseInt(formData.feePerLesson.toString()) || 0,
        max_student: parseInt(formData.max_student.toString()) || 30,
        year,
        status
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting class form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };



  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUpdateClass = () => {
    // Refresh class data when teacher/student management updates
    if (classItem) {
      const fetchDetails = async (retryCount = 0) => {
        try {
          const res = await getClassByIdAPI(classItem.id);
          const data = res?.data?.data || res?.data;
          if (data) {
            setTeacherInfo(data.teacher || null);
            setStudentsInfo(data.students || []);
          }
        } catch (e) {
          console.error('Error refreshing class details:', e);

          // Retry logic - thử lại tối đa 3 lần với delay 1s
          if (retryCount < 3) {
            console.log(`Retrying... Attempt ${retryCount + 1}/3`);
            setTimeout(() => {
              fetchDetails(retryCount + 1);
            }, 1000);
          } else {
            console.error('Failed to refresh class details after 3 attempts');
            // Có thể hiển thị thông báo lỗi cho user
          }
        }
      };
      fetchDetails();
    }
  };

  const renderGeneralInfoTab = () => (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Section 1: Thông tin cơ bản */}
      <Box>
        <Typography variant="subtitle2" sx={{
          color: '#1E3A5F',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2.5,
          letterSpacing: '0.5px'
        }}>
          <Box sx={{ width: 3, height: 14, bgcolor: '#D32F2F', borderRadius: 1 }} />
          1. THÔNG TIN CƠ BẢN LỚP HỌC
        </Typography>
        
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Khối"
              type="number"
              value={formData.grade ?? ''}
              onChange={(e) => handleInputChange('grade', e.target.value)}
              error={!!errors.grade}
              helperText={errors.grade || "Ví dụ: 6, 7, 8, 9..."}
              required
              InputProps={{ inputProps: { min: 1, max: 12 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tên lớp"
              value={formData.name ?? ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name || "Ví dụ: 6.1, IELTS-A1"}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Học phí/buổi"
              type="number"
              value={formData.feePerLesson ?? ''}
              onChange={(e) => handleInputChange('feePerLesson', e.target.value)}
              error={!!errors.feePerLesson}
              helperText={errors.feePerLesson}
              required
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số học sinh tối đa"
              type="number"
              value={formData.max_student ?? ''}
              onChange={(e) => handleInputChange('max_student', e.target.value)}
              error={!!errors.max_student}
              helperText={errors.max_student}
              InputProps={{ inputProps: { min: 1 } }}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phòng học"
              value={formData.room ?? ''}
              onChange={(e) => handleInputChange('room', e.target.value)}
              error={!!errors.room}
              helperText={errors.room || "Ví dụ: A101, B203"}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

      {/* Section 2: Lịch học & Thời gian */}
      <Box>
        <Typography variant="subtitle2" sx={{
          color: '#1E3A5F',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2.5,
          letterSpacing: '0.5px'
        }}>
          <Box sx={{ width: 3, height: 14, bgcolor: '#D32F2F', borderRadius: 1 }} />
          2. LỊCH HỌC & PHÂN BỔ THỜI GIAN
        </Typography>
        
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Giờ bắt đầu"
              type="time"
              value={formData.schedule?.time_slots?.start_time ?? ''}
              onChange={(e) => handleInputChange('schedule.time_slots.start_time', e.target.value)}
              error={!!errors.start_time}
              helperText={errors.start_time}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Giờ kết thúc"
              type="time"
              value={formData.schedule?.time_slots?.end_time ?? ''}
              onChange={(e) => handleInputChange('schedule.time_slots.end_time', e.target.value)}
              error={!!errors.end_time}
              helperText={errors.end_time}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Ngày bắt đầu *"
              format="DD/MM/YYYY"
              value={formData.schedule?.start_date ? dayjs(formData.schedule.start_date) : null}
              onChange={(date) => handleInputChange('schedule', {
                ...formData.schedule,
                start_date: date ? date.format('YYYY-MM-DD') : ''
              })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.start_date,
                  helperText: errors.start_date,
                  sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Ngày kết thúc *"
              format="DD/MM/YYYY"
              value={formData.schedule?.end_date ? dayjs(formData.schedule.end_date) : null}
              onChange={(date) => handleInputChange('schedule', {
                ...formData.schedule,
                end_date: date ? date.format('YYYY-MM-DD') : ''
              })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.end_date,
                  helperText: errors.end_date,
                  sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={daysOfWeekOptions}
               getOptionLabel={(option) => option.label}
              value={daysOfWeekOptions.filter(day => formData.schedule?.days_of_week?.includes(day.value))}
              onChange={(_, newValue) => {
                handleInputChange('schedule', {
                  ...formData.schedule,
                  days_of_week: newValue.map(day => day.value)
                });
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.label}
                    {...getTagProps({ index })}
                    key={option.value}
                    sx={{ borderRadius: 1.5, bgcolor: '#f1f5f9', fontWeight: 700 }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ngày học trong tuần"
                  placeholder="Chọn ngày trong tuần"
                  error={!!errors.days_of_week}
                  helperText={errors.days_of_week}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

      {/* Section 3: Mô tả */}
      <Box>
        <Typography variant="subtitle2" sx={{
          color: '#1E3A5F',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2.5,
          letterSpacing: '0.5px'
        }}>
          <Box sx={{ width: 3, height: 14, bgcolor: '#D32F2F', borderRadius: 1 }} />
          3. MÔ TẢ CHI TIẾT
        </Typography>
        <TextField
          fullWidth
          label="Mô tả lớp học"
          multiline
          rows={3}
          value={formData.description ?? ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(30, 58, 95, 0.15)',
          overflow: 'hidden',
          bgcolor: '#f8fafc'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
        color: 'white',
        py: 3.5,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px' }}>
            {classItem ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
            {classItem ? 'Cập nhật thông tin lớp học và phân công nhân sự' : 'Thêm lớp học mới vào hệ thống giáo dục TMix'}
          </Typography>
        </Box>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.15)',
          borderRadius: 3,
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {classItem ? (
            <EditIcon sx={{ fontSize: 24, color: 'white' }} />
          ) : (
            <AddIcon sx={{ fontSize: 24, color: 'white' }} />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Paper sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(30, 58, 95, 0.03)'
          }}>
            <Typography variant="h6" gutterBottom sx={{
              color: '#1E3A5F',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              mb: 3
            }}>
              <Box sx={{
                width: 4,
                height: 20,
                bgcolor: '#D32F2F',
                borderRadius: 2
              }} />
              Thông tin quản trị lớp học
            </Typography>

            {classItem ? (
              // Edit mode - Show tabs
              <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.01)' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    px: 3,
                    pt: 2,
                    bgcolor: '#f8fafc',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      minHeight: 48,
                      color: '#64748b',
                      '&.Mui-selected': {
                        color: '#D32F2F',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#D32F2F',
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  <Tab label="Thông tin chung" />
                  <Tab label="Giáo viên" />
                  <Tab label="Học sinh" />
                </Tabs>

                <Divider />

                <Box sx={{ p: 3.5 }}>
                  <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                    {renderGeneralInfoTab()}
                  </Box>
                  <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                    <ClassTeacherManagement
                      classData={{
                        ...classItem,
                        teacherId: teacherInfo
                      }}
                      onUpdate={handleUpdateClass}
                      onClose={() => { }}
                    />
                  </Box>
                  <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                    <ClassStudentManagement
                      classData={{
                        ...classItem,
                        students: studentsInfo
                      }}
                      onUpdate={handleUpdateClass}
                    />
                  </Box>
                </Box>
              </Box>
            ) : (
              // Create mode - Show original form
              <Box sx={{
                p: 3.5,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.01)'
              }}>
                {renderGeneralInfoTab()}
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3.5, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', gap: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            px: 4,
            py: 1.25,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            border: '1.5px solid #e2e8f0',
            color: '#64748b',
            bgcolor: 'white',
            '&:hover': {
              bgcolor: '#f8fafc',
              borderColor: '#cbd5e1',
              color: '#334155'
            },
            transition: 'all 0.2s'
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
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
            '&:disabled': { bgcolor: '#cbd5e1' },
            transition: 'all 0.2s'
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : (classItem ? <EditIcon /> : <AddIcon />)}
        >
          {isSubmitting ? 'Đang lưu...' : (classItem ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>


    </Dialog>
  );
};

export default ClassForm;
