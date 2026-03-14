// app/hooks/useCEOProjects.js
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useCEOProjects() {
     const [projects, setProjects] = useState([]);
     const [stats, setStats] = useState({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          upcomingProjects: 0,
          delayedProjects: 0,
          highRiskProjects: 0,
          totalBudget: 0,
          totalCost: 0,
          averageProgress: 0,
          portfolioValue: 0,
          activeDevelopers: 0
     });
     const [riskAlerts, setRiskAlerts] = useState([]);
     const [managerPerformance, setManagerPerformance] = useState([]);
     const [loading, setLoading] = useState({
          projects: true,
          dashboard: true
     });
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          status: 'all',
          risk: 'all',
          search: '',
          sortBy: 'progress',
          sortOrder: 'desc'
     });
     const router = useRouter();

     // Fetch projects
     const fetchProjects = useCallback(async () => {
          try {
               setLoading(prev => ({ ...prev, projects: true }));
               setError(null);

               const params = new URLSearchParams();
               if (filters.status !== 'all') params.append('status', filters.status);
               if (filters.risk !== 'all') params.append('risk', filters.risk);
               if (filters.search) params.append('search', filters.search);
               if (filters.sortBy) params.append('sortBy', filters.sortBy);
               if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

               const response = await fetch(`/api/ceo/projects?${params.toString()}`, {
                    credentials: 'include',
                    headers: {
                         'Cache-Control': 'no-cache'
                    }
               });

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    if (response.status === 403) {
                         throw new Error('Access denied. CEO privileges required.');
                    }
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to fetch projects');
               }

               const data = await response.json();
               setProjects(data.projects || []);
               setStats(data.stats || {});
               setRiskAlerts(data.riskAlerts || []);
               setManagerPerformance(data.managerPerformance || []);
               setError(null);
          } catch (err) {
               console.error('Projects fetch error:', err);
               setError(err.message);
          } finally {
               setLoading(prev => ({ ...prev, projects: false }));
          }
     }, [filters, router]);

     // Fetch dashboard stats
     const fetchDashboardStats = useCallback(async () => {
          try {
               setLoading(prev => ({ ...prev, dashboard: true }));

               const response = await fetch('/api/ceo/dashboard', {
                    credentials: 'include'
               });

               if (!response.ok) {
                    throw new Error('Failed to fetch dashboard stats');
               }

               const data = await response.json();
               setStats(prev => ({ ...prev, ...data.stats }));
               setRiskAlerts(data.riskAlerts || []);
               setManagerPerformance(data.managerPerformance || []);
          } catch (err) {
               console.error('Dashboard stats error:', err);
          } finally {
               setLoading(prev => ({ ...prev, dashboard: false }));
          }
     }, []);

     // Get single project details
     const getProjectDetails = useCallback(async (projectId) => {
          try {
               // Validate projectId
               if (!projectId) {
                    console.error('No project ID provided');
                    return null;
               }

               console.log('Fetching project details for ID:', projectId);

               const response = await fetch(`/api/ceo/projects/${projectId}`, {
                    credentials: 'include',
                    headers: {
                         'Cache-Control': 'no-cache'
                    }
               });

               if (!response.ok) {
                    if (response.status === 404) {
                         console.error('Project not found');
                         return null;
                    }
                    if (response.status === 401) {
                         router.push('/login');
                         return null;
                    }

                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
               }

               const data = await response.json();
               return data.project;
          } catch (err) {
               console.error('Project details error:', err);
               // Don't set global error for individual project fetch
               return null;
          }
     }, [router]);

     // Export projects data
     const exportProjectsData = useCallback(async () => {
          try {
               const data = {
                    projects,
                    stats,
                    riskAlerts,
                    managerPerformance,
                    exportedAt: new Date().toISOString()
               };

               const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `ceo-projects-${new Date().toISOString().split('T')[0]}.json`;
               a.click();
               URL.revokeObjectURL(url);

               return { success: true };
          } catch (err) {
               console.error('Export error:', err);
               return { success: false, error: err.message };
          }
     }, [projects, stats, riskAlerts, managerPerformance]);

     useEffect(() => {
          fetchProjects();
          fetchDashboardStats();
     }, [fetchProjects, fetchDashboardStats]);

     return {
          projects,
          stats,
          riskAlerts,
          managerPerformance,
          loading,
          error,
          filters,
          setFilters,
          getProjectDetails,
          exportProjectsData,
          refetch: fetchProjects
     };
}