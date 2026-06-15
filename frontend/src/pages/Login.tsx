import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Star, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginFormInputs {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast('Logged in successfully', 'success');

      // Fetch user role to determine redirection route
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (savedUser.role === 'STORE_OWNER') {
          navigate('/owner-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neo-bg relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-neo-accent border-4 border-black rounded-full shadow-neo-sm rotate-12 -z-0 hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-neo-secondary border-4 border-black shadow-neo-md -rotate-12 -z-0 hidden md:block"></div>
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-neo-muted border-4 border-black shadow-neo-sm rotate-45 -z-0 hidden md:block"></div>

      <div className="w-full max-w-md p-8 border-8 border-black bg-white shadow-neo-xl relative z-10 animate-bounce-in rotate-1">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-4 text-center mb-10">
          <div className="p-4 border-4 border-black bg-neo-secondary shadow-neo-sm -rotate-6">
            <Star className="h-10 w-10 stroke-[3px] text-black fill-neo-accent" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-black tracking-tighter m-0 uppercase leading-none">Welcome<br/>Back</h2>
            <p className="text-base font-bold text-black mt-3 uppercase tracking-wider bg-neo-muted/30 border-2 border-black px-2 py-1 inline-block">Sign in to manage ratings</p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Address field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest block bg-white w-max px-1 -mb-4 relative z-10 ml-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[3px]" />
              <input
                type="email"
                placeholder="YOU@STORERATING.COM"
                className={`w-full pl-12 pr-4 py-4 border-4 bg-white text-black font-bold uppercase tracking-wider text-base focus:outline-none transition-colors ${
                  errors.email ? 'border-neo-accent focus:bg-neo-accent/10' : 'border-black focus:bg-neo-secondary focus:shadow-neo-sm'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && <span className="text-sm text-white bg-black font-bold uppercase tracking-wider px-2 py-1 inline-block mt-1">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest block bg-white w-max px-1 -mb-4 relative z-10 ml-3">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[3px]" />
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full pl-12 pr-4 py-4 border-4 bg-white text-black font-bold tracking-widest text-lg focus:outline-none transition-colors ${
                  errors.password ? 'border-neo-accent focus:bg-neo-accent/10' : 'border-black focus:bg-neo-secondary focus:shadow-neo-sm'
                }`}
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <span className="text-sm text-white bg-black font-bold uppercase tracking-wider px-2 py-1 inline-block mt-1">{errors.password.message}</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 border-4 border-black bg-neo-secondary hover:bg-neo-accent text-black font-black uppercase tracking-widest text-lg transition-all duration-100 shadow-neo-md active:translate-x-2 active:translate-y-2 active:shadow-none flex items-center justify-center gap-3 cursor-pointer mt-8"
          >
            {submitting ? (
              <>
                <Loader2 className="h-6 w-6 stroke-[3px] animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer options */}
        <div className="mt-10 pt-6 border-t-4 border-black text-center">
          <p className="text-base font-bold text-black uppercase tracking-wider">
            Don't have an account?{' '}
            <Link to="/register" className="inline-block mt-2 bg-neo-secondary px-3 py-1 border-2 border-black hover:bg-neo-accent transition-colors shadow-neo-sm hover:-translate-y-1">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
