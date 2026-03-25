// Student Materials Page — Read-only view with inline preview

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Tooltip, CircularProgress, MenuItem, Button,
    Select, FormControl, InputLabel, Dialog, DialogTitle,
    DialogContent,
} from '@mui/material';
import {
    Visibility as PreviewIcon,
    Download as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    AudioFile as AudioIcon,
    VideoFile as VideoIcon,
    Description as DocIcon,
    InsertDriveFile as FileIcon,
    FolderOpen as EmptyIcon,
    Close as CloseIcon,
    OpenInNew as OpenIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { getMaterialsByClass, Material, getFileAccessUrl } from '../../services/materials';
import { getStudentScheduleAPI } from '../../services/students';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'grammar', label: '📖 Grammar' },
    { value: 'vocabulary', label: '📝 Vocabulary' },
    { value: 'listening', label: '🎧 Listening' },
    { value: 'reading', label: '📚 Reading' },
    { value: 'writing', label: '✍️ Writing' },
    { value: 'speaking', label: '🗣️ Speaking' },
    { value: 'other', label: '📁 Khác' },
];

const StudentMaterials: React.FC = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

    useEffect(() => {
        const loadClasses = async () => {
            try {
                let studentId = user?.id;
                if (user?.role === 'student' && user?.studentId) studentId = user.studentId;
                if (!studentId) return;
                const res = await getStudentScheduleAPI(studentId);
                const scheduleData = res?.data?.data || [];
                if (!Array.isArray(scheduleData)) return;
                const mapped = scheduleData.map((item: any) => ({
                    id: String(item?.class?.id || ''),
                    name: item?.class?.name || 'Lớp chưa đặt tên',
                })).filter((c: any) => c.id);
                setClasses(mapped);
                if (mapped.length > 0) setSelectedClassId(mapped[0].id);
            } catch (err) { console.error('Failed to load classes', err); }
        };
        loadClasses();
    }, [user]);

    useEffect(() => {
        if (selectedClassId) loadMaterials();
    }, [selectedClassId, categoryFilter]);

    const loadMaterials = async () => {
        try {
            setLoading(true);
            const response = await getMaterialsByClass(selectedClassId, {
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                limit: 50,
            });
            setMaterials(response?.data?.result || response?.result || []);
        } catch (err: any) { console.error('Failed to load materials', err); }
        finally { setLoading(false); }
    };

    const handlePreview = (material: Material) => {
        setPreviewMaterial(material);
        setPreviewOpen(true);
    };

    const handleOpenFile = (material: Material) => {
        window.open(getFileAccessUrl(material), '_blank', 'noopener,noreferrer');
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf': return <PdfIcon color="error" />;
            case 'image': return <ImageIcon color="primary" />;
            case 'audio': return <AudioIcon color="secondary" />;
            case 'video': return <VideoIcon color="warning" />;
            case 'document': return <DocIcon color="info" />;
            default: return <FileIcon />;
        }
    };

    const getCategoryChip = (category: string) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return <Chip label={cat?.label || category} size="small" variant="outlined" />;
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderPreviewContent = (material: Material) => {
        const fileUrl = getFileAccessUrl(material);
        const { fileType } = material;

        if (fileType === 'pdf') {
            return (
                <Box sx={{ width: '100%', height: '75vh', position: 'relative' }}>
                    <object data={fileUrl} type="application/pdf" style={{ width: '100%', height: '100%', border: 'none' }}>
                        <iframe src={fileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title={material.title} />
                    </object>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Button variant="outlined" startIcon={<OpenIcon />} onClick={() => window.open(fileUrl, '_blank')}>
                            Mở PDF trong tab mới
                        </Button>
                    </Box>
                </Box>
            );
        }
        if (fileType === 'image') {
            return <Box sx={{ textAlign: 'center', p: 2 }}><img src={fileUrl} alt={material.title} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} /></Box>;
        }
        if (fileType === 'audio') {
            return <Box sx={{ textAlign: 'center', p: 4 }}><AudioIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} /><Typography variant="h6" gutterBottom>{material.title}</Typography><audio controls style={{ width: '100%', maxWidth: 500 }}><source src={fileUrl} /></audio></Box>;
        }
        if (fileType === 'video') {
            return <Box sx={{ textAlign: 'center', p: 2 }}><video controls style={{ width: '100%', maxHeight: '70vh' }}><source src={fileUrl} /></video></Box>;
        }
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <DocIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>{material.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Loại file này không hỗ trợ xem trực tiếp.</Typography>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleOpenFile(material)}>Tải về</Button>
            </Box>
        );
    };

    return (
        <DashboardLayout role="student">
            <Box sx={commonStyles.pageContainer}>
                <Box sx={{ ...commonStyles.pageHeader, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" sx={commonStyles.pageTitle}>📚 Tài liệu học tập</Typography>
                </Box>

                <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Chọn lớp</InputLabel>
                        <Select value={selectedClassId} label="Chọn lớp" onChange={(e) => setSelectedClassId(e.target.value)}>
                            {classes.map((cls) => (<MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Danh mục</InputLabel>
                        <Select value={categoryFilter} label="Danh mục" onChange={(e) => setCategoryFilter(e.target.value)}>
                            {CATEGORIES.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary">{materials.length} tài liệu</Typography>
                </Paper>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : !selectedClassId ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6" color="text.secondary">Vui lòng chọn lớp để xem tài liệu</Typography></Paper>
                ) : materials.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <EmptyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>Chưa có tài liệu nào</Typography>
                        <Typography variant="body2" color="text.secondary">Giáo viên chưa upload tài liệu cho lớp này</Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={commonStyles.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={50}>Loại</TableCell>
                                    <TableCell>Tiêu đề</TableCell>
                                    <TableCell>Danh mục</TableCell>
                                    <TableCell>Tên file</TableCell>
                                    <TableCell align="right">Kích thước</TableCell>
                                    <TableCell>Ngày upload</TableCell>
                                    <TableCell align="center" width={120}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {materials.map((material) => (
                                    <TableRow key={material.id} sx={commonStyles.tableRow}>
                                        <TableCell>{getFileIcon(material.fileType)}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>{material.title}</Typography>
                                            {material.description && <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>{material.description}</Typography>}
                                        </TableCell>
                                        <TableCell>{getCategoryChip(material.category)}</TableCell>
                                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{material.originalFileName}</Typography></TableCell>
                                        <TableCell align="right">{formatFileSize(material.fileSize)}</TableCell>
                                        <TableCell>{formatDate(material.createdAt)}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                <Tooltip title="Xem trực tiếp"><IconButton size="small" color="primary" onClick={() => handlePreview(material)}><PreviewIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Tải về / Mở"><IconButton size="small" color="inherit" onClick={() => handleOpenFile(material)}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { minHeight: '50vh' } }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6">{previewMaterial?.title}</Typography>
                            {previewMaterial?.description && <Typography variant="body2" color="text.secondary">{previewMaterial.description}</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Mở tab mới"><IconButton onClick={() => previewMaterial && window.open(previewMaterial.fileUrl, '_blank')}><OpenIcon /></IconButton></Tooltip>
                            <IconButton onClick={() => setPreviewOpen(false)}><CloseIcon /></IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers sx={{ p: 0 }}>
                        {previewMaterial && renderPreviewContent(previewMaterial)}
                    </DialogContent>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default StudentMaterials;
