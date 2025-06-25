import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScheduleCalendar from '../../components/common/ScheduleCalendar';
import { getTeacherScheduleAPI, getMyClassesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Schedule = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherSchedule = async () => {
      if (!user) {
        console.error('No user found');
        setError('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const teacherId = user?.teacherId;
        if (!teacherId) {
          throw new Error('No teacher ID available');
        }

        let response = await getTeacherScheduleAPI(teacherId);

        // Nếu schedule API thất bại, thử getMyClassesAPI
        if (!response?.data?.classes) {
          try {
            const classesResponse = await getMyClassesAPI();
            if (classesResponse?.data?.classes) {
              response = {
                data: {
                  classes: classesResponse.data.classes
                }
              };
            }
          } catch (classesErr) {
            console.error('getMyClassesAPI also failed:', classesErr);
          }
        }

        if (response?.data?.classes) {
          const classes = response.data.classes;
          const formattedLessons = [];

          classes.forEach(classItem => {
            if (classItem.schedule) {
              const { schedule } = classItem;
              const startDate = new Date(schedule.startDate);
              const endDate = new Date(schedule.endDate);

              // Tạo lessons cho mỗi ngày trong tuần được lên lịch
              schedule.dayOfWeeks.forEach(dayOfWeek => {
                let currentDate = new Date(startDate);

                // API sử dụng format: 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7
                // JavaScript getDay() cũng sử dụng format tương tự
                while (currentDate.getDay() !== dayOfWeek) {
                  currentDate.setDate(currentDate.getDate() + 1);
                }

                // Tạo lessons cho tất cả các tuần từ startDate đến endDate
                while (currentDate <= endDate) {
                  const lesson = {
                    date: currentDate.toISOString().split('T')[0],
                    className: classItem.name,
                    time: `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`,
                    room: classItem.room,
                    teacher: user.name,
                    type: 'teacher',
                    classId: classItem.id,
                    status: classItem.status,
                    grade: classItem.grade,
                    section: classItem.section,
                  };

                  formattedLessons.push(lesson);

                  // Chuyển đến tuần tiếp theo
                  currentDate.setDate(currentDate.getDate() + 7);
                }
              });
            }
          });

          // Sắp xếp theo ngày
          formattedLessons.sort((a, b) => new Date(a.date) - new Date(b.date));

          setLessons(formattedLessons);
        } else {
          setLessons([]);
        }
      } catch (err) {
        console.error('Error fetching teacher schedule:', err);

        let errorMessage = 'Không thể tải lịch dạy học. Vui lòng thử lại sau.';

        if (err.response?.status === 404) {
          errorMessage = 'Không tìm thấy thông tin lịch dạy của giáo viên.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập thông tin này.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSchedule();
  }, [user?.teacherId, user?.name]);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <ScheduleCalendar
        lessons={lessons}
        title="Lịch dạy của tôi"
        userType="teacher"
      />
    </DashboardLayout>
  );
};

export default Schedule;
