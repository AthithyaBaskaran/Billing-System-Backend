import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Fade,
  Grow
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

interface SuccessPageProps {
  title: string;
  message: string;
  redirectPath: string;
  redirectText: string;
  autoRedirectTime?: number; // Time in seconds before auto-redirect
}

const SuccessPage: React.FC<SuccessPageProps> = ({
  title,
  message,
  redirectPath,
  redirectText,
  autoRedirectTime = 5 // Default to 5 seconds
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = React.useState(autoRedirectTime);
  const [showProgress, setShowProgress] = React.useState(true);

  useEffect(() => {
    if (autoRedirectTime <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          navigate(redirectPath);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [autoRedirectTime, navigate, redirectPath]);

  // Hide progress after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProgress(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = () => {
    navigate(redirectPath);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        p: 3
      }}
    >
      <Grow in={true} timeout={1000}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 500,
            width: '100%',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Success icon with animation */}
          <Fade in={true} timeout={1500}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <CheckCircleOutlineIcon
                color="success"
                sx={{ fontSize: 80, animation: 'pulse 2s infinite' }}
              />
            </Box>
          </Fade>

          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            {title}
          </Typography>
          
          <Typography variant="body1" align="center" paragraph>
            {message}
          </Typography>

          {autoRedirectTime > 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              You will be redirected in {timeLeft} seconds...
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleRedirect}
            sx={{ mt: 2, minWidth: 200 }}
          >
            {redirectText}
          </Button>

          {/* Circular progress animation */}
          {showProgress && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: -1
              }}
            >
              <CircularProgress
                size={250}
                thickness={1}
                sx={{
                  opacity: 0.2,
                  color: 'success.light'
                }}
              />
            </Box>
          )}
        </Paper>
      </Grow>

      {/* Add a global style for the pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(0.95);
              opacity: 0.7;
            }
            70% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.7;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default SuccessPage;