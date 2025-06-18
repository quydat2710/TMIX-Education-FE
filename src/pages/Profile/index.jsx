import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Nguyen Van A',
    email: 'nguyenvana@gmail.com',
    phone: '0912345678',
    address: 'Ha Noi',
    gender: 'male',
    dayOfBirth: '1990-01-01',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Gọi API cập nhật thông tin
  };

  return (
    <DashboardLayout>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Thông tin cá nhân
            </Typography>
            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={commonStyles.primaryButton}
              >
                Chỉnh sửa
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    sx={{
                      width: 150,
                      height: 150,
                      mb: 2,
                      border: '4px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  {isEditing && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        bgcolor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: 'white' },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {profileData.name}
                </Typography>
                <Typography color="textSecondary">
                  {profileData.email}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={profileData.name}
                      disabled={!isEditing}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled={!isEditing}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={profileData.phone}
                      disabled={!isEditing}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      type="date"
                      value={profileData.dayOfBirth}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      value={profileData.address}
                      disabled={!isEditing}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={commonStyles.formActions}>
                    <Button
                      onClick={() => setIsEditing(false)}
                      sx={commonStyles.secondaryButton}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      sx={commonStyles.primaryButton}
                    >
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Profile;
