import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  image: {
    alignSelf: 'center',
    margin: theme.spacing(0.5),
    objectFit: 'contain',
    display: 'block',
    // Remove all !important flags - let inline styles take precedence
  },
}));

const LogoImage = ({ color, style }) => {
  const theme = useTheme();
  const { classes } = useStyles();

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  // Safely access Redux state with fallback
  const logo = useSelector((state) => state?.session?.server?.attributes?.logo) || null;
  const logoInverted = useSelector((state) => state?.session?.server?.attributes?.logoInverted) || null;

  // Detect if we're in login context (no custom size props) vs app context (has specific size)
  const hasCustomSize = style && (style.width || style.height || style.maxWidth || style.maxHeight);
  
  // Check screen size for responsive sizing
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // For login context (no custom size), apply large sizes as INLINE styles
  // For app context (has custom size), use the passed styles
  const imageStyle = hasCustomSize ? { ...style } : {
    maxWidth: isMobile ? '204px' : '255px',
    maxHeight: isMobile ? '102px' : '127px',
    width: 'auto',
    height: 'auto',
  };

  const imgProps = {
    alt: "NUMZTRAK",
    className: classes.image,
    style: imageStyle,
  };

  // Use server-provided logos if available and valid
  if (logo && logo.trim()) {
    if (expanded && logoInverted && logoInverted.trim()) {
      return (
        <img 
          {...imgProps} 
          src={logoInverted}
          onError={(e) => {
            // Fallback to regular logo if inverted fails
            if (logo && logo.trim()) {
              e.target.src = logo;
            } else {
              e.target.src = '/NUMZLOGO.png';
            }
          }}
        />
      );
    }
    return (
      <img 
        {...imgProps} 
        src={logo}
        onError={(e) => {
          // Fallback to default logo if server logo fails
          e.target.src = '/NUMZLOGO.png';
        }}
      />
    );
  }
  
  // Always fallback to default logo from public folder
  return (
    <img 
      {...imgProps} 
      src="/NUMZLOGO.png"
      onError={(e) => {
        // If even the default fails, show a placeholder text
        e.target.style.display = 'none';
        e.target.parentNode.style.display = 'flex';
        e.target.parentNode.style.alignItems = 'center';
        e.target.parentNode.style.justifyContent = 'center';
        e.target.parentNode.style.backgroundColor = '#06b6d4';
        e.target.parentNode.style.color = 'white';
        e.target.parentNode.style.fontWeight = 'bold';
        e.target.parentNode.textContent = 'NUMZTRAK';
      }}
    />
  );
};

export default LogoImage;
