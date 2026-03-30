// Teacher Material Management Page
// Upload, manage, and delete learning materials for classes

import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tooltip, Alert, CircularProgress, MenuItem,
    Select, FormControl, InputLabel, TextField, Grid,
    Card, CardContent, LinearProgress,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as PreviewIcon,
    Download as DownloadIcon,
    OpenInNew as OpenIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    AudioFile as AudioIcon,
    VideoFile as VideoIcon,
    Description as DocIcon,
    InsertDriveFile as FileIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { uploadMaterial, getMaterialsByClass, deleteMaterial, Material, getFileAccessUrl } from '../../services/materials';
import { getTeacherScheduleAPI } from '../../services/teachers';
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

const MaterialManagement: React.FC = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Upload dialog
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDesc, setUploadDesc] = useState('');
    const [uploadCategory, setUploadCategory] = useState('other');
    const [uploading, setUploading] = useState(false);

    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

    // Preview dialog
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

    // Load teacher's classes
    useEffect(() => {
        const loadClasses = async () => {
            try {
                const teacherId = (user as any)?.teacherId || (user as any)?.teacher?.teacher_id || user?.id;
                if (!teacherId) return;
                const response = await getTeacherScheduleAPI(String(teacherId));
                const classData = response?.data?.classes || response?.data?.data || response?.data || [];
                const mapped = classData.map((item: any) => ({
                    id: String(item?.id || item?.classId || item?._id),
                    name: item?.name || 'Lớp chưa đặt tên',
                }));
                setClasses(mapped);
                if (mapped.length > 0) {
                    setSelectedClassId(mapped[0].id);
                }
            } catch (err) {
                console.error('Failed to load classes', err);
            }
        };
        loadClasses();
    }, [user]);

    // Load materials when class changes
    useEffect(() => {
        if (selectedClassId) loadMaterials();
    }, [selectedClassId]);

    const loadMaterials = async (category?: string) => {
        try {
            setLoading(true);
            const response = await getMaterialsByClass(selectedClassId, {
                category: category && category !== 'all' ? category : undefined,
                limit: 50,
            });
            setMaterials(response?.data?.result || response?.result || []);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách tài liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile || !uploadTitle || !selectedClassId) {
            setError('Vui lòng điền đầy đủ thông tin và chọn file');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', uploadTitle);
            formData.append('description', uploadDesc);
            formData.append('category', uploadCategory);
            formData.append('classId', selectedClassId);

            await uploadMaterial(formData);
            setSuccess('Upload tài liệu thành công! Học sinh đã được thông báo.');
            setUploadOpen(false);
            resetUploadForm();
            loadMaterials();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Upload thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMaterial) return;
        try {
            await deleteMaterial(selectedMaterial.id);
            setDeleteDialogOpen(false);
            setSelectedMaterial(null);
            setSuccess('Đã xóa tài liệu');
            loadMaterials();
        } catch (err: any) {
            setError(err.message || 'Xóa thất bại');
        }
    };

    const resetUploadForm = () => {
        setUploadFile(null);
        setUploadTitle('');
        setUploadDesc('');
        setUploadCategory('other');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePreview = (material: Material) => {
        setPreviewMaterial(material);
        setPreviewOpen(true);
    };

    const handleDownload = (material: Material) => {
        window.open(getFileAccessUrl(material), '_blank', 'noopener,noreferrer');
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
                        <Button variant="outlined" startIcon={<OpenIcon />} onClick={() => window.open(fileUrl, '_blank')}>Mở PDF trong tab mới</Button>
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
        return <Box sx={{ textAlign: 'center', p: 4 }}><DocIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} /><Typography variant="h6" gutterBottom>{material.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Loại file này không hỗ trợ xem trực tiếp.</Typography><Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleDownload(material)}>Tải về</Button></Box>;
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
                        📚 Quản lý tài liệu học tập
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => setUploadOpen(true)}
                        disabled={!selectedClassId}
                        sx={commonStyles.primaryButton}
                    >
                        Upload tài liệu
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {/* Class selector */}
                {/* Class selector */}
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
                            {classes.map((cls) => (
                                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontWeight: 600 }}>
                        Tổng: {materials.length} tài liệu
                    </Typography>
                </Box>

                {/* Materials table */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : !selectedClassId ? (
                    <Box sx={{ 
                        p: 6, textAlign: 'center',
                        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                        borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h6" color="text.secondary">
                            Vui lòng chọn lớp để xem tài liệu
                        </Typography>
                    </Box>
                ) : materials.length === 0 ? (
                    <Box sx={{ 
                        p: 6, textAlign: 'center',
                        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                        borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Chưa có tài liệu nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Upload tài liệu đầu tiên cho lớp này
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<UploadIcon />}
                            onClick={() => setUploadOpen(true)}
                            sx={{ ...commonStyles.primaryButton, borderRadius: 2 }}
                        >
                            Upload tài liệu
                        </Button>
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
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Loại</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tiêu đề</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Danh mục</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tên file</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Kích thước</TableCell>
                                        <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Ngày upload</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Thao tác</TableCell>
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
                                                {material.description && (
                                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                                        {material.description}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{getCategoryChip(material.category)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                                    {material.originalFileName}
                                                </Typography>
                                            </TableCell>
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
                                                    <Tooltip title="Tải về">
                                                        <IconButton 
                                                            size="small" 
                                                            color="inherit" 
                                                            onClick={() => handleDownload(material)} 
                                                            sx={{ 
                                                                bgcolor: 'rgba(0, 0, 0, 0.04)', 
                                                                transition: 'all 0.2s',
                                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.12)', transform: 'scale(1.1)' } 
                                                            }}
                                                        >
                                                            <DownloadIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {
                                                                setSelectedMaterial(material);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            sx={{ 
                                                                bgcolor: 'rgba(211, 47, 47, 0.08)', 
                                                                transition: 'all 0.2s',
                                                                '&:hover': { bgcolor: 'error.main', color: '#fff', transform: 'scale(1.1)' } 
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
                    </Box>
                )}

                {/* Upload Dialog */}
                <Dialog open={uploadOpen} onClose={() => { setUploadOpen(false); resetUploadForm(); }} maxWidth="sm" fullWidth>
                    <DialogTitle>📤 Upload tài liệu mới</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Tiêu đề tài liệu *"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder="VD: Bài tập Grammar Unit 5"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Mô tả (không bắt buộc)"
                                    value={uploadDesc}
                                    onChange={(e) => setUploadDesc(e.target.value)}
                                    multiline
                                    rows={2}
                                    placeholder="Mô tả ngắn gọn về tài liệu"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Danh mục</InputLabel>
                                    <Select
                                        value={uploadCategory}
                                        label="Danh mục"
                                        onChange={(e) => setUploadCategory(e.target.value)}
                                    >
                                        {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                                            <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.mp3,.wav,.ogg,.mp4,.pptx,.xlsx"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setUploadFile(file);
                                            if (!uploadTitle) {
                                                setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
                                            }
                                        }
                                    }}
                                />
                                <Card
                                    component={motion.div}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    variant="outlined"
                                    sx={{
                                        p: 4, textAlign: 'center', cursor: 'pointer',
                                        border: '2px dashed',
                                        borderColor: uploadFile ? 'success.main' : 'primary.main',
                                        bgcolor: uploadFile ? 'success.50' : 'rgba(25, 118, 210, 0.02)',
                                        borderRadius: 4,
                                        transition: 'all 0.3s ease',
                                        '&:hover': { 
                                            borderColor: 'primary.dark', 
                                            bgcolor: 'rgba(25, 118, 210, 0.05)',
                                            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)'
                                        },
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <CardContent>
                                        {uploadFile ? (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', bgcolor: 'success.100', color: 'success.main', mb: 2 }}>
                                                    <FileIcon fontSize="large" />
                                                </Box>
                                                <Typography variant="body1" fontWeight={700} color="success.dark" fontSize="1.1rem" gutterBottom>
                                                    {uploadFile.name}
                                                </Typography>
                                                <Typography variant="body2" color="success.main" fontWeight={500}>
                                                    {formatFileSize(uploadFile.size)} — Nhấn để chọn file khác
                                                </Typography>
                                            </motion.div>
                                        ) : (
                                            <Box>
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.50', color: 'primary.main', mb: 2 }}>
                                                    <UploadIcon sx={{ fontSize: 32 }} />
                                                </Box>
                                                <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                                                    Kéo thả hoặc nhấn để chọn file
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                                                    Hỗ trợ: PDF, Word, Hình ảnh, Audio, Video (Tối đa 50MB)
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        {uploading && <LinearProgress sx={{ mt: 2 }} />}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setUploadOpen(false); resetUploadForm(); }}>Hủy</Button>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={uploading || !uploadFile || !uploadTitle}
                            startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                        >
                            {uploading ? 'Đang upload...' : 'Upload'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete confirmation dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        Bạn có chắc muốn xóa tài liệu "<strong>{selectedMaterial?.title}</strong>"?
                        Hành động này không thể hoàn tác.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button color="error" variant="contained" onClick={handleDelete}>
                            Xóa
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { minHeight: '50vh' } }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6">{previewMaterial?.title}</Typography>
                            {previewMaterial?.description && <Typography variant="body2" color="text.secondary">{previewMaterial.description}</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Mở tab mới"><IconButton onClick={() => previewMaterial && window.open(getFileAccessUrl(previewMaterial), '_blank')}><OpenIcon /></IconButton></Tooltip>
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

export default MaterialManagement;
