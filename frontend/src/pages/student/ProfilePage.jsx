import React, { useState } from 'react';
import { User, Lock, Phone, Mail, GraduationCap, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner } from '../../components/common/AlertBanner';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const profile = user?.student_profile;

  // Edit form state
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileAlert(null);
    try {
      const res = await api.patch(`/users/${user.id}`, { phone });
      if (res.data.success) {
        updateUser(res.data.data);
        setProfileAlert({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileAlert({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: 'New password must be at least 6 characters' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      if (res.data.success) {
        setPasswordAlert({ type: 'success', message: 'Password updated successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordAlert({ type: 'error', message: err.response?.data?.message || 'Password update failed' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Profile & Security</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal contact information and portal authentication security</p>
      </div>

      {/* Academic Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Student')}&background=6366f1&color=fff`}
          alt={user?.full_name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
        />
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-xl font-bold text-slate-800">{user?.full_name}</h2>
          <p className="text-xs font-mono font-bold text-indigo-600">Enrollment: {profile?.enrollment_number}</p>
          <p className="text-xs text-slate-500">
            {profile?.course_name} · Semester {profile?.current_semester} · Admission Year {profile?.admission_year}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
              {profile?.department_name}
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              Active Student Status
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Contact Details</h3>
          </div>

          {profileAlert && (
            <AlertBanner type={profileAlert.type} message={profileAlert.message} onClose={() => setProfileAlert(null)} />
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name (Read-Only)</label>
              <input
                type="text"
                disabled
                value={user?.full_name || ''}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email (Read-Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Security & Password</h3>
          </div>

          {passwordAlert && (
            <AlertBanner type={passwordAlert.type} message={passwordAlert.message} onClose={() => setPasswordAlert(null)} />
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password (Min. 6 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
