
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export function useProjectManagerClients() {
     const [clients, setClients] = useState([]);
     const [stats, setStats] = useState({
          totalClients: 0,
          activeProjects: 0,
          pendingFeedback: 0,
          totalPortfolio: 0,
          clientsWithFeedback: 0,
          clientsWithDocuments: 0
     });
     const [loading, setLoading] = useState({
          clients: true,
          createClient: false
     });
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          status: 'all',
          search: ''
     });
     const router = useRouter();

     // Fetch clients
     const fetchClients = useCallback(async () => {
          try {
               setLoading(prev => ({ ...prev, clients: true }));

               const params = new URLSearchParams();
               if (filters.status !== 'all') params.append('status', filters.status);
               if (filters.search) params.append('search', filters.search);

               const response = await fetch(`/api/project-manager/clients?${params.toString()}`, {
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
                    throw new Error('Failed to fetch clients');
               }

               const data = await response.json();
               setClients(data.clients || []);
               setStats(data.stats || {
                    totalClients: 0,
                    activeProjects: 0,
                    pendingFeedback: 0,
                    totalPortfolio: 0,
                    clientsWithFeedback: 0,
                    clientsWithDocuments: 0
               });
               setError(null);
          } catch (err) {
               console.error('Clients fetch error:', err);
               setError(err.message);
          } finally {
               setLoading(prev => ({ ...prev, clients: false }));
          }
     }, [filters, router]);

     // Create new client (with initial project)
     const createClient = useCallback(async (clientData) => {
          try {
               setLoading(prev => ({ ...prev, createClient: true }));

               const response = await fetch('/api/project-manager/clients', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(clientData),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to create client');
               }

               await Swal.fire({
                    title: 'Success!',
                    text: data.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               // Refresh clients list
               await fetchClients();

               return { success: true, client: data.client };
          } catch (err) {
               console.error('Create client error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false, error: err.message };
          } finally {
               setLoading(prev => ({ ...prev, createClient: false }));
          }
     }, [fetchClients]);

     // Get client details
     const getClientDetails = useCallback(async (clientEmail) => {
          try {
               const response = await fetch(`/api/project-manager/clients/${encodeURIComponent(clientEmail)}`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    throw new Error('Failed to fetch client details');
               }

               const data = await response.json();
               return data.client;
          } catch (err) {
               console.error('Client details fetch error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return null;
          }
     }, []);

     // Get client documents
     const getClientDocuments = useCallback(async (clientEmail) => {
          try {
               const response = await fetch(`/api/project-manager/clients/${encodeURIComponent(clientEmail)}/documents`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    throw new Error('Failed to fetch documents');
               }

               const data = await response.json();
               return data.documents;
          } catch (err) {
               console.error('Client documents fetch error:', err);
               return [];
          }
     }, []);

     // Get client feedback
     const getClientFeedback = useCallback(async (clientEmail) => {
          try {
               const response = await fetch(`/api/project-manager/clients/${encodeURIComponent(clientEmail)}/feedback`, {
                    credentials: 'include'
               });

               if (!response.ok) {
                    throw new Error('Failed to fetch feedback');
               }

               const data = await response.json();
               return data;
          } catch (err) {
               console.error('Client feedback fetch error:', err);
               return { feedbacks: [], stats: {} };
          }
     }, []);

     // Update client info (via project update)
     const updateClientInfo = useCallback(async (clientEmail, updates) => {
          try {
               // Find the first project for this client to update
               const client = clients.find(c => c.email === clientEmail);
               if (!client || client.projects.length === 0) {
                    throw new Error('Client not found');
               }

               const projectId = client.projects[0].id;

               const response = await fetch(`/api/project-manager/projects/${projectId}`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                         clientName: updates.name,
                         clientCompany: updates.company,
                         clientPhone: updates.phone
                    }),
               });

               if (!response.ok) {
                    throw new Error('Failed to update client');
               }

               await Swal.fire({
                    title: 'Updated!',
                    text: 'Client information updated successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });

               await fetchClients();

               return { success: true };
          } catch (err) {
               console.error('Update client error:', err);

               await Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });

               return { success: false };
          }
     }, [clients, fetchClients]);

     useEffect(() => {
          fetchClients();
     }, [fetchClients]);

     return {
          clients,
          stats,
          loading,
          error,
          filters,
          setFilters,
          createClient,
          getClientDetails,
          getClientDocuments,
          getClientFeedback,
          updateClientInfo,
          refetch: fetchClients
     };
}