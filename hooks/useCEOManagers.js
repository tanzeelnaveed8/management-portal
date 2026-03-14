
// hooks/useCEOManagers.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useCEOManagers() {
     const [managers, setManagers] = useState([]);
     const [stats, setStats] = useState({
          totalManagers: 0,
          avgPortfolioHealth: 0,
          resourceEfficiency: 0,
          totalPortfolioValue: 0,
          activeManagers: 0,
          managersAtRisk: 0,
          topPerformers: 0
     });
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          status: 'all',
          search: '',
          sortBy: 'performance',
          sortOrder: 'desc'
     });
     const router = useRouter();

     const fetchManagers = useCallback(async () => {
          try {
               setLoading(true);

               const params = new URLSearchParams();
               if (filters.status !== 'all') params.append('status', filters.status);
               if (filters.search) params.append('search', filters.search);
               if (filters.sortBy) params.append('sortBy', filters.sortBy);
               if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

               const response = await fetch(`/api/ceo/managers?${params.toString()}`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch managers');
               }

               const data = await response.json();
               setManagers(data.managers || []);
               setStats(data.stats || {});
               setError(null);
          } catch (err) {
               console.error('Managers fetch error:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [filters, router]);

     // Get single manager details
     const getManagerDetails = useCallback(async (managerId) => {
          try {
               const response = await fetch(`/api/ceo/managers/${managerId}`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    throw new Error('Failed to fetch manager details');
               }

               const data = await response.json();
               return data.manager;
          } catch (err) {
               console.error('Manager details error:', err);
               return null;
          }
     }, []);

     // Get manager performance trends
     const getManagerTrends = useCallback(async (managerId) => {
          try {
               const response = await fetch(`/api/ceo/managers/${managerId}/trends`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    throw new Error('Failed to fetch trends');
               }

               const data = await response.json();
               return data.trends;
          } catch (err) {
               console.error('Manager trends error:', err);
               return [];
          }
     }, []);

     // Contact manager (simulate sending email)
     const contactManager = useCallback(async (managerId, message) => {
          try {
               // This would integrate with your email service
               console.log('Contacting manager:', managerId, message);

               // Simulate API call
               await new Promise(resolve => setTimeout(resolve, 1000));

               return { success: true };
          } catch (err) {
               console.error('Contact error:', err);
               return { success: false, error: err.message };
          }
     }, []);

     useEffect(() => {
          fetchManagers();
     }, [fetchManagers]);

     return {
          managers,
          stats,
          loading,
          error,
          filters,
          setFilters,
          getManagerDetails,
          getManagerTrends,
          contactManager,
          refetch: fetchManagers
     };
}