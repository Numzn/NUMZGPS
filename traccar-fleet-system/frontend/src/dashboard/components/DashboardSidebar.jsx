import {
  List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { sessionActions } from '../../store';
import { nativePostMessage } from '../../common/components/NativeInterface';

const useStyles = makeStyles()((theme) => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden',
  },
  header: {
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(6, 182, 212, 0.05) 100%)`,
  },
  title: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: theme.palette.primary.main,
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '0.875rem',
    opacity: 0.7,
    marginTop: theme.spacing(0.5),
  },
  menuContainer: {
    padding: theme.spacing(2, 0),
  },
  menuItem: {
    borderRadius: theme.spacing(1.5),
    margin: theme.spacing(0.75, 1.5),
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s ease-in-out',
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.contrastText,
      },
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    '&:hover': {
      backgroundColor: 'rgba(6, 182, 212, 0.08)',
      transform: 'translateX(4px)',
    },
  },
  menuIcon: {
    minWidth: 44,
    color: theme.palette.primary.main,
  },
  menuText: {
    '& .MuiTypography-root': {
      fontWeight: 600,
      fontSize: '0.95rem',
    },
  },
  bottomMenu: {
    padding: theme.spacing(2, 0),
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(2),
  },
  logoutItem: {
    borderRadius: theme.spacing(1.5),
    margin: theme.spacing(0.75, 1.5),
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s ease-in-out',
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      transform: 'translateX(4px)',
    },
  },
}));

const DashboardSidebar = () => {
  const { classes } = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      key: 'dashboard',
    },
    {
      title: t('mapTitle'),
      icon: <MapIcon />,
      path: '/map',
      key: 'map',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  return (
    <div className={classes.root}>
      <Box className={classes.header}>
        <Typography className={classes.title}>
          NUMZTRAK FLEET
        </Typography>
        <Typography className={classes.subtitle}>
          Fleet Management System
        </Typography>
      </Box>
      
      <div className={classes.menuContainer}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.key}
              button
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              className={classes.menuItem}
            >
              <ListItemIcon className={classes.menuIcon}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                className={classes.menuText}
              />
            </ListItem>
          ))}
        </List>
      </div>

      {/* Bottom Menu - Settings & Logout */}
      <div className={classes.bottomMenu}>
        <List>
          <ListItem
            button
            selected={location.pathname.startsWith('/settings')}
            onClick={() => handleNavigation('/settings/preferences')}
            className={classes.menuItem}
          >
            <ListItemIcon className={classes.menuIcon}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('settingsTitle')}
              className={classes.menuText}
            />
          </ListItem>
          
          <ListItem
            button
            onClick={handleLogout}
            className={classes.logoutItem}
          >
            <ListItemIcon className={classes.menuIcon} style={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('loginLogout')}
              className={classes.menuText}
            />
          </ListItem>
        </List>
      </div>
    </div>
  );
};

export default DashboardSidebar;
