import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
  Theme,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';
import { styled } from '@mui/material/styles';
import 'dayjs/locale/vi';
import updateLocale from 'dayjs/plugin/updateLocale';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion, AnimatePresence } from 'framer-motion';

// Cấu hình dayjs để sử dụng tiếng Việt và plugin updateLocale
dayjs.extend(updateLocale);
dayjs.updateLocale('vi', {
  weekdays: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  weekdaysShort: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  months: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  formats: {
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd, D MMMM YYYY HH:mm',
    calendarHeader: 'MMMM [Năm] YYYY',
  },
});
dayjs.locale('vi');

interface Lesson {
  date: string;
  className: string;
  time: string;
  room?: string;
  teacher?: string;
  type?: string;
}

interface CustomCalendarHeaderProps {
  currentMonth: Dayjs;
  onMonthChange: (date: Dayjs, direction: 'left' | 'right') => void;
}

interface ServerDayProps {
  day: Dayjs;
  lessons: Lesson[];
  userType: 'teacher' | 'student';
  selected?: boolean;
  sx?: any;
  [key: string]: any;
}

interface ScheduleCalendarProps {
  lessons: Lesson[];
  title: string;
  userType: 'teacher' | 'student';
}

const CustomCalendarHeader: React.FC<CustomCalendarHeaderProps> = ({ currentMonth, onMonthChange }) => {
  const theme: Theme = useTheme();

  const handlePrevMonth = (): void => {
    onMonthChange(currentMonth.subtract(1, 'month'), 'left');
  };

  const handleNextMonth = (): void => {
    onMonthChange(currentMonth.add(1, 'month'), 'right');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, width: '100%' }}>
      <IconButton onClick={handlePrevMonth} size="small">
        <ChevronLeftIcon />
      </IconButton>
      <Typography
        variant="h6"
        sx={{
          textTransform: 'capitalize',
          fontSize: '1.6rem',
          fontWeight: '600',
          [theme.breakpoints.up('sm')]: {
            fontSize: '1.6rem',
          },
          [theme.breakpoints.up('sm')]: {
            fontSize: '1.6rem',
          },
        }}
      >
        {currentMonth.format('MMMM [Năm] YYYY')}
      </Typography>
      <IconButton onClick={handleNextMonth} size="small">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

const weekDayNames: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7'
};

const StyledDateCalendar = styled(DateCalendar)(({ theme }) => ({
  width: '100%',
  maxWidth: 'none',
  margin: '0 auto',
  height: 'unset',
  overflow: 'unset',
  [theme.breakpoints.up('sm')]: {
    minWidth: '600px',
  },
  [theme.breakpoints.up('md')]: {
    minWidth: '800px',
  },
  '& .MuiPickersSlideTransition-root': {
    minHeight: '400px',
  },
  '& .MuiDayCalendar-monthContainer': {
    minHeight: '360px',
  },
  '& .MuiDayCalendar-weekContainer': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    justifyContent: 'space-between',
    width: '100%',
    margin: '0 auto',
    minHeight: '55px',
  },
  '& .MuiPickersCalendarHeader-root': {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '& .MuiPickersCalendarHeader-label': {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.87)',
    '& .MuiTypography-root': {
      fontSize: '1.8rem',
      fontWeight: '600',
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '2rem',
      '& .MuiTypography-root': {
        fontSize: '2rem',
      },
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '2.2rem',
      '& .MuiTypography-root': {
        fontSize: '2.2rem',
      },
    },
  },
  '& .MuiDayCalendar-header': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    justifyContent: 'space-between',
    width: '100%',
    margin: '0 auto',
  },
  '& .MuiDayCalendar-weekDayLabel': {
    fontSize: '1.1rem',
    width: '100%',
    height: '40px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '600',
    padding: '4px',
    '&[aria-label*="Sunday"], &[aria-label*="Saturday"]': {
      color: theme.palette.error.main,
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.2rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.3rem',
    },
  },
  '& .MuiPickersDay-root': {
    fontSize: '1.1rem',
    width: '45px',
    height: '45px',
    margin: '4px auto',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '500',
    '&.MuiPickersDay-dayOutsideMonth': {
      color: 'rgba(0, 0, 0, 0.38)',
    },
    '&.MuiPickersDay-today': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.2rem',
      width: '50px',
      height: '50px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.3rem',
      width: '55px',
      height: '55px',
    },
  },
  '& .MuiPickersArrowSwitcher-button': {
    padding: theme.spacing(1.5),
    color: 'rgba(0, 0, 0, 0.54)',
    '& svg': {
      fontSize: '2rem',
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2),
      '& svg': {
        fontSize: '2.2rem',
      },
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2.5),
      '& svg': {
        fontSize: '2.4rem',
      },
    },
  },
}));

