

// app/hooks/useDeveloperDashboard.js
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useDeveloperDashboard() {
     const [data, setData] = useState({
          stats: {
               total: 0,
               notStarted: 0,
               inProgress: 0,
               review: 0,
               completed: 0,
               blocked: 0
          },
          projects: [],
          tasks: [],
          comments: [],
          weeklyGoal: {
               target: 15,
               completed: 0,
               percentage: 0
          },
          session: {
               activeDuration: '0m',
               activeMinutes: 0
          }
     });

     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [selectedTask, setSelectedTask] = useState(null);
     const router = useRouter();

     // const [weeklyActivity, setWeeklyActivity] = useState([]);

     // const fetchWeeklyActivity = useCallback(async () => {
     //      try {
     //           const response = await fetch('/api/developer/activity/weekly');
     //           if (!response.ok) throw new Error('Failed to fetch activity');
     //           const data = await response.json();
     //           setWeeklyActivity(data.activity);
     //      } catch (err) {
     //           console.error('Error fetching weekly activity:', err);
     //      }
     // }, []);

     // // Add to your existing fetch calls
     // useEffect(() => {
     //      fetchWeeklyActivity();
     // }, [fetchWeeklyActivity]);


     const fetchDashboardData = useCallback(async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/developer/dashboard');

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch dashboard data');
               }

               const dashboardData = await response.json();
               setData(dashboardData);
               setError(null);

               // Update session duration every minute
               if (dashboardData.session.activeMinutes > 0) {
                    updateSessionTime(dashboardData.session.activeMinutes);
               }

          } catch (err) {
               setError(err.message);
               console.error('Dashboard fetch error:', err);
          } finally {
               setLoading(false);
          }
     }, [router]);

     // Update session time every minute
     const updateSessionTime = (initialMinutes) => {
          let minutes = initialMinutes;

          const interval = setInterval(() => {
               minutes++;
               setData(prev => ({
                    ...prev,
                    session: {
                         activeMinutes: minutes,
                         activeDuration: formatDuration(minutes)
                    }
               }));
          }, 60000);

          return () => clearInterval(interval);
     };

     // Submit task for review
     const submitForReview = useCallback(async (taskId, notes = '') => {
          try {
               const response = await fetch(`/api/developer/tasks/${taskId}/submit-review`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ notes }),
               });

               const result = await response.json();

               if (!response.ok) {
                    throw new Error(result.error || 'Failed to submit for review');
               }

               // Refresh dashboard data
               await fetchDashboardData();

               return { success: true, message: result.message };
          } catch (err) {
               console.error('Submit review error:', err);
               return { success: false, error: err.message };
          }
     }, [fetchDashboardData]);

     // Submit all completed tasks for review
     const submitAllForReview = useCallback(async () => {
          // Get all tasks that are currently 'Completed' (excluding the currently selected one if needed)
          const completedTasks = data.tasks.filter(
               t => t.status === 'Completed' && t.id !== selectedTask?.id
          );

          if (completedTasks.length === 0) {
               return { success: false, error: 'No completed tasks to review' };
          }

          // Use allSettled to collect successes and failures
          const results = await Promise.allSettled(
               completedTasks.map(task =>
                    submitForReview(task.id, 'Auto-submitted from dashboard')
               )
          );

          const succeeded = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
          const failed = results.filter(r => r.status === 'rejected' || !r.value?.success);

          if (failed.length === 0) {
               return {
                    success: true,
                    message: `All ${succeeded} tasks submitted for review`
               };
          } else {
               return {
                    success: false,
                    error: `${failed.length} task(s) failed to submit. Please try again.`
               };
          }
     }, [data.tasks, selectedTask, submitForReview]);

     
     useEffect(() => {
          fetchDashboardData();
     }, [fetchDashboardData]);

     return {
          ...data,
          loading,
          error, 
          selectedTask,
          setSelectedTask,
          submitForReview,
          submitAllForReview,
          refetch: fetchDashboardData
     };
}

function formatDuration(minutes) {
     if (minutes < 60) {
          return `${minutes}m`;
     }
     const hours = Math.floor(minutes / 60);
     const remainingMinutes = minutes % 60;
     return `${hours}h ${remainingMinutes}m`;
}