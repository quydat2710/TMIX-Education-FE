import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Parent } from '../../../types';

interface ParentTableProps {
  parents: Parent[];
  onEdit: (parent: Parent) => void;
  onDelete: (parentId: string) => void;
  onViewDetails: (parent: Parent) => void;
  loading?: boolean;
}

const ParentTable: React.FC<ParentTableProps> = ({
  parents,
  onEdit,
  onDelete,
  onViewDetails,
  loading = false
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (parents.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có phụ huynh nào</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
      border: '1px solid #e2e8f0', 
      borderRadius: 3,
      p: { xs: 1, sm: 2 } 
    }}>
      <TableContainer sx={{ 
        bgcolor: 'transparent',
        boxShadow: 'none',
        border: 'none',
        '& .MuiTableCell-root': {
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Họ và tên</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Số điện thoại</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Con</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Giới tính</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Xem thông tin giáo viên</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', textAlign: 'center' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parents && Array.isArray(parents) && parents.map((parent) => (
              <TableRow key={parent.id} sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.6)', transform: 'translateY(-1px)' }
              }}>
                <TableCell>
                  <Typography variant="body1" fontWeight="700" color="primary.main">
                    {parent.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {parent.students && parent.students.length > 0 ? (
                      parent.students.map((student, index) => (
                        <Typography key={student.id || index} variant="body2" sx={{ mb: index < parent.students.length - 1 ? 0.5 : 0 }}>
                          {student.name}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có con
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.gender === 'male' ? 'Nam' : parent.gender === 'female' ? 'Nữ' : 'Không xác định'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#45a049'
                      }
                    }}
                  >
                    Có
                  </Button>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(parent)}
                      sx={{ color: 'grey.600' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(parent)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(parent.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!parents || !Array.isArray(parents) || parents.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu phụ huynh
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParentTable;
