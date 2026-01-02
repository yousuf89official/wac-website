import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <div className="dark">
        <AppLayout />
      </div>
    </AppProvider>
  );
};

export default Index;
