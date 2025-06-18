import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const weekDays = [
    { id: 1, name: 'Thứ 2' },
    { id: 2, name: 'Thứ 3' },
    { id: 3, name: 'Thứ 4' },
    { id: 4, name: 'Thứ 5' },
    { id: 5, name: 'Thứ 6' },
    { id: 6, name: 'Thứ 7' },
    { id: 0, name: 'Chủ nhật' },
  ];

  const timeSlots = [
    { id: 1, start: '08:00', end: '09:30' },
    { id: 2, start: '10:00', end: '11:30' },
    { id: 3, start: '13:30', end: '15:00' },
    { id: 4, start: '15:30', end: '17:00' },
    { id: 5, start: '18:00', end: '19:30' },
  ];

  return (
    <DashboardLayout role="teacher">
      <Box>
        <Typography variant="h4" gutterBottom>
        Lịch dạy
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Chọn tuần"
              type="week"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {weekDays.map((day) => (
          <Grid item xs={12} key={day.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {day.name}
              </Typography>
              <Grid container spacing={2}>
                {timeSlots.map((slot) => (
                  <Grid item xs={12} sm={6} md={4} key={slot.id}>
                    <Card
                      sx={{
                          bgcolor: COLORS.background,
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: COLORS.hover,
                        },
                      }}
                      onClick={() => handleOpenDialog()}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {slot.start} - {slot.end}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lớp A1.1 - Phòng 101
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog chi tiết buổi học */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Chi tiết buổi học
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Lớp:</Typography>
              <Typography>Lớp A1.1</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Thời gian:</Typography>
              <Typography>Thứ 2, 18:00 - 19:30</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Phòng học:</Typography>
              <Typography>Phòng 101</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Nội dung bài học:</Typography>
              <Typography>
                Unit 1: Greetings and Introductions
                - Vocabulary: Common greetings
                - Grammar: Present simple tense
                - Speaking: Practice introducing yourself
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
          <Button
            variant="contained"
              sx={{ bgcolor: COLORS.primary }}
          >
            Cập nhật nội dung
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </DashboardLayout>
  );
};

export default Schedule;
