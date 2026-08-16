import React from 'react';

export default function CyberBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft ambient gradient spots */}
      <div className="absolute -top-40 left-1/3 w-[36rem] h-[36rem] bg-blue-600/[0.04] rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-indigo-600/[0.03] rounded-full blur-3xl" />
    </div>
  );
}
