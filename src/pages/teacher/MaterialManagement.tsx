// Teacher Material Management Page
// Upload, manage, and delete learning materials for classes

import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
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
                <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Chọn lớp</InputLabel>
                        <Select
                            value={selectedClassId}
                            label="Chọn lớp"
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            {classes.map((cls) => (
                                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary">
                        Tổng: {materials.length} tài liệu
                    </Typography>
                </Paper>

                {/* Materials table */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : !selectedClassId ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            Vui lòng chọn lớp để xem tài liệu
                        </Typography>
                    </Paper>
                ) : materials.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
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
                            sx={commonStyles.primaryButton}
                        >
                            Upload tài liệu
                        </Button>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={commonStyles.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Loại</TableCell>
                                    <TableCell>Tiêu đề</TableCell>
                                    <TableCell>Danh mục</TableCell>
                                    <TableCell>Tên file</TableCell>
                                    <TableCell align="right">Kích thước</TableCell>
                                    <TableCell>Ngày upload</TableCell>
                                    <TableCell align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {materials.map((material) => (
                                    <TableRow key={material.id} sx={commonStyles.tableRow}>
                                        <TableCell>{getFileIcon(material.fileType)}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>{material.title}</Typography>
                                            {material.description && (
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                                    {material.description}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{getCategoryChip(material.category)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                {material.originalFileName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">{formatFileSize(material.fileSize)}</TableCell>
                                        <TableCell>{formatDate(material.createdAt)}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                <Tooltip title="Xem trực tiếp">
                                                    <IconButton size="small" color="primary" onClick={() => handlePreview(material)}>
                                                        <PreviewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Tải về">
                                                    <IconButton size="small" color="inherit" onClick={() => handleDownload(material)}>
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
                                    variant="outlined"
                                    sx={{
                                        p: 3, textAlign: 'center', cursor: 'pointer',
                                        border: '2px dashed',
                                        borderColor: uploadFile ? 'success.main' : 'divider',
                                        bgcolor: uploadFile ? 'success.50' : 'background.default',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <CardContent>
                                        {uploadFile ? (
                                            <>
                                                <Typography variant="body1" fontWeight={600} color="success.main">
                                                    ✅ {uploadFile.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatFileSize(uploadFile.size)} — Nhấn để đổi file
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                                <Typography variant="body1" color="text.secondary">
                                                    Nhấn để chọn file
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    PDF, Word, Hình ảnh, Audio, Video
                                                </Typography>
                                            </>
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
