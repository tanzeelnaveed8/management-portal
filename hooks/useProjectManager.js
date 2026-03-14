

// hooks/useProjectManager.js
// For Projects
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export function useProjectManager() {
     const [projects, setProjects] = useState([]);
     const [stats, setStats] = useState({
          activeProjects: 0,
          totalMilestones: 0,
          pendingApprovals: 0,
          deadlinesHit: 94,
          completionRate: 0,
          projectsWithoutLead: 0
     });
     const [recentDocuments, setRecentDocuments] = useState([]);
     const [recentFeedback, setRecentFeedback] = useState([]);
     const [upcomingMilestones, setUpcomingMilestones] = useState([]);
     const [projectsWithoutLead, setProjectsWithoutLead] = useState([]);
     const [teamLeads, setTeamLeads] = useState([]);
     const [loading, setLoading] = useState({
          dashboard: true,
          teamLeads: false,
          createProject: false
     });
     const [error, setError] = useState(null);
     const router = useRouter();

     // Fetch dashboard data
     const fetchDashboardData = useCallback(async () => {
          try {
               setLoading(prev => ({ ...prev, dashboard: true }));
               const response = await fetch('/api/project-manager/dashboard');

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch dashboard data');
               }

               const data = await response.json();
               setProjects(data.projects);
               setStats(data.stats);
               setRecentDocuments(data.recentDocuments);
               setRecentFeedback(data.recentFeedback);
               setUpcomingMilestones(data.upcomingMilestones);
               setProjectsWithoutLead(data.projectsWithoutLead);
               setError(null);
          } catch (err) {
               setError(err.message);
               console.error('Dashboard fetch error:', err);
          } finally {
               setLoading(prev => ({ ...prev, dashboard: false }));
          }
     }, [router]);

     // Fetch team leads
     // In fetchTeamLeads function, update the error handling:
     const fetchTeamLeads = useCallback(async () => {
          try {
               setLoading(prev => ({ ...prev, teamLeads: true }));
               const response = await fetch('/api/project-manager/team-leads');

               if (!response.ok) {
                    // Try to get error message from response
                    let errorMessage = 'Failed to fetch team leads';
                    try {
                         const errorData = await response.json();
                         errorMessage = errorData.error || errorMessage;
                    } catch {
                         // If response is not JSON, use status text
                         errorMessage = response.statusText || errorMessage;
                    }

                    // Handle specific status codes
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    if (response.status === 403) {
                         console.error('Access denied: User is not a Project Manager');
                         setTeamLeads([]); // Set empty array to prevent UI errors
                         return;
                    }

                    throw new Error(errorMessage);
               }

               const data = await response.json();
               setTeamLeads(data.teamLeads || []);
               setError(null); // Clear any previous errors
          } catch (err) {
               console.error('Team leads fetch error:', err);
               setTeamLeads([]); // Set empty array to prevent UI errors
               // Don't show error to user for this - it's not critical
          } finally {
               setLoading(prev => ({ ...prev, teamLeads: false }));
          }
     }, [router]);

     // Create new project
     // In hooks/useProjectManager.js
     // Update the createProject function:

     const createProject = useCallback(async (projectData) => {
          try {
               setLoading(prev => ({ ...prev, createProject: true }));
               setError(null);

               const response = await fetch('/api/project-manager/projects', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(projectData),
               });

               // Check if response is OK before trying to parse JSON
               if (!response.ok) {
                    // Try to get error message from response
                    let errorMessage = 'Failed to create project';
                    try {
                         const errorData = await response.json();
                         errorMessage = errorData.error || errorMessage;
                    } catch {
                         // If response is not JSON, use status text
                         errorMessage = response.statusText || errorMessage;
                    }
                    throw new Error(errorMessage);
               }

               // Check if response has content before parsing
               const text = await response.text();
               const data = text ? JSON.parse(text) : {};

               await Swal.fire({
                    title: 'Success!',
                    text: 'Project created successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               // Refresh dashboard
               await fetchDashboardData();

               return { success: true, project: data.project };
          } catch (err) {
               console.error('Create project error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          } finally {
               setLoading(prev => ({ ...prev, createProject: false }));
          }
     }, [fetchDashboardData]);

     
     // Assign team lead
     const assignTeamLead = useCallback(async (projectId, teamLeadId) => {
          try {
               const response = await fetch(`/api/project-manager/projects/${projectId}/assign-lead`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ teamLeadId }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to assign team lead');
               }

               await Swal.fire({
                    title: 'Success!',
                    text: 'Team lead assigned successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               // Refresh dashboard
               await fetchDashboardData();

               return { success: true };
          } catch (err) {
               console.error('Assign team lead error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, [fetchDashboardData]);

     // Upload document
     const uploadDocument = useCallback(async (projectId, file, type, description) => {
          try {
               const formData = new FormData();
               formData.append('file', file);
               formData.append('type', type);
               if (description) formData.append('description', description);

               const response = await fetch(`/api/project-manager/projects/${projectId}/documents`, {
                    method: 'POST',
                    body: formData,
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to upload document');
               }

               await Swal.fire({
                    title: 'Uploaded!',
                    text: 'Document uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               // Refresh dashboard
               await fetchDashboardData();

               return { success: true, document: data.document };
          } catch (err) {
               console.error('Document upload error:', err);

               await Swal.fire({
                    title: 'Upload Failed',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, [fetchDashboardData]);

     // Record client feedback
     const recordFeedback = useCallback(async (projectId, feedbackData) => {
          try {
               const response = await fetch(`/api/project-manager/projects/${projectId}/feedback`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(feedbackData),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to record feedback');
               }

               await Swal.fire({
                    title: feedbackData.isApproved ? 'Approved! 🎉' : 'Feedback Recorded',
                    text: feedbackData.isApproved ? 'Client approval recorded' : 'Feedback saved successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               // Refresh dashboard
               await fetchDashboardData();

               return { success: true, feedback: data.feedback };
          } catch (err) {
               console.error('Record feedback error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, [fetchDashboardData]);

     // Generate project report
     const generateReport = useCallback(async (projectId) => {
          try {
               const response = await fetch(`/api/project-manager/projects/${projectId}/report`);

               if (!response.ok) {
                    throw new Error('Failed to generate report');
               }

               const data = await response.json();
               return data.report;
          } catch (err) {
               console.error('Generate report error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return null;
          }
     }, []);

     useEffect(() => {
          fetchDashboardData();
          fetchTeamLeads();
     }, [fetchDashboardData, fetchTeamLeads]);

     return {
          projects,
          stats,
          recentDocuments,
          recentFeedback,
          upcomingMilestones,
          projectsWithoutLead,
          teamLeads,
          loading,
          error,
          createProject,
          assignTeamLead,
          uploadDocument,
          recordFeedback,
          generateReport,
          refetch: fetchDashboardData
     };
}