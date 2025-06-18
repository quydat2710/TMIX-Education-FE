import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';
import { loginAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        let user = JSON.parse(userData);
        // Nếu là parent và thiếu permissions thì bổ sung mặc định
        if (user.role === 'parent' && !user.permissions) {
          user.permissions = [
            'view_child_info',
            'view_child_attendance',
            'view_fees',
            'make_payment',
            'view_schedule'
          ];
          localStorage.setItem('userData', JSON.stringify(user));
        }
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, accessToken: token }
        });
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('userData');
      }
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      console.log('Login attempt with credentials:', credentials);

      // Demo accounts for testing frontend
      const demoAccounts = [
        {
          email: 'admin@demo.com',
          password: 'admin123',
          role: 'admin',
          name: 'Admin User',
          _id: 'demo_admin_1'
        },
        {
          email: 'teacher@demo.com',
          password: 'teacher123',
          role: 'teacher',
          name: 'Teacher User',
          _id: 'demo_teacher_1'
        },
        {
          email: 'student@demo.com',
          password: 'student123',
          role: 'student',
          name: 'Student User',
          _id: 'demo_student_1'
        },
        {
          email: 'parent@demo.com',
          password: 'parent123',
          role: 'parent',
          name: 'Parent User',
          _id: 'demo_parent_1',
          permissions: [
            'view_child_info',
            'view_child_attendance',
            'view_fees',
            'make_payment',
            'view_schedule'
          ]
        }
      ];

      // Check for demo account first
      const demoUser = demoAccounts.find(
        account => account.email === credentials.email && account.password === credentials.password
      );

      if (demoUser) {
        // Use demo account
        const userData = {
              user: {
            _id: demoUser._id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            permissions: demoUser.permissions
          },
          accessToken: 'demo-token-' + Date.now()
        };

        localStorage.setItem('access_token', userData.accessToken);
        localStorage.setItem('userData', JSON.stringify(userData.user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: userData
        });

        return userData;
      }

      // If not demo account, try API
      const apiResponse = await Promise.race([
        loginAPI({
          email: credentials.email,
          password: credentials.password
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);

      console.log('API Response:', apiResponse);

      // Handle different response structures
      let userData = null;
      let accessToken = null;

      if (apiResponse?.data?.data) {
        // Nested data structure
        userData = apiResponse.data.data.user;
        accessToken = apiResponse.data.data.access_token || apiResponse.data.data.accessToken;
      } else if (apiResponse?.data) {
        // Direct data structure
        userData = apiResponse.data.user;
        accessToken = apiResponse.data.access_token || apiResponse.data.accessToken;
      } else if (apiResponse?.user) {
        // Direct response
        userData = apiResponse.user;
        accessToken = apiResponse.access_token || apiResponse.accessToken;
      }

      if (!userData || !accessToken) {
        throw new Error('Invalid response structure: missing user data or token');
      }

      // Store in localStorage
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('userData', JSON.stringify(userData));

      // Dispatch success
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userData,
          accessToken: accessToken
        }
      });

      return { user: userData, accessToken };

    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Đăng nhập thất bại';

      if (error.message === 'Request timeout') {
        errorMessage = 'Kết nối API timeout. Vui lòng thử lại.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.message && error.message !== 'Request timeout') {
        errorMessage = error.message;
      }

      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });

      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userData');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
