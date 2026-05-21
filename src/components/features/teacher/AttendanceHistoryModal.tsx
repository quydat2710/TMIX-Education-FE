import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  Typography, Box, Chip, IconButton, Tooltip, Collapse, Paper,
  Skeleton, Avatar, LinearProgress,
} from '@mui/material';
import {
  History as HistoryIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon, Close as CloseIcon,
  CheckCircle as PresentIcon, Cancel as AbsentIcon, Schedule as LateIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { getAttendanceListAPI } from '../../../services/sessions';

// ─── Design Tokens ───
const COLORS = {
  present: { bg: '#ecfdf5', text: '#065f46', accent: '#10b981', icon: <PresentIcon sx={{ fontSize: 14 }} /> },
  absent:  { bg: '#fef2f2', text: '#991b1b', accent: '#ef4444', icon: <AbsentIcon sx={{ fontSize: 14 }} /> },
  late:    { bg: '#fffbeb', text: '#92400e', accent: '#f59e0b', icon: <LateIcon sx={{ fontSize: 14 }} /> },
};

interface StudentAttendance { name: string; status: 'present' | 'absent' | 'late'; }
interface AttendanceRecord { date: string; students: StudentAttendance[]; }
interface ClassData { id: string; name: string; grade?: string; section?: string; }
interface AttendanceHistoryModalProps { open: boolean; onClose: () => void; classData: ClassData | null; }

const getStatusLabel = (s: string) => s === 'present' ? 'Có mặt' : s === 'absent' ? 'Vắng' : s === 'late' ? 'Đi muộn' : 'N/A';

// ─── KPI Card ───
const KpiCard: React.FC<{ label: string; value: string | number; accent: string; icon: React.ReactNode; subtitle?: string }> = ({ label, value, accent, icon, subtitle }) => (
  <Paper elevation={0} sx={{
    p: 2, borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.04)',
    borderLeft: `4px solid ${accent}`, flex: 1, minWidth: 100,
    transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
      <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 16 } }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</Typography>
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</Typography>
    {subtitle && <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.3, display: 'block' }}>{subtitle}</Typography>}
  </Paper>
);

