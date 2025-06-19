import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScheduleCalendar from '../../components/common/ScheduleCalendar';

const mockLessons = [
  {
    date: '2024-06-10',
    className: 'Tiếng Anh 1',
    time: '08:00 - 09:30',
    room: 'Phòng 101',
    teacher: 'Nguyễn Văn A',
    type: 'student',
  },
  {
    date: '2024-06-10',
    className: 'Tiếng Anh 2',
    time: '10:00 - 11:30',
    room: 'Phòng 102',
    teacher: 'Nguyễn Văn B',
    type: 'student',
  },
  {
    date: '2024-06-12',
    className: 'Tiếng Anh 3',
    time: '13:30 - 15:00',
    room: 'Phòng 103',
    teacher: 'Nguyễn Văn C',
    type: 'student',
  },
];

const Schedule = () => {
  return (
    <DashboardLayout role="student">
      <ScheduleCalendar
        lessons={mockLessons}
        title="Lịch học của tôi"
        userType="student"
      />
    </DashboardLayout>
  );
};

export default Schedule;
