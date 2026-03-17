// app/hooks/useDeveloperProjects.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useDeveloperProjects() {
     const [projects, setProjects] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          status: 'all',
          search: ''
     });
     const router = useRouter();

     const fetchProjects = useCallback(async () => {
          try {
               setLoading(true);

               // Build query string
               const params = new URLSearchParams();
               if (filters.status !== 'all') params.append('status', filters.status);
               if (filters.search) params.append('search', filters.search);

               const url = `/api/developer/projects${params.toString() ? `?${params.toString()}` : ''}`;

               const response = await fetch(url);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch projects');
               }

               const data = await response.json();
               setProjects(data.projects);
               setError(null);
          } catch (err) {
               setError(err.message);
               console.error('Projects fetch error:', err);
          } finally {
               setLoading(false);
          }
     }, [filters, router]);

     // Get single project details
     const getProject = useCallback(async (projectId) => {
          try {
               const response = await fetch(`/api/developer/projects/${projectId}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return null;
                    }
                    throw new Error('Failed to fetch project');
               }

               const data = await response.json();
               return data.project;
          } catch (err) {
               console.error('Project fetch error:', err);
               return null;
          }
     }, [router]);

     // Update task status
     const updateTaskStatus = useCallback(async (taskId, status) => {
          try {
               const response = await fetch(`/api/developer/tasks/${taskId}/status`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status }),
               });

               if (!response.ok) {
                    throw new Error('Failed to update task');
               }

               return { success: true };
          } catch (err) {
               console.error('Task update error:', err);
               return { success: false, error: err.message };
          }
     }, []);

     useEffect(() => {
          fetchProjects();
     }, [fetchProjects]);

     return {
          projects,
          loading,
          error,
          filters,
          setFilters,
          getProject,
          updateTaskStatus,
          refetch: fetchProjects
     };
}

// Hook for single project details
export function useDeveloperProject(projectId) {
     const [project, setProject] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [activeTab, setActiveTab] = useState('tasks');
     const router = useRouter();

     const fetchProject = useCallback(async () => {
          if (!projectId) return;

          try {
               setLoading(true);
               const response = await fetch(`/api/developer/projects/${projectId}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch project');
               }

               const data = await response.json();
               setProject(data.project);
               setError(null);
          } catch (err) {
               setError(err.message);
               console.error('Project fetch error:', err);
          } finally {
               setLoading(false);
          }
     }, [projectId, router]);

     useEffect(() => {
          fetchProject();
     }, [fetchProject]);

     return {
          project,
          loading,
          error,
          activeTab,
          setActiveTab,
          refetch: fetchProject
     };
}