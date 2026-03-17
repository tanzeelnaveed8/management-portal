// hooks/useProjectReports.js (FIXED VERSION)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export function useProjectReports() {
     const [reports, setReports] = useState([]);
     const [metrics, setMetrics] = useState({
          avgVelocity: 0,
          atRiskProjects: 0,
          monthlyDeliveries: 0,
          velocityTrend: '+0%',
          projectsByRisk: { low: 0, medium: 0, high: 0 },
          completionTrend: [],
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0
     });
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          status: 'ALL',
          riskLevel: 'ALL',
          dateRange: '30days',
          search: ''
     });
     const router = useRouter();

     const fetchReports = useCallback(async () => {
          try {
               setLoading(true);
               setError(null);

               // Build query string from filters
               const queryParams = new URLSearchParams();
               if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
               if (filters.riskLevel && filters.riskLevel !== 'ALL') queryParams.append('riskLevel', filters.riskLevel);
               if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
               if (filters.search) queryParams.append('search', filters.search);

               const url = `/api/project-manager/reports?${queryParams.toString()}`;
               console.log('Fetching reports from:', url);

               const response = await fetch(url, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }

                    // Try to get error message
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to fetch reports (${response.status})`);
               }

               const data = await response.json();
               console.log('Received reports data:', data);

               // Ensure we have arrays
               setReports(data.reports || []);
               setMetrics(data.metrics || {
                    avgVelocity: 0,
                    atRiskProjects: 0,
                    monthlyDeliveries: 0,
                    velocityTrend: '+0%',
                    projectsByRisk: { low: 0, medium: 0, high: 0 },
                    totalProjects: 0,
                    activeProjects: 0,
                    completedProjects: 0
               });

          } catch (err) {
               console.error('Error fetching reports:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [filters.status, filters.riskLevel, filters.dateRange, filters.search, router]);

     useEffect(() => {
          fetchReports();
     }, [fetchReports]);

     const updateFilters = (newFilters) => {
          setFilters(prev => ({ ...prev, ...newFilters }));
     };

     const clearFilters = () => {
          setFilters({
               status: 'ALL',
               riskLevel: 'ALL',
               dateRange: '30days',
               search: ''
          });
     };

     const generateCustomReport = async (config) => {
          try {
               const response = await fetch('/api/project-manager/reports/custom', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config),
                    credentials: 'include'
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to generate custom report');
               }

               const data = await response.json();

               Swal.fire({
                    title: 'Report Generated!',
                    text: 'Your custom report is ready',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               return data;
          } catch (err) {
               console.error('Error generating report:', err);
               Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
               throw err;
          }
     };

     const exportReport = async (projectId, format = 'pdf') => {
          try {
               const response = await fetch(`/api/project-manager/reports/${projectId}/export?format=${format}`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error || 'Failed to export report');
               }

               // Get filename from Content-Disposition header or create one
               const contentDisposition = response.headers.get('Content-Disposition');
               let filename = `project-report-${projectId}.${format}`;
               if (contentDisposition) {
                    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (match && match[1]) {
                         filename = match[1].replace(/['"]/g, '');
                    }
               }

               // Get blob and download
               const blob = await response.blob();
               const url = window.URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = filename;
               document.body.appendChild(a);
               a.click();
               window.URL.revokeObjectURL(url);
               document.body.removeChild(a);

               Swal.fire({
                    title: 'Exported!',
                    text: 'Report downloaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               return true;
          } catch (err) {
               console.error('Error exporting report:', err);
               Swal.fire({
                    title: 'Export Failed',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
               return false;
          }
     };

     return {
          reports,
          metrics,
          loading,
          error,
          filters,
          updateFilters,
          clearFilters,
          generateCustomReport,
          exportReport,
          refetch: fetchReports
     };
}