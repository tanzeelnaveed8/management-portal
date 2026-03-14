
// hooks/useProfile.js
"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useProfile() {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [isUpdating, setIsUpdating] = useState(false);
     const router = useRouter();

     // Fetch profile data
     const fetchProfile = useCallback(async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/user/profile');

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch profile');
               }

               const data = await response.json();
               setUser(data.user);
               setError(null);
          } catch (err) {
               setError(err.message);
               console.error('Profile fetch error:', err);
          } finally {
               setLoading(false);
          }
     }, [router]);

     // Update profile
     const updateProfile = async (data) => {
          try {
               setIsUpdating(true);
               setError(null);

               const response = await fetch('/api/user/profile/update', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
               });

               const result = await response.json();

               if (!response.ok) {
                    throw new Error(result.error || 'Failed to update profile');
               }

               setUser(prev => ({ ...prev, ...result.user }));
               return { success: true, user: result.user };
          } catch (err) {
               setError(err.message);
               return { success: false, error: err.message };
          } finally {
               setIsUpdating(false);
          }
     };

     // Change password
     const changePassword = async (currentPassword, newPassword) => {
          try {
               setIsUpdating(true);
               setError(null);

               const response = await fetch('/api/user/profile/change-password', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ currentPassword, newPassword }),
               });

               const result = await response.json();

               if (!response.ok) {
                    throw new Error(result.error || 'Failed to change password');
               }

               return { success: true, message: result.message };
          } catch (err) {
               setError(err.message);
               return { success: false, error: err.message };
          } finally {
               setIsUpdating(false);
          }
     };

     // Upload avatar
     const uploadAvatar = async (file) => {
          try {
               setIsUpdating(true);
               setError(null);

               const formData = new FormData();
               formData.append('avatar', file);

               const response = await fetch('/api/user/profile/avatar', {
                    method: 'POST',
                    body: formData,
               });

               const result = await response.json();

               if (!response.ok) {
                    throw new Error(result.error || 'Failed to upload avatar');
               }

               setUser(prev => ({ ...prev, avatar: result.avatar }));
               return { success: true, avatar: result.avatar };
          } catch (err) {
               setError(err.message);
               return { success: false, error: err.message };
          } finally {
               setIsUpdating(false);
          }
     };

     // Remove avatar
     const removeAvatar = async () => {
          try {
               setIsUpdating(true);
               setError(null);

               const response = await fetch('/api/user/profile/avatar', {
                    method: 'DELETE',
               });

               const result = await response.json();

               if (!response.ok) {
                    throw new Error(result.error || 'Failed to remove avatar');
               }

               setUser(prev => ({ ...prev, avatar: null }));
               return { success: true };
          } catch (err) {
               setError(err.message);
               return { success: false, error: err.message };
          } finally {
               setIsUpdating(false);
          }
     };

     useEffect(() => {
          fetchProfile();
     }, [fetchProfile]);

     return {
          user,
          loading,
          error,
          isUpdating,
          updateProfile,
          changePassword,
          uploadAvatar,
          removeAvatar,
          refetch: fetchProfile
     };
}