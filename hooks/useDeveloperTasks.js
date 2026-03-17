

//app/hooks/useDeveloperTasks.js
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useDeveloperTasks() {
     const [tasks, setTasks] = useState([]);
     const [stats, setStats] = useState({
          total: 0,
          notStarted: 0,
          inProgress: 0,
          review: 0,
          completed: 0,
          blocked: 0,
          overdue: 0,
          highPriority: 0
     });
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          status: 'all',
          priority: 'all',
          projectId: null,
          search: ''
     });
     const [sortBy, setSortBy] = useState('deadline');
     const [sortOrder, setSortOrder] = useState('asc');
     const router = useRouter();

     const fetchTasks = useCallback(async () => {
          try {
               setLoading(true);

               // Build query string
               const params = new URLSearchParams();
               if (filters.status !== 'all') params.append('status', filters.status);
               if (filters.priority !== 'all') params.append('priority', filters.priority);
               if (filters.projectId) params.append('projectId', filters.projectId);
               if (filters.search) params.append('search', filters.search);
               if (sortBy) params.append('sortBy', sortBy);
               if (sortOrder) params.append('sortOrder', sortOrder);

               const url = `/api/developer/tasks${params.toString() ? `?${params.toString()}` : ''}`;

               const response = await fetch(url);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch tasks');
               }

               const data = await response.json();
               setTasks(data.tasks);
               setStats(data.stats);
               setError(null);
          } catch (err) {
               setError(err.message);
               console.error('Tasks fetch error:', err);
          } finally {
               setLoading(false);
          }
     }, [filters, sortBy, sortOrder, router]);

     // Get single task details
     const getTask = useCallback(async (taskId) => {
          try {
               const response = await fetch(`/api/developer/tasks/${taskId}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return null;
                    }
                    throw new Error('Failed to fetch task');
               }

               const data = await response.json();
               return data.task;
          } catch (err) {
               console.error('Task fetch error:', err);
               return null;
          }
     }, [router]);

     // Update task status
     const updateTaskStatus = useCallback(async (taskId, status, reviewNotes = null) => {
          try {
               const response = await fetch(`/api/developer/tasks/${taskId}/status`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status, reviewNotes }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to update task');
               }

               // Refresh tasks list
               await fetchTasks();

               return { success: true, task: data.task };
          } catch (err) {
               console.error('Task update error:', err);
               return { success: false, error: err.message };
          }
     }, [fetchTasks]);

     // Add comment to task
     const addComment = useCallback(async (taskId, content, parentId = null) => {
          try {
               const response = await fetch(`/api/developer/tasks/${taskId}/comments`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content, parentId }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to add comment');
               }

               return { success: true, comment: data.comment };
          } catch (err) {
               console.error('Add comment error:', err);
               return { success: false, error: err.message };
          }
     }, []);

     // Get task comments
     const getComments = useCallback(async (taskId) => {
          try {
               const response = await fetch(`/api/developer/tasks/${taskId}/comments`);

               if (!response.ok) {
                    throw new Error('Failed to fetch comments');
               }

               const data = await response.json();
               return data.comments;
          } catch (err) {
               console.error('Comments fetch error:', err);
               return [];
          }
     }, []);

     useEffect(() => {
          fetchTasks();
     }, [fetchTasks]);

     return {
          tasks,
          stats,
          loading,
          error,
          filters,
          setFilters,
          sortBy,
          setSortBy,
          sortOrder,
          setSortOrder,
          getTask,
          updateTaskStatus,
          addComment,
          getComments,
          refetch: fetchTasks
     };
}

// Hook for single task details
export function useDeveloperTask(taskId) {
     const [task, setTask] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const router = useRouter();

     const fetchTask = useCallback(async () => {
          if (!taskId) return;

          try {
               setLoading(true);
               const response = await fetch(`/api/developer/tasks/${taskId}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch task');
               }

               const data = await response.json();
               setTask(data.task);
               setError(null);
          } catch (err) {
               setError(err.message);
               console.error('Task fetch error:', err);
          } finally {
               setLoading(false);
          }
     }, [taskId, router]);

     useEffect(() => {
          fetchTask();
     }, [fetchTask]);

     return {
          task,
          loading,
          error,
          refetch: fetchTask
     };
}