import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScheduleCalendar from '../../components/common/ScheduleCalendar';

const mockLessons = [
  {
    date: '2024-06-10',
    className: 'Lớp A1',
    time: '08:00 - 09:30',
    room: 'Phòng 201',
    teacher: 'Nguyễn Văn Giáo Viên',
    type: 'teacher',
  },
  {
    date: '2024-06-11',
    className: 'Lớp B2',
    time: '10:00 - 11:30',
    room: 'Phòng 202',
    teacher: 'Nguyễn Văn Giáo Viên',
    type: 'teacher',
  },
  {
    date: '2024-06-12',
    className: 'Lớp C3',
    time: '13:30 - 15:00',
    room: 'Phòng 203',
    teacher: 'Nguyễn Văn Giáo Viên',
    type: 'teacher',
  },
];

const Schedule = () => {
  return (
    <DashboardLayout role="teacher">
      <ScheduleCalendar
        lessons={mockLessons}
        title="Lịch dạy của tôi"
        userType="teacher"
      />
    </DashboardLayout>
  );
};

export default Schedule;
