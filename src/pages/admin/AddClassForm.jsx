import React, { useState } from 'react';
import {
  Box, TextField, Button, MenuItem, Grid, Typography, Select, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput
} from '@mui/material';

const daysOfWeek = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật' },
];

const statusOptions = [
  { value: 'upcoming', label: 'Sắp khai giảng' },
  { value: 'ongoing', label: 'Đang học' },
  { value: 'finished', label: 'Đã kết thúc' },
];

const AddClassForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    grade: '',
    section: '',
    name: '',
    year: new Date().getFullYear(),
    status: 'upcoming',
    feePerLesson: '',
    maxStudents: '',
    description: '',
    room: '',
    schedule: {
      startDate: '',
      endDate: '',
      dayOfWeeks: [],
      timeSlots: {
        startTime: '',
        endTime: ''
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: value
      }
    }));
  };

  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        timeSlots: {
          ...prev.schedule.timeSlots,
          [name]: value
        }
      }
    }));
  };

  const handleDayOfWeeksChange = (e) => {
    const { value } = e.target;
    setForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        dayOfWeeks: typeof value === 'string' ? value.split(',') : value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Thêm lớp học mới</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField label="Khối " name="grade" value={form.grade} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Lớp " name="section" value={form.section} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Tên lớp" name="name" value={form.name} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Năm học" name="year" type="number" value={form.year} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={form.status}
              onChange={handleChange}
              label="Trạng thái"
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField label="Học phí/buổi" name="feePerLesson" type="number" value={form.feePerLesson} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Số học sinh tối đa" name="maxStudents" type="number" value={form.maxStudents} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Phòng học" name="room" value={form.room} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Ngày bắt đầu"
            name="startDate"
            type="date"
            value={form.schedule.startDate}
            onChange={handleScheduleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Ngày kết thúc"
            name="endDate"
            type="date"
            value={form.schedule.endDate}
            onChange={handleScheduleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Ngày học trong tuần</InputLabel>
            <Select
              multiple
              name="dayOfWeeks"
              value={form.schedule.dayOfWeeks}
              onChange={handleDayOfWeeksChange}
              input={<OutlinedInput label="Ngày học trong tuần" />}
              renderValue={(selected) => selected.map(val => daysOfWeek.find(d => d.value === val)?.label).join(', ')}
            >
              {daysOfWeek.map(day => (
                <MenuItem key={day.value} value={day.value}>
                  <Checkbox checked={form.schedule.dayOfWeeks.indexOf(day.value) > -1} />
                  <ListItemText primary={day.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Giờ bắt đầu"
            name="startTime"
            type="time"
            value={form.schedule.timeSlots.startTime}
            onChange={handleTimeSlotChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Giờ kết thúc"
            name="endTime"
            type="time"
            value={form.schedule.timeSlots.endTime}
            onChange={handleTimeSlotChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Mô tả" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={2} />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button type="button" variant="outlined" color="secondary" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Thêm lớp học
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddClassForm;
