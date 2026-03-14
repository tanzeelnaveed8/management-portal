// app/login/page.jsx
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
     Eye,
     EyeOff,
     Lock,
     Mail,
     ArrowRight,
     AlertCircle,
     Key
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Logo from '../../public/icon.png';

export default function LoginPage() {
     const router = useRouter();
     const [showPassword, setShowPassword] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState('');
     const [formData, setFormData] = useState({
          email: '',
          password: ''
     });

     // Subtle animations
     const fadeInUp = {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4 }
     };

     const handleChange = (e) => {
          setFormData({
               ...formData,
               [e.target.id]: e.target.value
          });
          if (error) setError('');
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          setIsLoading(true);
          setError('');

          try {
               const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
               }

               if (!data.user || !data.user.role) {
                    router.push('/dashboard');
                    return;
               }

               const roleRedirects = {
                    'CEO': '/ceo',
                    'PROJECT_MANAGER': '/project-manager',
                    'TEAM_LEAD': '/team-lead',
                    'DEVELOPER': '/developer'
               };

               const destination = roleRedirects[data.user.role] || '/dashboard';
               window.location.href = destination;

          } catch (error) {
               setError(error.message);
          } finally {
               setIsLoading(false);
          }
     };

     return (
          <div className="min-h-screen bg-bg-page flex">
               {/* Left Section - Brand */}
               <motion.div
                    className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
               >
                    <div className="max-w-md">
                         {/* Logo and Company Name */}
                         <motion.div
                              className="flex items-center gap-3 mb-12"
                              {...fadeInUp}
                              transition={{ delay: 0.1 }}
                         >
                              <div className="relative w-16 h-16">
                                   <Image
                                        src={Logo}
                                        alt="Meetech Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                   />
                              </div>
                              <h1 className="text-4xl font-semibold text-text-primary tracking-tight">Meetech Development</h1>
                         </motion.div>

                         {/* Welcome Message */}
                         <motion.h2
                              className="text-3xl font-medium text-text-primary mb-3"
                              {...fadeInUp}
                              transition={{ delay: 0.2 }}
                         >
                              Welcome back
                         </motion.h2>

                         <motion.p
                              className="text-text-muted mb-8"
                              {...fadeInUp}
                              transition={{ delay: 0.3 }}
                         >
                              Sign in to access your workspace and continue where you left off.
                         </motion.p>

                         {/* First Login Note - Minimal */}
                         <motion.div
                              className="bg-bg-subtle rounded-lg p-4 border border-border-default"
                              {...fadeInUp}
                              transition={{ delay: 0.4 }}
                         >
                              <div className="flex items-start gap-3">
                                   <div className="p-1.5 bg-accent/10 rounded-md">
                                        <Key className="w-4 h-4 text-accent" />
                                   </div>
                                   <div>
                                        <p className="text-sm font-medium text-text-primary mb-1">First time login?</p>
                                        <p className="text-xs text-text-muted">
                                             You'll be prompted to change your password for security.
                                        </p>
                                   </div>
                              </div>
                         </motion.div>

                         {/* Simple feature list */}
                         <motion.div
                              className="mt-8 space-y-2"
                              {...fadeInUp}
                              transition={{ delay: 0.5 }}
                         >
                              {[
                                   'Enterprise-grade security',
                                   'Role-based access control',
                                   'Real-time collaboration'
                              ].map((feature, index) => (
                                   <div key={index} className="flex items-center gap-2 text-xs text-text-muted">
                                        <div className="w-1 h-1 bg-accent/60 rounded-full"></div>
                                        <span>{feature}</span>
                                   </div>
                              ))}
                         </motion.div>
                    </div>
               </motion.div>

               {/* Right Section - Login Form */}
               <motion.div
                    className="w-full lg:w-1/2 flex items-center justify-center p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
               >
                    <div className="w-full max-w-[400px]">
                         {/* Mobile Logo */}
                         <div className="lg:hidden text-center mb-8">
                              <div className="relative w-10 h-10 mx-auto mb-3">
                                   <Image
                                        src={Logo}
                                        alt="Meetech Logo"
                                        fill
                                        className="object-contain"
                                   />
                              </div>
                              <h1 className="text-xl font-semibold text-text-primary">Meetech</h1>
                         </div>

                         {/* Login Card */}
                         <div className="bg-bg-surface border border-border-default rounded-xl">
                              <div className="p-8">
                                   {/* Header */}
                                   <div className="mb-6">
                                        <h2 className="text-xl font-medium text-text-primary mb-1">Sign In</h2>
                                        <p className="text-sm text-text-muted">Enter your credentials to continue</p>
                                   </div>

                                   {/* Error Message */}
                                   {error && (
                                        <motion.div
                                             className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm"
                                             initial={{ opacity: 0, y: -5 }}
                                             animate={{ opacity: 1, y: 0 }}
                                        >
                                             <AlertCircle size={16} />
                                             <span>{error}</span>
                                        </motion.div>
                                   )}

                                   <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Email Field */}
                                        <div className="space-y-2">
                                             <label
                                                  htmlFor="email"
                                                  className="text-xs font-medium text-text-primary uppercase tracking-wide"
                                             >
                                                  Email
                                             </label>
                                             <div className="relative">
                                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                                  <input
                                                       id="email"
                                                       type="email"
                                                       value={formData.email}
                                                       onChange={handleChange}
                                                       placeholder="name@company.com"
                                                       required
                                                       className="w-full pl-9 pr-3 py-2.5 bg-bg-subtle border border-border-default rounded-lg 
                                                text-sm text-text-primary placeholder:text-text-disabled
                                                focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                                                transition-colors"
                                                  />
                                             </div>
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                             <div className="flex justify-between items-center">
                                                  <label
                                                       htmlFor="password"
                                                       className="text-xs font-medium text-text-primary uppercase tracking-wide"
                                                  >
                                                       Password
                                                  </label>
                                                 
                                             </div>
                                             <div className="relative">
                                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                                  <input
                                                       id="password"
                                                       type={showPassword ? "text" : "password"}
                                                       value={formData.password}
                                                       onChange={handleChange}
                                                       placeholder="••••••••"
                                                       required
                                                       className="w-full pl-9 pr-10 py-2.5 bg-bg-subtle border border-border-default rounded-lg 
                                                text-sm text-text-primary placeholder:text-text-disabled
                                                focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                                                transition-colors"
                                                  />
                                                  <button
                                                       type="button"
                                                       onClick={() => setShowPassword(!showPassword)}
                                                       className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                                  >
                                                       {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                  </button>
                                             </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                             type="submit"
                                             disabled={isLoading}
                                             className="w-full bg-accent hover:bg-accent-hover active:bg-accent-active text-text-inverse py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                             {isLoading ? (
                                                  <>
                                                       <div className="w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin"></div>
                                                       <span>Signing in...</span>
                                                  </>
                                             ) : (
                                                  <>
                                                       <span>Sign In</span>
                                                       <ArrowRight size={16} />
                                                  </>
                                             )}
                                        </button>
                                   </form>
                              </div>

                              {/* Footer */}
                              <div className="p-6 bg-bg-subtle border-t border-border-default text-center">
                                   <p className="text-xs text-text-muted">
                                        Don't have an account?{' '}
                                        <button className="text-accent hover:text-accent-hover font-medium transition-colors">
                                             Contact admin
                                        </button>
                                   </p>
                              </div>
                         </div>

                         {/* Simple trust badge */}
                         <p className="text-center text-xs text-text-disabled mt-4">
                              Secured by enterprise-grade encryption
                         </p>
                    </div>
               </motion.div>
          </div>
     );
}