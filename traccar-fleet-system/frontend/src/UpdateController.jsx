import { useSelector } from 'react-redux';
import { useTranslation } from './common/components/LocalizationProvider';

// PWA functionality temporarily disabled
// Based on https://vite-pwa-org.netlify.app/frameworks/react.html
const UpdateController = () => {
  const t = useTranslation();
  const swUpdateInterval = useSelector((state) => state.session.server.attributes.serviceWorkerUpdateInterval || 3600000);

  // PWA update notifications disabled
  // TODO: Re-enable PWA functionality when needed
  return null;
};

export default UpdateController;
