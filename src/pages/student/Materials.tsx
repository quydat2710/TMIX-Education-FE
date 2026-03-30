// Student Materials Page — Read-only view with inline preview

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
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

import { motion } from 'framer-motion';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả', color: 'default' },
    { value: 'grammar', label: '📖 Grammar', color: 'primary' },
    { value: 'vocabulary', label: '📝 Vocabulary', color: 'secondary' },
    { value: 'listening', label: '🎧 Listening', color: 'info' },
    { value: 'reading', label: '📚 Reading', color: 'success' },
    { value: 'writing', label: '✍️ Writing', color: 'warning' },
    { value: 'speaking', label: '🗣️ Speaking', color: 'error' },
    { value: 'other', label: '📁 Khác', color: 'default' },
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
        let icon;
        let color = 'primary';
        switch (fileType) {
            case 'pdf': icon = <PdfIcon color="error" />; color = 'error'; break;
            case 'image': icon = <ImageIcon color="primary" />; color = 'primary'; break;
            case 'audio': icon = <AudioIcon color="secondary" />; color = 'secondary'; break;
            case 'video': icon = <VideoIcon color="warning" />; color = 'warning'; break;
            case 'document': icon = <DocIcon color="info" />; color = 'info'; break;
            default: icon = <FileIcon color="action" />; color = 'inherit'; break;
        }
        return (
            <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: color !== 'inherit' ? `${color}.100` : 'action.selected',
            }}>
                {icon}
            </Box>
        );
    };

    const getCategoryChip = (category: string) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return (
            <Chip 
                label={cat?.label || category} 
                size="small" 
                color={(cat?.color as any) || 'default'}
                sx={{ 
                    fontWeight: 600, 
                    borderRadius: '8px',
                    '& .MuiChip-label': { px: 2 }
                }} 
            />
        );
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

                {/* Filter Bar */}
                <Box sx={{ 
                    p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap',
                    background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                    borderRadius: 4,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0'
                }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Chọn lớp</InputLabel>
                        <Select 
                            value={selectedClassId} 
                            label="Chọn lớp" 
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            {classes.map((cls) => (<MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Danh mục</InputLabel>
                        <Select 
                            value={categoryFilter} 
                            label="Danh mục" 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            {CATEGORIES.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontWeight: 600 }}>
                        {materials.length} tài liệu
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : !selectedClassId ? (
                    <Box sx={{ 
                        p: 6, textAlign: 'center',
                        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                        borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h6" color="text.secondary">Vui lòng chọn lớp để xem tài liệu</Typography>
                    </Box>
                ) : materials.length === 0 ? (
                    <Box sx={{ 
                        p: 6, textAlign: 'center',
                        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                        borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0'
                    }}>
                        <EmptyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>Chưa có tài liệu nào</Typography>
                        <Typography variant="body2" color="text.secondary">Giáo viên chưa upload tài liệu cho lớp này</Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                        borderRadius: 4,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <TableContainer>
                            <Table component={motion.table} initial="hidden" animate="visible" variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                            }}>
                                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                    <TableRow>
                                        <TableCell width={50} sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Loại</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tiêu đề</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Danh mục</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tên file</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Kích thước</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Ngày upload</TableCell>
                                        <TableCell align="center" width={120} sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {materials.map((material) => (
                                        <TableRow 
                                            key={material.id} 
                                            component={motion.tr}
                                            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                            sx={{ 
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                '& td': { 
                                                    borderBottom: '1px solid #f1f5f9',
                                                    transition: 'all 0.3s ease'
                                                },
                                                '&:last-child td': { borderBottom: 'none' },
                                                '&:hover td': { 
                                                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                                                },
                                                '&:hover td:first-of-type': {
                                                    boxShadow: 'inset 4px 0 0 0 #1976d2',
                                                }
                                            }}
                                        >
                                            <TableCell>{getFileIcon(material.fileType)}</TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600} color="text.primary">{material.title}</Typography>
                                                {material.description && <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>{material.description}</Typography>}
                                            </TableCell>
                                            <TableCell>{getCategoryChip(material.category)}</TableCell>
                                            <TableCell><Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>{material.originalFileName}</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="body2" fontWeight={500}>{formatFileSize(material.fileSize)}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" color="text.secondary">{formatDate(material.createdAt)}</Typography></TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Xem trực tiếp">
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary" 
                                                            onClick={() => handlePreview(material)} 
                                                            sx={{ 
                                                                bgcolor: 'rgba(25, 118, 210, 0.08)', 
                                                                transition: 'all 0.2s',
                                                                '&:hover': { bgcolor: 'primary.main', color: '#fff', transform: 'scale(1.1)' } 
                                                            }}
                                                        >
                                                            <PreviewIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Tải về / Mở">
                                                        <IconButton 
                                                            size="small" 
                                                            color="inherit" 
                                                            onClick={() => handleOpenFile(material)} 
                                                            sx={{ 
                                                                bgcolor: 'rgba(0, 0, 0, 0.04)', 
                                                                transition: 'all 0.2s',
                                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.12)', transform: 'scale(1.1)' } 
                                                            }}
                                                        >
                                                            <DownloadIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
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
