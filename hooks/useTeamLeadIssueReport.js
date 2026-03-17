

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export function useTeamLeadIssueReport() {
     const [projects, setProjects] = useState([]);
     const [milestones, setMilestones] = useState([]);
     const [tasks, setTasks] = useState([]);
     const [loading, setLoading] = useState({
          projects: true,
          milestones: false,
          tasks: false,
          submit: false
     });
     const [error, setError] = useState(null);
     const [selectedProject, setSelectedProject] = useState(null);
     const [selectedMilestone, setSelectedMilestone] = useState(null);
     const router = useRouter();

     // Fetch projects on mount
     useEffect(() => {
          fetchProjects();
     }, []);

     const fetchProjects = useCallback(async () => {
          try {
               setLoading(prev => ({ ...prev, projects: true }));
               const response = await fetch('/api/team-lead/report-issues/form-data');

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch projects');
               }

               const data = await response.json();
               setProjects(data.projects);
          } catch (err) {
               setError(err.message);
               console.error('Projects fetch error:', err);
          } finally {
               setLoading(prev => ({ ...prev, projects: false }));
          }
     }, [router]);

     // Fetch milestones when project changes
     const fetchMilestones = useCallback(async (projectId) => {
          if (!projectId) {
               setMilestones([]);
               return;
          }

          try {
               setLoading(prev => ({ ...prev, milestones: true }));
               const response = await fetch(`/api/team-lead/report-issues/projects/${projectId}/milestones`);

               if (!response.ok) {
                    throw new Error('Failed to fetch milestones');
               }

               const data = await response.json();
               setMilestones(data.milestones);
          } catch (err) {
               console.error('Milestones fetch error:', err);
               setError(err.message);
          } finally {
               setLoading(prev => ({ ...prev, milestones: false }));
          }
     }, []);

     // Fetch tasks when milestone changes
     const fetchTasks = useCallback(async (milestoneId) => {
          if (!milestoneId) {
               setTasks([]);
               return;
          }

          try {
               setLoading(prev => ({ ...prev, tasks: true }));
               const response = await fetch(`/api/team-lead/report-issues/milestones/${milestoneId}/tasks`);

               if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
               }

               const data = await response.json();
               setTasks(data.tasks);
          } catch (err) {
               console.error('Tasks fetch error:', err);
               setError(err.message);
          } finally {
               setLoading(prev => ({ ...prev, tasks: false }));
          }
     }, []);

     // Handle project change
     const handleProjectChange = useCallback((projectId) => {
          setSelectedProject(projectId);
          setSelectedMilestone(null);
          setTasks([]);
          if (projectId) {
               fetchMilestones(projectId);
          }
     }, [fetchMilestones]);

     // Handle milestone change
     const handleMilestoneChange = useCallback((milestoneId) => {
          setSelectedMilestone(milestoneId);
          if (milestoneId) {
               fetchTasks(milestoneId);
          } else {
               setTasks([]);
          }
     }, [fetchTasks]);

     // Submit issue report
     const submitIssue = useCallback(async (formData) => {
          try {
               setLoading(prev => ({ ...prev, submit: true }));

               const response = await fetch('/api/team-lead/report-issues/submit', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to submit issue');
               }

               // Show success message
               await Swal.fire({
                    title: 'Issue Reported!',
                    html: `
          <div class="text-left">
            <p class="mb-2">Your issue has been reported to the Project Manager.</p>
            <p class="text-sm text-gray-600"><strong>Urgency:</strong> ${data.data.urgency}</p>
            <p class="text-sm text-gray-600"><strong>Reported to:</strong> ${data.data.reportedTo}</p>
          </div>
        `,
                    icon: 'success',
                    confirmButtonColor: '#2563eb',
                    timer: 3000
               });

               return { success: true, data: data.data };
          } catch (err) {
               console.error('Submit issue error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          } finally {
               setLoading(prev => ({ ...prev, submit: false }));
          }
     }, []);

     // Save draft
     const saveDraft = useCallback(async (draftData) => {
          try {
               const response = await fetch('/api/team-lead/report-issues/draft', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(draftData),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to save draft');
               }

               await Swal.fire({
                    title: 'Draft Saved',
                    text: 'Your draft has been saved successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               return { success: true, draftId: data.draftId };
          } catch (err) {
               console.error('Save draft error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, []);

     // Upload file
     const uploadFile = useCallback(async (file, projectId) => {
          try {
               const formData = new FormData();
               formData.append('file', file);
               if (projectId) {
                    formData.append('projectId', projectId);
               }

               const response = await fetch('/api/team-lead/report-issues/upload', {
                    method: 'POST',
                    body: formData,
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to upload file');
               }

               return { success: true, ...data };
          } catch (err) {
               console.error('File upload error:', err);

               await Swal.fire({
                    title: 'Upload Failed',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          }
     }, []);

     return {
          projects,
          milestones,
          tasks,
          loading,
          error,
          selectedProject,
          selectedMilestone,
          handleProjectChange,
          handleMilestoneChange,
          submitIssue,
          saveDraft,
          uploadFile,
          refetchProjects: fetchProjects
     };
}