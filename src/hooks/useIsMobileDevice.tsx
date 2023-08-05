import { useEffect, useState } from 'react';
import { MOBILE_VIEW_WIDTH } from '../utils/constants';

/**
 * Custom hook that tracks screen size and determines if current device is mobile
 * @returns {boolean} variable that indicates if current screen size corresponds to mobile device
 */
const useIsMobileDevice = (): boolean => {
  // We setup state to determine if current window inner width is smaller than the defined mobile viewport
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth <= MOBILE_VIEW_WIDTH;
  });

  // And on mount, add an event listener to check current window width, and set the state accordingly
  useEffect(() => {
    const handleResize = () => {
      const isMobileDevice = window.innerWidth <= MOBILE_VIEW_WIDTH;
      setIsMobile(isMobileDevice);
    };

    window.addEventListener('resize', handleResize);

    // We remove the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // We return variable indicating if current screen size corresponds to mobile device
  return isMobile;
};

export default useIsMobileDevice;
