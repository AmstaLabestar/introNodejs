import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0EA5E9',      // sky-500
      light: '#38bdf8',     // sky-400
      dark: '#0284C7'       // sky-600
    },
    secondary: {
      main: '#0284C7',
      light: '#0EA5E9'
    },
    background: {
      default: '#f0f9ff',   // sky-50
      paper: '#ffffff'
    },
    error: {
      main: '#ef4444'       // red-500
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          borderRadius: '0.5rem'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
});

export default muiTheme;
