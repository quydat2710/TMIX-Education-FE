import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Class as ClassIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Dashboard = () => {
  const stats = [
    {
      title: 'Lớp học đang dạy',
      value: '5',
      icon: <ClassIcon sx={{ fontSize: 40, color: COLORS.primary.main }} />,
      color: COLORS.primary.light,
    },
    {
      title: 'Giờ dạy tuần này',
      value: '20',
      icon: <TimeIcon sx={{ fontSize: 40, color: COLORS.secondary.main }} />,
      color: COLORS.secondary.light,
    },
    {
      title: 'Tổng học viên',
      value: '75',
      icon: <SchoolIcon sx={{ fontSize: 40, color: COLORS.success.main }} />,
      color: COLORS.success.light,
    },
    {
      title: 'Đánh giá trung bình',
      value: '4.8/5',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: COLORS.warning.main }} />,
      color: COLORS.warning.light,
    },
  ];

  const upcomingClasses = [
    {
      id: 1,
      name: 'Lớp Speaking A1',
      time: '09:00 - 10:30',
      students: 15,
    },
    {
      id: 2,
      name: 'Lớp Grammar B1',
      time: '13:00 - 14:30',
      students: 12,
    },
    {
      id: 3,
      name: 'Lớp Writing A2',
      time: '15:00 - 16:30',
      students: 10,
    },
  ];

  return (
    <DashboardLayout role="teacher">
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  bgcolor: stat.color,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'white' },
                      }}
                    >
                      {stat.icon}
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lớp học sắp tới
                </Typography>
                <List>
                  {upcomingClasses.map((classItem, index) => (
                    <React.Fragment key={classItem.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: COLORS.primary.main }}>
                            <ClassIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={classItem.name}
                          secondary={`${classItem.time} • ${classItem.students} học viên`}
                        />
                      </ListItem>
                      {index < upcomingClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông báo mới
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Lịch dạy tuần tới đã được cập nhật"
                      secondary="2 giờ trước"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Họp giáo viên định kỳ"
                      secondary="Hôm nay, 15:00"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Cập nhật giáo trình mới"
                      secondary="Hôm qua"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
