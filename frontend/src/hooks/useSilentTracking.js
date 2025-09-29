import { useEffect, useRef } from 'react';
import axios from 'axios';

const useSilentTracking = () => {
  const hasTracked = useRef(false);

  const generateUserFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    return {
      // Browser information
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      
      // Screen information
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenColorDepth: screen.colorDepth,
      
      // Window information
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      
      // Timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Canvas fingerprint (simplified)
      canvasFingerprint: canvas.toDataURL(),
      
      // Session information
      sessionStart: new Date().toISOString(),
      
      // Generate a unique session ID
      sessionId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      
      // Browser features
      webGL: !!window.WebGLRenderingContext,
      touchSupport: 'ontouchstart' in window,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      
      // Performance information
      connectionType: navigator.connection?.effectiveType || 'unknown',
    };
  };

  const trackUserSilently = async () => {
    if (hasTracked.current) return;
    
    try {
      const userInfo = generateUserFingerprint();
      
      // Send to backend
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/track`, userInfo);
      
      // Store in localStorage for session persistence
      localStorage.setItem('userSession', JSON.stringify({
        sessionId: userInfo.sessionId,
        firstVisit: new Date().toISOString()
      }));
      
      hasTracked.current = true;
      console.log('User tracked silently');
    } catch (error) {
      console.error('Silent tracking failed:', error);
    }
  };

  useEffect(() => {
    // Track immediately when component mounts
    trackUserSilently();
    
    // Also track on page visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && !hasTracked.current) {
        trackUserSilently();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This hook doesn't render anything
};

export default useSilentTracking;