import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminProfile from './AdminProfile';
import TeacherProfile from './TeacherProfile';
import StudentProfile from './StudentProfile';
import ParentProfile from './ParentProfile';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminProfile />;
    case 'teacher':
      return <TeacherProfile />;
    case 'student':
      return <StudentProfile />;
    case 'parent':
      return <ParentProfile />;
    default:
      return <div>Không xác định vai trò người dùng!</div>;
  }
};

export default Profile;
