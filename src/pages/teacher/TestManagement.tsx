// Teacher Test Management Page
// List, create, edit, publish/unpublish tests

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tooltip, Alert, CircularProgress, MenuItem,
    Select, FormControl, InputLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Publish as PublishIcon,
    Unpublished as UnpublishedIcon,
    BarChart as StatsIcon,
    Archive as ArchiveIcon,
    ContentCopy as CopyIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { getTeacherTests, deleteTest, publishTest, unpublishTest, archiveTest, duplicateTest } from '../../services/tests';
import { getTeacherScheduleAPI } from '../../services/teachers';
import { useAuth } from '../../contexts/AuthContext';
import { Test } from '../../types/test';

const TestManagement: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page] = useState(1);
    const [, setTotalPages] = useState(1);

    // Duplicate dialog
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [duplicateClassId, setDuplicateClassId] = useState<string>('');
    const [classes, setClasses] = useState<any[]>([]);
    const [duplicating, setDuplicating] = useState(false);

    const loadTests = async () => {
        try {
            setLoading(true);
            const response = await getTeacherTests({ page, limit: 10 });
            setTests(response.data?.result || []);
            setTotalPages(response.data?.meta?.totalPages || 1);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách đề thi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, [page]);

    // Load teacher's classes for duplicate dialog
    useEffect(() => {
        const loadClasses = async () => {
            try {
                const teacherId = (user as any)?.teacherId || (user as any)?.teacher?.teacher_id || user?.id;
                if (!teacherId) return;
                const response = await getTeacherScheduleAPI(String(teacherId));
                const classData = response?.data?.classes || response?.data?.data || response?.data || [];
                setClasses(classData.map((item: any) => ({
                    id: String(item?.id || item?.classId || item?._id),
                    name: item?.name || 'Lớp chưa đặt tên',
                })));
            } catch (err) {
                console.error('Failed to load classes', err);
            }
        };
        loadClasses();
    }, [user]);

    const handleDelete = async () => {
        if (!selectedTest) return;
        try {
            await deleteTest(selectedTest.id);
            setDeleteDialogOpen(false);
            setSelectedTest(null);
            loadTests();
        } catch (err: any) {
            setError(err.message || 'Xóa đề thi thất bại');
        }
    };

    const handlePublish = async (test: Test) => {
        try {
            await publishTest(test.id);
            loadTests();
        } catch (err: any) {
            setError(err.message || 'Đăng đề thi thất bại');
        }
    };

    const handleUnpublish = async (test: Test) => {
        try {
            await unpublishTest(test.id);
            loadTests();
        } catch (err: any) {
            setError(err.message || 'Gỡ đề thi thất bại');
        }
    };

    const handleArchive = async (test: Test) => {
        try {
            await archiveTest(test.id);
            loadTests();
        } catch (err: any) {
            setError(err.message || 'Lưu trữ đề thi thất bại');
        }
    };

    const handleDuplicate = async () => {
        if (!selectedTest) return;
        try {
            setDuplicating(true);
            await duplicateTest(selectedTest.id, duplicateClassId || undefined);
            setDuplicateDialogOpen(false);
            setSelectedTest(null);
            setDuplicateClassId('');
            loadTests();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Nhân bản đề thi thất bại');
        } finally {
            setDuplicating(false);
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'draft':
                return <Chip label="Nháp" size="small" color="default" />;
            case 'published':
                return <Chip label="Đã đăng" size="small" color="success" />;
            case 'archived':
                return <Chip label="Lưu trữ" size="small" color="warning" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const filteredTests = statusFilter === 'all'
        ? tests
        : tests.filter(t => t.status === statusFilter);

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <DashboardLayout>
            <Box sx={commonStyles.pageContainer}>
                <Box sx={{ ...commonStyles.pageHeader, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" sx={commonStyles.pageTitle}>
                        📝 Quản lý đề thi
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/teacher/tests/create')}
                        sx={commonStyles.primaryButton}
                    >
                        Tạo đề mới
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Filter */}
                <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Trạng thái"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả</MenuItem>
                            <MenuItem value="draft">Nháp</MenuItem>
                            <MenuItem value="published">Đã đăng</MenuItem>
                            <MenuItem value="archived">Lưu trữ</MenuItem>
                        </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary">
                        Tổng: {filteredTests.length} đề thi
                    </Typography>
                </Paper>

                {/* Test table */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredTests.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Chưa có đề thi nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Tạo đề thi đầu tiên của bạn để giao cho học sinh làm bài
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/teacher/tests/create')}
                            sx={commonStyles.primaryButton}
                        >
                            Tạo đề mới
                        </Button>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={commonStyles.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tiêu đề</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell align="center">Số câu</TableCell>
                                    <TableCell align="center">Thời gian</TableCell>
                                    <TableCell align="center">Điểm đạt</TableCell>
                                    <TableCell align="center">Trạng thái</TableCell>
                                    <TableCell>Ngày tạo</TableCell>
                                    <TableCell align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTests.map((test) => (
                                    <TableRow key={test.id} sx={commonStyles.tableRow}>
                                        <TableCell>
                                            <Typography fontWeight={600}>{test.title}</Typography>
                                            {test.description && (
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                                                    {test.description}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{test.className || '—'}</TableCell>
                                        <TableCell align="center">{test.questions?.length || 0}</TableCell>
                                        <TableCell align="center">{test.duration} phút</TableCell>
                                        <TableCell align="center">{test.passingScore}%</TableCell>
                                        <TableCell align="center">{getStatusChip(test.status)}</TableCell>
                                        <TableCell>{formatDate(test.createdAt as any)}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                <Tooltip title="Sửa">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/teacher/tests/${test.id}/edit`)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                {test.status === 'draft' && (
                                                    <Tooltip title="Đăng đề">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handlePublish(test)}
                                                        >
                                                            <PublishIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {test.status === 'published' && (
                                                    <>
                                                        <Tooltip title="Gỡ đề">
                                                            <IconButton
                                                                size="small"
                                                                color="warning"
                                                                onClick={() => handleUnpublish(test)}
                                                            >
                                                                <UnpublishedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Thống kê">
                                                            <IconButton
                                                                size="small"
                                                                color="info"
                                                                onClick={() => navigate(`/teacher/tests/${test.id}/stats`)}
                                                            >
                                                                <StatsIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}

                                                <Tooltip title="Nhân bản">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => {
                                                            setSelectedTest(test);
                                                            setDuplicateClassId('');
                                                            setDuplicateDialogOpen(true);
                                                        }}
                                                    >
                                                        <CopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Lưu trữ">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleArchive(test)}
                                                    >
                                                        <ArchiveIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Xóa">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            setSelectedTest(test);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Delete confirmation dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        Bạn có chắc muốn xóa đề thi "<strong>{selectedTest?.title}</strong>"?
                        Hành động này không thể hoàn tác.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button color="error" variant="contained" onClick={handleDelete}>
                            Xóa
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Duplicate dialog */}
                <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>📋 Nhân bản đề thi</DialogTitle>
                    <DialogContent>
                        <Typography gutterBottom>
                            Tạo bản sao của đề "<strong>{selectedTest?.title}</strong>" cho lớp khác.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Bản sao sẽ ở trạng thái nháp. Bạn có thể chỉnh sửa rồi đăng cho lớp mới.
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel>Chọn lớp mới (hoặc để trống giữ lớp cũ)</InputLabel>
                            <Select
                                value={duplicateClassId}
                                label="Chọn lớp mới (hoặc để trống giữ lớp cũ)"
                                onChange={(e) => setDuplicateClassId(e.target.value)}
                            >
                                <MenuItem value=""><em>Giữ nguyên lớp cũ</em></MenuItem>
                                {classes.map((cls: any) => (
                                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDuplicateDialogOpen(false)}>Hủy</Button>
                        <Button
                            variant="contained"
                            onClick={handleDuplicate}
                            disabled={duplicating}
                            startIcon={duplicating ? <CircularProgress size={16} /> : <CopyIcon />}
                        >
                            {duplicating ? 'Đang nhân bản...' : 'Nhân bản'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default TestManagement;
