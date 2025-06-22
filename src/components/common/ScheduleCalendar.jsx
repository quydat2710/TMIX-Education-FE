import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  List,
  ListItem,
  Paper,
  IconButton,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import { styled } from '@mui/material/styles';
import 'dayjs/locale/vi';
import updateLocale from 'dayjs/plugin/updateLocale';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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

const CustomCalendarHeader = (props) => {
  const { currentMonth, onMonthChange } = props;

  const handlePrevMonth = () => {
    onMonthChange(currentMonth.subtract(1, 'month'), 'left');
  };

  const handleNextMonth = () => {
    onMonthChange(currentMonth.add(1, 'month'), 'right');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, width: '100%' }}>
      <IconButton onClick={handlePrevMonth} size="small">
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
        {currentMonth.format('MMMM [Năm] YYYY')}
      </Typography>
      <IconButton onClick={handleNextMonth} size="small">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

const weekDayNames = {
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
    minHeight: '360px',
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
    fontSize: '1.5rem',
    fontWeight: 'normal',
    color: 'rgba(0, 0, 0, 0.87)',
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
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
    fontSize: '0.9rem',
    width: '100%',
    height: '40px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 'normal',
    padding: '4px',
    '&[aria-label*="Sunday"], &[aria-label*="Saturday"]': {
      color: theme.palette.error.main,
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '1rem',
    },
  },
  '& .MuiPickersDay-root': {
    fontSize: '1rem',
    width: '40px',
    height: '40px',
    margin: '4px auto',
    color: 'rgba(0, 0, 0, 0.87)',
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
  },
  '& .MuiPickersArrowSwitcher-button': {
    padding: theme.spacing(1),
    color: 'rgba(0, 0, 0, 0.54)',
    '& svg': {
      fontSize: '1.5rem',
    },
  },
}));

const ServerDay = ({ day, lessons, userType, ...other }) => {
  const hasLesson = lessons.some(l => {
    const isMatchingDay = dayjs(l.date).isSame(day, 'day');
    const isCorrectType = !l.type || l.type === userType;
    return isMatchingDay && isCorrectType;
  });
  const isWeekend = day.day() === 0 || day.day() === 6;

  return (
    <PickersDay
      {...other}
      day={day}
      sx={{
        ...other.sx,
        position: 'relative',
        color: isWeekend ? 'error.main' : 'inherit',
        '&::after': hasLesson ? {
          content: '""',
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: '4px',
          backgroundColor: 'primary.main',
          borderRadius: '50%',
        } : {},
        '&.MuiPickersDay-today': {
          backgroundColor: 'primary.main',
          color: '#fff',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        },
      }}
    />
  );
};

// lessons: [{ date, className, time, room, teacher, type }], title: string, userType: 'teacher' | 'student'
const ScheduleCalendar = ({ lessons, title, userType }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [open, setOpen] = useState(false);
  const [lessonsOfDay, setLessonsOfDay] = useState([]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const filteredLessons = lessons.filter(l => {
        const isMatchingDay = dayjs(l.date).isSame(date, 'day');
        const isCorrectType = !l.type || l.type === userType;
        return isMatchingDay && isCorrectType;
      });
      if (filteredLessons.length > 0) {
        setLessonsOfDay(filteredLessons);
        setOpen(true);
      }
    }
  };

  const formatWeekDay = (day, date) => {
    if (dayjs.isDayjs(date)) {
      return weekDayNames[date.day()];
    }
    return day;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{
        maxWidth: '1000px',
        margin: '0 auto',
        p: 2,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minHeight: '500px'
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

        <Paper
          elevation={3}
          sx={{
            pt: { xs: 1, sm: 2 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 2, sm: 3, md: 4 },
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            width: '100%',
            overflow: 'unset',
            minHeight: '450px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <StyledDateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            slots={{
              day: (props) => (
                <ServerDay {...props} lessons={lessons} userType={userType} />
              ),
              calendarHeader: CustomCalendarHeader,
            }}
            showDaysOutsideCurrentMonth
            views={['day']}
            dayOfWeekFormatter={formatWeekDay}
            sx={{ overflow: 'unset', width: '100%' }}
          />
        </Paper>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              backgroundColor: '#ffebee',
            }
          }}
        >
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f' }}>
              Lịch học {lessonsOfDay.length > 1 ? `(${lessonsOfDay.length})` : ''}
            </Typography>
            <List sx={{ p: 0 }}>
              {lessonsOfDay.map((lesson, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 1,
                    px: 0,
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Typography sx={{
                      fontSize: '1.1rem',
                      color: '#d32f2f',
                      width: '120px'
                    }}>
                      {lesson.time}
                    </Typography>
                    <Typography sx={{
                      fontSize: '1.1rem',
                      color: '#d32f2f',
                      flex: 1
                    }}>
                      {lesson.className}
                    </Typography>
                  </Box>
                  <Typography sx={{
                    fontSize: '1rem',
                    color: '#d32f2f',
                    pl: '120px'
                  }}>
                    {lesson.room}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleCalendar;
