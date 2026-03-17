'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
     User,
     Mail,
     Lock,
     Shield,
     Phone,
     Briefcase,
     Building2,
     Camera,
     CheckCircle2,
     AlertCircle,
     Eye,
     EyeOff,
     X,
     Upload,
     LogOut,
     Calendar
} from 'lucide-react';
import { useProfile } from '../../../../hooks/useProfile'; // Adjust the import path as needed
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Spinner from '../../../Components/common/Spinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);



const ProfilePage = () => {
     const router = useRouter();
     const {
          user,
          loading,
          error: profileError,
          isUpdating,
          updateProfile,
          changePassword,
          uploadAvatar,
          removeAvatar
     } = useProfile();

     // Form states
     const [formData, setFormData] = useState({
          name: '',
          phone: '',
          jobTitle: '',
          department: ''
     });

     // Password states
     const [passwordData, setPasswordData] = useState({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
     });
     const [showPasswords, setShowPasswords] = useState({
          current: false,
          new: false,
          confirm: false
     });
     const [passwordStrength, setPasswordStrength] = useState({
          score: 0,
          feedback: []
     });

     // Avatar states
     const [avatarPreview, setAvatarPreview] = useState(null);
     const [isUploading, setIsUploading] = useState(false);
     const fileInputRef = useRef(null);

     // UI states
     const [successMessage, setSuccessMessage] = useState('');
     const [errorMessage, setErrorMessage] = useState('');
     const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
     const [memberSince, setMemberSince] = useState('');

     // Update form data when user loads
     useEffect(() => {
          if (user) {
               setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    jobTitle: user.jobTitle || '',
                    department: user.department || ''
               });

               // Format member since date
               if (user.createdAt) {
                    const date = new Date(user.createdAt);
                    setMemberSince(date.toLocaleDateString('en-US', {
                         month: 'long',
                         year: 'numeric'
                    }));
               }
          }
     }, [user]);

     // Password strength checker
     const checkPasswordStrength = (password) => {
          const feedback = [];
          let score = 0;

          if (password.length >= 8) score += 25;
          else feedback.push('At least 8 characters');

          if (/[A-Z]/.test(password)) score += 25;
          else feedback.push('One uppercase letter');

          if (/[a-z]/.test(password)) score += 25;
          else feedback.push('One lowercase letter');

          if (/[0-9]/.test(password)) score += 15;
          else feedback.push('One number');

          if (/[^A-Za-z0-9]/.test(password)) score += 10;
          else feedback.push('One special character');

          setPasswordStrength({ score, feedback });
     };

     // Handle password change
     const handlePasswordChange = (e) => {
          const { name, value } = e.target;
          setPasswordData(prev => ({ ...prev, [name]: value }));

          if (name === 'newPassword') {
               checkPasswordStrength(value);
          }
     };

     // Handle form input change
     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     // Handle profile update
     const handleUpdateProfile = async (e) => {
          e.preventDefault();
          setErrorMessage('');
          setSuccessMessage('');

          const result = await updateProfile(formData);

          if (result.success) {
               setSuccessMessage('Profile updated successfully!');
               setTimeout(() => setSuccessMessage(''), 3000);
          } else {
               setErrorMessage(result.error);
          }
     };

     // Handle password change submit
     const handlePasswordSubmit = async (e) => {
          e.preventDefault();
          setErrorMessage('');
          setSuccessMessage('');

          // Validate passwords match
          if (passwordData.newPassword !== passwordData.confirmPassword) {
               setErrorMessage('New passwords do not match');
               return;
          }

          // Validate password strength
          if (passwordStrength.score < 70) {
               setErrorMessage('Password is too weak. Please follow the requirements.');
               return;
          }

          const result = await changePassword(
               passwordData.currentPassword,
               passwordData.newPassword
          );

          if (result.success) {
               setSuccessMessage(result.message);
               setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
               });

               // Show countdown and logout
               let countdown = 3;
               const interval = setInterval(() => {
                    setSuccessMessage(`Password changed! Logging out in ${countdown} seconds...`);
                    countdown--;
                    if (countdown < 0) {
                         clearInterval(interval);
                         router.push('/login');
                    }
               }, 1000);
          } else {
               setErrorMessage(result.error);
          }
     };

     // Handle avatar upload
     const handleAvatarUpload = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // Validate file type
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!validTypes.includes(file.type)) {
               setErrorMessage('Invalid file type. Please upload JPEG, PNG, GIF, or WEBP');
               return;
          }

          // Validate file size (max 2MB)
          if (file.size > 2 * 1024 * 1024) {
               setErrorMessage('File too large. Maximum size is 2MB');
               return;
          }

          // Preview
          const reader = new FileReader();
          reader.onloadend = () => {
               setAvatarPreview(reader.result);
          };
          reader.readAsDataURL(file);

          // Upload
          setIsUploading(true);
          setErrorMessage('');

          const result = await uploadAvatar(file);

          setIsUploading(false);
          setAvatarPreview(null);

          if (result.success) {
               setSuccessMessage('Avatar updated successfully!');
               setTimeout(() => setSuccessMessage(''), 3000);
          } else {
               setErrorMessage(result.error);
          }
     };

     // Handle avatar remove
     const handleRemoveAvatar = async () => {
          if (!confirm('Are you sure you want to remove your avatar?')) return;

          const result = await removeAvatar();

          if (result.success) {
               setSuccessMessage('Avatar removed successfully!');
               setTimeout(() => setSuccessMessage(''), 3000);
          } else {
               setErrorMessage(result.error);
          }
     };

     // Handle logout
     const handleLogout = async () => {
          const result = await MySwal.fire({
               title: <p className="text-red-700 font-bold">Are you sure?</p>,
               text: "You will need to login again to access the Executive Dashboard.",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#b91c1c',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, logout',
               background: '#ffffff',
               customClass: {
                    popup: 'rounded-2xl border border-border-default shadow-xl',
                    confirmButton: 'rounded-xl px-4 py-2 font-medium',
                    cancelButton: 'rounded-xl px-4 py-2 font-medium'
               }
          });
          if (result.isConfirmed) {
               try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    router.push('/login');
               } catch (error) {
                    console.error('Logout error:', error);
               }

          }
     };

     // Toggle password visibility
     const togglePasswordVisibility = (field) => {
          setShowPasswords(prev => ({
               ...prev,
               [field]: !prev[field]
          }));
     };

     // Loading state
     if (loading) {
          return <Spinner title="Profile..." />;
     }

     if (!user) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y flex items-center justify-center">
                    <div className="text-center">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <p className="text-text-primary font-bold mb-2">Failed to load profile</p>
                         <button
                              onClick={() => router.push('/login')}
                              className="text-accent hover:underline"
                         >
                              Return to login
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y animate-in fade-in slide-in-from-bottom-2 duration-700">
               <div className="max-w-5xl mx-auto space-y-8">

                    {/* Success/Error Messages */}
                    {successMessage && (
                         <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                              <CheckCircle2 size={20} className="text-green-500" />
                              <p className="text-text-primary text-sm">{successMessage}</p>
                         </div>
                    )}

                    {errorMessage && (
                         <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                              <AlertCircle size={20} className="text-red-500" />
                              <p className="text-text-primary text-sm">{errorMessage}</p>
                              <button
                                   onClick={() => setErrorMessage('')}
                                   className="ml-auto text-red-500 hover:text-red-600"
                              >
                                   <X size={16} />
                              </button>
                         </div>
                    )}

                    {/* Profile Header Card */}
                    <section className="bg-bg-surface border border-border-default rounded-3xl p-8 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-accent/10 to-accent-secondary/10" />

                         <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 mt-4">
                              <div className="relative group">
                                   <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-text-inverse text-4xl font-black shadow-xl border-4 border-bg-surface overflow-hidden rounded-full">
                                        {avatarPreview ? (
                                             <img
                                                  src={avatarPreview}
                                                  alt="Preview"
                                                  className="w-full h-full object-cover"
                                             />
                                        ) : user.avatar ? (
                                             <img
                                                  src={user.avatar}
                                                  alt={user.name}
                                                  className="w-full h-full object-cover"
                                             />
                                        ) : (
                                             <span className="text-4xl font-black">
                                                  {
                                                       user.name
                                                            ?.split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase()
                                                            .substring(0, 2)
                                                  }                                             </span>
                                        )}
                                   </div>

                                   {/* Avatar upload button */}
                                   {/* <div className="absolute -bottom-2 -right-2 flex gap-1">
                                        <button
                                             onClick={() => fileInputRef.current?.click()}
                                             disabled={isUploading}
                                             className="p-2 bg-bg-surface border border-border-strong rounded-xl text-accent hover:bg-accent hover:text-text-inverse transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                             title="Upload avatar"
                                        >
                                             {isUploading ? (
                                                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                                             ) : (
                                                  <Camera size={18} />
                                             )}
                                        </button>

                                        {user.avatar && (
                                             <button
                                                  onClick={handleRemoveAvatar}
                                                  className="p-2 bg-bg-surface border border-border-strong rounded-xl text-red-500 hover:bg-red-500 hover:text-text-inverse transition-all shadow-lg"
                                                  title="Remove avatar"
                                             >
                                                  <X size={18} />
                                             </button>
                                        )}
                                   </div> */}

                                   <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                   />
                              </div>

                              <div className="flex-1 text-center md:text-left space-y-2">
                                   <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <h1 className="text-4xl font-black text-text-primary tracking-tight">
                                             {user.name}
                                        </h1>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${user.status === 'ACTIVE'
                                             ? 'bg-teal-500/10 text-accent-secondary'
                                             : 'bg-yellow-500/10 text-yellow-500'
                                             }`}>
                                             <CheckCircle2 size={12} /> {user.status}
                                        </span>
                                   </div>
                                   <p className="text-text-muted font-medium flex items-center justify-center md:justify-start gap-2">
                                        <Briefcase size={16} /> {user.jobTitle || 'No title'} • {user.department || 'No department'}
                                   </p>
                                   <p className="text-xs text-text-disabled flex items-center justify-center md:justify-start gap-2">
                                        <Mail size={12} /> {user.email}
                                   </p>
                                   {user.phone && (
                                        <p className="text-xs text-text-disabled flex items-center justify-center md:justify-start gap-2">
                                             <Phone size={12} /> {user.phone}
                                        </p>
                                   )}
                              </div>

                              {/* Role badge */}
                              <div className="hidden lg:block px-4 py-2 bg-accent/10 rounded-2xl border border-accent/20">
                                   <p className="text-[10px] font-black text-accent uppercase tracking-widest">Role</p>
                                   <p className="text-sm font-bold text-text-primary">{user.role.replace('_', ' ')}</p>
                              </div>
                         </div>
                    </section>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 border-b border-border-default">
                         <button
                              onClick={() => setActiveTab('profile')}
                              className={`px-6 py-3 text-sm font-bold transition-colors relative ${activeTab === 'profile'
                                   ? 'text-accent'
                                   : 'text-text-muted hover:text-text-primary'
                                   }`}
                         >
                              Profile Information
                              {activeTab === 'profile' && (
                                   <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                              )}
                         </button>
                         <button
                              onClick={() => setActiveTab('security')}
                              className={`px-6 py-3 text-sm font-bold transition-colors relative ${activeTab === 'security'
                                   ? 'text-accent'
                                   : 'text-text-muted hover:text-text-primary'
                                   }`}
                         >
                              Security
                              {activeTab === 'security' && (
                                   <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                              )}
                         </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Main Content */}
                         <div className="lg:col-span-2 space-y-6">
                              {activeTab === 'profile' ? (
                                   /* Profile Form */
                                   <div className="bg-bg-surface border border-border-default rounded-3xl p-8 space-y-8">
                                        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                                             <div className="p-2 bg-accent-muted rounded-lg text-accent">
                                                  <User size={20} />
                                             </div>
                                             <h2 className="text-lg font-bold text-text-primary">Personal Details</h2>
                                        </div>

                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                  {/* Name */}
                                                  <div className="space-y-2">
                                                       <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                            Full Name
                                                       </label>
                                                       <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent">
                                                                 <User size={16} />
                                                            </div>
                                                            <input
                                                                 type="text"
                                                                 name="name"
                                                                 value={formData.name}
                                                                 onChange={handleInputChange}
                                                                 className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-body focus:ring-1 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                                                                 required
                                                            />
                                                       </div>
                                                  </div>

                                                  {/* Email (read-only) */}
                                                  <div className="space-y-2">
                                                       <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                            Email Address
                                                       </label>
                                                       <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled">
                                                                 <Mail size={16} />
                                                            </div>
                                                            <input
                                                                 type="email"
                                                                 value={user.email}
                                                                 disabled
                                                                 className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-body opacity-60 cursor-not-allowed"
                                                            />
                                                       </div>
                                                  </div>

                                                  {/* Phone */}
                                                  <div className="space-y-2">
                                                       <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                            Phone Number
                                                       </label>
                                                       <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent">
                                                                 <Phone size={16} />
                                                            </div>
                                                            <input
                                                                 type="tel"
                                                                 name="phone"
                                                                 value={formData.phone}
                                                                 onChange={handleInputChange}
                                                                 placeholder="+1 (555) 000-0000"
                                                                 className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-body focus:ring-1 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                                                            />
                                                       </div>
                                                  </div>

                                                  {/* Job Title */}
                                                  <div className="space-y-2">
                                                       <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                            Job Title
                                                       </label>
                                                       <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent">
                                                                 <Briefcase size={16} />
                                                            </div>
                                                            <input
                                                                 type="text"
                                                                 name="jobTitle"
                                                                 value={formData.jobTitle}
                                                                 onChange={handleInputChange}
                                                                 placeholder="e.g., Senior Developer"
                                                                 className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-body focus:ring-1 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                                                            />
                                                       </div>
                                                  </div>

                                                  {/* Department */}
                                                  <div className="space-y-2">
                                                       <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                            Department
                                                       </label>
                                                       <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent">
                                                                 <Building2 size={16} />
                                                            </div>
                                                            <input
                                                                 type="text"
                                                                 name="department"
                                                                 value={formData.department}
                                                                 onChange={handleInputChange}
                                                                 placeholder="e.g., Engineering"
                                                                 className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-body focus:ring-1 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                                                            />
                                                       </div>
                                                  </div>

                                                  {/* Role (read-only) */}
                                                  <div className="space-y-2">
                                                       <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                            Role
                                                       </label>
                                                       <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled">
                                                                 <Shield size={16} />
                                                            </div>
                                                            <input
                                                                 type="text"
                                                                 value={user.role.replace('_', ' ')}
                                                                 disabled
                                                                 className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-body opacity-60 cursor-not-allowed"
                                                            />
                                                       </div>
                                                  </div>
                                             </div>

                                             <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-border-subtle">
                                                  <button
                                                       type="button"
                                                       onClick={() => {
                                                            setFormData({
                                                                 name: user.name || '',
                                                                 phone: user.phone || '',
                                                                 jobTitle: user.jobTitle || '',
                                                                 department: user.department || ''
                                                            });
                                                       }}
                                                       className="px-6 py-2.5 border border-border-strong rounded-xl text-text-primary font-bold text-sm hover:bg-bg-subtle transition-all"
                                                  >
                                                       Cancel
                                                  </button>
                                                  <button
                                                       type="submit"
                                                       disabled={isUpdating}
                                                       className="bg-accent hover:bg-accent-hover text-text-inverse px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                  >
                                                       {isUpdating ? (
                                                            <>
                                                                 <div className="w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin" />
                                                                 Saving...
                                                            </>
                                                       ) : (
                                                            'Save Changes'
                                                       )}
                                                  </button>
                                             </div>
                                        </form>
                                   </div>
                              ) : (
                                   /* Security Form */
                                   <div className="bg-bg-surface border border-border-default rounded-3xl p-8 space-y-8">
                                        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                                             <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                                  <Lock size={20} />
                                             </div>
                                             <h2 className="text-lg font-bold text-text-primary">Change Password</h2>
                                        </div>

                                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                             {/* Current Password */}
                                             <div className="space-y-2">
                                                  <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                       Current Password
                                                  </label>
                                                  <div className="relative">
                                                       <input
                                                            type={showPasswords.current ? "text" : "password"}
                                                            name="currentPassword"
                                                            value={passwordData.currentPassword}
                                                            onChange={handlePasswordChange}
                                                            placeholder="Enter current password"
                                                            className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 px-4 pr-12 text-sm font-medium text-text-body focus:ring-1 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                                                            required
                                                       />
                                                       <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('current')}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-accent"
                                                       >
                                                            {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                                       </button>
                                                  </div>
                                             </div>

                                             {/* New Password */}
                                             <div className="space-y-2">
                                                  <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                       New Password
                                                  </label>
                                                  <div className="relative">
                                                       <input
                                                            type={showPasswords.new ? "text" : "password"}
                                                            name="newPassword"
                                                            value={passwordData.newPassword}
                                                            onChange={handlePasswordChange}
                                                            placeholder="Enter new password"
                                                            className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 px-4 pr-12 text-sm font-medium text-text-body focus:ring-1 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                                                            required
                                                       />
                                                       <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('new')}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-accent"
                                                       >
                                                            {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                       </button>
                                                  </div>

                                                  {/* Password strength meter */}
                                                  {passwordData.newPassword && (
                                                       <div className="mt-3 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                 <div className="flex-1 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                                                                      <div
                                                                           className={`h-full transition-all ${passwordStrength.score < 40 ? 'bg-red-500' :
                                                                                passwordStrength.score < 70 ? 'bg-yellow-500' :
                                                                                     'bg-green-500'
                                                                                }`}
                                                                           style={{ width: `${passwordStrength.score}%` }}
                                                                      />
                                                                 </div>
                                                                 <span className="text-[10px] font-bold text-text-muted">
                                                                      {passwordStrength.score}%
                                                                 </span>
                                                            </div>

                                                            {passwordStrength.feedback.length > 0 && (
                                                                 <div className="p-3 bg-accent-muted/30 rounded-xl border border-accent/10">
                                                                      <p className="text-[10px] font-bold text-accent mb-2">Password Requirements:</p>
                                                                      <ul className="space-y-1">
                                                                           {passwordStrength.feedback.map((item, index) => (
                                                                                <li key={index} className="text-[11px] text-text-muted flex items-center gap-2">
                                                                                     <span className="w-1 h-1 bg-accent rounded-full" />
                                                                                     {item}
                                                                                </li>
                                                                           ))}
                                                                      </ul>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  )}
                                             </div>

                                             {/* Confirm Password */}
                                             <div className="space-y-2">
                                                  <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest ml-1">
                                                       Confirm New Password
                                                  </label>
                                                  <div className="relative">
                                                       <input
                                                            type={showPasswords.confirm ? "text" : "password"}
                                                            name="confirmPassword"
                                                            value={passwordData.confirmPassword}
                                                            onChange={handlePasswordChange}
                                                            placeholder="Confirm new password"
                                                            className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 px-4 pr-12 text-sm font-medium text-text-body focus:ring-1 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                                                            required
                                                       />
                                                       <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('confirm')}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-accent"
                                                       >
                                                            {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                       </button>
                                                  </div>

                                                  {/* Password match indicator */}
                                                  {passwordData.confirmPassword && (
                                                       <div className="mt-1 flex items-center gap-1.5">
                                                            {passwordData.newPassword === passwordData.confirmPassword ? (
                                                                 <>
                                                                      <CheckCircle2 size={12} className="text-green-500" />
                                                                      <span className="text-[10px] text-green-500">Passwords match</span>
                                                                 </>
                                                            ) : (
                                                                 <>
                                                                      <AlertCircle size={12} className="text-red-500" />
                                                                      <span className="text-[10px] text-red-500">Passwords do not match</span>
                                                                 </>
                                                            )}
                                                       </div>
                                                  )}
                                             </div>

                                             <div className="p-4 bg-accent-muted/50 rounded-2xl border border-accent/10 space-y-2">
                                                  <p className="text-[10px] font-bold text-accent uppercase flex items-center gap-2">
                                                       <AlertCircle size={12} /> Security Notice
                                                  </p>
                                                  <p className="text-[11px] text-text-muted leading-tight">
                                                       Changing your password will log you out of all other active sessions for security.
                                                       You'll need to log in again on other devices.
                                                  </p>
                                             </div>

                                             <div className="flex justify-end pt-4">
                                                  <button
                                                       type="submit"
                                                       disabled={isUpdating || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                                       className="bg-accent hover:bg-accent-hover text-text-inverse px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                  >
                                                       {isUpdating ? (
                                                            <>
                                                                 <div className="w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin" />
                                                                 Updating...
                                                            </>
                                                       ) : (
                                                            'Update Password'
                                                       )}
                                                  </button>
                                             </div>
                                        </form>
                                   </div>
                              )}
                         </div>

                         {/* Sidebar - Account Info */}
                         <aside className="space-y-6">
                              {/* Account Status Card */}
                              <div className="bg-gradient-to-br from-accent to-accent-active rounded-3xl p-6 text-text-inverse shadow-xl">
                                   <div className="flex items-center gap-2 mb-4">
                                        <Calendar size={16} className="opacity-70" />
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Member Since</p>
                                   </div>
                                   <p className="text-xl font-bold mb-6">{memberSince || 'N/A'}</p>

                                   <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                             <div>
                                                  <p className="text-[10px] font-black uppercase opacity-70 mb-1">Total Tasks</p>
                                                  <p className="text-3xl font-black">{user.stats?.totalTasks || 0}</p>
                                             </div>
                                             <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                                  <Briefcase size={20} />
                                             </div>
                                        </div>

                                        <div className="mt-4 flex justify-between text-xs">
                                             <span className="opacity-70">Completed</span>
                                             <span className="font-bold">{user.stats?.completedTasks || 0}</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                                             <div
                                                  className="bg-white rounded-full h-1.5 transition-all"
                                                  style={{
                                                       width: `${user.stats?.completionRate || 0}%`
                                                  }}
                                             />
                                        </div>
                                   </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="bg-bg-surface border border-border-default rounded-3xl p-6 space-y-3">
                                   <h3 className="text-xs font-bold text-text-primary mb-3">Quick Actions</h3>

                                   <button
                                        onClick={() => setActiveTab('security')}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-subtle transition-colors text-left"
                                   >
                                        <div className="p-2 bg-accent/10 rounded-lg">
                                             <Lock size={16} className="text-accent" />
                                        </div>
                                        <div>
                                             <p className="text-sm font-bold text-text-primary">Change Password</p>
                                             <p className="text-[10px] text-text-muted">Update your security</p>
                                        </div>
                                   </button>

                                   <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left group"
                                   >
                                        <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20">
                                             <LogOut size={16} className="text-red-500" />
                                        </div>
                                        <div>
                                             <p className="text-sm font-bold text-text-primary">Logout</p>
                                             <p className="text-[10px] text-text-muted">End current session</p>
                                        </div>
                                   </button>
                              </div>

                              {/* Session Info */}
                              <div className="bg-bg-surface border border-border-default rounded-3xl p-6">
                                   <h3 className="text-xs font-bold text-text-primary mb-3">Active Sessions</h3>
                                   <div className="flex items-center gap-3 p-3 bg-accent-muted/30 rounded-xl">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <div className="flex-1">
                                             <p className="text-sm font-bold text-text-primary">Current Device</p>
                                             <p className="text-[10px] text-text-muted">Last active: Just now</p>
                                        </div>
                                   </div>
                                   <p className="text-[10px] text-text-muted mt-3 text-center">
                                        Other sessions will be terminated when you change your password
                                   </p>
                              </div>
                         </aside>
                    </div>
               </div>
          </div>
     );
};

export default ProfilePage;