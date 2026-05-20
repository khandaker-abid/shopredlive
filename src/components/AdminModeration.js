'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const STATUS_COLORS = {
  open: 'warning',
  reviewing: 'info',
  resolved: 'success',
  dismissed: 'default'
};

const ACTION_LABELS = {
  reviewing: 'Mark Reviewing',
  dismiss: 'Dismiss',
  resolve: 'Resolve',
  warn_user: 'Warn User',
  suspend_user: 'Suspend User',
  remove_listing: 'Remove Listing',
  restore_listing: 'Restore Listing'
};

export default function AdminModeration() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ open: false, report: null, action: '', note: '', days: 7 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userId = user?._id || user?.id;

  const loadReports = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const res = await fetch(`${BACKEND_URL}/reports?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load reports');
      setReports(Array.isArray(data) ? data : data.reports || []);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to load reports', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, userId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const openAction = (report, action) => {
    setActionDialog({ open: true, report, action, note: '', days: 7 });
  };

  const closeAction = () => {
    setActionDialog({ open: false, report: null, action: '', note: '', days: 7 });
  };

  const submitAction = async () => {
    if (!actionDialog.report || !actionDialog.action || !userId) return;

    try {
      const res = await fetch(`${BACKEND_URL}/reports/${actionDialog.report._id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: userId,
          action: actionDialog.action,
          note: actionDialog.note,
          suspensionDays: actionDialog.action === 'suspend_user' ? actionDialog.days : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update report');
      setSnackbar({ open: true, message: 'Report updated', severity: 'success' });
      closeAction();
      loadReports();
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to update report', severity: 'error' });
    }
  };

  const summary = useMemo(() => {
    const counts = reports.reduce((acc, report) => {
      const status = report.status || 'open';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [reports]);

  if (!user?.isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Admin access required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You do not have permission to view moderation tools.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Moderation Queue</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading reports…' : `${reports.length} reports`} · Open {summary.open || 0} · Reviewing {summary.reviewing || 0}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="reviewing">Reviewing</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography variant="body2" color="text.secondary">Loading reports…</Typography>
      ) : reports.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No reports to review.</Typography>
      ) : (
        reports.map((report) => {
          const targetUser = report.targetUser;
          const targetProduct = report.targetProduct;
          const reporter = report.reporter;
          const statusColor = STATUS_COLORS[report.status] || 'default';
          const lastAction = Array.isArray(report.actions) && report.actions.length
            ? report.actions[report.actions.length - 1]
            : null;

          return (
            <Card key={report._id} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'grid', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{report.reason || 'Report'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Submitted {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown'}
                    </Typography>
                  </Box>
                  <Chip label={report.status || 'open'} size="small" color={statusColor} />
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Reporter: {reporter?.actualName || reporter?.name || 'Unknown'}
                  </Typography>
                  {targetUser && (
                    <Typography variant="body2">
                      Target user: {targetUser.actualName || targetUser.name || 'Unknown'}
                    </Typography>
                  )}
                  {targetProduct && (
                    <Typography variant="body2">
                      Target listing: {targetProduct.name || 'Listing'} · Status: {targetProduct.status || 'unknown'}
                    </Typography>
                  )}
                  {report.details ? (
                    <Typography variant="body2" color="text.secondary">
                      {report.details}
                    </Typography>
                  ) : null}
                  {lastAction ? (
                    <Typography variant="caption" color="text.secondary">
                      Last action: {lastAction.action} · {lastAction.createdAt ? new Date(lastAction.createdAt).toLocaleString() : 'recently'}
                    </Typography>
                  ) : null}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" onClick={() => openAction(report, 'reviewing')}>
                    Mark Reviewing
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => openAction(report, 'dismiss')}>
                    Dismiss
                  </Button>
                  <Button size="small" variant="contained" onClick={() => openAction(report, 'resolve')}>
                    Resolve
                  </Button>
                  {targetUser && (
                    <>
                      <Button size="small" variant="outlined" onClick={() => openAction(report, 'warn_user')}>
                        Warn User
                      </Button>
                      <Button size="small" variant="outlined" color="warning" onClick={() => openAction(report, 'suspend_user')}>
                        Suspend User
                      </Button>
                    </>
                  )}
                  {targetProduct && (
                    <>
                      <Button size="small" variant="outlined" color="warning" onClick={() => openAction(report, 'remove_listing')}>
                        Remove Listing
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => openAction(report, 'restore_listing')}>
                        Restore Listing
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={actionDialog.open} onClose={closeAction} maxWidth="sm" fullWidth>
        <DialogTitle>{ACTION_LABELS[actionDialog.action] || 'Update report'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          {actionDialog.action === 'suspend_user' && (
            <TextField
              label="Suspension length (days)"
              type="number"
              value={actionDialog.days}
              onChange={(e) => setActionDialog({ ...actionDialog, days: Number(e.target.value || 0) })}
              inputProps={{ min: 1 }}
            />
          )}
          <TextField
            label="Moderator note"
            value={actionDialog.note}
            onChange={(e) => setActionDialog({ ...actionDialog, note: e.target.value })}
            placeholder="Optional context for the action"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAction}>Cancel</Button>
          <Button variant="contained" onClick={submitAction}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
