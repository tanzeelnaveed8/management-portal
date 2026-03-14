
//app/hooks/useTeamLeadApprovals.js
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export function useTeamLeadApprovals() {
     const [tasks, setTasks] = useState([]);
     const [projects, setProjects] = useState([]);
     const [developers, setDevelopers] = useState([]);
     const [stats, setStats] = useState({
          total: 0,
          urgent: 0,
          waitingMoreThan24h: 0,
          byProject: [],
          byDeveloper: []
     });
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          projectId: '',
          developerId: '',
          priority: 'all',
          days: '7'
     });
     const router = useRouter();

     const fetchApprovals = useCallback(async () => {
          try {
               setLoading(true);

               const params = new URLSearchParams();
               if (filters.projectId) params.append('projectId', filters.projectId);
               if (filters.developerId) params.append('developerId', filters.developerId);
               if (filters.priority !== 'all') params.append('priority', filters.priority);
               if (filters.days) params.append('days', filters.days);

               const response = await fetch(`/api/team-lead/approvals?${params.toString()}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch approvals');
               }

               const data = await response.json();
               setTasks(data.tasks);
               setProjects(data.filters?.projects || []);
               setDevelopers(data.filters?.developers || []);
               setStats(data.stats);
               setError(null);
          } catch (err) {
               setError(err.message);
               console.error('Approvals fetch error:', err);
          } finally {
               setLoading(false);
          }
     }, [filters, router]);

     // Approve task
     const approveTask = useCallback(async (taskId, feedback = '', notifyPM = false) => {
          try {
               const response = await fetch(`/api/team-lead/approvals/${taskId}/approve`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ feedback, notifyPM }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to approve task');
               }

               // Show success message
               await Swal.fire({
                    title: 'Approved! 🎉',
                    text: 'Task has been approved successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               // Refresh the list
               await fetchApprovals();

               return { success: true, task: data.task };
          } catch (err) {
               console.error('Approve task error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, [fetchApprovals]);

     // Request changes (reject)
     const requestChanges = useCallback(async (taskId, feedback, priority = 'MEDIUM') => {
          try {
               const response = await fetch(`/api/team-lead/approvals/${taskId}/reject`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ feedback, revisionPriority: priority }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to request changes');
               }

               // Show success message
               await Swal.fire({
                    title: 'Feedback Sent',
                    text: 'Developer has been notified to make changes',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               // Refresh the list
               await fetchApprovals();

               return { success: true, task: data.task };
          } catch (err) {
               console.error('Request changes error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, [fetchApprovals]);

     // Upload attachment
     const uploadAttachment = useCallback(async (taskId, file) => {
          try {
               const formData = new FormData();
               formData.append('file', file);

               const response = await fetch(`/api/team-lead/approvals/${taskId}/attachments`, {
                    method: 'POST',
                    body: formData,
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to upload attachment');
               }

               return { success: true, attachment: data.attachment };
          } catch (err) {
               console.error('Upload error:', err);

               await Swal.fire({
                    title: 'Upload Failed',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, []);

     // Get attachments for a task
     const getAttachments = useCallback(async (taskId) => {
          try {
               const response = await fetch(`/api/team-lead/approvals/${taskId}/attachments`);

               if (!response.ok) {
                    throw new Error('Failed to fetch attachments');
               }

               const data = await response.json();
               return data.attachments;
          } catch (err) {
               console.error('Fetch attachments error:', err);
               return [];
          }
     }, []);

     useEffect(() => {
          fetchApprovals();
     }, [fetchApprovals]);

     return {
          tasks,
          projects,
          developers,
          stats,
          loading,
          error,
          filters,
          setFilters,
          approveTask,
          requestChanges,
          uploadAttachment,
          getAttachments,
          refetch: fetchApprovals
     };
}