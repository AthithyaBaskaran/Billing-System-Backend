import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, LoginRequest, SignupRequest } from '../types/api.types';
import { authApi } from '../Api/authApi';

// Define the context type
interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

// Action types
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: any }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_SUCCESS'; payload: any }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Check for token on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set the token in axios headers
          authApi.setAuthToken(token);
          
          // Get user data from token (you might need to implement this endpoint)
          // For now, we'll just use the data from localStorage if available
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (userData && userData.email) {
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: userData 
            });
          } else {
            authApi.setAuthToken(null);
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } catch (error) {
          authApi.setAuthToken(null);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const userData = await authApi.login(credentials);
      
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set token in axios headers
      authApi.setAuthToken(userData.token);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: userData 
      });
    } catch (error: any) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.response?.data?.message || 'Login failed' 
      });
    }
  };

  // Signup function
  const signup = async (userData: SignupRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authApi.signup(userData);
      dispatch({ type: 'SIGNUP_SUCCESS', payload: null });
    } catch (error: any) {
      dispatch({ 
        type: 'SIGNUP_FAILURE', 
        payload: error.response?.data?.message || 'Signup failed' 
      });
    }
  };

  // Logout function
  const logout = () => {
    authApi.setAuthToken(null);
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};