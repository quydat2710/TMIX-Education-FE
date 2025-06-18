import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { COLORS } from '../../utils/colors';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch schedule data from API
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        // const response = await api.get('/student/schedule', {
        //   params: { date: selectedDate.toISOString() }
        // });
        // setSchedule(response.data);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDate]);

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const timeSlots = [
    '07:00 - 08:30',
    '08:45 - 10:15',
    '10:30 - 12:00',
    '13:30 - 15:00',
    '15:15 - 16:45',
    '17:00 - 18:30',
    '18:45 - 20:15',
  ];

  const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom>
            Lịch học
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Chọn ngày"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { mb: 3 }
                }
              }}
            />
          </LocalizationProvider>

          <Grid container spacing={2}>
            {/* Header với các ngày trong tuần */}
            <Grid item xs={2}>
              <Box sx={{ height: 50 }} />
            </Grid>
            {weekdays.map((day) => (
              <Grid item xs={1.4} key={day}>
                <Paper
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    bgcolor: COLORS.primary,
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle2">{day}</Typography>
                </Paper>
              </Grid>
            ))}

            {/* Các khung giờ */}
            {timeSlots.map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <Grid item xs={2}>
                  <Paper sx={{ p: 1, textAlign: 'center', height: '100%' }}>
                    <Typography variant="body2">{timeSlot}</Typography>
                  </Paper>
                </Grid>
                {weekdays.map((day) => (
                  <Grid item xs={1.4} key={`${day}-${timeSlot}`}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: COLORS.background,
                        },
                      }}
                      onClick={() => {
                        const classData = schedule.find(
                          (c) => c.day === day && c.timeSlot === timeSlot
                        );
                        if (classData) {
                          handleOpenDialog(classData);
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1 }}>
                        {schedule
                          .filter((c) => c.day === day && c.timeSlot === timeSlot)
                          .map((classData) => (
                            <Box key={classData.id}>
                              <Typography variant="subtitle2" noWrap>
                                {classData.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {classData.room}
                              </Typography>
                            </Box>
                          ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>

          {/* Dialog xem chi tiết lớp học */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              Chi tiết lớp học
            </DialogTitle>
            <DialogContent>
              {selectedClass && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin lớp học
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Tên lớp:</Typography>
                        <Typography>{selectedClass.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Thời gian:</Typography>
                        <Typography>{selectedClass.timeSlot}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Phòng học:</Typography>
                        <Typography>{selectedClass.room}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Giáo viên:</Typography>
                        <Typography>{selectedClass.teacher}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Nội dung bài học
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedClass.lessonContent}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Bài tập về nhà
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên bài tập</TableCell>
                            <TableCell>Hạn nộp</TableCell>
                            <TableCell>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedClass.homework?.map((hw) => (
                            <TableRow key={hw.id}>
                              <TableCell>{hw.name}</TableCell>
                              <TableCell>{hw.dueDate}</TableCell>
                              <TableCell>
                                <Chip
                                  label={hw.status}
                                  color={hw.status === 'completed' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Schedule;
