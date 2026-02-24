import React, { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen text-slate-200 font-sans pb-28 px-4 pt-4 relative overflow-hidden bg-[#0b0f14]">
      <div className="absolute inset-0">
        <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-10 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
      </div>
      <div className="max-w-md mx-auto relative min-h-screen flex flex-col z-10">
        {children}
      </div>
    </div>
  );
};
