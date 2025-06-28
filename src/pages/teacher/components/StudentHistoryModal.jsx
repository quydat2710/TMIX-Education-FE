import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import {
  History as HistoryIcon,
} from '@mui/icons-material';

const StudentHistoryModal = ({
  open,
  onClose,
  student,
  history
}) => {
  console.log('StudentHistoryModal props:', { open, student, history });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'absent': return 'Vắng';
      case 'late': return 'Đi muộn';
      default: return status;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #e0e0e0',
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <HistoryIcon color="primary" />
        <Box>
          <Typography variant="h6">Lịch sử điểm danh</Typography>
          <Typography variant="body2" color="text.secondary">
            {student?.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {history.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record, idx) => {
                  const status = record.status || '';
                  const note = record.note || '';

                  return (
                    <TableRow key={idx} hover>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(status)}
                          color={getStatusColor(status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {note || '---'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có lịch sử điểm danh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Học sinh này chưa có bản ghi điểm danh nào.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentHistoryModal;
