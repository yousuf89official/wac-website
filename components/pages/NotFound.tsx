"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import NeonButton from '@/components/ui/NeonButton';

const NotFound: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
      <h1 className="text-9xl font-black mb-4 text-primary glow-cyan">404</h1>
      <p className="text-2xl text-gray-400 mb-8 font-light">Page not found</p>
      <NeonButton variant="primary" onClick={() => router.push('/')}>
        Return Home
      </NeonButton>
    </div>
  );
};

export default NotFound;
