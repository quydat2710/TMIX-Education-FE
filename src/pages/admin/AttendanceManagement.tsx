import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, MenuItem, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Collapse, Avatar, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  ToggleButtonGroup, ToggleButton, ListSubheader,
} from '@mui/material';
import {
  FactCheck as FactCheckIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon, Edit as EditIcon,
  CheckCircle as PresentIcon, Cancel as AbsentIcon,
  Schedule as LateIcon, Save as SaveIcon, Close as CloseIcon,
  TrendingUp as TrendingUpIcon, History as HistoryIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { getAllClassesAPI } from '../../services/classes';
import { getAttendanceListAPI, updateSessionAttendanceAPI } from '../../services/sessions';

// ─── Design Tokens ───
const COLORS = {
  present: { bg: '#ecfdf5', text: '#065f46', accent: '#10b981' },
  absent: { bg: '#fef2f2', text: '#991b1b', accent: '#ef4444' },
  late: { bg: '#fffbeb', text: '#92400e', accent: '#f59e0b' },
};
const getStatusLabel = (s: string) => s === 'present' ? 'Có mặt' : s === 'absent' ? 'Vắng' : 'Đi muộn';

// ─── KPI Card ───
const KpiCard: React.FC<{ label: string; value: string | number; accent: string; icon: React.ReactNode; subtitle?: string }> = ({ label, value, accent, icon, subtitle }) => (
  <Paper elevation={0} sx={{
    p: 2.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)',
    borderLeft: `4px solid ${accent}`, flex: 1, minWidth: 140,
    transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
      <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 18 } }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</Typography>
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: '1.6rem' }}>{value}</Typography>
    {subtitle && <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', mt: 0.3, display: 'block' }}>{subtitle}</Typography>}
  </Paper>
);

interface ClassItem { id: string; name: string; grade?: string; section?: string; year?: string; status?: string; }
interface AttendanceStudent { student?: { id: string; name: string; email?: string }; status: string; note?: string; studentId?: string; }
interface SessionRecord { id: string; date: string; attendances: AttendanceStudent[]; }

const AttendanceManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [classLoading, setClassLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Edit dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [editSession, setEditSession] = useState<SessionRecord | null>(null);
  const [editAttendance, setEditAttendance] = useState<Record<string, string>>({});
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load classes
  useEffect(() => {
    (async () => {
      setClassLoading(true);
      try {
        const res = await getAllClassesAPI({ limit: 100, page: 1 });
        const data = (res as any)?.data?.data || (res as any)?.data || {};
        const list = data?.result || data || [];
        setClasses(Array.isArray(list) ? list : []);
      } catch { setClasses([]); }
      finally { setClassLoading(false); }
    })();
  }, []);

  // Load attendance when class changes
  const loadAttendance = useCallback(async () => {
    if (!selectedClassId) { setSessions([]); return; }
    setLoading(true);
    try {
      const res = await getAttendanceListAPI({ classId: selectedClassId, limit: 100, page: 1 });
      const data = (res as any)?.data?.data || (res as any)?.data || {};
      setSessions(data?.result || []);
    } catch { setSessions([]); }
    finally { setLoading(false); }
  }, [selectedClassId]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  // Stats
  const stats = (() => {
    if (!sessions.length) return { totalSessions: 0, avgRate: 0, totalPresent: 0, totalAbsent: 0, totalLate: 0 };
    let tp = 0, ta = 0, tl = 0, tt = 0;
    sessions.forEach(s => {
      s.attendances?.forEach(a => { tt++; if (a.status === 'present') tp++; else if (a.status === 'absent') ta++; else tl++; });
    });
    return { totalSessions: sessions.length, avgRate: tt > 0 ? Math.round((tp / tt) * 100) : 0, totalPresent: tp, totalAbsent: ta, totalLate: tl };
  })();

  const getSessionSummary = (s: SessionRecord) => {
    const atts = s.attendances || [];
    const present = atts.filter(a => a.status === 'present').length;
    const absent = atts.filter(a => a.status === 'absent').length;
    const late = atts.filter(a => a.status === 'late').length;
    const total = atts.length;
    return { present, absent, late, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  const getInitials = (name: string) => {
    const p = name.trim().split(' ');
    return p.length > 1 ? `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  // Edit handlers
  const handleOpenEdit = (session: SessionRecord) => {
    setEditSession(session);
    const att: Record<string, string> = {};
    const notes: Record<string, string> = {};
    session.attendances?.forEach(a => {
      const sid = a.student?.id || a.studentId || '';
      att[sid] = a.status; notes[sid] = a.note || '';
    });
    setEditAttendance(att); setEditNotes(notes); setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editSession) return;
    setSaving(true);
    try {
      const body = Object.entries(editAttendance).map(([studentId, status]) => ({
        studentId, status: status as 'present' | 'absent' | 'late' | 'excused', isModified: true, note: editNotes[studentId] || undefined,
      }));
      await updateSessionAttendanceAPI(editSession.id, body);
      setNotification({ open: true, message: 'Cập nhật điểm danh thành công!', severity: 'success' });
      setEditDialog(false);
      loadAttendance();
    } catch {
      setNotification({ open: true, message: 'Lỗi khi cập nhật điểm danh', severity: 'error' });
    } finally { setSaving(false); }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <DashboardLayout role="admin">
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        {/* ─── Header ─── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Quản lý điểm danh
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Xem và chỉnh sửa điểm danh tất cả các lớp
            </Typography>
          </Box>
          <TextField
            select size="small" label="Chọn lớp học"
            value={selectedClassId}
            onChange={e => { setSelectedClassId(e.target.value); setExpandedRows({}); }}
            disabled={classLoading}
            sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
          >
            <MenuItem value=""><em>— Chọn lớp —</em></MenuItem>
            {(() => {
              const sorted = [...classes].sort((a, b) => {
                const yA = parseInt(a.year || '0'); const yB = parseInt(b.year || '0');
                if (yB !== yA) return yB - yA;
                return (a.name || '').localeCompare(b.name || '', 'vi');
              });
              const items: React.ReactNode[] = [];
              let lastYear = '';
              sorted.forEach(c => {
                const yr = c.year || 'Khác';
                if (yr !== lastYear) {
                  lastYear = yr;
                  items.push(
                    <ListSubheader key={`yr-${yr}`} sx={{ bgcolor: '#f1f5f9', fontWeight: 700, fontSize: '0.75rem', color: '#475569', lineHeight: '32px', letterSpacing: '0.5px' }}>
                      📅 Năm {yr}
                    </ListSubheader>
                  );
                }
                items.push(
                  <MenuItem key={c.id} value={c.id} sx={{ pl: 3, fontSize: '0.88rem' }}>
                    {c.name}{c.status === 'inactive' ? <Chip label="Ngừng" size="small" sx={{ ml: 1, height: 20, fontSize: '0.68rem', bgcolor: '#fee2e2', color: '#991b1b' }} /> : null}
                  </MenuItem>
                );
              });
              return items;
            })()}
          </TextField>
        </Box>

        {!selectedClassId ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <FactCheckIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700, mb: 0.5 }}>Chọn lớp học để xem điểm danh</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Chọn một lớp từ dropdown phía trên để xem và quản lý điểm danh</Typography>
          </Paper>
        ) : loading ? (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={95} sx={{ flex: 1, borderRadius: 3 }} />)}
            </Box>
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 2 }} />)}
          </Box>
        ) : (
          <>
            {/* ─── KPI Cards ─── */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <KpiCard label="Tổng buổi" value={stats.totalSessions} accent="#6366f1" icon={<HistoryIcon />} subtitle={selectedClass?.name} />
              <KpiCard label="Chuyên cần" value={`${stats.avgRate}%`} accent={stats.avgRate >= 80 ? '#10b981' : stats.avgRate >= 60 ? '#f59e0b' : '#ef4444'} icon={<TrendingUpIcon />} subtitle="Trung bình" />
              <KpiCard label="Có mặt" value={stats.totalPresent} accent="#10b981" icon={<PresentIcon />} />
              <KpiCard label="Vắng" value={stats.totalAbsent} accent="#ef4444" icon={<AbsentIcon />} />
            </Box>

            {/* ─── Sessions Table ─── */}
            {sessions.length === 0 ? (
              <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
                <HistoryIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>Chưa có dữ liệu</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>Lớp này chưa có buổi điểm danh nào.</Typography>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.78rem', color: '#64748b', py: 1.8, borderBottom: '2px solid rgba(0,0,0,0.06)', bgcolor: '#f8fafc', letterSpacing: '0.3px' } }}>
                        <TableCell>Ngày</TableCell>
                        <TableCell align="center">Có mặt</TableCell>
                        <TableCell align="center">Vắng</TableCell>
                        <TableCell align="center">Muộn</TableCell>
                        <TableCell align="center">Tỷ lệ</TableCell>
                        <TableCell align="center" width={100}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session, idx) => {
                        const s = getSessionSummary(session);
                        const isExpanded = expandedRows[idx];
                        return (
                          <React.Fragment key={session.id || idx}>
                            <TableRow hover onClick={() => setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              sx={{ cursor: 'pointer', transition: 'all 0.15s', '&:hover': { bgcolor: 'rgba(30,64,175,0.02)' }, '& td': { borderBottom: '1px solid rgba(0,0,0,0.04)', py: 1.5 } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                                  {new Date(session.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Typography>
                              </TableCell>
                              <TableCell align="center"><Chip label={s.present} size="small" sx={{ bgcolor: COLORS.present.bg, color: COLORS.present.text, fontWeight: 700, minWidth: 40 }} /></TableCell>
                              <TableCell align="center"><Chip label={s.absent} size="small" sx={{ bgcolor: COLORS.absent.bg, color: COLORS.absent.text, fontWeight: 700, minWidth: 40 }} /></TableCell>
                              <TableCell align="center"><Chip label={s.late} size="small" sx={{ bgcolor: COLORS.late.bg, color: COLORS.late.text, fontWeight: 700, minWidth: 40 }} /></TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                  <LinearProgress variant="determinate" value={s.rate} sx={{
                                    flex: 1, maxWidth: 60, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.06)',
                                    '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: s.rate >= 80 ? '#10b981' : s.rate >= 60 ? '#f59e0b' : '#ef4444' },
                                  }} />
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: s.rate >= 80 ? '#065f46' : s.rate >= 60 ? '#92400e' : '#991b1b', fontSize: '0.8rem', minWidth: 32 }}>
                                    {s.rate}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <Tooltip title="Sửa điểm danh">
                                    <IconButton size="small" onClick={e => { e.stopPropagation(); handleOpenEdit(session); }}
                                      sx={{ color: '#1e40af', '&:hover': { bgcolor: 'rgba(30,64,175,0.08)' } }}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={isExpanded ? "Đóng" : "Chi tiết"}>
                                    <IconButton size="small" sx={{ color: '#94a3b8' }}>
                                      {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ py: 0, border: 0 }} colSpan={6}>
                                <Collapse in={isExpanded} timeout={250} unmountOnExit>
                                  <Box sx={{ py: 2, px: 1 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1 }}>
                                      {session.attendances?.map((a, si) => {
                                        const sc = COLORS[a.status as keyof typeof COLORS] || COLORS.absent;
                                        const name = a.student?.name || 'Unknown';
                                        return (
                                          <Box key={si} sx={{
                                            p: 1.5, borderRadius: 2, bgcolor: sc.bg, border: `1px solid ${sc.accent}20`,
                                            display: 'flex', alignItems: 'center', gap: 1.2,
                                            transition: 'all 0.15s', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                                          }}>
                                            <Avatar sx={{ width: 30, height: 30, fontSize: '0.65rem', fontWeight: 700, bgcolor: sc.accent + '18', color: sc.accent }}>
                                              {getInitials(name)}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</Typography>
                                              {a.note && <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>{a.note}</Typography>}
                                            </Box>
                                            <Chip label={getStatusLabel(a.status)} size="small" sx={{ bgcolor: sc.accent + '18', color: sc.text, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
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
            )}
          </>
        )}
      </Box>

      {/* ─── Edit Dialog ─── */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          color: 'white', py: 2.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.3 }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 0.8, display: 'flex' }}><EditIcon sx={{ fontSize: 20, color: 'white' }} /></Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>Chỉnh sửa điểm danh</Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, ml: 5.5, fontSize: '0.8rem' }}>
              {editSession ? new Date(editSession.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              {' — '}{selectedClass?.name}
            </Typography>
          </Box>
          <Button onClick={() => setEditDialog(false)} sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 36 }}><CloseIcon /></Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.78rem', color: '#64748b', py: 1.8, bgcolor: '#f8fafc' } }}>
                  <TableCell width={50}>STT</TableCell>
                  <TableCell>Học sinh</TableCell>
                  <TableCell align="center" width={300}>Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editSession?.attendances?.map((a, i) => {
                  const sid = a.student?.id || a.studentId || '';
                  const name = a.student?.name || 'Unknown';
                  const status = editAttendance[sid] || 'absent';
                  const sc = COLORS[status as keyof typeof COLORS] || COLORS.absent;
                  return (
                    <TableRow key={sid} sx={{ bgcolor: sc.bg + '40', '&:hover': { bgcolor: sc.bg }, '& td': { borderBottom: '1px solid rgba(0,0,0,0.04)', py: 1.5 } }}>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: '#94a3b8' }}>{i + 1}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, fontSize: '0.72rem', fontWeight: 700, bgcolor: sc.accent + '18', color: sc.accent }}>{getInitials(name)}</Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>{name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <ToggleButtonGroup value={status} exclusive onChange={(_, v) => v && setEditAttendance(p => ({ ...p, [sid]: v }))} size="small"
                          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderRadius: '8px !important', px: 1.8, py: 0.6, border: '1.5px solid rgba(0,0,0,0.08) !important', mx: 0.3 } }}>
                          <ToggleButton value="present" sx={{ '&.Mui-selected': { bgcolor: '#10b981 !important', color: '#fff !important' } }}><PresentIcon sx={{ fontSize: 16, mr: 0.5 }} />Có mặt</ToggleButton>
                          <ToggleButton value="late" sx={{ '&.Mui-selected': { bgcolor: '#f59e0b !important', color: '#fff !important' } }}><LateIcon sx={{ fontSize: 16, mr: 0.5 }} />Muộn</ToggleButton>
                          <ToggleButton value="absent" sx={{ '&.Mui-selected': { bgcolor: '#ef4444 !important', color: '#fff !important' } }}><AbsentIcon sx={{ fontSize: 16, mr: 0.5 }} />Vắng</ToggleButton>
                        </ToggleButtonGroup>
                      </TableCell>
                      <TableCell>
                        <TextField size="small" placeholder="Ghi chú..." value={editNotes[sid] || ''} onChange={e => setEditNotes(p => ({ ...p, [sid]: e.target.value }))}
                          fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem', bgcolor: 'white' } }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.06)', gap: 1.5 }}>
          {/* <Chip label="Admin — không giới hạn thời gian sửa" size="small" sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 600, mr: 'auto' }} /> */}
          <Button onClick={() => setEditDialog(false)} variant="outlined" sx={{ borderColor: '#e2e8f0', color: '#64748b', fontWeight: 600, px: 3, borderRadius: 2, textTransform: 'none' }}>Hủy</Button>
          <Button onClick={handleSaveEdit} disabled={saving} variant="contained" startIcon={<SaveIcon />}
            sx={{ bgcolor: '#1e40af', fontWeight: 600, px: 3, borderRadius: 2, textTransform: 'none', boxShadow: '0 4px 12px rgba(30,64,175,0.3)', '&:hover': { bgcolor: '#1e3a8a' }, '&:disabled': { bgcolor: '#e2e8f0' } }}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={notification.open} onClose={() => setNotification(p => ({ ...p, open: false }))} message={notification.message} severity={notification.severity} />
    </DashboardLayout>
  );
};

export default AttendanceManagement;
