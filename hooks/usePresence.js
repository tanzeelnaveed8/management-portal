// hooks/usePresence.js
"use client";
import { useEffect } from 'react';

export const usePresence = () => {
     useEffect(() => {
          const sendPulse = () => {
               fetch('/api/auth/presence', { method: 'POST' }).catch(() => { });
          };

          // Send pulse immediately on load
          sendPulse();

          // Send pulse every 45 seconds (before the 1-minute timeout threshold)
          const interval = setInterval(sendPulse, 45000);

          return () => clearInterval(interval);
     }, []);
};