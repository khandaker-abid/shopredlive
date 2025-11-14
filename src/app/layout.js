export const metadata = {
  title: 'ShopRedLive',
  description: 'Campus marketplace for secondhand items'
};

import './globals.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { AuthProvider } from '../context/AuthContext';
import theme from '../theme';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#121212' }}>
        <AppRouterCacheProvider>
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}


