import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'warning'
}) => {
  const getColor = () => {
    switch (severity) {
      case 'error':
        return 'error.main';
      case 'info':
        return 'info.main';
      case 'warning':
      default:
        return 'warning.main';
    }
  };

  const getIcon = () => {
    return <WarningIcon sx={{ color: getColor(), fontSize: 40 }} />;
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: { xs: '90%', sm: 400 }
        }
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIcon()}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit" variant="outlined">
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={severity === 'error' ? 'error' : severity === 'info' ? 'primary' : 'warning'} 
          variant="contained"
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;