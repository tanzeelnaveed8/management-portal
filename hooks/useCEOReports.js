

// hooks/useCEOReports.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useCEOReports() {
     const [reportsData, setReportsData] = useState({
          metrics: {
               portfolioHealth: 0,
               resourceLoad: 0,
               operationalRisk: 'Low',
               cycleEfficiency: '0d',
               portfolioHealthTrend: '+0%',
               resourceLoadTrend: '0%',
               operationalRiskTrend: '0%',
               cycleEfficiencyTrend: '0d'
          },
          projectStats: {
               total: 0,
               active: 0,
               completed: 0,
               upcoming: 0,
               inProgress: 0
          },
          revenue: {
               total: 0,
               growth: 0,
               byProject: []
          },
          velocity: [],
          managerPerformance: [],
          statusDistribution: {
               completed: 0,
               inDevelopment: 0,
               clientReview: 0,
               archived: 0,
               upcoming: 0
          },
          risks: [],
          activities: []
     });

     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [dateRange, setDateRange] = useState({
          range: 'quarter',
          from: null,
          to: null
     });
     const router = useRouter();

     const fetchReports = useCallback(async () => {
          try {
               setLoading(true);

               const params = new URLSearchParams();
               params.append('range', dateRange.range);
               if (dateRange.from) params.append('from', dateRange.from);
               if (dateRange.to) params.append('to', dateRange.to);

               const response = await fetch(`/api/ceo/reports?${params.toString()}`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch reports data');
               }

               const data = await response.json();
               setReportsData(data);
               setError(null);
          } catch (err) {
               console.error('Reports fetch error:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [dateRange, router]);

     const exportReport = useCallback(async (format = 'json') => {
          try {
               const response = await fetch('/api/ceo/reports/export', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                         range: dateRange.range,
                         from: dateRange.from,
                         to: dateRange.to,
                         format
                    })
               });

               if (!response.ok) {
                    throw new Error('Failed to export report');
               }

               const blob = await response.blob();
               const url = window.URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `ceo-report-${new Date().toISOString().split('T')[0]}.${format}`;
               a.click();
               window.URL.revokeObjectURL(url);

               return { success: true };
          } catch (err) {
               console.error('Export error:', err);
               return { success: false, error: err.message };
          }
     }, [dateRange]);

     useEffect(() => {
          fetchReports();
     }, [fetchReports]);

     return {
          ...reportsData,
          loading,
          error,
          dateRange,
          setDateRange,
          exportReport,
          refetch: fetchReports
     };
}