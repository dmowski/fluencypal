import { useState, useEffect } from 'react';

export const useIsLocalhost = () => {
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const checkIsLocalhost = () => {
      const hostname = window.location.hostname;
      setIsLocalhost(hostname === 'localhost');
    };

    checkIsLocalhost();
  }, []);

  return isLocalhost;
};