const ServerDay: React.FC<ServerDayProps> = ({ day, lessons, userType, selected, ...other }) => {
  const hasLesson = lessons.some(l => {
    const isMatchingDay = dayjs(l.date).isSame(day, 'day');
    const isCorrectType = !l.type || l.type === userType;

    // Debug log cho ngày hiện tại
    if (dayjs().isSame(day, 'day')) {
      console.log('🔍 ServerDay debug for today:', {
        lessonDate: l.date,
        lessonType: l.type,
        userType: userType,
        isMatchingDay,
        isCorrectType,
        className: l.className
      });
    }

    return isMatchingDay && isCorrectType;
  });
  // const isToday = dayjs().isSame(day, 'day');
  const isSelected = selected;

  // Style với độ ưu tiên cao bằng selector lớp của MUI
  const dayStyle: any = {
    ...other.sx,
    position: 'relative',
    color: '#334155',
    boxShadow: 'none',
    fontWeight: 500,
    transition: 'all 0.2s ease-in-out',
    '&.Mui-selected': {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      color: '#fff',
      border: 'none',
      fontWeight: 700,
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
      transform: 'scale(1.05)',
      '&:hover': {
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      }
    },
    '&.MuiPickersDay-today:not(.Mui-selected)': {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      color: '#2563eb',
      fontWeight: 700,
      boxShadow: 'none',
    },
    '&:hover:not(.Mui-selected)': {
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
    }
  };

  // Dấu chấm lịch học: hiện đại hơn với hiệu ứng đổ bóng
  const dotStyle = hasLesson
    ? {
        content: '""',
        position: 'absolute',
        bottom: '6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '5px',
        height: '5px',
        backgroundColor: isSelected ? '#fff' : '#3b82f6',
        borderRadius: '50%',
        boxShadow: isSelected ? '0 0 4px rgba(255,255,255,0.8)' : '0 1px 3px rgba(59, 130, 246, 0.4)',
        zIndex: 2,
      }
    : {};

  dayStyle['&::after'] = dotStyle;

  return (
    <PickersDay
      {...other}
      day={day}
      selected={selected}
      sx={dayStyle}
      onDaySelect={other.onDaySelect}
      outsideCurrentMonth={false}
      isFirstVisibleCell={false}
      isLastVisibleCell={false}
    />
  );
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ lessons, title, userType }) => {
  console.log('📅 ScheduleCalendar received:', { lessons, userType, lessonsCount: lessons.length });

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [lessonsOfDay, setLessonsOfDay] = useState<Lesson[]>([]);

  // Hiển thị lịch học của ngày hôm nay khi component được mount
  useEffect(() => {
    const today = dayjs();
    const filteredLessons = lessons.filter(l => {
      const isMatchingDay = dayjs(l.date).isSame(today, 'day');
      const isCorrectType = !l.type || l.type === userType;
      return isMatchingDay && isCorrectType;
    });
    setLessonsOfDay(filteredLessons);
  }, [lessons, userType]);

  const handleDateChange = (date: Dayjs | null): void => {
    if (date) {
      setSelectedDate(date);
      const filteredLessons = lessons.filter(l => {
        const isMatchingDay = dayjs(l.date).isSame(date, 'day');
        const isCorrectType = !l.type || l.type === userType;
        return isMatchingDay && isCorrectType;
      });
      setLessonsOfDay(filteredLessons);
    } else {
      setLessonsOfDay([]);
    }
  };

  const formatWeekDay = (day: string, date: Dayjs): string => {
    if (dayjs.isDayjs(date)) {
      return weekDayNames[date.day()];
    }
    return day;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{
        maxWidth: '1400px',
        margin: '0 auto',
        px: 2,
        pb: 2,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minHeight: '520px'
      }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontSize: { xs: '1.8rem', md: '2.2rem' }
          }}
        >
          {title}
        </Typography>

        <Box sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'center', lg: 'flex-start' }
        }}>
          {/* Calendar Section */}
        <Paper
          elevation={3}
          sx={{
            pt: { xs: 1, sm: 2 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 2, sm: 3, md: 4 },
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
              width: { xs: '100%', lg: '70%' },
            overflow: 'unset',
              minHeight: '530px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <StyledDateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            slots={{
              day: (props: any) => (
                <ServerDay {...(props as any)} lessons={lessons} userType={userType} />
              ),
              calendarHeader: CustomCalendarHeader as any,
            }}
            showDaysOutsideCurrentMonth
            views={['day']}
            dayOfWeekFormatter={formatWeekDay as any}
            sx={{ overflow: 'unset', width: '100%' }}
          />
        </Paper>

          {/* Schedule Details Section */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 4 },
              backgroundColor: '#ffffff',
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.03)',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
              width: { xs: '100%', lg: '35%' },
              minHeight: '530px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background subtle effect */}
            <Box sx={{
              position: 'absolute',
              top: 0, right: 0,
              width: '150px', height: '150px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
              zIndex: 0
            }} />

            <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #f1f5f9', position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}>
                {userType === 'teacher' ? 'Lịch dạy' : 'Lịch học'}
              </Typography>
              <Typography variant="subtitle1" color="primary.main" fontWeight="600">
                {selectedDate ? dayjs(selectedDate).format('dddd, DD/MM/YYYY') : ''}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, position: 'relative', zIndex: 1 }}>
              <AnimatePresence mode="wait">
                {lessonsOfDay.length > 0 ? (
                  <Box 
                    component={motion.div}
                    key="has-lessons"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                      Có <Typography component="span" fontWeight="700" color="primary.main">{lessonsOfDay.length}</Typography> {userType === 'teacher' ? 'buổi dạy' : 'buổi học'} trong ngày
                    </Typography>
                    
                    {lessonsOfDay.map((lesson, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)',
                              borderColor: '#bae6fd',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '4px',
                              background: 'linear-gradient(to bottom, #3b82f6, #60a5fa)',
                              borderRadius: '4px 0 0 4px',
                            }
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 800, mb: 1.5, fontSize: '1.1rem' }}>
                            {lesson.className}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ p: 0.5, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#64748b', display: 'flex' }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </Box>
                              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                {lesson.time}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ p: 0.5, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#64748b', display: 'flex' }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                <Typography component="span" fontWeight="400" color="text.secondary">Phòng:</Typography> {lesson.room || '---'}
                              </Typography>
                            </Box>
                            
                            {userType !== 'teacher' && lesson.teacher && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ p: 0.5, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#64748b', display: 'flex' }}>
                                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                  <Typography component="span" fontWeight="400" color="text.secondary">GV:</Typography> {lesson.teacher}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Box>
                ) : (
                  <Box 
                    component={motion.div}
                    key="no-lessons"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      textAlign: 'center',
                      p: 4,
                      opacity: 0.7
                    }}
                  >
                    <Box sx={{ 
                      width: 80, height: 80, mb: 3, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </Box>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
                      Tự do
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '80%' }}>
                      Bạn {userType === 'teacher' ? 'không có lịch dạy' : 'không có lịch học'} vào ngày này. Hãy tận hưởng thời gian nghỉ ngơi!
                    </Typography>
                  </Box>
                )}
              </AnimatePresence>
            </Box>
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleCalendar;
