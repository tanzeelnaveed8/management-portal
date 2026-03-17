

// hooks/useTeamLeadProjects.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useTeamLeadProjects() {
     const [projects, setProjects] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          search: '',
          status: '',
          priority: '',
          riskLevel: ''
     });
     const router = useRouter();

     const fetchProjects = useCallback(async () => {
          try {
               setLoading(true);

               // Build query string from filters
               const queryParams = new URLSearchParams();
               if (filters.search) queryParams.append('search', filters.search);
               if (filters.status) queryParams.append('status', filters.status);
               if (filters.priority) queryParams.append('priority', filters.priority);
               if (filters.riskLevel) queryParams.append('riskLevel', filters.riskLevel);

               const response = await fetch(`/api/team-lead/projects?${queryParams.toString()}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/auth/login');
                         return;
                    }
                    throw new Error('Failed to fetch projects');
               }

               const data = await response.json();
               setProjects(data.projects);
               setError(null);
          } catch (err) {
               console.error('Error fetching projects:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [filters, router]);

     useEffect(() => {
          fetchProjects();
     }, [fetchProjects]);

     const updateFilters = (newFilters) => {
          setFilters(prev => ({ ...prev, ...newFilters }));
     };

     const createProject = async (projectData) => {
          try {
               const response = await fetch('/api/team-lead/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
               });

               if (!response.ok) throw new Error('Failed to create project');

               const newProject = await response.json();
               setProjects(prev => [newProject, ...prev]);
               return newProject;
          } catch (err) {
               console.error('Error creating project:', err);
               throw err;
          }
     };

     return {
          projects,
          loading,
          error,
          filters,
          updateFilters,
          createProject,
          refetch: fetchProjects
     };
}