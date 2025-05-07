import React from 'react';
import ReactDOM from 'react-dom/client';
import FirebaseDebugger from './components/debug/FirebaseDebugger';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';

// Tạo theme cho debug
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

function DebugApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FirebaseDebugger />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Render ứng dụng debug
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DebugApp />
  </React.StrictMode>
);

// Xuất cho webpack
export default DebugApp; 