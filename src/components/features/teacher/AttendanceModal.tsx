import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  Typography, Box, TextField, Paper, Skeleton, Avatar, Chip,
  ToggleButtonGroup, ToggleButton, LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon, Save as SaveIcon,
  CheckCircle as PresentIcon, Cancel as AbsentIcon,
  Schedule as LateIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { getTodaySessionAPI as getTodayAttendanceAPI, updateSessionAttendanceAPI } from '../../../services/sessions';
import NotificationSnackbar from '../../../components/common/NotificationSnackbar';

// ─── Design Tokens ───
const COLORS = {
  present: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', accent: '#10b981' },
  absent:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', accent: '#ef4444' },
  late:    { bg: '#fffbeb', border: '#fde68a', text: '#92400e', accent: '#f59e0b' },
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
} as const;

type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

interface Student { id: string; name: string; status: AttendanceStatus; note: string; }
interface ClassData { id: string; name: string; schedule?: { dayOfWeeks: number[] }; }
interface AttendanceModalProps { open: boolean; onClose: () => void; classData: ClassData | null; }
interface NotificationState { open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info'; }

// ─── KPI Card ───
const KpiCard: React.FC<{ label: string; value: number; color: string; total: number }> = ({ label, value, color, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Paper elevation={0} sx={{
      p: 2, borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${color}`, flex: 1, minWidth: 120,
      transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    }}>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>({pct}%)</Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{
        mt: 1, height: 4, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)',
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
      }} />
    </Paper>
  );
};

const AttendanceModal: React.FC<AttendanceModalProps> = ({ open, onClose, classData }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceNote, setAttendanceNote] = useState<Record<string, string>>({});
  const [originalAttendance, setOriginalAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isChanged, setIsChanged] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({ open: false, message: '', severity: 'success' });
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open && classData) handleOpenAttendance(); }, [open, classData]);

  const handleOpenAttendance = async () => {
    if (!classData?.id) return;
    const today = new Date();
    const dayOfWeek = today.getDay();

    if (!classData.schedule || !classData.schedule.dayOfWeeks) {
      setNotification({ open: true, message: 'Lớp này chưa có lịch học được thiết lập', severity: 'warning' });
      onClose(); return;
    }
    if (!classData.schedule.dayOfWeeks.includes(dayOfWeek)) {
      setNotification({
        open: true,
        message: `Lớp ${classData.name} không có lịch học vào ${['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dayOfWeek]}`,
        severity: 'warning'
      });
      onClose(); return;
    }

    setLoading(true);
    try {
      const res = await getTodayAttendanceAPI(classData.id);
      const responseData = (res as any)?.data?.data || (res as any)?.data || {};
      setAttendanceId(responseData?.id);

      const studentsList: Student[] = (responseData?.attendances || []).map((att: any) => ({
        id: att.student?.id || '', name: att.student?.name || '',
        status: att.status || 'absent', note: att.note || ''
      }));
      studentsList.sort((a, b) => {
        const lastA = a.name.trim().split(' ').pop() || '';
        const lastB = b.name.trim().split(' ').pop() || '';
        return lastA.localeCompare(lastB, 'vi');
      });
      setStudents(studentsList);

      const att: Record<string, AttendanceStatus> = {};
      const notes: Record<string, string> = {};
      studentsList.forEach(s => { att[s.id] = s.status || ATTENDANCE_STATUS.ABSENT; notes[s.id] = s.note || ''; });
      setAttendance(att);
      setOriginalAttendance(att);
      setAttendanceNote(notes);
      setIsChanged(false);
    } catch {
      setNotification({ open: true, message: 'Không thể tải dữ liệu điểm danh', severity: 'error' });
    } finally { setLoading(false); }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setIsChanged(true);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceNote(prev => ({ ...prev, [studentId]: note }));
    setIsChanged(true);
  };

  const handleSaveAttendance = async () => {
    if (!isChanged || !attendanceId) return;
    setLoading(true);
    try {
      const body = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id] || ATTENDANCE_STATUS.ABSENT,
        isModified: (attendance[s.id] || ATTENDANCE_STATUS.ABSENT) !== (originalAttendance[s.id] || ATTENDANCE_STATUS.ABSENT),
        note: attendanceNote[s.id] || undefined
      }));
      await updateSessionAttendanceAPI(attendanceId, body);
      setNotification({ open: true, message: 'Lưu điểm danh thành công', severity: 'success' });
      setIsChanged(false);
      onClose();
    } catch {
      setNotification({ open: true, message: 'Không thể lưu điểm danh', severity: 'error' });
    } finally { setLoading(false); }
  };

  const summary = (() => {
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const late = Object.values(attendance).filter(s => s === 'late').length;
    return { present, absent, late, total: students.length };
  })();

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
        sx: { borderRadius: 3, boxShadow: '0 24px 48px rgba(0,0,0,0.12)', overflow: 'hidden' }
      }}>
        {/* ─── Header ─── */}
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          color: 'white', py: 2.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 0.8, display: 'flex' }}>
                <AssignmentIcon sx={{ fontSize: 22, color: 'white' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.3px' }}>Điểm danh lớp học</Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, ml: 5.5, fontSize: '0.82rem' }}>
              {classData?.name} — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 36, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={90} sx={{ flex: 1, borderRadius: 2.5 }} />)}
              </Box>
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 1.5 }} />)}
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              {/* ─── KPI Cards ─── */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <KpiCard label="Có mặt" value={summary.present} color={COLORS.present.accent} total={summary.total} />
                <KpiCard label="Đi muộn" value={summary.late} color={COLORS.late.accent} total={summary.total} />
                <KpiCard label="Vắng mặt" value={summary.absent} color={COLORS.absent.accent} total={summary.total} />
                <KpiCard label="Tổng" value={summary.total} color="#6366f1" total={summary.total} />
              </Box>

              {/* ─── Student Table ─── */}
              <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.78rem', color: '#64748b', py: 1.8, borderBottom: '2px solid rgba(0,0,0,0.06)', bgcolor: '#f8fafc', letterSpacing: '0.3px' } }}>
                        <TableCell width={50}>STT</TableCell>
                        <TableCell>Học sinh</TableCell>
                        <TableCell align="center" width={300}>Trạng thái</TableCell>
                        <TableCell>Ghi chú</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student, index) => {
                        const status = attendance[student.id] || 'absent';
                        const statusColor = COLORS[status];
                        return (
                          <TableRow key={student.id} sx={{
                            transition: 'all 0.15s ease',
                            bgcolor: statusColor.bg + '40',
                            '&:hover': { bgcolor: statusColor.bg },
                            '& td': { borderBottom: '1px solid rgba(0,0,0,0.04)', py: 1.5 },
                          }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.82rem' }}>{index + 1}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{
                                  width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700,
                                  bgcolor: statusColor.accent + '18', color: statusColor.accent,
                                  border: `2px solid ${statusColor.accent}30`,
                                }}>
                                  {getInitials(student.name)}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
                                  {student.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <ToggleButtonGroup
                                value={status}
                                exclusive
                                onChange={(_, val) => val && handleStatusChange(student.id, val)}
                                size="small"
                                sx={{ '& .MuiToggleButton-root': {
                                  textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                  borderRadius: '8px !important', px: 1.8, py: 0.6,
                                  border: '1.5px solid rgba(0,0,0,0.08) !important', mx: 0.3,
                                  transition: 'all 0.2s ease',
                                  '&.Mui-selected': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                                } }}
                              >
                                <ToggleButton value="present" sx={{
                                  '&.Mui-selected': { bgcolor: COLORS.present.accent + ' !important', color: '#fff !important', borderColor: COLORS.present.accent + ' !important' },
                                  '&:hover': { bgcolor: COLORS.present.bg },
                                }}>
                                  <PresentIcon sx={{ fontSize: 16, mr: 0.5 }} /> Có mặt
                                </ToggleButton>
                                <ToggleButton value="late" sx={{
                                  '&.Mui-selected': { bgcolor: COLORS.late.accent + ' !important', color: '#fff !important', borderColor: COLORS.late.accent + ' !important' },
                                  '&:hover': { bgcolor: COLORS.late.bg },
                                }}>
                                  <LateIcon sx={{ fontSize: 16, mr: 0.5 }} /> Muộn
                                </ToggleButton>
                                <ToggleButton value="absent" sx={{
                                  '&.Mui-selected': { bgcolor: COLORS.absent.accent + ' !important', color: '#fff !important', borderColor: COLORS.absent.accent + ' !important' },
                                  '&:hover': { bgcolor: COLORS.absent.bg },
                                }}>
                                  <AbsentIcon sx={{ fontSize: 16, mr: 0.5 }} /> Vắng
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small" placeholder="Ghi chú..."
                                value={attendanceNote[student.id] || ''}
                                onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                fullWidth variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem', bgcolor: 'white', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' } } }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </DialogContent>

        {/* ─── Actions ─── */}
        <DialogActions sx={{ p: 2.5, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.06)', gap: 1.5 }}>
          {isChanged && (
            <Chip label="Có thay đổi chưa lưu" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, mr: 'auto' }} />
          )}
          <Button onClick={onClose} variant="outlined" sx={{
            borderColor: '#e2e8f0', color: '#64748b', fontWeight: 600, px: 3, py: 1, borderRadius: 2,
            textTransform: 'none', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
          }}>
            Hủy
          </Button>
          <Button onClick={handleSaveAttendance} disabled={!isChanged || loading} variant="contained" startIcon={<SaveIcon />} sx={{
            bgcolor: '#1e40af', fontWeight: 600, px: 3, py: 1, borderRadius: 2, textTransform: 'none',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
            '&:hover': { bgcolor: '#1e3a8a', boxShadow: '0 6px 16px rgba(30, 64, 175, 0.4)' },
            '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
          }}>
            Lưu điểm danh
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default AttendanceModal;
