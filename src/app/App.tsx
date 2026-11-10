import React, { useCallback, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { SupplyFlowProvider } from '../context/SupplyFlowContext';
import { ToastContainer } from '../components/common/ToastContainer';
import { BootSplash } from '../components/animations/BootSplash';
import { router } from './router';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const isRoot = window.location.pathname === '/' || window.location.pathname === '';
      const alreadyBooted = window.sessionStorage.getItem('supplyflow_booted') === '1';
      return isRoot && !alreadyBooted;
    } catch {
      return false;
    }
  });

  const handleSplashComplete = useCallback(() => {
    try {
      window.sessionStorage.setItem('supplyflow_booted', '1');
    } catch {
      // ignore
    }
    setShowSplash(false);
  }, []);

  return (
    <SupplyFlowProvider>
      {showSplash && <BootSplash onComplete={handleSplashComplete} />}
      <RouterProvider router={router} />
      <ToastContainer />
    </SupplyFlowProvider>
  );
};

export default App;
