

// hooks/useTeamLeadTasks.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// HOOK 1: For multiple tasks (list view)
// ============================================
// hooks/useTeamLeadTasks.js

export function useTeamLeadTasks(projectId = null) {
     const [tasks, setTasks] = useState([]);
     const [projects, setProjects] = useState([]);
     const [developers, setDevelopers] = useState([]);
     const [stats, setStats] = useState({
          totalTasks: 0,
          inReview: 0,
          overdue: 0,
          completed: 0,
          notStarted: 0,
          inProgress: 0,
          blocked: 0
     });
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          status: 'all',
          projectId: '',
          assigneeId: '',
          search: ''
     });
     const [sortBy, setSortBy] = useState('deadline');
     const [sortOrder, setSortOrder] = useState('asc');
     const router = useRouter();

     // ✅ FIX: Move fetchTasks outside of useEffect and memoize properly
     const fetchTasks = useCallback(async () => {
          try {
               setLoading(true);

               // Build query parameters based on filters
               const queryParams = new URLSearchParams();
               if (filters.status && filters.status !== 'all') {
                    queryParams.append('status', filters.status);
               }
               if (filters.projectId) {
                    queryParams.append('projectId', filters.projectId);
               }
               if (filters.assigneeId) {
                    queryParams.append('assigneeId', filters.assigneeId);
               }
               if (filters.search) {
                    queryParams.append('search', filters.search);
               }
               if (sortBy) {
                    queryParams.append('sortBy', sortBy);
                    queryParams.append('sortOrder', sortOrder);
               }

               // If projectId is provided, fetch only that project's tasks
               const url = projectId
                    ? `/api/team-lead/projects/${projectId}/tasks`
                    : `/api/team-lead/tasks?${queryParams.toString()}`;

               console.log('Fetching tasks from:', url);
               const response = await fetch(url);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/auth/login');
                         return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch tasks');
               }

               const data = await response.json();

               // Handle different response structures
               const taskList = data.tasks || data || [];
               setTasks(taskList);

               // Update stats
               setStats({
                    totalTasks: taskList.length,
                    inReview: taskList.filter(t => t.status === 'REVIEW').length,
                    overdue: taskList.filter(t =>
                         t.status !== 'COMPLETED' &&
                         t.deadline &&
                         new Date(t.deadline) < new Date()
                    ).length,
                    completed: taskList.filter(t => t.status === 'COMPLETED').length,
                    notStarted: taskList.filter(t => t.status === 'NOT_STARTED').length,
                    inProgress: taskList.filter(t => t.status === 'IN_PROGRESS').length,
                    blocked: taskList.filter(t => t.status === 'BLOCKED').length
               });

               setError(null);
          } catch (err) {
               console.error('Error fetching tasks:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [projectId, filters.status, filters.projectId, filters.assigneeId, filters.search, sortBy, sortOrder, router]);

     const fetchProjects = useCallback(async () => {
          try {
               const response = await fetch('/api/team-lead/projects');
               if (response.ok) {
                    const data = await response.json();
                    setProjects(data.projects || []);
               }
          } catch (err) {
               console.error('Error fetching projects:', err);
          }
     }, []);

     const fetchDevelopers = useCallback(async () => {
          try {
               const response = await fetch('/api/team-lead/developers');
               if (response.ok) {
                    const data = await response.json();
                    setDevelopers(data.developers || []);
               }
          } catch (err) {
               console.error('Error fetching developers:', err);
          }
     }, []);

     // ✅ FIX: Only fetch tasks on initial mount and when filters change
     useEffect(() => {
          fetchTasks();
     }, [fetchTasks]); // ✅ fetchTasks is now memoized, so this is safe

     // Fetch projects and developers only once
     useEffect(() => {
          fetchProjects();
          fetchDevelopers();
     }, [fetchProjects, fetchDevelopers]); // ✅ These are also memoized

     // Update tasks when filters change
     useEffect(() => {
          fetchTasks();
     }, [filters.status, filters.projectId, filters.assigneeId, filters.search, sortBy, sortOrder]);

     const createTask = async (taskData) => {
          try {
               const response = await fetch(`/api/team-lead/projects/${taskData.projectId}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create task');
               }

               const newTask = await response.json();
               await fetchTasks();
               return newTask;
          } catch (err) {
               console.error('Error creating task:', err);
               throw err;
          }
     };

     const assignTask = async (taskId, developerId) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}/assign`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ developerId })
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to assign task');
               }

               await fetchTasks();
               return await response.json();
          } catch (err) {
               console.error('Error assigning task:', err);
               throw err;
          }
     };

     const approveTask = async (taskId) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to approve task');
               }

               await fetchTasks();
               return await response.json();
          } catch (err) {
               console.error('Error approving task:', err);
               throw err;
          }
     };

     const updateTask = useCallback(async (taskId, updates) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updates),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to update task');
               }

               await fetchTasks();
               return { success: true, task: data.task };
          } catch (err) {
               console.error('Task update error:', err);
               return { success: false, error: err.message };
          }
     }, [fetchTasks]);

     const deleteTask = useCallback(async (taskId) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}`, {
                    method: 'DELETE',
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete task');
               }

               await fetchTasks();
               return { success: true };
          } catch (err) {
               console.error('Task delete error:', err);
               return { success: false, error: err.message };
          }
     }, [fetchTasks]);

     const reportIssue = useCallback(async (taskId, issueData) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}/report`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(issueData),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to report issue');
               }

               return { success: true, message: data.message };
          } catch (err) {
               console.error('Report issue error:', err);
               return { success: false, error: err.message };
          }
     }, []);

     return {
          tasks,
          projects,
          developers,
          stats,
          loading,
          error,
          filters,
          setFilters,
          sortBy,
          setSortBy,
          sortOrder,
          setSortOrder,
          createTask,
          assignTask,
          approveTask,
          updateTask,
          deleteTask,
          reportIssue,
          fetchTasks, // ✅ Now properly exported
          refetch: fetchTasks
     };
}

// ============================================
// HOOK 2: For single task details
// ============================================
export function useTeamLeadTask(taskId) {
     const [task, setTask] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const router = useRouter();

     const fetchTask = useCallback(async () => {
          if (!taskId) return;

          try {
               setLoading(true);
               const response = await fetch(`/api/team-lead/tasks/${taskId}`);

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch task');
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

     const updateTaskStatus = useCallback(async (status, reviewApproved = false) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status, reviewApproved }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to update task');
               }

               await fetchTask();
               return { success: true, task: data.task };
          } catch (error) {
               console.error('Failed to update task:', error);
               return { success: false, error: error.message };
          }
     }, [taskId, fetchTask]);

     const addComment = useCallback(async (content) => {
          try {
               const response = await fetch(`/api/team-lead/tasks/${taskId}/comments`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to add comment');
               }

               await fetchTask();
               return { success: true, comment: data.comment };
          } catch (error) {
               console.error('Failed to add comment:', error);
               return { success: false, error: error.message };
          }
     }, [taskId, fetchTask]);

     useEffect(() => {
          fetchTask();
     }, [fetchTask]);

     return {
          task,
          loading,
          error,
          updateTaskStatus,
          addComment,
          refetch: fetchTask
     };
}