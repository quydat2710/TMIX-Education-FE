import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email,
  ArrowBack,
  CheckCircle,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { sendRequestPasswordAPI, resetPasswordAPI } from '../../services/auth';
import { validateOtpCode } from '../../validations/forgotPasswordValidation';
import { validateEmail, validatePassword } from '../../validations/commonValidation';
import { validationRules } from '../../utils/validation';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import logoTMix from '../../assets/logo_tmix.png';

interface FormErrors {
  email?: string;
  verificationCode?: string;
  password?: string;
  confirmPassword?: string;
}

type StepType = 'email' | 'verify' | 'reset' | 'success';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<StepType>('email');
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  // const [resetToken, setResetToken] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const {
    values,
    handleChange,
    handleBlur
  } = useForm(
    {
      email: ''
    },
    {
      email: [
        validationRules.required('Email là bắt buộc'),
        validationRules.pattern(
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          'Email không hợp lệ'
        )
      ]
    }
  );

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Chỉ validate email cho bước này
    const emailError = validateEmail(values.email);
    if (emailError) {
      setFormErrors({ email: emailError });
      setIsSubmitting(false);
      return;
    }

    try {
      await sendRequestPasswordAPI(values.email);
      setEmail(values.email);
      setCurrentStep('verify');
    } catch (error: any) {
      console.error('Send request password failed:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const otpError = validateOtpCode(verificationCode);
    setFormErrors({ verificationCode: otpError });
    if (otpError) {
      setError(otpError);
      return;
    }

    // Với API mới, không cần verify code riêng, chỉ cần chuyển sang bước reset
    // Code sẽ được gửi kèm trong request reset password
    setCurrentStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate các trường cần thiết cho bước reset password
    const errors: FormErrors = {};

    // Validate verification code
    const codeError = validateOtpCode(verificationCode);
    if (codeError) {
      errors.verificationCode = codeError;
    }

    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) errors.password = passwordError;

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0] || '');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // API mới: resetPasswordAPI(email, code, newPassword, confirmPassword)
      await resetPasswordAPI(email, verificationCode, newPassword, confirmPassword);
      setCurrentStep('success');
    } catch (error: any) {
      console.error('Reset password failed:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = (): void => {
    navigate('/login');
  };

  const handleResendCode = async (): Promise<void> => {
    setIsSubmitting(true);
    setError('');

    try {
      await sendRequestPasswordAPI(email);
      setError('');
      setSnackbarOpen(true);
      // Hiển thị thông báo thành công qua snackbar
    } catch (error: any) {
      console.error('Resend code failed:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi gửi lại mã. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const showError = (msg: string): void => {
  //   setError(msg);
  //   setSnackbarOpen(true);
  // };

  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
    setError('');
    setFormErrors({});
  };

  if (currentStep === 'success') {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url(/images/login-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 0
        }
      }}>
        <Container component="main" maxWidth="sm" sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <Card sx={{
            width: '100%',
            maxWidth: 450,
            mx: 'auto',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}>
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <CheckCircle sx={{
                fontSize: 64,
                color: 'success.main',
                mb: 2
              }} />
              <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
                Đặt lại mật khẩu thành công!
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Mật khẩu của bạn đã được đặt lại thành công.
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                Bạn có thể sử dụng mật khẩu mới để đăng nhập vào hệ thống.
              </Typography>
              <Button
                variant="contained"
                onClick={handleBackToLogin}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Đăng nhập ngay
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const renderStepContent = (): React.ReactElement => {
    switch (currentStep) {
      case 'email':
        return (
          <Box component="form" onSubmit={handleSubmitEmail} sx={{ mt: 1 }}>
            {/* Process explanation */}
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(30, 58, 95, 0.06)',
              border: '1px solid rgba(30, 58, 95, 0.12)'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1E3A5F' }}>
                📋 Quy trình khôi phục:
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', lineHeight: 1.8 }}>
                1️⃣ Nhập email đã đăng ký tài khoản<br/>
                2️⃣ Nhận mã OTP (6 số) qua email<br/>
                3️⃣ Nhập mã OTP + đặt mật khẩu mới
              </Typography>
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email đã đăng ký"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&.Mui-focused fieldset': {
                    borderColor: '#1E3A5F',
                    boxShadow: 'none',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                  '&.Mui-autofill': {
                    backgroundColor: 'white !important',
                    WebkitBoxShadow: '0 0 0 100px white inset !important',
                    WebkitTextFillColor: 'inherit !important',
                  },
                  '&.Mui-autofill:hover': {
                    backgroundColor: 'white !important',
                  },
                  '&.Mui-autofill:focus': {
                    backgroundColor: 'white !important',
                  }
                },
                '& .MuiInputBase-input': {
                  '&:-webkit-autofill': {
                    backgroundColor: 'white !important',
                    WebkitBoxShadow: '0 0 0 100px white inset !important',
                    WebkitTextFillColor: 'inherit !important',
                  }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Gửi mã OTP qua email'
              )}
            </Button>

            {/* Note for students */}
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: '#fff3e0',
              border: '1px solid #ffe0b2'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#e65100', fontSize: '0.82rem' }}>
                💡 Không nhớ email đăng ký?
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#bf360c', mb: 1.5 }}>
                Học sinh / Phụ huynh có thể liên hệ trung tâm để được hỗ trợ đặt lại mật khẩu:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  size="small"
                  variant="outlined"
                  href="tel:0123456789"
                  sx={{ 
                    textTransform: 'none', 
                    fontSize: '0.78rem',
                    borderColor: '#e65100',
                    color: '#e65100',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#fff3e0', borderColor: '#bf360c' }
                  }}
                >
                  📞 Gọi: 0123 456 789
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  href="https://zalo.me/0123456789"
                  target="_blank"
                  sx={{ 
                    textTransform: 'none', 
                    fontSize: '0.78rem',
                    borderColor: '#0068ff',
                    color: '#0068ff',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#0068ff' }
                  }}
                >
                  💬 Nhắn Zalo
                </Button>
              </Box>
            </Box>
          </Box>
        );

      case 'verify':
        return (
          <Box component="form" onSubmit={handleVerifyCode} sx={{ mt: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Chúng tôi đã gửi mã xác thực đến <strong>{email}</strong>
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="verificationCode"
              label="Mã xác thực"
              name="verificationCode"
              type="text"
              autoFocus
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={!!formErrors.verificationCode}
              helperText={formErrors.verificationCode}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&.Mui-focused fieldset': {
                    borderColor: '#1E3A5F',
                    boxShadow: 'none',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Xác thực mã'
              )}
            </Button>

            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="text"
                onClick={handleResendCode}
                disabled={isSubmitting}
                sx={{
                  textTransform: 'none',
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(118, 75, 162, 0.04)',
                  }
                }}
              >
                Gửi lại mã
              </Button>
            </Box>
          </Box>
        );

      case 'reset':
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="verificationCode"
              label="Mã xác thực"
              name="verificationCode"
              type="text"
              autoFocus
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
                if (formErrors.verificationCode) {
                  setFormErrors(prev => ({ ...prev, verificationCode: undefined }));
                }
              }}
              error={!!formErrors.verificationCode}
              helperText={formErrors.verificationCode || 'Nhập mã 6 chữ số đã được gửi đến email'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&.Mui-focused fieldset': {
                    borderColor: '#1E3A5F',
                    boxShadow: 'none',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  }
                }
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&.Mui-focused fieldset': {
                    borderColor: '#1E3A5F',
                    boxShadow: 'none',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                  // Hide browser's default password visibility icon
                  '& input[type="password"]::-ms-reveal': {
                    display: 'none',
                  },
                  '& input[type="password"]::-ms-clear': {
                    display: 'none',
                  },
                  '& input[type="password"]::-webkit-contacts-auto-fill-button': {
                    display: 'none',
                  },
                  '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                    display: 'none',
                  }
                }
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&.Mui-focused fieldset': {
                    borderColor: '#1E3A5F',
                    boxShadow: 'none',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                  // Hide browser's default password visibility icon
                  '& input[type="password"]::-ms-reveal': {
                    display: 'none',
                  },
                  '& input[type="password"]::-ms-clear': {
                    display: 'none',
                  },
                  '& input[type="password"]::-webkit-contacts-auto-fill-button': {
                    display: 'none',
                  },
                  '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                    display: 'none',
                  }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đặt lại mật khẩu'
              )}
            </Button>
          </Box>
        );

      default:
        return <></>;
    }
  };

  return (
    <>
      {/* CSS animations */}
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(-45deg, #D32F2F, #B71C1C, #1E3A5F, #0F1F33)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          zIndex: 0
        }
      }}>
        <Container component="main" maxWidth="sm" sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <Card sx={{
            width: '100%',
            maxWidth: 480,
            mx: 'auto',
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden',
            position: 'relative',
            animation: 'fadeInUp 0.5s ease-out',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #D32F2F 0%, #1E3A5F 100%)'
            }
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}>
                {/* TMix Logo */}
                <Box
                  component="img"
                  src={logoTMix}
                  alt="TMix Education"
                  sx={{
                    height: 60,
                    width: 'auto',
                    mb: 2,
                    animation: 'float 3s ease-in-out infinite',
                    filter: 'drop-shadow(0 4px 12px rgba(211, 47, 47, 0.3))'
                  }}
                />

                {/* Step Progress Indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  {[
                    { step: 'email', label: 'Email', num: 1 },
                    { step: 'verify', label: 'OTP', num: 2 },
                    { step: 'reset', label: 'Mật khẩu', num: 3 }
                  ].map((item, index) => {
                    const stepOrder = ['email', 'verify', 'reset'];
                    const currentIndex = stepOrder.indexOf(currentStep);
                    const itemIndex = stepOrder.indexOf(item.step);
                    const isActive = currentStep === item.step;
                    const isCompleted = itemIndex < currentIndex;

                    return (
                      <React.Fragment key={item.step}>
                        {index > 0 && (
                          <Box sx={{
                            width: 32,
                            height: 2,
                            borderRadius: 1,
                            backgroundColor: isCompleted ? '#D32F2F' : '#e0e0e0',
                            transition: 'all 0.3s ease'
                          }} />
                        )}
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            transition: 'all 0.3s ease',
                            ...(isCompleted ? {
                              backgroundColor: '#D32F2F',
                              color: '#fff',
                            } : isActive ? {
                              backgroundColor: '#1E3A5F',
                              color: '#fff',
                              boxShadow: '0 0 0 3px rgba(30, 58, 95, 0.2)',
                            } : {
                              backgroundColor: '#f0f0f0',
                              color: '#9e9e9e',
                            })
                          }}>
                            {isCompleted ? '✓' : item.num}
                          </Box>
                          <Typography sx={{
                            fontSize: '0.65rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? '#1E3A5F' : isCompleted ? '#D32F2F' : '#9e9e9e',
                            transition: 'all 0.3s ease'
                          }}>
                            {item.label}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>

                <Typography
                  component="h1"
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center'
                  }}
                >
                  {currentStep === 'email' && 'Quên mật khẩu'}
                  {currentStep === 'verify' && 'Nhập mã OTP'}
                  {currentStep === 'reset' && 'Đặt mật khẩu mới'}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 320 }}>
                  {currentStep === 'email' && 'Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu'}
                  {currentStep === 'verify' && 'Kiểm tra hộp thư email và nhập mã OTP 6 số'}
                  {currentStep === 'reset' && 'Tạo mật khẩu mới cho tài khoản của bạn'}
                </Typography>
              </Box>

            {error && (
              <NotificationSnackbar
                open={!!error}
                onClose={handleSnackbarClose}
                message={error}
                severity="error"
              />
            )}

            {snackbarOpen && !error && (
              <NotificationSnackbar
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message="Mã xác thực mới đã được gửi đến email của bạn"
                severity="success"
              />
            )}

            {renderStepContent()}

            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={handleBackToLogin}
                sx={{
                  textTransform: 'none',
                  color: 'black',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                Quay lại đăng nhập
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
    </>
  );
};

export default ForgotPassword;
