import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Star, User, Mail, MapPin, Lock, Loader2 } from 'lucide-react';

interface RegisterFormInputs {
  name: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export const Register: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const passwordVal = watch('password');

  const onSubmit = async (data: RegisterFormInputs) => {
    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        address: data.address,
        password: data.password,
      });
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register. Please check your credentials.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neo-bg relative overflow-hidden font-sans py-12">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-neo-accent border-4 border-black rounded-none shadow-neo-sm rotate-[15deg] -z-0 hidden md:block"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-neo-secondary border-4 border-black shadow-neo-md -rotate-[10deg] -z-0 hidden md:block"></div>
      <div className="absolute top-1/3 left-10 w-16 h-16 bg-neo-muted border-4 border-black shadow-neo-sm rotate-[45deg] rounded-full -z-0 hidden md:block"></div>

      <div className="w-full max-w-lg p-8 border-8 border-black bg-white shadow-neo-xl relative z-10 animate-bounce-in -rotate-1">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <div className="p-4 border-4 border-black bg-neo-secondary shadow-neo-sm rotate-3">
            <Star className="h-10 w-10 stroke-[3px] text-black fill-neo-accent" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-black tracking-tighter m-0 uppercase leading-none">Create<br/>Account</h2>
            <p className="text-sm font-bold text-black mt-3 uppercase tracking-wider bg-neo-muted/30 border-2 border-black px-2 py-1 inline-block">Join to rate local stores</p>
          </div>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Full Name field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest block bg-white w-max px-1 -mb-4 relative z-10 ml-3">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[3px]" />
              <input
                type="text"
                placeholder="REGULAR CUSTOMER"
                className={`w-full pl-12 pr-4 py-4 border-4 bg-white text-black font-bold uppercase tracking-wider text-base focus:outline-none transition-colors ${
                  errors.name ? 'border-neo-accent focus:bg-neo-accent/10' : 'border-black focus:bg-neo-secondary focus:shadow-neo-sm'
                }`}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 20, message: 'Must be at least 20 chars' },
                  maxLength: { value: 60, message: 'Must be at most 60 chars' },
                })}
              />
            </div>
            {errors.name && <span className="text-sm text-white bg-black font-bold uppercase tracking-wider px-2 py-1 inline-block mt-1">{errors.name.message}</span>}
          </div>

          {/* Email Address field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest block bg-white w-max px-1 -mb-4 relative z-10 ml-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[3px]" />
              <input
                type="email"
                placeholder="YOU@DOMAIN.COM"
                className={`w-full pl-12 pr-4 py-4 border-4 bg-white text-black font-bold uppercase tracking-wider text-base focus:outline-none transition-colors ${
                  errors.email ? 'border-neo-accent focus:bg-neo-accent/10' : 'border-black focus:bg-neo-secondary focus:shadow-neo-sm'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email',
                  },
                })}
              />
            </div>
            {errors.email && <span className="text-sm text-white bg-black font-bold uppercase tracking-wider px-2 py-1 inline-block mt-1">{errors.email.message}</span>}
          </div>

          {/* Location Address field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest block bg-white w-max px-1 -mb-4 relative z-10 ml-3">Location Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-black stroke-[3px]" />
              <textarea
                placeholder="ENTER PHYSICAL ADDRESS"
                rows={2}
                className={`w-full pl-12 pr-4 py-4 border-4 bg-white text-black font-bold uppercase tracking-wider text-base focus:outline-none transition-colors resize-none ${
                  errors.address ? 'border-neo-accent focus:bg-neo-accent/10' : 'border-black focus:bg-neo-secondary focus:shadow-neo-sm'
                }`}
                {...register('address', {
                  required: 'Address is required',
                  maxLength: { value: 400, message: 'Max 400 characters' },
                })}
              />
            </div>
            {errors.address && <span className="text-sm text-white bg-black font-bold uppercase tracking-wider px-2 py-1 inline-block mt-1">{errors.address.message}</span>}
          </div>

          {/* Password complex details container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password input */}
            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase tracking-widest block bg-white w-max px-1 -mb-4 relative z-10 ml-3">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[3px]" />
                <input
                  type="password"
                  placeholder="8-16 CHARS"
                  className={`w-full pl-12 pr-4 py-4 border-4 bg-white text-black font-bold tracking-widest text-lg focus:outline-none transition-colors ${
                    errors.password ? 'border-neo-accent focus:bg-neo-accent/10' : 'border-black focus:bg-neo-secondary focus:shadow-neo-sm'
                  }`}
                  {...register('password', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Min 8 chars' },
                    maxLength: { value: 16, message: 'Max 16 chars' },
                    validate: {
                      uppercase: (v) => /(?=.*[A-Z])/.test(v) || 'Need uppercase',
                      special: (v) => /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(v) || 'Need special char',
                    },
                  })}
                />
              </div>
              {errors.password && <span className="text-xs text-white bg-black font-bold uppercase tracking-wider px-2 py-1 inline-block mt-1">{errors.password.message}</span>}
            </div>

            {/* Confirm Password input */}
            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase tracking-widest block bg-white w-max px-1 -mb-4 relative z-10 ml-3">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[3px]" />
                <input
                  type="password"
                  placeholder="RE-TYPE"
                  className={`w-full pl-12 pr-4 py-4 border-4 bg-white text-black font-bold tracking-widest text-lg focus:outline-none transition-colors ${
                    errors.confirmPassword ? 'border-neo-accent focus:bg-neo-accent/10' : 'border-black focus:bg-neo-secondary focus:shadow-neo-sm'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Required',
                    validate: (v) => v === passwordVal || 'Must match',
                  })}
                />
              </div>
              {errors.confirmPassword && <span className="text-xs text-white bg-black font-bold uppercase tracking-wider px-2 py-1 inline-block mt-1">{errors.confirmPassword.message}</span>}
            </div>
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
                Creating Account...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        {/* Footer options */}
        <div className="mt-8 pt-6 border-t-4 border-black text-center">
          <p className="text-base font-bold text-black uppercase tracking-wider">
            Already have an account?{' '}
            <Link to="/login" className="inline-block mt-2 bg-neo-secondary px-3 py-1 border-2 border-black hover:bg-neo-accent transition-colors shadow-neo-sm hover:-translate-y-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
