

// hooks/useTeamLeadDashboard.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function useTeamLeadDashboard() {
     const [dashboardData, setDashboardData] = useState({
          projects: [],
          pendingApprovals: [],
          developerTasks: [],
          stats: {
               totalProjects: 0,
               activeProjects: 0,
               totalDevelopers: 0,
               pendingReviews: 0,
               overdueTasks: 0,
               completionRate: 0
          },
          deadlines: []
     });
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const router = useRouter();

     const fetchDashboardData = useCallback(async () => {
          try {
               setLoading(true);
               setError(null);

               const response = await fetch('/api/team-lead/dashboard');

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/auth/login');
                         return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch dashboard data');
               }

               const data = await response.json();
               setDashboardData(data);
          } catch (err) {
               console.error('Error fetching dashboard:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [router]);

     useEffect(() => {
          fetchDashboardData();
     }, [fetchDashboardData]);

     const createTask = async (taskData) => {
          try {
               const response = await fetch('/api/team-lead/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create task');
               }

               const newTask = await response.json();
               await fetchDashboardData(); // Refresh data
               return newTask;
          } catch (err) {
               console.error('Error creating task:', err);
               throw err;
          }
     };

     const approveTask = async (taskId, notes) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes })
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to approve task');
               }

               await fetchDashboardData(); // Refresh data
               return await response.json();
          } catch (err) {
               console.error('Error approving task:', err);
               throw err;
          }
     };

     const requestRevision = async (taskId, feedback) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}/revision`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback })
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to request revision');
               }

               await fetchDashboardData(); // Refresh data
               return await response.json();
          } catch (err) {
               console.error('Error requesting revision:', err);
               throw err;
          }
     };

     // const reportIssue = async (issueData) => {

     //      try {
     //           const response = await fetch('/api/team-lead/issues', {
     //                method: 'POST',
     //                headers: { 'Content-Type': 'application/json' },
     //                body: JSON.stringify(issueData)
     //           });

     //           if (!response.ok) {
     //                const error = await response.json();
     //                throw new Error(error.error || 'Failed to report issue');
     //           }

     //           return await response.json();
     //      } catch (err) {
     //           console.error('Error reporting issue:', err);
     //           throw err;
     //      }
     // };


     // hooks/useTeamLeadDashboard.js
     // Add these functions inside your hook:


     const reportIssue = async (issueData) => {
          try {
               const response = await fetch('/api/team-lead/report-issues', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(issueData)
               });

               // First check if response is OK
               if (!response.ok) {
                    // Try to parse error as JSON
                    try {
                         const errorData = await response.json();
                         throw new Error(errorData.error || `Failed to report issue (${response.status})`);
                    } catch {
                         // If not JSON, get text and create error
                         const text = await response.text();
                         throw new Error(`Server error: ${response.status}. ${text.substring(0, 100)}`);
                    }
               }

               const data = await response.json();

               // Show success message
               await MySwal.fire({
                    title: 'Success!',
                    text: 'Issue reported to Project Manager successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               return data;
          } catch (err) {
               console.error('Error reporting issue:', err);

               // Show error message
               await MySwal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               throw err; // Re-throw for component handling
          }
     };

     const assignTask = useCallback(async (taskId, developerId) => {
          try {
               setLoading(prev => ({ ...prev, assigning: true }));

               const response = await fetch(`/api/team-lead/tasks/${taskId}/assign`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ developerId }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to assign task');
               }

               // Refresh the dashboard to show updated assignments
               await fetchDashboardData();

               await Swal.fire({
                    title: 'Success!',
                    text: 'Task assigned successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               return { success: true, task: data.task };
          } catch (err) {
               console.error('Assign task error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          } finally {
               setLoading(prev => ({ ...prev, assigning: false }));
          }
     }, [fetchDashboardData]);

     const unassignTask = useCallback(async (taskId) => {
          try {
               setLoading(prev => ({ ...prev, unassigning: true }));

               const response = await fetch(`/api/team-lead/tasks/${taskId}/assign`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ developerId: null }), // null to unassign
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to unassign task');
               }

               // Refresh the dashboard
               await fetchDashboardData();

               await Swal.fire({
                    title: 'Success!',
                    text: 'Task unassigned successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               return { success: true };
          } catch (err) {
               console.error('Unassign task error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          } finally {
               setLoading(prev => ({ ...prev, unassigning: false }));
          }
     }, [fetchDashboardData]);

   
     return {
          ...dashboardData,
          loading,
          error,
          createTask,
          approveTask,
          requestRevision,
          reportIssue,
          assignTask,
          unassignTask,
          refetch: fetchDashboardData
     };
}