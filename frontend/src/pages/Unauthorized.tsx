import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-sans">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-neo-accent border-4 border-black rounded-full shadow-neo-sm rotate-12 -z-0 hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-neo-secondary border-4 border-black shadow-neo-md -rotate-12 -z-0 hidden md:block"></div>

      <div className="w-full max-w-md p-8 border-8 border-black bg-white shadow-neo-xl relative z-10 animate-bounce-in rotate-1">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 text-center mb-6">
          <div className="p-4 border-4 border-black bg-neo-accent shadow-neo-sm rotate-6 text-black">
            <ShieldOff className="h-10 w-10 stroke-[3px]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-black tracking-tighter m-0 uppercase leading-none">Access Denied</h1>
            <p className="text-base font-bold text-black mt-3 uppercase tracking-wider bg-neo-muted/30 border-2 border-black px-2 py-1 inline-block">Unauthorized</p>
          </div>
        </div>

        <div className="space-y-4 text-left">
          <p className="text-black font-bold uppercase tracking-wide text-sm leading-relaxed text-center">
            You don't have permission to view this page. Please contact your administrator if you believe this is a mistake.
          </p>
          <div className="p-4 border-4 border-black bg-neo-secondary/30 text-left w-full mt-4">
            <p className="text-black text-xs font-black uppercase tracking-wider leading-relaxed text-center">
              🔒 This area requires elevated permissions or a different account role.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 py-3 px-6 border-4 border-black bg-white hover:bg-neo-secondary text-black font-black uppercase tracking-wider transition-all duration-100 shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 stroke-[3px]" /> Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-3 px-6 border-4 border-black bg-neo-secondary hover:bg-neo-accent text-black font-black uppercase tracking-wider transition-all duration-100 shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <Home className="h-5 w-5 stroke-[3px]" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
};
