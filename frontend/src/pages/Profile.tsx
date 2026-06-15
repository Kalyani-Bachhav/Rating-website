import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  MapPin,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Save,
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  address: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const Profile: React.FC = () => {
  const { user, updateUserLocal } = useAuth();
  const { showToast } = useToast();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name ?? '',
      address: user?.address ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.put(`/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUserLocal({ name: data.name, address: data.address });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      showToast('Profile updated successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      await api.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      showToast('Password changed successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => updateProfileMutation.mutate(data);

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    changePasswordMutation.mutate(data);
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-neo-accent text-black border-black',
    USER: 'bg-neo-muted text-black border-black',
    STORE_OWNER: 'bg-neo-secondary text-black border-black',
  };

  const inputClass =
    'w-full px-4 py-2.5 border-4 border-black bg-white text-black font-bold uppercase tracking-wider text-sm focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm placeholder:text-black/40';

  return (
    <div className="space-y-10 max-w-2xl mx-auto text-black">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tight text-black m-0">My Profile</h2>
        <p className="text-sm font-bold text-black/70 mt-1 uppercase tracking-wider">Manage your account information and security settings</p>
      </div>

      {/* Profile avatar card */}
      <div className="p-6 border-4 border-black bg-white shadow-neo-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="h-20 w-20 border-4 border-black bg-neo-muted flex items-center justify-center font-black text-black text-3xl uppercase shadow-neo-sm shrink-0">
          {user?.name?.charAt(0) ?? '?'}
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-black uppercase tracking-tight text-black m-0">{user?.name}</h3>
          <p className="text-sm font-bold text-black/70 mt-1">{user?.email}</p>
          <span
            className={`inline-block mt-2 text-[10px] font-black px-2.5 py-1 border-2 uppercase tracking-widest ${
              roleColors[user?.role ?? 'USER']
            }`}
          >
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Account Info Form */}
      <div className="p-6 border-4 border-black bg-white shadow-neo-md space-y-5">
        <h3 className="text-base font-black uppercase tracking-wider text-black flex items-center gap-2 m-0">
          <User className="h-5 w-5 text-black stroke-[2.5px]" /> Account Information
        </h3>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="h-4 w-4 stroke-[2.5px]" /> Email Address
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full px-4 py-2.5 border-4 border-black bg-black/5 text-black/60 font-bold uppercase tracking-wider text-sm cursor-not-allowed focus:outline-none"
            />
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-wider">Email cannot be changed</p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1.5">
              <User className="h-4 w-4 stroke-[2.5px]" /> Full Name
            </label>
            <input
              type="text"
              className={inputClass}
              {...profileForm.register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 60, message: 'Name cannot exceed 60 characters' },
              })}
            />
            {profileForm.formState.errors.name && (
              <span className="text-xs text-white bg-black font-black uppercase tracking-wider px-2 py-1 inline-block mt-1">
                {profileForm.formState.errors.name.message}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="h-4 w-4 stroke-[2.5px]" /> Address
            </label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              {...profileForm.register('address', {
                required: 'Address is required',
                maxLength: { value: 400, message: 'Address cannot exceed 400 characters' },
              })}
            />
            {profileForm.formState.errors.address && (
              <span className="text-xs text-white bg-black font-black uppercase tracking-wider px-2 py-1 inline-block mt-1">
                {profileForm.formState.errors.address.message}
              </span>
            )}
          </div>

          {/* Role (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="h-4 w-4 stroke-[2.5px]" /> Account Role
            </label>
            <input
              type="text"
              value={user?.role?.replace('_', ' ') ?? ''}
              readOnly
              className="w-full px-4 py-2.5 border-4 border-black bg-black/5 text-black/60 font-bold uppercase tracking-wider text-sm cursor-not-allowed focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending || profileSaved}
            className="w-full py-3 border-4 border-black bg-neo-secondary hover:bg-neo-accent disabled:bg-neo-secondary/50 text-black font-black uppercase tracking-wider text-sm transition-all duration-100 shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="h-4 w-4 stroke-[3px] animate-spin" />
            ) : profileSaved ? (
              <CheckCircle className="h-4 w-4 stroke-[3px]" />
            ) : (
              <Save className="h-4 w-4 stroke-[2.5px]" />
            )}
            {updateProfileMutation.isPending
              ? 'Saving...'
              : profileSaved
              ? 'Saved!'
              : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 border-4 border-black bg-white shadow-neo-md space-y-5">
        <h3 className="text-base font-black uppercase tracking-wider text-black flex items-center gap-2 m-0">
          <Lock className="h-5 w-5 text-black stroke-[2.5px]" /> Change Password
        </h3>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-black uppercase tracking-widest block">Current Password</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="Enter current password"
                {...passwordForm.register('oldPassword', { required: 'Current password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-neo-accent transition-colors"
              >
                {showOld ? <EyeOff className="h-4 w-4 stroke-[2.5px]" /> : <Eye className="h-4 w-4 stroke-[2.5px]" />}
              </button>
            </div>
            {passwordForm.formState.errors.oldPassword && (
              <span className="text-xs text-white bg-black font-black uppercase tracking-wider px-2 py-1 inline-block mt-1">
                {passwordForm.formState.errors.oldPassword.message}
              </span>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-black uppercase tracking-widest block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="8-16 chars, 1 uppercase, 1 special"
                {...passwordForm.register('newPassword', {
                  required: 'New password is required',
                  validate: (val) => {
                    if (val.length < 8 || val.length > 16) return 'Password must be 8-16 characters';
                    if (!/(?=.*[A-Z])/.test(val)) return 'Must include at least 1 uppercase letter';
                    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(val))
                      return 'Must include at least 1 special character';
                    return true;
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-neo-accent transition-colors"
              >
                {showNew ? <EyeOff className="h-4 w-4 stroke-[2.5px]" /> : <Eye className="h-4 w-4 stroke-[2.5px]" />}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <span className="text-xs text-white bg-black font-black uppercase tracking-wider px-2 py-1 inline-block mt-1">
                {passwordForm.formState.errors.newPassword.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-black uppercase tracking-widest block">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="Re-enter new password"
                {...passwordForm.register('confirmPassword', { required: 'Please confirm your password' })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-neo-accent transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4 stroke-[2.5px]" /> : <Eye className="h-4 w-4 stroke-[2.5px]" />}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <span className="text-xs text-white bg-black font-black uppercase tracking-wider px-2 py-1 inline-block mt-1">
                {passwordForm.formState.errors.confirmPassword.message}
              </span>
            )}
          </div>

          <div className="p-3 border-4 border-black bg-neo-secondary/30">
            <p className="text-[11px] font-bold text-black/80 uppercase tracking-wider leading-relaxed">
              Password requirements: 8–16 characters, at least 1 uppercase letter, and at least 1 special character
              (e.g. <span className="text-black font-mono font-black">!@#$%^&*</span>).
            </p>
          </div>

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full py-3 border-4 border-black bg-neo-secondary hover:bg-neo-accent disabled:bg-neo-secondary/50 text-black font-black uppercase tracking-wider text-sm transition-all duration-100 shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 stroke-[3px] animate-spin" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};
