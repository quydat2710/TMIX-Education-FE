import React, { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScheduleCalendar from '../../components/common/ScheduleCalendar';
import { useApi } from '../../hooks/useApi';
import { getStudentScheduleAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const processSchedules = (schedules) => {
  const lessons = [];
  if (!schedules) return lessons;

  schedules.forEach((item) => {
    const { class: classInfo, schedule, teacher } = item;
    const startDate = dayjs(schedule.startDate);
    const endDate = dayjs(schedule.endDate);
    const dayOfWeeks = schedule.dayOfWeeks;
    const time = `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`;

    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      // dayjs().day() returns 0 for Sunday, 1 for Monday... 6 for Saturday
      // API seems to follow the same convention
      if (dayOfWeeks.includes(currentDate.day())) {
        lessons.push({
          date: currentDate.format('YYYY-MM-DD'),
          className: classInfo.name,
          time,
          room: classInfo.room,
          teacher: teacher.name,
          type: 'student',
        });
      }
      currentDate = currentDate.add(1, 'day');
    }
  });

  return lessons;
};

const Schedule = () => {
  const { user } = useAuth();
  const { data, loading, error, execute: fetchSchedule } = useApi(getStudentScheduleAPI, null, false);

  useEffect(() => {
    if (user?.id) {
      fetchSchedule(user.id);
    }
  }, [user, fetchSchedule]);

  const lessons = useMemo(() => {
    // The API response is now correctly handled by useApi
    // The data object from the response is nested under a 'data' key
    return data?.data?.schedules ? processSchedules(data.data.schedules) : [];
  }, [data]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box>
          <Typography color="error" textAlign="center" sx={{ mt: 4, mb: 2 }}>
            Đã xảy ra lỗi khi tải lịch học.
          </Typography>
          <Paper component="pre" sx={{ p: 2, backgroundColor: '#fbe9e7', border: '1px solid #ffab91', overflowX: 'auto' }}>
            {JSON.stringify(error, null, 2)}
          </Paper>
        </Box>
      );
    }

    if (data) {
      return (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Kết quả API trả về:
          </Typography>
          <Paper component="pre" sx={{ p: 2, backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', overflowX: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </Paper>
        </Box>
      );
    }

    // Default message if no data, no error, not loading
    return <Typography sx={{ mt: 4, textAlign: 'center' }}>Đang chờ lấy dữ liệu...</Typography>;
  };

  return (
    <DashboardLayout role="student">
      {renderContent()}
    </DashboardLayout>
  );
};

export default Schedule;
