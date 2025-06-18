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
  LinearProgress,
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
      title: 'Khóa học đang học',
      value: '3',
      icon: <ClassIcon sx={{ fontSize: 40, color: COLORS.primary.main }} />,
      color: COLORS.primary.light,
    },
    {
      title: 'Giờ học tuần này',
      value: '12',
      icon: <TimeIcon sx={{ fontSize: 40, color: COLORS.secondary.main }} />,
      color: COLORS.secondary.light,
    },
    {
      title: 'Điểm trung bình',
      value: '8.5',
      icon: <SchoolIcon sx={{ fontSize: 40, color: COLORS.success.main }} />,
      color: COLORS.success.light,
    },
    {
      title: 'Tiến độ học tập',
      value: '75%',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: COLORS.warning.main }} />,
      color: COLORS.warning.light,
    },
  ];

  const upcomingClasses = [
    {
      id: 1,
      name: 'Speaking A1',
      time: '09:00 - 10:30',
      teacher: 'Cô Sarah',
    },
    {
      id: 2,
      name: 'Grammar B1',
      time: '13:00 - 14:30',
      teacher: 'Thầy John',
    },
    {
      id: 3,
      name: 'Writing A2',
      time: '15:00 - 16:30',
      teacher: 'Cô Mary',
    },
  ];

  const courses = [
    {
      name: 'Speaking A1',
      progress: 75,
      nextLesson: 'Unit 5: Daily Conversations',
    },
    {
      name: 'Grammar B1',
      progress: 60,
      nextLesson: 'Unit 4: Past Perfect',
    },
    {
      name: 'Writing A2',
      progress: 85,
      nextLesson: 'Unit 6: Email Writing',
    },
  ];

  return (
    <DashboardLayout role="student">
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
                          secondary={`${classItem.time} • ${classItem.teacher}`}
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
                  Tiến độ khóa học
                </Typography>
                <List>
                  {courses.map((course, index) => (
                    <React.Fragment key={course.name}>
                      <ListItem>
                        <ListItemText
                          primary={course.name}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {course.nextLesson}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={course.progress}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: COLORS.background.default,
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: COLORS.primary.main,
                                      },
                                    }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {`${course.progress}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < courses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
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
