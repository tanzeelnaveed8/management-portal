'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useCEODashboard() {
     const [dashboardData, setDashboardData] = useState({
          stats: {
               totalProjects: 0,
               activeProjects: 0,
               inProgressProjects: 0,
               completedProjects: 0,
               upcomingProjects: 0,
               totalRevenue: 0,
               activeRevenue: 0,
               avgProgress: 0,
               portfolioValue: 0,
               activeDevelopers: 0,
               highRiskProjects: 0,
               delayedProjects: 0,
               clientApprovals: { approved: 0, total: 0, rate: 0 }
          },
          projects: [],
          managers: [],
          workload: {
               totalCapacity: 0,
               assignedHours: 0,
               percentage: 0,
               distribution: {
                    development: 0,
                    design: 0,
                    overhead: 0
               }
          },
          alerts: [],
          approvalQueue: [],
          riskAlerts: []
     });

     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [searchTerm, setSearchTerm] = useState('');
     const router = useRouter();

     const fetchDashboardData = useCallback(async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/ceo/dashboard', {
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
                    throw new Error('Failed to fetch dashboard data');
               }

               const data = await response.json();

               // Transform the data to match component expectations
               const transformedData = {
                    stats: {
                         totalProjects: data.stats?.totalProjects || 0,
                         activeProjects: data.stats?.activeProjects || 0,
                         inProgressProjects: data.stats?.inProgress || 0,
                         completedProjects: data.stats?.completedProjects || 0,
                         upcomingProjects: data.stats?.upcomingProjects || 0,
                         totalRevenue: data.stats?.totalBudget || 0,
                         activeRevenue: data.stats?.totalBudget || 0,
                         avgProgress: data.stats?.averageEfficiency || 0,
                         portfolioValue: data.stats?.portfolioValue || 0,
                         activeDevelopers: data.stats?.activeDevelopers || 0,
                         highRiskProjects: data.stats?.highRiskProjects || 0,
                         delayedProjects: data.stats?.delayedProjects || 0,
                         clientApprovals: {
                              approved: data.stats?.projectsWithApproval || 0,
                              total: data.stats?.totalProjects || 0,
                              rate: data.stats?.totalProjects > 0
                                   ? Math.round((data.stats?.projectsWithApproval / data.stats?.totalProjects) * 100)
                                   : 0
                         }
                    },
                    projects: data.projects || [],
                    managers: data.managerPerformance || [],
                    workload: data.workload || {
                         totalCapacity: 0,
                         assignedHours: 0,
                         percentage: 0,
                         distribution: { development: 0, design: 0, overhead: 0 }
                    },
                    alerts: data.riskAlerts || [],
                    approvalQueue: data.approvalQueue || [
                         { label: 'Client Feedback Pending', count: data.stats?.pendingApprovals || 0, color: 'bg-accent' },
                         { label: 'Awaiting CEO Sign-off', count: data.stats?.pendingApprovals || 0, color: 'bg-accent-secondary' },
                         { label: 'PM Resource Requests', count: 0, color: 'bg-orange-500' }
                    ],
                    riskAlerts: data.riskAlerts || []
               };

               setDashboardData(transformedData);
               setError(null);
          } catch (err) {
               console.error('Error fetching CEO dashboard:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [router]);

     useEffect(() => {
          fetchDashboardData();
     }, [fetchDashboardData]);

     const getFilteredProjects = useCallback(() => {
          if (!searchTerm) return dashboardData.projects;

          return dashboardData.projects.filter(p =>
               p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.manager?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
          );
     }, [dashboardData.projects, searchTerm]);

     const getStatsByTimeRange = useCallback(async (range) => {
          try {
               const response = await fetch(`/api/ceo/stats?range=${range}`, {
                    credentials: 'include'
               });
               if (!response.ok) throw new Error('Failed to fetch stats');
               return await response.json();
          } catch (err) {
               console.error('Error fetching stats:', err);
               return null;
          }
     }, []);

     const refetch = useCallback(() => {
          fetchDashboardData();
     }, [fetchDashboardData]);

     return {
          ...dashboardData,
          loading,
          error,
          searchTerm,
          setSearchTerm,
          filteredProjects: getFilteredProjects(),
          getStatsByTimeRange,
          refetch
     };
}