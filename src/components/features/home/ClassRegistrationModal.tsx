import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  EventNote as EventIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import { getClassBannerInfoAPI } from '../../../services/classes';
import { createRegistrationAPI } from '../../../services/registrations';
import NotificationSnackbar from '../../common/NotificationSnackbar';

interface ClassRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  classId: string | null;
  className?: string;
  onSuccess?: () => void;
}

interface ClassInfo {
  id: string;
  name: string;
  grade?: number;
  section?: number;
  year?: number;
  description?: string;
  feePerLesson?: number;
  max_student?: number;
  room?: string;
  teacher?: {
    id: string;
    name: string;
    email?: string;
  };
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
}

const ClassRegistrationModal: React.FC<ClassRegistrationModalProps> = ({
  open,
  onClose,
  classId,
  onSuccess
}) => {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male' as 'male' | 'female',
    address: '',
    note: ''
  });

  // Fetch class info khi modal mở
  useEffect(() => {
    if (open && classId) {
      fetchClassInfo();
    }
    // Reset form khi modal đóng
    if (!open) {
      setForm({ name: '', phone: '', email: '', gender: 'male', address: '', note: '' });
      setError(null);
    }
  }, [open, classId]);

  const fetchClassInfo = async () => {
    if (!classId) return;

    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [ClassRegistrationModal] Fetching class banner info for classId:', classId);
      const response = await getClassBannerInfoAPI(classId);
      console.log('✅ [ClassRegistrationModal] API response:', response);
      const data = response?.data?.data || response?.data;
      console.log('📊 [ClassRegistrationModal] Parsed data:', data);
      setClassInfo(data);
    } catch (err: any) {
      console.error('❌ [ClassRegistrationModal] Error fetching class info:', err);
      setError('Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim() || !form.email.trim()) {
      setError('Vui lòng nhập đầy đủ Họ tên và Email');
      return;
    }

    if (!classId) {
      setError('Không tìm thấy thông tin lớp học');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createRegistrationAPI({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        address: form.address.trim(),
        note: form.note.trim(),
        classId: classId,
        processed: false
      });

      // Đóng modal ngay
      onClose();

      // Reset form
      setForm({ name: '', phone: '', email: '', gender: 'male', address: '', note: '' });

      // Hiển thị notification
      setNotification({
        open: true,
        message: 'Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
        severity: 'success'
      });

      // Gọi callback nếu có
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setError('Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDayOfWeekLabel = (day: string): string => {
    const days: { [key: string]: string } = {
      '1': 'Thứ 2',
      '2': 'Thứ 3',
      '3': 'Thứ 4',
      '4': 'Thứ 5',
      '5': 'Thứ 6',
      '6': 'Thứ 7',
      '7': 'Chủ nhật',
      '0': 'Chủ nhật'
    };
    return days[day] || `Thứ ${day}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
        color: 'white',
        py: 1.5,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Đăng ký tư vấn
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container sx={{ minHeight: 350 }}>
            {/* Left side - Class Info */}
            <Grid item xs={12} md={7} sx={{
              bgcolor: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
              p: 3,
              borderRight: { md: '1px solid', borderColor: 'divider' }
            }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  📚 Thông tin lớp học
                </Typography>
              </Box>

              {classInfo ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Tên lớp */}
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main'
                  }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <SchoolIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Tên lớp học:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {classInfo.name}
                        </Typography>
                      </Box>
                    </Box>
                    {classInfo.grade && classInfo.section && (
                      <Typography variant="body2" sx={{ pl: 3.5 }}>
                        Dành cho học sinh lớp {classInfo.grade}.{classInfo.section} • Năm học {classInfo.year}
                      </Typography>
                    )}
                  </Box>

                  {/* Giảng viên */}
                  {classInfo.teacher && (
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PersonIcon sx={{ color: 'success.main', fontSize: 22 }} />
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Giảng viên phụ trách:
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {classInfo.teacher.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ pl: 3.5 }}>
                        Giảng viên có kinh nghiệm, tận tâm với học sinh
                      </Typography>
                    </Box>
                  )}

                  {/* Lịch học */}
                  {classInfo.schedule && (
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <EventIcon sx={{ color: 'info.main', fontSize: 22 }} />
                        <Typography variant="subtitle2" fontWeight={700}>
                          Lịch học trong tuần
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Các ngày học trong tuần:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        {classInfo.schedule.days_of_week?.map((day, idx) => (
                          <Chip
                            key={idx}
                            label={getDayOfWeekLabel(day)}
                            size="small"
                            color="info"
                            sx={{ fontWeight: 600 }}
                          />
                        ))}
                      </Box>

                      {classInfo.schedule.time_slots && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TimeIcon sx={{ fontSize: 20, color: 'info.main' }} />
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2">
                              Giờ học:
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {classInfo.schedule.time_slots.start_time} - {classInfo.schedule.time_slots.end_time}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {classInfo.schedule.start_date && classInfo.schedule.end_date && (
                        <Typography variant="body2" sx={{
                          mt: 1,
                          pt: 1,
                          borderTop: '1px dashed',
                          borderColor: 'divider'
                        }}>
                          📅 Thời gian: {formatDate(classInfo.schedule.start_date)} đến {formatDate(classInfo.schedule.end_date)}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Học phí */}
                  {classInfo.feePerLesson && classInfo.feePerLesson > 0 && (
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <MoneyIcon sx={{ color: 'error.main', fontSize: 22 }} />
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Học phí:
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {classInfo.feePerLesson.toLocaleString('vi-VN')}đ / buổi học
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ pl: 3.5 }}>
                        (Có thể áp dụng ưu đãi khi đăng ký)
                      </Typography>
                    </Box>
                  )}

                  {/* Mô tả */}
                  {classInfo.description && (
                    <Box sx={{
                      p: 2,
                      bgcolor: 'info.lighter',
                      borderRadius: 1,
                      borderLeft: '4px solid',
                      borderColor: 'info.main'
                    }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {classInfo.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có thông tin lớp học
                </Typography>
              )}
            </Grid>

            {/* Right side - Registration Form */}
            <Grid item xs={12} md={5} sx={{ p: 2.5, bgcolor: 'background.paper' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  ✍️ Đăng ký tư vấn
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Để lại thông tin, chúng tôi sẽ liên hệ ngay
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 1.5, py: 0.5 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  fullWidth
                  required
                  label="Họ và tên"
                  placeholder="Nhập họ và tên"
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={submitting}
                  size="small"
                />

                <TextField
                  fullWidth
                  required
                  label="Email"
                  placeholder="Nhập email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={submitting}
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Số điện thoại"
                  placeholder="Nhập SĐT"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={submitting}
                  size="small"
                />

                <TextField
                  fullWidth
                  select
                  label="Giới tính"
                  value={form.gender}
                  onChange={handleChange('gender')}
                  disabled={submitting}
                  size="small"
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ"
                  value={form.address}
                  onChange={handleChange('address')}
                  disabled={submitting}
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Ghi chú"
                  placeholder="Thêm ghi chú (nếu có)"
                  value={form.note}
                  onChange={handleChange('note')}
                  disabled={submitting}
                  multiline
                  rows={4}
                  size="small"
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || !form.name.trim() || !form.email.trim()}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)',
                    }
                  }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Đang xử lý...
                    </>
                  ) : (
                    'ĐĂNG KÝ NGAY'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>

    {/* Notification Snackbar */}
    <NotificationSnackbar
      open={notification.open}
      onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      message={notification.message}
      severity={notification.severity}
      title={notification.severity === 'success' ? 'Thành công' : 'Lỗi'}
      autoHideDuration={4000}
    />
    </>
  );
};

export default ClassRegistrationModal;
