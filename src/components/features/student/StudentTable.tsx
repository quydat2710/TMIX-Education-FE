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
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { Student } from '../../../types';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onViewDetails: (student: Student) => void;
  onResetPassword?: (student: Student) => void;
  loading?: boolean;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
  onViewDetails,
  onResetPassword,
  loading = false
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (students.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có học sinh nào</Typography>
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
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Phụ huynh</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Lớp học</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Giới tính</TableCell>
              <TableCell sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', textAlign: 'center' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students && Array.isArray(students) && students.map((student) => (
              <TableRow key={student.id} sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.6)', transform: 'translateY(-1px)' }
              }}>
                <TableCell>
                  <Typography variant="body1" fontWeight="700" color="primary.main">
                    {student.name || student.userId?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.email || student.userId?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.phone || student.userId?.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {(((student as any)?.parent && (student as any)?.parent?.id) || student.parentId)
                      ? (((student as any)?.parent?.name) || 'Có phụ huynh')
                      : 'Không có phụ huynh'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {Array.isArray(student.classes) && student.classes.length > 0 ? (
                    <Box>
                      {student.classes.map((cls: any, idx: number) => {
                        const className = cls.class?.name || cls.classId?.name || `Lớp ${cls.class?.grade || cls.classId?.grade || ''}.${cls.class?.section || cls.classId?.section || ''}`;
                        const status = cls.status === 'active' ? 'Đang học' : 'Đã nghỉ';
                        const discount = cls.discountPercent ? ` (Giảm ${cls.discountPercent}%)` : '';
                        return (
                          <Typography key={idx} variant="body2" sx={{ display: 'block' }}>
                            {`${className}${discount} - ${status}`}
                          </Typography>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2">Chưa đăng ký lớp</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Không xác định'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(student)}
                      sx={{ color: 'grey.600' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(student)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(student.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {onResetPassword && (
                      <IconButton
                        size="small"
                        onClick={() => onResetPassword(student)}
                        sx={{ color: '#ff9800' }}
                        title="Đặt lại mật khẩu"
                      >
                        <LockResetIcon />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!students || !Array.isArray(students) || students.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu học sinh
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

export default StudentTable;
