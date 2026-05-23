import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button, ListSubheader,
  CircularProgress, Alert, Snackbar, Chip, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Send as SendIcon,
  NotificationsActive as BellIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CampaignOutlined as CampaignIcon,
  Visibility as PreviewIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { sendNotificationAPI, SendNotificationData } from '../../services/notifications';
import { getAllClassesAPI } from '../../services/classes';

// ─── Design tokens ───
const NOTIFICATION_TYPES = [
  { value: 'general', label: 'Thông báo chung', color: '#3B82F6' },
  { value: 'schedule_change', label: 'Thay đổi lịch học', color: '#F59E0B' },
  { value: 'payment_reminder', label: 'Nhắc học phí', color: '#EF4444' },
  { value: 'attendance_reminder', label: 'Nhắc điểm danh', color: '#8B5CF6' },
  { value: 'new_test', label: 'Bài kiểm tra mới', color: '#10B981' },
];

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Tất cả', icon: <GroupsIcon />, description: 'Gửi tới toàn bộ hệ thống' },
  { value: 'student', label: 'Học sinh', icon: <SchoolIcon />, description: 'Gửi tới tất cả học sinh' },
  { value: 'teacher', label: 'Giáo viên', icon: <PersonIcon />, description: 'Gửi tới tất cả giáo viên' },
  { value: 'parent', label: 'Phụ huynh', icon: <PeopleIcon />, description: 'Gửi tới tất cả phụ huynh' },
  { value: 'class', label: 'Theo lớp', icon: <SchoolIcon />, description: 'Gửi tới học sinh trong lớp' },
];

// ─── Section Paper ───
const SectionPaper: React.FC<{ children: React.ReactNode; sx?: any }> = ({ children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 3 }, borderRadius: 3,
      border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', ...sx,
    }}
  >
    {children}
  </Paper>
);

interface SentRecord {
  title: string;
  audience: string;
  count: number;
  time: string;
  type: string;
}

