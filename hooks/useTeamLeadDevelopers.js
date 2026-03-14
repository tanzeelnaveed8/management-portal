
// hooks/useTeamLeadDevelopers.js
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useTeamLeadDevelopers() {
     const [developers, setDevelopers] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          search: '',
          department: '',
          status: '',
          workload: ''
     });
     const router = useRouter();

     const fetchDevelopers = useCallback(async () => {
          try {
               setLoading(true);

               // Build query string from filters
               const queryParams = new URLSearchParams();
               if (filters.search) queryParams.append('search', filters.search);
               if (filters.department) queryParams.append('department', filters.department);
               if (filters.status) queryParams.append('status', filters.status);
               if (filters.workload) queryParams.append('workload', filters.workload);

               const response = await fetch(`/api/team-lead/developers?${queryParams.toString()}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/auth/login');
                         return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch developers');
               }

               const data = await response.json();
               setDevelopers(data.developers);
               setError(null);
          } catch (err) {
               console.error('Error fetching developers:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [filters, router]);

     const deactivateDeveloper = useCallback(async (developerId) => {
          try {
               setLoading(prev => ({ ...prev, deactivating: true }));

               const response = await fetch(`/api/team-lead/developers/${developerId}/deactivate`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    }
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to deactivate developer');
               }

               // Refresh the developers list
               await fetchDevelopers();

               return { success: true };
          } catch (err) {
               console.error('Deactivate developer error:', err);
               return { success: false, error: err.message };
          } finally {
               setLoading(prev => ({ ...prev, deactivating: false }));
          }
     }, [fetchDevelopers]);

     useEffect(() => {
          fetchDevelopers();
     }, [fetchDevelopers]);

     const updateFilters = (newFilters) => {
          setFilters(prev => ({ ...prev, ...newFilters }));
     };

     const clearFilters = () => {
          setFilters({
               search: '',
               department: '',
               status: '',
               workload: ''
          });
     };

     const addDeveloper = async (developerData) => {
          try {
               const response = await fetch('/api/team-lead/developers/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(developerData)
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to invite developer');
               }

               const result = await response.json();
               // Refresh the list after adding
               await fetchDevelopers();
               return result;
          } catch (err) {
               console.error('Error inviting developer:', err);
               throw err;
          }
     };

     const getDeveloperStats = async (developerId) => {
          try {
               const response = await fetch(`/api/team-lead/developers/${developerId}/stats`);
               if (!response.ok) throw new Error('Failed to fetch developer stats');
               return await response.json();
          } catch (err) {
               console.error('Error fetching developer stats:', err);
               throw err;
          }
     };

     return {
          developers,
          loading,
          error,
          filters,
          updateFilters,
          clearFilters,
          addDeveloper,
          getDeveloperStats,
          deactivateDeveloper,
          refetch: fetchDevelopers
     };
}