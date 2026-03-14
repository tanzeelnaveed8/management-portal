// app/loading-role/page.js
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoadingRole() {
     const { user, isLoading } = useUser();
     const router = useRouter();
     const [error, setError] = useState('');

     useEffect(() => {
          const checkUserRole = async () => {
               if (!isLoading && !user) {
                    router.push('/');
                    return;
               }

               if (user) {
                    try {
                         console.log('User logged in:', user.email); // Debug log

                         // Check if user exists in our database and get their role
                         const response = await fetch('/api/user/role');
                         const data = await response.json();

                         if (data.role) {
                              // Redirect based on role
                              switch (data.role) {
                                   case 'CEO':
                                        router.push('/ceo/dashboard');
                                        break;
                                   case 'PROJECT_MANAGER':
                                        router.push('/project-manager/dashboard');
                                        break;
                                   case 'TEAM_LEAD':
                                        router.push('/team-lead/dashboard');
                                        break;
                                   case 'DEVELOPER':
                                        router.push('/developer/dashboard');
                                        break;
                                   default:
                                        router.push('/unauthorized');
                              }
                         } else {
                              // New user - needs admin to assign role
                              router.push('/pending-approval');
                         }
                    } catch (err) {
                         console.error('Error loading user data:', err);
                         setError('Error loading user data. Please try again.');
                    }
               }
          };

          if (!isLoading) {
               checkUserRole();
          }
     }, [user, isLoading, router]);

     if (isLoading) {
          return (
               <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                    <div className="text-center">
                         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                         <h2 className="text-xl text-white">Loading your profile...</h2>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
               <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-xl text-white">Loading your dashboard...</h2>
                    {error && <p className="text-red-400 mt-2">{error}</p>}
               </div>
          </div>
     );
}