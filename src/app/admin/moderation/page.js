import { Box } from '@mui/material';
import Header from '../../../components/Header';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminModeration from '../../../components/AdminModeration';

export default function AdminModerationPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ padding: 2, flex: 1 }}>
          <AdminModeration />
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
