import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  LinearProgress,
  Grid,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useDispatch } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { errorsActions } from '../../store';

const useStyles = makeStyles()((theme) => ({
  dialog: {
    minWidth: 600,
    borderRadius: '12px',
  },
  fuelGauge: {
    width: '100%',
    height: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #CBD5E1',
  },
  fuelLevel: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: '8px',
    transition: 'width 0.3s ease',
  },
  fuelMarker: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: 2,
    backgroundColor: '#F59E0B',
    zIndex: 2,
  },
  fuelMarkerRequested: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: 2,
    backgroundColor: '#EF4444',
    zIndex: 2,
  },
  fuelLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  validationAlert: {
    marginTop: theme.spacing(2),
  },
  suggestionBox: {
    backgroundColor: theme.palette.primary.light + '20',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

const FuelApprovalDialog = ({ open, onClose, request, onApprove, onReject }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const [approvedAmount, setApprovedAmount] = useState(request?.requestedAmount || 0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (request) {
      setApprovedAmount(request.managerSuggestion || request.requestedAmount);
      setNotes('');
    }
  }, [request]);

  if (!request) return null;

  const hasWarnings = request.validationWarnings && request.validationWarnings.length > 0;
  const currentFuelLiters = (request.currentFuelLevel / 100) * (request.vehicleSpec?.tankCapacity || 60);
  const maxPossible = (request.vehicleSpec?.tankCapacity || 60) - currentFuelLiters;
  const fuelLevelPercentage = (currentFuelLiters / (request.vehicleSpec?.tankCapacity || 60)) * 100;
  const requestedPercentage = (request.requestedAmount / (request.vehicleSpec?.tankCapacity || 60)) * 100;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await onApprove(request.id, approvedAmount, notes);
      onClose();
    } catch (error) {
      console.error('Failed to approve request:', error);
      const errorMessage = error?.message || error?.error || 'Failed to approve fuel request. Please try again.';
      setError(errorMessage);
      dispatch(errorsActions.push(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await onReject(request.id, notes);
      onClose();
    } catch (error) {
      console.error('Failed to reject request:', error);
      const errorMessage = error?.message || error?.error || 'Failed to reject fuel request. Please try again.';
      setError(errorMessage);
      dispatch(errorsActions.push(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className={classes.dialog}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LocalGasStationIcon color="primary" />
          <Typography variant="h6">Review Fuel Request</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Vehicle and Request Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Request Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Vehicle: {request.device?.name || `Device ${request.deviceId}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Driver: {request.user?.name || `User ${request.userId}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requested: {request.requestedAmount}L
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Urgency: <Chip label={request.urgency} size="small" color={request.urgency === 'urgent' ? 'error' : 'default'} />
              </Typography>
              {request.reason && (
                <Typography variant="body2" color="text.secondary">
                  Reason: {request.reason}
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Vehicle Specs</Typography>
              <Typography variant="body2" color="text.secondary">
                Tank Capacity: {request.vehicleSpec?.tankCapacity || 60}L
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fuel Efficiency: {request.vehicleSpec?.fuelEfficiency || 10} km/L
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Fuel: {Math.round(currentFuelLiters)}L ({Math.round(request.currentFuelLevel)}%)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Max Possible: {Math.round(maxPossible)}L
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Fuel Gauge Visualization */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Fuel Level Visualization</Typography>
          <Box className={classes.fuelGauge}>
            <Box 
              className={classes.fuelLevel} 
              style={{ width: `${fuelLevelPercentage}%` }}
            />
            <Box 
              className={classes.fuelMarker}
              style={{ left: `${requestedPercentage}%` }}
            />
            <Box 
              className={classes.fuelMarkerRequested}
              style={{ left: `${requestedPercentage}%` }}
            />
          </Box>
          <Box className={classes.fuelLabels}>
            <span>Empty</span>
            <span>Current: {Math.round(fuelLevelPercentage)}%</span>
            <span>Requested: {Math.round(requestedPercentage)}%</span>
            <span>Full</span>
          </Box>
        </Box>

        {/* Validation Warnings */}
        {hasWarnings && (
          <Alert severity="warning" className={classes.validationAlert}>
            <Typography variant="h6">⚠️ Excessive Request Detected</Typography>
            {request.validationWarnings.map((warning, index) => (
              <Typography key={index} variant="body2">
                {warning.icon} {warning.message}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Smart Suggestion */}
        {request.managerSuggestion && (
          <Box className={classes.suggestionBox}>
            <Typography variant="h6" color="primary">
              💡 Smart Suggestion
            </Typography>
            <Typography variant="body2">
              System suggests approving {request.managerSuggestion}L instead of {request.requestedAmount}L
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => setApprovedAmount(request.managerSuggestion)}
              sx={{ mt: 1 }}
            >
              Use Suggested Amount
            </Button>
          </Box>
        )}

        {/* Approval Amount Adjustment */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Approval Amount</Typography>
          <TextField
            label="Approved Amount (Liters)"
            type="number"
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
            fullWidth
            helperText={`Maximum possible: ${Math.round(maxPossible)}L`}
            error={approvedAmount > maxPossible}
          />
        </Box>

        {/* Notes */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Notes</Typography>
          <TextField
            label="Approval notes or feedback"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            placeholder="Add any notes for the driver or approval details..."
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleReject}
          color="error"
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          color="success"
          startIcon={<CheckCircleIcon />}
          disabled={loading || approvedAmount <= 0}
          variant="contained"
        >
          Approve {approvedAmount}L
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FuelApprovalDialog;
