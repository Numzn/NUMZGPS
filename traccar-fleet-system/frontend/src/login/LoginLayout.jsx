import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' 
      : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
    padding: theme.spacing(2),
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2),
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    padding: theme.spacing(0, 2), // Add horizontal padding to prevent edge overflow
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.mode === 'dark' 
      ? 'rgba(15, 23, 35, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 20px rgba(0, 0, 0, 0.6)' 
      : '0 8px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '14px',
    padding: theme.spacing(5),
    width: '100%',
    maxWidth: theme.spacing(52),
    marginBottom: theme.spacing(3),
  },
  form: {
    width: '100%',
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.logoContainer}>
        <LogoImage color={theme.palette.primary.main} />
      </div>
      <Paper className={classes.paper}>
        <form className={classes.form}>
          {children}
        </form>
      </Paper>
    </main>
  );
};

export default LoginLayout;
