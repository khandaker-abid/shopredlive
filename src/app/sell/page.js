import { Box } from '@mui/material';
import Header from '../../components/Header';
import SellForm from '../../components/SellForm';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function SellPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header />
        <Box sx={{ 
          padding: 2,
          backgroundColor: 'background.default',
          flex: 1
        }}>
          <SellForm />
        </Box>
      </Box>
    </ProtectedRoute>
  );
}