const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ open, onClose, classData }) => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => { if (open && classData) handleOpenHistory(); }, [open, classData]);

  const handleOpenHistory = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      const res = await getAttendanceListAPI({ classId: classData.id, limit: 50, page: 1 });
      const responseData = (res as any)?.data?.data || (res as any)?.data || {};
      const records = responseData?.result || [];
      setAttendanceHistory(records.map((r: any) => ({
        date: r.date,
        students: r.attendances?.map((att: any) => ({ name: att.student?.name || '', status: att.status || 'absent' })) || []
      })));
    } catch (err) { console.error('Error loading attendance history:', err); }
    finally { setLoading(false); }
  };

  const getSummary = (r: AttendanceRecord) => {
    if (!r?.students) return { present: 0, absent: 0, late: 0, total: 0, rate: 0 };
    const present = r.students.filter(s => s.status === 'present').length;
    const absent = r.students.filter(s => s.status === 'absent').length;
    const late = r.students.filter(s => s.status === 'late').length;
    const total = r.students.length;
    return { present, absent, late, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  // Global stats
  const globalStats = (() => {
    if (!attendanceHistory.length) return { totalSessions: 0, avgRate: 0, totalPresent: 0, totalAbsent: 0 };
    let tp = 0, ta = 0, tt = 0;
    attendanceHistory.forEach(r => { const s = getSummary(r); tp += s.present; ta += s.absent; tt += s.total; });
    return { totalSessions: attendanceHistory.length, avgRate: tt > 0 ? Math.round((tp / tt) * 100) : 0, totalPresent: tp, totalAbsent: ta };
  })();

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
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
              <HistoryIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.3px' }}>Lịch sử điểm danh</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8, ml: 5.5, fontSize: '0.82rem' }}>
            {classData?.name}
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
              {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={85} sx={{ flex: 1, borderRadius: 2.5 }} />)}
            </Box>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 1.5 }} />)}
          </Box>
        ) : attendanceHistory.length > 0 ? (
          <Box sx={{ p: 3 }}>
            {/* ─── KPI Cards ─── */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <KpiCard label="Tổng buổi" value={globalStats.totalSessions} accent="#6366f1" icon={<HistoryIcon />} subtitle="Đã điểm danh" />
              <KpiCard label="Chuyên cần" value={`${globalStats.avgRate}%`} accent={globalStats.avgRate >= 80 ? '#10b981' : globalStats.avgRate >= 60 ? '#f59e0b' : '#ef4444'} icon={<TrendingUpIcon />} subtitle="Tỷ lệ trung bình" />
              <KpiCard label="Tổng có mặt" value={globalStats.totalPresent} accent="#10b981" icon={<PresentIcon />} />
              <KpiCard label="Tổng vắng" value={globalStats.totalAbsent} accent="#ef4444" icon={<AbsentIcon />} />
            </Box>

            {/* ─── History Table ─── */}
            <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.78rem', color: '#64748b', py: 1.8, borderBottom: '2px solid rgba(0,0,0,0.06)', bgcolor: '#f8fafc', letterSpacing: '0.3px' } }}>
                      <TableCell>Ngày</TableCell>
                      <TableCell align="center">Có mặt</TableCell>
                      <TableCell align="center">Vắng</TableCell>
                      <TableCell align="center">Muộn</TableCell>
                      <TableCell align="center">Tỷ lệ</TableCell>
                      <TableCell width={50}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceHistory.map((record, index) => {
                      const s = getSummary(record);
                      const isExpanded = expandedRows[index];
                      return (
                        <React.Fragment key={index}>
                          <TableRow hover onClick={() => setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }))}
                            sx={{ cursor: 'pointer', transition: 'all 0.15s ease', '&:hover': { bgcolor: 'rgba(30, 64, 175, 0.02)' }, '& td': { borderBottom: '1px solid rgba(0,0,0,0.04)', py: 1.5 } }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                                {new Date(record.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </Typography>
                            </TableCell>
                            <TableCell align="center"><Chip label={s.present} size="small" sx={{ bgcolor: COLORS.present.bg, color: COLORS.present.text, fontWeight: 700, minWidth: 40 }} /></TableCell>
                            <TableCell align="center"><Chip label={s.absent} size="small" sx={{ bgcolor: COLORS.absent.bg, color: COLORS.absent.text, fontWeight: 700, minWidth: 40 }} /></TableCell>
                            <TableCell align="center"><Chip label={s.late} size="small" sx={{ bgcolor: COLORS.late.bg, color: COLORS.late.text, fontWeight: 700, minWidth: 40 }} /></TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                <LinearProgress variant="determinate" value={s.rate}
                                  sx={{ flex: 1, maxWidth: 60, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.06)',
                                    '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: s.rate >= 80 ? '#10b981' : s.rate >= 60 ? '#f59e0b' : '#ef4444' } }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: s.rate >= 80 ? '#065f46' : s.rate >= 60 ? '#92400e' : '#991b1b', fontSize: '0.8rem', minWidth: 32 }}>
                                  {s.rate}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={isExpanded ? "Đóng" : "Chi tiết"}>
                                <IconButton size="small" sx={{ color: '#94a3b8', transition: 'all 0.2s', '&:hover': { color: '#1e40af' } }}>
                                  {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ py: 0, border: 0 }} colSpan={6}>
                              <Collapse in={isExpanded} timeout={250} unmountOnExit>
                                <Box sx={{ py: 2, px: 1 }}>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1 }}>
                                    {record.students?.map((student, si) => {
                                      const sc = COLORS[student.status] || COLORS.absent;
                                      return (
                                        <Box key={si} sx={{
                                          p: 1.5, borderRadius: 2, bgcolor: sc.bg, border: `1px solid ${sc.accent}20`,
                                          display: 'flex', alignItems: 'center', gap: 1.2,
                                          transition: 'all 0.15s ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                                        }}>
                                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.65rem', fontWeight: 700, bgcolor: sc.accent + '18', color: sc.accent }}>
                                            {getInitials(student.name)}
                                          </Avatar>
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              {student.name}
                                            </Typography>
                                          </Box>
                                          <Chip
                                            icon={sc.icon as React.ReactElement}
                                            label={getStatusLabel(student.status)}
                                            size="small"
                                            sx={{ bgcolor: sc.accent + '18', color: sc.text, fontWeight: 600, fontSize: '0.7rem', height: 24,
                                              '& .MuiChip-icon': { color: sc.accent, ml: 0.5 } }}
                                          />
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <HistoryIcon sx={{ fontSize: 36, color: '#94a3b8' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700, mb: 0.5 }}>Chưa có lịch sử điểm danh</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Lớp học này chưa có bản ghi điểm danh nào.</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button onClick={onClose} variant="contained" sx={{
          bgcolor: '#1e40af', fontWeight: 600, px: 3, py: 1, borderRadius: 2, textTransform: 'none',
          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
          '&:hover': { bgcolor: '#1e3a8a', boxShadow: '0 6px 16px rgba(30, 64, 175, 0.4)' },
        }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceHistoryModal;