const AdminNotificationCenter: React.FC = () => {
  // ─── Form state ───
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [audience, setAudience] = useState('all');
  const [classId, setClassId] = useState('');
  const [link, setLink] = useState('');

  // ─── UI state ───
  const [classes, setClasses] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [sentHistory, setSentHistory] = useState<SentRecord[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res: any = await getAllClassesAPI({ limit: 100, page: 1 });
      const data = res?.data?.data || res?.data || {};
      const list = data?.result || data || [];
      setClasses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setClasses([]);
    }
  };

  const getAudienceLabel = () => {
    if (audience === 'class') {
      const cls = classes.find(c => c.id === classId);
      return cls ? `Lớp ${cls.name}` : 'Chưa chọn lớp';
    }
    return AUDIENCE_OPTIONS.find(a => a.value === audience)?.label || audience;
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setSnackbar({ open: true, message: 'Vui lòng nhập tiêu đề và nội dung', severity: 'error' });
      return;
    }
    if (audience === 'class' && !classId) {
      setSnackbar({ open: true, message: 'Vui lòng chọn lớp học', severity: 'error' });
      return;
    }

    setSending(true);
    try {
      const payload: SendNotificationData = {
        type,
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
      };

      if (audience === 'class') {
        payload.classId = classId;
      } else {
        payload.recipientRole = audience;
      }

      const res: any = await sendNotificationAPI(payload);
      const count = res?.data?.data?.count || res?.data?.count || 0;

      setSentHistory(prev => [{
        title: title.trim(),
        audience: getAudienceLabel(),
        count,
        time: new Date().toLocaleTimeString('vi-VN'),
        type,
      }, ...prev]);

      setSnackbar({
        open: true,
        message: `Đã gửi thông báo thành công tới ${count} người`,
        severity: 'success',
      });

      // Reset form
      setTitle('');
      setMessage('');
      setLink('');
      setShowPreview(false);
    } catch (err: any) {
      console.error('Error sending notification:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Gửi thông báo thất bại',
        severity: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const typeConfig = NOTIFICATION_TYPES.find(t => t.value === type);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* ═══ Header ═══ */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <CampaignIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Gửi thông báo
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', ml: 5.5 }}>
              Soạn và gửi thông báo tới học sinh, giáo viên, phụ huynh
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* ═══ Left: Compose Form ═══ */}
            <Grid item xs={12} lg={7}>
              <SectionPaper>
                {/* Notification Type */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                  Loại thông báo
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  {NOTIFICATION_TYPES.map(t => (
                    <Chip
                      key={t.value}
                      label={t.label}
                      onClick={() => setType(t.value)}
                      sx={{
                        fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                        bgcolor: type === t.value ? `${t.color}15` : 'transparent',
                        color: type === t.value ? t.color : '#64748b',
                        border: `1.5px solid ${type === t.value ? t.color : 'rgba(0,0,0,0.08)'}`,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: `${t.color}10`, borderColor: t.color },
                      }}
                    />
                  ))}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Title */}
                <TextField
                  fullWidth
                  label="Tiêu đề thông báo"
                  placeholder="VD: Thông báo lịch nghỉ lễ 2/9"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                {/* Message */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Nội dung thông báo"
                  placeholder="Nhập nội dung chi tiết..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                {/* Link (optional) */}
                <TextField
                  fullWidth
                  label="Link đính kèm (tùy chọn)"
                  placeholder="/admin/attendance hoặc URL bất kỳ"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Divider sx={{ mb: 3 }} />

                {/* Audience */}
                <FormControl sx={{ mb: 2.5 }}>
                  <FormLabel sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, fontSize: '0.875rem' }}>
                    Đối tượng nhận
                  </FormLabel>
                  <RadioGroup
                    value={audience}
                    onChange={e => { setAudience(e.target.value); setClassId(''); }}
                  >
                    <Grid container spacing={1}>
                      {AUDIENCE_OPTIONS.map(opt => (
                        <Grid item xs={6} sm={4} key={opt.value}>
                          <Paper
                            elevation={0}
                            onClick={() => { setAudience(opt.value); setClassId(''); }}
                            sx={{
                              p: 1.5, borderRadius: 2, cursor: 'pointer',
                              border: `1.5px solid ${audience === opt.value ? '#3B82F6' : 'rgba(0,0,0,0.06)'}`,
                              bgcolor: audience === opt.value ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: '#3B82F6', bgcolor: 'rgba(59, 130, 246, 0.02)' },
                            }}
                          >
                            <FormControlLabel
                              value={opt.value}
                              control={<Radio size="small" sx={{ p: 0.5, mr: 0.5 }} />}
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.82rem' }}>
                                    {opt.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                                    {opt.description}
                                  </Typography>
                                </Box>
                              }
                              sx={{ m: 0, alignItems: 'flex-start' }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </FormControl>

                {/* Class selector (conditional) */}
                {audience === 'class' && (
                  <TextField
                    select
                    fullWidth
                    label="Chọn lớp học"
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 },
                    }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: { maxHeight: 320, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
                        },
                      },
                    }}
                  >
                    {(() => {
                      const active = classes.filter(c => c.status === 'active');
                      const inactive = classes.filter(c => c.status !== 'active');
                      const items: React.ReactNode[] = [];

                      if (active.length > 0) {
                        items.push(
                          <ListSubheader key="h-active" sx={{ bgcolor: '#f0fdf4', fontWeight: 700, fontSize: '0.7rem', color: '#059669', lineHeight: '28px', letterSpacing: '0.5px' }}>
                            ĐANG HOẠT ĐỘNG ({active.length})
                          </ListSubheader>
                        );
                        active.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi')).forEach(cls => {
                          items.push(
                            <MenuItem key={cls.id} value={cls.id} sx={{ py: 1, px: 2, fontSize: '0.88rem', '&:hover': { bgcolor: '#f0fdf4' } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                  {cls.name}
                                </Typography>
                                <Chip label="Đang học" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#dcfce7', color: '#059669' }} />
                              </Box>
                            </MenuItem>
                          );
                        });
                      }

                      if (inactive.length > 0) {
                        items.push(
                          <ListSubheader key="h-inactive" sx={{ bgcolor: '#f8fafc', fontWeight: 700, fontSize: '0.7rem', color: '#94a3b8', lineHeight: '28px', letterSpacing: '0.5px' }}>
                            ĐÃ KẾT THÚC ({inactive.length})
                          </ListSubheader>
                        );
                        inactive.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi')).forEach(cls => {
                          items.push(
                            <MenuItem key={cls.id} value={cls.id} sx={{ py: 1, px: 2, fontSize: '0.88rem', '&:hover': { bgcolor: '#f8fafc' } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#94a3b8' }}>
                                  {cls.name}
                                </Typography>
                                <Chip label="Kết thúc" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#f1f5f9', color: '#94a3b8' }} />
                              </Box>
                            </MenuItem>
                          );
                        });
                      }

                      return items;
                    })()}
                  </TextField>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={!title.trim() && !message.trim()}
                    sx={{
                      borderRadius: 2, textTransform: 'none', fontWeight: 600,
                      borderColor: 'rgba(0,0,0,0.12)', color: '#475569',
                      '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
                    }}
                  >
                    Xem trước
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    onClick={handleSend}
                    disabled={sending || !title.trim() || !message.trim()}
                    sx={{
                      borderRadius: 2, textTransform: 'none', fontWeight: 600,
                      bgcolor: '#3B82F6', px: 3,
                      '&:hover': { bgcolor: '#2563EB' },
                      '&.Mui-disabled': { bgcolor: 'rgba(59, 130, 246, 0.3)', color: '#fff' },
                    }}
                  >
                    {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                  </Button>
                </Box>
              </SectionPaper>
            </Grid>

            {/* ═══ Right: Preview + History ═══ */}
            <Grid item xs={12} lg={5}>
              {/* Preview Card */}
              {showPreview && (title.trim() || message.trim()) && (
                <SectionPaper sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PreviewIcon sx={{ fontSize: 18 }} />
                    Xem trước thông báo
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5, borderRadius: 2.5,
                      border: `1px solid ${typeConfig?.color || '#3B82F6'}20`,
                      bgcolor: `${typeConfig?.color || '#3B82F6'}04`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BellIcon sx={{ fontSize: 18, color: typeConfig?.color || '#3B82F6' }} />
                      <Chip
                        label={typeConfig?.label || 'Thông báo'}
                        size="small"
                        sx={{
                          fontWeight: 600, fontSize: '0.7rem', height: 22,
                          bgcolor: `${typeConfig?.color || '#3B82F6'}15`,
                          color: typeConfig?.color || '#3B82F6',
                        }}
                      />
                      <Chip
                        label={getAudienceLabel()}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500, fontSize: '0.7rem', height: 22, borderColor: 'rgba(0,0,0,0.1)' }}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                      {title || 'Tiêu đề...'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {message || 'Nội dung...'}
                    </Typography>
                    {link && (
                      <Typography variant="caption" sx={{ color: '#3B82F6', display: 'block', mt: 1 }}>
                        🔗 {link}
                      </Typography>
                    )}
                  </Paper>
                </SectionPaper>
              )}

              {/* Sent History */}
              <SectionPaper>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BellIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                  Lịch sử gửi (phiên này)
                </Typography>
                {sentHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CampaignIcon sx={{ fontSize: 48, color: 'rgba(0,0,0,0.08)', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      Chưa có thông báo nào được gửi
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 600, fontSize: '0.75rem', color: '#64748b', py: 1 } }}>
                          <TableCell>Thông báo</TableCell>
                          <TableCell align="center">Đối tượng</TableCell>
                          <TableCell align="center">Số người</TableCell>
                          <TableCell align="right">Thời gian</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sentHistory.map((record, idx) => {
                          const tConfig = NOTIFICATION_TYPES.find(t => t.value === record.type);
                          return (
                            <TableRow key={idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.82rem' }}>
                                  {record.title}
                                </Typography>
                                <Chip
                                  label={tConfig?.label || record.type}
                                  size="small"
                                  sx={{
                                    mt: 0.3, height: 18, fontSize: '0.65rem', fontWeight: 600,
                                    bgcolor: `${tConfig?.color || '#64748b'}15`,
                                    color: tConfig?.color || '#64748b',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="caption" fontWeight={600} color="#475569">
                                  {record.audience}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={record.count}
                                  size="small"
                                  sx={{
                                    fontWeight: 700, fontSize: '0.78rem',
                                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                                    color: '#059669',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="caption" color="#94a3b8">
                                  {record.time}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </SectionPaper>
            </Grid>
          </Grid>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              severity={snackbar.severity}
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              sx={{ borderRadius: 2, fontWeight: 500 }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AdminNotificationCenter;
