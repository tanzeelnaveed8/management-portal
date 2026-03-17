// app/(dashboard)/developer/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
     Briefcase,
     CheckCircle2,
     AlertCircle,
     ListTodo,
     MessageSquare,
     Upload,
     MoreVertical,
     ChevronRight,
     Clock,
     Flag,
     Send,
     Paperclip,
     CheckCircle,
     Circle,
     PlayCircle,
     LogOut,
     RefreshCw,
     Target,
     Calendar,
     BarChart3,
     PieChart,
     TrendingUp,
     Award,
     Zap,
     Users,
     FileText,
     Download,
     Share2,
     Bell,
     Settings,
     Search,
     Filter,
     Grid3x3,
     LayoutList,
     Sun,
     Moon,
     Star,
     GitBranch,
     Activity,
     Sparkles,
     AlertTriangle
} from 'lucide-react';
import {
     LineChart,
     Line,
     BarChart,
     Bar,
     PieChart as RePieChart,
     Pie,
     Cell,
     AreaChart,
     Area,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     ResponsiveContainer,
     RadarChart,
     Radar,
     PolarGrid,
     PolarAngleAxis,
     PolarRadiusAxis,
     ComposedChart,
     Scatter
} from 'recharts';
import { StatCard } from '../../Components/common/StatCard';
import { StatusBadge } from '../../Components/common/StatusBadge';
import { PriorityBadge } from '../../Components/common/PriorityBadge';
import { useDeveloperDashboard } from '../../../hooks/useDeveloperDashboard';
import { usePresence } from '../../../hooks/usePresence';
import Spinner from '../../Components/common/Spinner';
import FailedLoading from '../../Components/common/FailedLoading';

const MySwal = withReactContent(Swal);

const DeveloperDashboard = () => {
     const router = useRouter();
     usePresence();
     const {
          stats,
          projects,
          tasks,
          comments,
          weeklyGoal,
          session,
          loading,
          error,
          selectedTask,
          setSelectedTask,
          submitForReview,
          submitAllForReview,
          refetch
     } = useDeveloperDashboard();

     const [isSubmitting, setIsSubmitting] = useState(false);
     const [isLoggingOut, setIsLoggingOut] = useState(false);
     const [newComment, setNewComment] = useState('');
     const [taskComments, setTaskComments] = useState({});
     const [viewMode, setViewMode] = useState('grid');
     const [showTaskStats, setShowTaskStats] = useState(true);
     const [selectedTimeRange, setSelectedTimeRange] = useState('week');
     // Add this state near your other useState declarations
     const [showWeeklyStats, setShowWeeklyStats] = useState(false);

     // Add this modal component before the return statement
     const WeeklyStatsModal = ({ isOpen, onClose, weeklyGoal, tasks }) => {
          if (!isOpen) return null;

          // Filter tasks completed this week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const completedThisWeek = tasks.filter(task => {
               // Assuming task has a completedAt field
               if (task.status === 'COMPLETED' && task.completedAt) {
                    const completedDate = new Date(task.completedAt);
                    return completedDate >= oneWeekAgo;
               }
               return false;
          });

          return (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                         <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
                              <h2 className="text-xl font-bold text-text-primary">Weekly Task Summary</h2>
                              <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg">
                                   <X size={20} />
                              </button>
                         </div>

                         <div className="p-6 space-y-6">
                              {/* Stats Overview */}
                              <div className="grid grid-cols-3 gap-4">
                                   <div className="bg-bg-subtle p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-accent">{weeklyGoal.completed}</p>
                                        <p className="text-xs text-text-muted">Completed</p>
                                   </div>
                                   <div className="bg-bg-subtle p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-accent-secondary">{weeklyGoal.target}</p>
                                        <p className="text-xs text-text-muted">Weekly Target</p>
                                   </div>
                                   <div className="bg-bg-subtle p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-500">{weeklyGoal.percentage}%</p>
                                        <p className="text-xs text-text-muted">Achievement</p>
                                   </div>
                              </div>

                              {/* Completed Tasks List */}
                              <div>
                                   <h3 className="text-sm font-bold text-text-primary mb-3">Tasks Completed This Week</h3>
                                   {completedThisWeek.length > 0 ? (
                                        <div className="space-y-2">
                                             {completedThisWeek.map(task => (
                                                  <div key={task.id} className="flex items-center justify-between p-3 bg-bg-subtle rounded-lg">
                                                       <div className="flex items-center gap-3">
                                                            <CheckCircle size={16} className="text-green-500" />
                                                            <div>
                                                                 <p className="text-sm font-medium text-text-primary">{task.task}</p>
                                                                 <p className="text-xs text-text-muted">{task.project}</p>
                                                            </div>
                                                       </div>
                                                       <span className="text-xs text-text-muted">
                                                            {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'This week'}
                                                       </span>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <p className="text-center text-text-muted py-4">No tasks completed this week</p>
                                   )}
                              </div>

                              {/* Daily Breakdown Chart */}
                              <div>
                                   <h3 className="text-sm font-bold text-text-primary mb-3">Daily Breakdown</h3>
                                   <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                             <BarChart data={getDailyBreakdown(tasks)}>
                                                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                  <Tooltip />
                                                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                             </BarChart>
                                        </ResponsiveContainer>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          );
     };

     // Helper function for daily breakdown
     const getDailyBreakdown = (tasks) => {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const completedThisWeek = tasks.filter(task =>
               task.status === 'COMPLETED' &&
               task.completedAt &&
               new Date(task.completedAt) >= oneWeekAgo
          );

          const dailyCounts = days.map((day, index) => {
               const count = completedThisWeek.filter(task => {
                    const taskDate = new Date(task.completedAt);
                    return taskDate.getDay() === index;
               }).length;

               return { day, completed: count };
          });

          return dailyCounts;
     };

     console.log("Developer Tasks", tasks)


     // Group tasks by status for easier access
     const getTasksByStatus = (status) => {
          return tasks.filter(task => task.status === status);
     };

     // Prepare chart data with proper defaults
     // Replace your getTaskDistributionData function with this:

     const getTaskDistributionData = () => {
          // Log tasks to see their structure
          console.log('Tasks for chart:', tasks.map(t => ({
               title: t.task || t.title,
               status: t.status,
               statusType: typeof t.status
          })));

          // Define all possible statuses with proper formatting
          const statusConfig = {
               'NOT_STARTED': { label: 'Not Started', color: '#94a3b8' },
               'IN_PROGRESS': { label: 'In Progress', color: '#3b82f6' },
               'REVIEW': { label: 'Review', color: '#f59e0b' },
               'COMPLETED': { label: 'Completed', color: '#10b981' },
               'BLOCKED': { label: 'Blocked', color: '#ef4444' }
          };

          // Count tasks by status
          const distribution = Object.keys(statusConfig)
               .map(statusKey => {
                    const count = tasks.filter(t => {
                         const taskStatus = t.status || t.taskStatus || t.State;
                         return taskStatus === statusKey;
                    }).length;

                    return {
                         name: statusConfig[statusKey].label,
                         value: count,
                         color: statusConfig[statusKey].color, // ✅ Color is defined here
                         originalStatus: statusKey
                    };
               })
               .filter(item => item.value > 0);

          console.log('Task distribution with colors:', distribution);

          // If we have tasks but no distribution matches, show them grouped
          if (distribution.length === 0 && tasks.length > 0) {
               const statusGroups = {};
               tasks.forEach(task => {
                    const status = task.status || task.taskStatus || 'UNKNOWN';
                    statusGroups[status] = (statusGroups[status] || 0) + 1;
               });

               return Object.entries(statusGroups).map(([status, count]) => ({
                    name: status.replace('_', ' '),
                    value: count,
                    color: statusConfig[status]?.color || '#94a3b8' // ✅ Use config color or fallback
               }));
          }

          return distribution;
     };

     // Helper function for random colors if needed
     const getRandomColor = (status) => {
          const colors = {
               'NOT_STARTED': '#94a3b8',
               'IN_PROGRESS': '#3b82f6',
               'REVIEW': '#f59e0b',
               'COMPLETED': '#10b981',
               'BLOCKED': '#ef4444'
          };
          return colors[status] || '#10b981';
     };

     const getPriorityDistributionData = () => {
          console.log('Tasks for priority chart:', tasks.map(t => ({
               title: t.task || t.title,
               priority: t.priority,
               priorityType: typeof t.priority
          })));

          const priorityConfig = {
               'URGENT': { label: 'Urgent', color: '#ef4444' },
               'HIGH': { label: 'High', color: '#f97316' },
               'MEDIUM': { label: 'Medium', color: '#f59e0b' },
               'LOW': { label: 'Low', color: '#10b981' }
          };

          const distribution = Object.keys(priorityConfig)
               .map(priorityKey => {
                    const count = tasks.filter(t => {
                         const taskPriority = t.priority || t.taskPriority;
                         return taskPriority === priorityKey;
                    }).length;

                    return {
                         name: priorityConfig[priorityKey].label,
                         value: count,
                         color: priorityConfig[priorityKey].color,
                         originalPriority: priorityKey
                    };
               })
               .filter(item => item.value > 0);

          console.log('Priority distribution:', distribution);

          if (distribution.length === 0 && tasks.length > 0) {
               // Group by whatever priority field exists
               const priorityGroups = {};
               tasks.forEach(task => {
                    const priority = task.priority || task.taskPriority || 'MEDIUM';
                    priorityGroups[priority] = (priorityGroups[priority] || 0) + 1;
               });

               return Object.entries(priorityGroups).map(([priority, count]) => ({
                    name: priority,
                    value: count,
                    color: priorityConfig[priority]?.color || '#94a3b8'
               }));
          }

          return distribution;
     };

     const getWeeklyProgressData = () => {
          // Get current date
          const today = new Date();

          // Create array of last 7 days
          const last7Days = [];
          for (let i = 6; i >= 0; i--) {
               const date = new Date(today);
               date.setDate(today.getDate() - i);
               last7Days.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    date: date.toISOString().split('T')[0],
                    fullDate: date
               });
          }

          // Process tasks data
          return last7Days.map(dayInfo => {
               const dayStart = new Date(dayInfo.fullDate);
               dayStart.setHours(0, 0, 0, 0);

               const dayEnd = new Date(dayInfo.fullDate);
               dayEnd.setHours(23, 59, 59, 999);

               // Count tasks completed on this day
               const completed = tasks.filter(task => {
                    if (task.status !== 'COMPLETED') return false;

                    // Try different possible date fields
                    const completedDate = task.completedAt || task.completedDate || task.updatedAt;
                    if (!completedDate) return false;

                    const taskDate = new Date(completedDate);
                    return taskDate >= dayStart && taskDate <= dayEnd;
               }).length;

               // Count tasks that were in progress during this day
               const inProgress = tasks.filter(task => {
                    if (task.status !== 'IN_PROGRESS') return false;

                    // Check if task was active on this day
                    const createdDate = task.createdAt ? new Date(task.createdAt) : null;
                    const updatedDate = task.updatedAt ? new Date(task.updatedAt) : null;

                    // Task was created before or on this day
                    const wasCreatedBefore = createdDate && createdDate <= dayEnd;

                    // Task hasn't been completed yet (or completed after this day)
                    const notCompletedYet = !task.completedAt || new Date(task.completedAt) > dayStart;

                    return wasCreatedBefore && notCompletedYet;
               }).length;

               return {
                    day: dayInfo.day,
                    completed,
                    inProgress,
                    date: dayInfo.date
               };
          });
     };

     const getProjectProgressData = () => {
          return projects.map(p => ({
               name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
               progress: p.progress || Math.floor(Math.random() * 100),
               tasksLeft: p.tasksLeft || 0
          }));
     };

     const taskDistribution = getTaskDistributionData();
     const priorityDistribution = getPriorityDistributionData();
     const weeklyData = getWeeklyProgressData();
     const projectData = getProjectProgressData();

     // Handle logout
     const handleLogout = async () => {
          const result = await MySwal.fire({
               title: <p className="text-red-700 font-bold">Are you sure?</p>,
               text: "You will need to login again to access the Developer Dashboard.",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#b91c1c',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, logout',
               background: '#ffffff',
               customClass: {
                    popup: 'rounded-2xl border border-border-default shadow-xl',
                    confirmButton: 'rounded-xl px-4 py-2 font-medium',
                    cancelButton: 'rounded-xl px-4 py-2 font-medium'
               }
          });

          if (result.isConfirmed) {
               try {
                    setIsLoggingOut(true);
                    const response = await fetch('/api/auth/logout', { method: 'POST' });

                    if (response.ok) {
                         router.push('/login');
                    }
               } catch (error) {
                    MySwal.fire('Error', 'Logout failed. Please try again.', 'error');
               } finally {
                    setIsLoggingOut(false);
               }
          }
     };

     // Handle submit for review
     const handleSubmitForReview = async (taskId) => {
          const { value: notes } = await MySwal.fire({
               title: 'Submit for Review',
               input: 'textarea',
               inputLabel: 'Review Notes (Optional)',
               inputPlaceholder: 'Add any notes for the reviewer...',
               showCancelButton: true,
               confirmButtonColor: '#2563eb',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Submit',
               background: '#ffffff',
               customClass: {
                    popup: 'rounded-2xl border border-border-default shadow-xl',
                    confirmButton: 'rounded-xl px-4 py-2 font-medium',
                    cancelButton: 'rounded-xl px-4 py-2 font-medium'
               }
          });

          if (notes !== undefined) {
               setIsSubmitting(true);
               const result = await submitForReview(taskId, notes);
               setIsSubmitting(false);

               if (result.success) {
                    MySwal.fire({
                         title: 'Success!',
                         text: result.message,
                         icon: 'success',
                         confirmButtonColor: '#2563eb',
                         timer: 2000
                    });
               } else {
                    MySwal.fire({
                         title: 'Error',
                         text: result.error,
                         icon: 'error',
                         confirmButtonColor: '#b91c1c'
                    });
               }
          }
     };

     // Handle submit all for review
     const handleSubmitAllForReview = async () => {
          const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

          if (completedTasks === 0) {
               MySwal.fire({
                    title: 'No Tasks',
                    text: 'You have no completed tasks to submit for review.',
                    icon: 'info',
                    confirmButtonColor: '#2563eb'
               });
               return;
          }

          const result = await MySwal.fire({
               title: 'Submit All?',
               text: `You have ${completedTasks} completed task(s). Submit all for review?`,
               icon: 'question',
               showCancelButton: true,
               confirmButtonColor: '#2563eb',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, submit all'
          });

          if (result.isConfirmed) {
               setIsSubmitting(true);
               const submitResult = await submitAllForReview();
               setIsSubmitting(false);

               if (submitResult.success) {
                    MySwal.fire({
                         title: 'Success!',
                         text: submitResult.message,
                         icon: 'success',
                         confirmButtonColor: '#2563eb',
                         timer: 2000
                    });
               } else {
                    MySwal.fire({
                         title: 'Error',
                         text: submitResult.error,
                         icon: 'error',
                         confirmButtonColor: '#b91c1c'
                    });
               }
          }
     };

     // Handle comment submission
     const handleAddComment = async (taskId) => {
          if (!newComment.trim()) return;

          try {
               const response = await fetch(`/api/developer/tasks/${taskId}/comments`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: newComment }),
               });

               if (response.ok) {
                    setNewComment('');
                    setTaskComments(prev => ({ ...prev, [taskId]: '' }));
                    refetch();
               }
          } catch (error) {
               console.error('Failed to add comment:', error);
          }
     };

     if (loading) {
          return (
               <Spinner title="Your Dashboard" />
          );
     }

     if (error) {
          return (
               <FailedLoading refetch={refetch} error={error} />
          );
     }

     return (
          <div className="flex flex-col h-screen bg-bg-page">
               {/* Enhanced Header */}
               <header className="sticky top-0 z-20 w-full border-b border-border-default bg-bg-surface/80 backdrop-blur-lg px-4 md:px-6 py-3 lg:h-16 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    {/* Left Section: Logo & Title */}
                    <div className="flex items-center justify-between lg:justify-start gap-3">
                         <div className="flex items-center gap-3">
                              <h1 className="text-lg md:text-xl font-bold text-text-primary whitespace-nowrap">
                                   Developer Workspace
                              </h1>
                              <div className="hidden sm:block h-6 w-px bg-border-default"></div>
                         </div>

                         {/* Mobile Only: Quick Refresh - Saves space in the bottom row */}
                         <button
                              onClick={() => refetch()}
                              className="lg:hidden p-2 text-text-muted hover:text-accent rounded-lg bg-bg-subtle transition-colors"
                         >
                              <RefreshCw size={18} />
                         </button>
                    </div>

                    {/* Right Section: Stats, Toggles, and Actions */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 md:gap-6">

                         {/* Live Session Indicator - Hidden on extra small, shown on sm+ */}
                         <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                   <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                   </span>
                                   <span className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                        {session.activeDuration || 'Online'}
                                   </span>
                              </div>

                              {/* Desktop Refresh */}
                              <button
                                   onClick={() => refetch()}
                                   className="hidden lg:block p-1.5 text-text-muted hover:text-accent rounded-lg hover:bg-bg-subtle transition-colors"
                                   title="Refresh"
                              >
                                   <RefreshCw size={16} />
                              </button>
                         </div>

                         {/* Controls Group: View Toggle & Submit */}
                         <div className="flex items-center gap-2 md:gap-3 flex-1 lg:flex-none justify-end">

                              {/* View Toggle - Slimmer on Mobile */}
                              <div className="flex items-center gap-1 p-1 bg-bg-subtle rounded-lg border border-border-default">
                                   <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                   >
                                        <Grid3x3 size={14} />
                                   </button>
                                   <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                   >
                                        <LayoutList size={14} />
                                   </button>
                              </div>

                              {/* Submit Button - Responsive text */}
                              <button
                                   onClick={handleSubmitAllForReview}
                                   disabled={isSubmitting}
                                   className="bg-accent hover:bg-accent-hover text-text-inverse px-3 md:px-4 py-2 rounded-lg text-ui font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-accent/20 disabled:opacity-50"
                              >
                                   <CheckCircle2 size={18} />
                                   <span className="hidden sm:inline">
                                        {isSubmitting ? 'Submitting...' : 'Submit All for Review'}
                                   </span>
                                   <span className="sm:hidden">
                                        {isSubmitting ? '...' : 'Submit'}
                                   </span>
                              </button>
                         </div>
                    </div>
               </header>

               {/* Dashboard Content */}
               <div className="flex-1 overflow-y-auto chat-scroll px-6 py-6 space-y-8">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-2xl p-6">
                         <div className="flex items-start justify-between">
                              <div>
                                   <h2 className="text-2xl font-bold text-text-primary mb-2">
                                        Welcome back, {session.user?.name || 'Developer'}! 👋
                                   </h2>
                                   <p className="text-text-muted max-w-2xl">
                                        You have {stats.inProgress || 0} tasks in progress and {stats.review || 0} tasks awaiting review.
                                        Keep up the great work!
                                   </p>
                              </div>
                              <div className="flex items-center gap-3">
                                   <div className="text-right">
                                        <p className="text-xs text-text-muted">Focus Score</p>
                                        <p className="text-2xl font-bold text-accent">94%</p>
                                   </div>
                                   <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                                        <Award className="text-accent" size={24} />
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Quick Stats Cards with Icons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <EnhancedStatCard
                              title="Total Tasks"
                              value={stats.total || 0}
                              icon={<ListTodo size={20} />}
                              trend="+12%"
                              color="blue"
                              gradient="from-blue-500/10 to-blue-500/5"
                         />
                         <EnhancedStatCard
                              title="In Progress"
                              value={stats.inProgress || 0}
                              icon={<PlayCircle size={20} />}
                              trend="3 active"
                              color="yellow"
                              gradient="from-yellow-500/10 to-yellow-500/5"
                         />
                         <EnhancedStatCard
                              title="Review"
                              value={stats.review || 0}
                              icon={<Clock size={20} />}
                              trend="2 pending"
                              color="purple"
                              gradient="from-purple-500/10 to-purple-500/5"
                         />
                         <EnhancedStatCard
                              title="Completed"
                              value={stats.completed || 0}
                              icon={<CheckCircle size={20} />}
                              trend={`${Math.round((stats.completed / (stats.total || 1)) * 100) || 0}% rate`}
                              color="green"
                              gradient="from-green-500/10 to-green-500/5"
                         />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* Task Distribution Pie Chart - FIXED */}
                         <div className="bg-bg-surface border border-border-default rounded-2xl p-6 hover:shadow-lg transition-all">
                              <div className="flex items-center justify-between mb-4">
                                   <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                        <PieChart size={16} className="text-accent" />
                                        Task Distribution
                                   </h3>
                                   <span className="text-xs text-text-muted">By Status</span>
                              </div>

                              {taskDistribution.length > 0 ? (
                                   <>
                                        <div className="h-[200px] w-full">
                                             <ResponsiveContainer width="100%" height="100%">
                                                  <RePieChart>
                                                       <Pie
                                                            data={taskDistribution}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                            labelLine={false}
                                                            isAnimationActive={true}
                                                       >
                                                            {
                                                                 taskDistribution.map((entry, index) => (
                                                                      <Cell key={`cell-${index}`} fill={entry.color || '#94a3b8'} />
                                                                 ))
                                                            }
                                                       </Pie>
                                                       <Tooltip
                                                            contentStyle={{
                                                                 backgroundColor: '#1e293b',
                                                                 border: '1px solid #334155',
                                                                 borderRadius: '0.75rem',
                                                                 color: '#fff',
                                                                 fontSize: '12px'
                                                            }}
                                                            formatter={(value, name, props) => {
                                                                 return [value, props.payload.name];
                                                            }}
                                                       />
                                                  </RePieChart>
                                             </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                             {taskDistribution.map((item, idx) => (
                                                  <div key={idx} className="flex items-center gap-2">
                                                       <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: item.color || '#94a3b8' }}
                                                       />
                                                       <span className="text-xs text-text-muted">{item.name}</span>
                                                       <span className="text-xs font-bold ml-auto">{item.value}</span>
                                                  </div>
                                             ))}
                                        </div>
                                   </>
                              ) : (
                                   <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-text-muted">No task data available</p>
                                   </div>
                              )}
                         </div>

                         {/* Priority Distribution Bar Chart */}
                         <div className="bg-bg-surface border border-border-default rounded-2xl p-6 hover:shadow-lg transition-all">
                              <div className="flex items-center justify-between mb-4">
                                   <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                        <BarChart3 size={16} className="text-accent" />
                                        Priority Breakdown
                                   </h3>
                                   <span className="text-xs text-text-muted">By Urgency</span>
                              </div>

                              {priorityDistribution.length > 0 ? (
                                   <>
                                        <div className="h-[200px] w-full">
                                             <ResponsiveContainer width="100%" height="100%">
                                                  <BarChart data={priorityDistribution} layout="vertical">
                                                       <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                       <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                                       <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
                                                       <Tooltip
                                                            contentStyle={{
                                                                 backgroundColor: '#1e293b',
                                                                 border: '1px solid #334155',
                                                                 borderRadius: '0.75rem',
                                                                 color: '#fff',
                                                                 fontSize: '12px'
                                                            }}
                                                       />
                                                       <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                            {priorityDistribution.map((entry, index) => (
                                                                 <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                       </Bar>
                                                  </BarChart>
                                             </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                             {priorityDistribution.map((item, idx) => (
                                                  <div key={idx} className="flex items-center gap-2">
                                                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                       <span className="text-xs text-text-muted">{item.name}</span>
                                                       <span className="text-xs font-bold ml-auto">{item.value}</span>
                                                  </div>
                                             ))}
                                        </div>
                                   </>
                              ) : (
                                   <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-text-muted">No priority data available</p>
                                   </div>
                              )}
                         </div>

                         {/* Weekly Goal Progress */}
                         {/* Weekly Goal Progress - FIXED */}
                         <div className="bg-gradient-to-br from-accent to-accent-active rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
                              <div className="flex items-start justify-between mb-6">
                                   <div>
                                        <p className="text-xs font-bold uppercase opacity-80 mb-1 flex items-center gap-1">
                                             <Target size={14} /> Weekly Goal
                                        </p>
                                        <p className="text-3xl font-bold">{weeklyGoal.completed || 0} / {weeklyGoal.target || 10}</p>
                                        <p className="text-xs opacity-80 mt-2">Tasks completed this week</p>
                                   </div>
                                   <div className="relative w-20 h-20">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                                             <circle
                                                  cx="40"
                                                  cy="40"
                                                  r="36"
                                                  stroke="rgba(255,255,255,0.2)"
                                                  strokeWidth="6"
                                                  fill="transparent"
                                             />
                                             <circle
                                                  cx="40"
                                                  cy="40"
                                                  r="36"
                                                  stroke="white"
                                                  strokeWidth="6"
                                                  fill="transparent"
                                                  strokeDasharray={226.2}
                                                  strokeDashoffset={226.2 - (226.2 * (weeklyGoal.percentage || 0)) / 100}
                                                  strokeLinecap="round"
                                                  className="transition-all duration-1000"
                                             />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                             <span className="text-xl font-bold">{weeklyGoal.percentage || 0}%</span>
                                        </div>
                                   </div>
                              </div>

                              <div className="space-y-3">
                                   <div className="flex justify-between text-xs opacity-90">
                                        <span>Daily Average</span>
                                        <span className="font-bold">{Math.round((weeklyGoal.completed || 0) / 7)} tasks/day</span>
                                   </div>
                                   <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                             className="h-full bg-white rounded-full transition-all duration-500"
                                             style={{ width: `${weeklyGoal.percentage || 0}%` }}
                                        />
                                   </div>

                                   {/* FIXED: Only show View Details button if there are completed tasks */}
                                   {(weeklyGoal.completed > 0) ? (
                                        <button
                                             onClick={() => {
                                                  // Navigate to weekly stats page or open modal
                                                  setShowTaskStats(true);
                                                  // You can also navigate to a detailed stats page
                                                  // router.push('/developer/stats/weekly');
                                             }}
                                             className="w-full mt-4 text-xs font-bold hover:underline flex items-center justify-center gap-1 opacity-90 transition-opacity hover:opacity-100"
                                        >
                                             View Details <ChevronRight size={12} />
                                        </button>
                                   ) : (
                                        <div className="w-full mt-4 text-xs text-center opacity-70">
                                             No tasks completed this week
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Weekly Progress Chart */}
                    {/* Weekly Progress Chart */}
                    <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
                         <div className="flex items-center justify-between mb-6">
                              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                   <Activity size={16} className="text-accent" />
                                   Weekly Activity
                              </h3>
                              <div className="flex items-center gap-3">
                                   <select
                                        value={selectedTimeRange}
                                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                                        className="text-xs px-3 py-1.5 bg-bg-subtle border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                   >
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">Last 3 Months</option>
                                   </select>
                                   <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-accent" />
                                             <span className="text-xs text-text-muted">Completed</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-accent-secondary" />
                                             <span className="text-xs text-text-muted">In Progress</span>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className="h-[250px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={getWeeklyProgressData()}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip
                                             contentStyle={{
                                                  backgroundColor: '#1e293b',
                                                  border: '1px solid #334155',
                                                  borderRadius: '0.75rem',
                                                  color: '#fff',
                                                  fontSize: '12px'
                                             }}
                                             formatter={(value, name) => {
                                                  if (name === 'completed') return [`${value} tasks`, 'Completed'];
                                                  if (name === 'inProgress') return [`${value} tasks`, 'In Progress'];
                                                  return [value, name];
                                             }}
                                             labelFormatter={(label) => `${label}`}
                                        />
                                        <Legend />
                                        <Area
                                             type="monotone"
                                             dataKey="completed"
                                             stackId="1"
                                             stroke="#2563eb"
                                             fill="#2563eb80"
                                             name="Completed"
                                        />
                                        <Area
                                             type="monotone"
                                             dataKey="inProgress"
                                             stackId="1"
                                             stroke="#14b8a6"
                                             fill="#14b8a680"
                                             name="In Progress"
                                        />
                                   </AreaChart>
                              </ResponsiveContainer>
                         </div>

                         {/* Optional: Show summary stats */}
                         <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border-default">
                              {getWeeklyProgressData().reduce((acc, day) => {
                                   return {
                                        totalCompleted: acc.totalCompleted + day.completed,
                                        totalInProgress: day.inProgress, // Shows current in progress
                                        avgPerDay: Math.round((acc.totalCompleted + day.completed) / 7)
                                   };
                              }, { totalCompleted: 0, totalInProgress: 0, avgPerDay: 0 }) && (
                                        <>
                                             <div className="text-center">
                                                  <p className="text-xs text-text-muted">Week Total</p>
                                                  <p className="text-lg font-bold text-text-primary">
                                                       {getWeeklyProgressData().reduce((sum, day) => sum + day.completed, 0)}
                                                  </p>
                                             </div>
                                             <div className="text-center border-x border-border-default">
                                                  <p className="text-xs text-text-muted">Currently Active</p>
                                                  <p className="text-lg font-bold text-accent-secondary">
                                                       {getWeeklyProgressData().find(day => day.day === new Date().toLocaleDateString('en-US', { weekday: 'short' }))?.inProgress || 0}
                                                  </p>
                                             </div>
                                             <div className="text-center">
                                                  <p className="text-xs text-text-muted">Daily Average</p>
                                                  <p className="text-lg font-bold text-accent">
                                                       {Math.round(getWeeklyProgressData().reduce((sum, day) => sum + day.completed, 0) / 7)}
                                                  </p>
                                             </div>
                                        </>
                                   )}
                         </div>
                    </div>

                    {/* Projects & Task Workspace */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                         {/* Left Column - Projects */}
                         <div className="xl:col-span-1 space-y-4">
                              <div className="flex items-center justify-between">
                                   <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                        <Briefcase size={18} className="text-accent" />
                                        My Projects
                                        <span className="text-xs font-normal px-2 py-0.5 bg-accent-muted text-accent rounded-full">
                                             {projects.length}
                                        </span>
                                   </h2>
                                   <a href="/developer/projects" className="text-xs text-accent hover:text-accent-hover font-bold">
                                        View All
                                   </a>
                              </div>

                              {/* Project Progress Chart */}
                              {projectData.length > 0 && (
                                   <div className="bg-bg-surface border border-border-default rounded-xl p-4 mb-4">
                                        <h4 className="text-xs font-bold text-text-muted uppercase mb-3">Project Progress</h4>
                                        <div className="space-y-3">
                                             {projectData.slice(0, 4).map((project, idx) => (
                                                  <div key={idx} className="space-y-1">
                                                       <div className="flex justify-between text-xs">
                                                            <span className="text-text-primary font-medium">{project.name}</span>
                                                            <span className="text-accent font-bold">{project.progress}%</span>
                                                       </div>
                                                       <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                                                            <div
                                                                 className="h-full bg-accent rounded-full transition-all duration-500"
                                                                 style={{ width: `${project.progress}%` }}
                                                            />
                                                       </div>
                                                       <p className="text-[10px] text-text-muted">
                                                            {project.tasksLeft} tasks left
                                                       </p>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              )}

                              {/* Project Cards */}
                              <div className="grid grid-cols-1 gap-4">
                                   {projects.map(proj => (
                                        <EnhancedProjectCard
                                             key={proj.id}
                                             project={proj}
                                             onClick={() => router.push(`/developer/projects/${proj.id}`)}
                                        />
                                   ))}
                              </div>
                         </div>

                         {/* Right Column - Tasks & Details */}
                         <div className="xl:col-span-2 space-y-6">
                              {/* Task Header */}
                              <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                             <ListTodo size={18} className="text-accent" />
                                             My Active Tasks
                                        </h2>
                                        <span className="text-xs font-normal px-2 py-0.5 bg-accent-muted text-accent rounded-full">
                                             {tasks.filter(t => t.status !== 'COMPLETED').length}
                                        </span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                        <div className="relative">
                                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                             <input
                                                  type="text"
                                                  placeholder="Search tasks..."
                                                  className="pl-8 pr-3 py-1.5 text-xs bg-bg-subtle border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                             />
                                        </div>
                                   </div>
                              </div>

                              {/* Task List */}
                              {tasks.filter(t => t.status !== 'COMPLETED').length > 0 ? (
                                   <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1 gap-3'}`}>
                                        {tasks
                                             .filter(t => t.status !== 'COMPLETED')
                                             .map((task) => (
                                                  <EnhancedTaskItem
                                                       key={task.id}
                                                       task={task}
                                                       isSelected={selectedTask?.id === task.id}
                                                       onSelect={() => setSelectedTask(task)}
                                                       onSubmitReview={handleSubmitForReview}
                                                       viewMode={viewMode}
                                                  />
                                             ))}
                                   </div>
                              ) : (
                                   <div className="bg-bg-surface border border-dashed border-border-strong rounded-xl p-8 text-center">
                                        <div className="bg-bg-subtle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                             <CheckCircle size={24} className="text-green-500" />
                                        </div>
                                        <p className="text-lg font-bold text-text-primary mb-2">All Caught Up! 🎉</p>
                                        <p className="text-sm text-text-muted max-w-xs mx-auto">
                                             You have no active tasks. Take a break or start something new!
                                        </p>
                                   </div>
                              )}

                              {/* Task Details Panel */}
                              {selectedTask && (
                                   <EnhancedTaskDetails
                                        selectedTask={selectedTask}
                                        comments={comments}
                                        newComment={newComment}
                                        setNewComment={setNewComment}
                                        onAddComment={handleAddComment}
                                        onSubmitReview={handleSubmitForReview}
                                   />
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
};

// Enhanced Stat Card Component
const EnhancedStatCard = ({ title, value, icon, trend, color, gradient }) => {
     const colorClasses = {
          blue: 'text-blue-500',
          yellow: 'text-yellow-500',
          purple: 'text-purple-500',
          green: 'text-green-500',
          red: 'text-red-500'
     };

     return (
          <div className={`bg-gradient-to-br ${gradient} bg-bg-surface border border-border-default rounded-xl p-5 hover:shadow-lg transition-all group relative overflow-hidden`}>
               <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-current opacity-5 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform"></div>

               <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 bg-${color}-500/10 rounded-lg group-hover:scale-110 transition-transform`}>
                         {React.cloneElement(icon, { className: colorClasses[color] })}
                    </div>
                    <span className={`text-xs font-medium ${colorClasses[color]}`}>{trend}</span>
               </div>

               <p className="text-2xl font-bold text-text-primary mb-1">{value}</p>
               <p className="text-xs text-text-muted">{title}</p>
          </div>
     );
};

// Enhanced Project Card
const EnhancedProjectCard = ({ project, onClick }) => {
     const progress = project.progress || Math.floor(Math.random() * 100);

     return (
          <div
               onClick={onClick}
               className="bg-bg-surface border border-border-default p-5 rounded-xl hover:border-accent hover:shadow-lg transition-all cursor-pointer group"
          >
               <div className="flex items-start justify-between mb-4">
                    <div>
                         <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                                   {project.name}
                              </h3>
                              <span className="text-[10px] font-bold text-accent bg-accent-muted px-2 py-0.5 rounded-full">
                                   {project.role}
                              </span>
                         </div>
                         <p className="text-xs text-text-muted line-clamp-2">
                              {project.description || 'No description available'}
                         </p>
                    </div>
                    <ChevronRight size={16} className="text-border-strong group-hover:text-accent group-hover:translate-x-1 transition-all" />
               </div>

               <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                         <span className="text-text-muted">Progress</span>
                         <span className="font-bold text-accent">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                         <div
                              className="h-full bg-accent rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                         />
                    </div>
                    <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3 text-[10px] text-text-muted">
                              <span className="flex items-center gap-1">
                                   <Clock size={10} />
                                   {project.deadline}
                              </span>
                              <span className="flex items-center gap-1">
                                   <ListTodo size={10} />
                                   {project.tasksLeft} left
                              </span>
                         </div>
                         <span className="text-[10px] font-medium text-accent">View Details →</span>
                    </div>
               </div>
          </div>
     );
};

// Enhanced Task Item Component
const EnhancedTaskItem = ({ task, isSelected, onSelect, onSubmitReview, viewMode }) => {
     const getPriorityColor = (priority) => {
          const colors = {
               'URGENT': 'text-red-600 bg-red-50 border-red-200',
               'HIGH': 'text-orange-600 bg-orange-50 border-orange-200',
               'MEDIUM': 'text-yellow-600 bg-yellow-50 border-yellow-200',
               'LOW': 'text-green-600 bg-green-50 border-green-200'
          };
          return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
     };

     return (
          <div
               onClick={onSelect}
               className={`bg-bg-surface border rounded-xl transition-all cursor-pointer group
                    ${isSelected
                         ? 'border-accent ring-2 ring-accent/20'
                         : 'border-border-default hover:border-accent/50 hover:shadow-md'
                    }
                    ${viewMode === 'grid' ? 'p-4' : 'p-3'}`}
          >
               <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center justify-between'} gap-3`}>
                    <div className="flex items-start gap-3">
                         <button
                              onClick={(e) => {
                                   e.stopPropagation();
                                   if (task.status !== 'COMPLETED') {
                                        onSubmitReview(task.id);
                                   }
                              }}
                              className={`transition-colors mt-0.5 ${task.status === 'COMPLETED'
                                   ? 'text-green-500'
                                   : 'text-text-disabled hover:text-accent'
                                   }`}
                              disabled={task.status === 'COMPLETED'}
                         >
                              {task.status === 'COMPLETED' ? (
                                   <CheckCircle size={18} />
                              ) : (
                                   <Circle size={18} />
                              )}
                         </button>

                         <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                   <p className={`text-sm font-semibold transition-colors truncate max-w-[200px] ${task.status === 'COMPLETED'
                                        ? 'text-text-disabled line-through'
                                        : 'text-text-primary group-hover:text-accent'
                                        }`}>
                                        {task.task}
                                   </p>
                                   <PriorityBadge priority={task.priority} />
                                   {task.priority === 'URGENT' && (
                                        <Zap size={12} className="text-red-500" />
                                   )}
                              </div>

                              <div className="flex items-center gap-3 text-[10px] text-text-muted flex-wrap">
                                   <span className="flex items-center gap-1">
                                        <Briefcase size={10} /> {task.project}
                                   </span>
                                   {task.comments > 0 && (
                                        <span className="flex items-center gap-1">
                                             <MessageSquare size={10} /> {task.comments}
                                        </span>
                                   )}
                                   <span className={`flex items-center gap-1 ${task.isOverdue ? 'text-red-500' : ''}`}>
                                        <Clock size={10} />
                                        {task.deadline}
                                   </span>
                              </div>
                         </div>
                    </div>

                    <div className={`flex items-center ${viewMode === 'grid' ? 'justify-between mt-2' : 'gap-4'}`}>
                         <StatusBadge status={task.status} />
                         <ChevronRight size={14} className="text-border-strong group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
               </div>

               {task.status === 'COMPLETED' && (
                    <div className="mt-3 pt-3 border-t border-border-subtle flex justify-end">
                         <button
                              onClick={(e) => {
                                   e.stopPropagation();
                                   onSubmitReview(task.id);
                              }}
                              className="text-xs text-accent hover:text-accent-hover font-bold flex items-center gap-1"
                         >
                              <CheckCircle2 size={12} />
                              Submit for Review
                         </button>
                    </div>
               )}
          </div>
     );
};

// Enhanced Task Details Component
const EnhancedTaskDetails = ({
     selectedTask,
     comments,
     newComment,
     setNewComment,
     onAddComment,
     onSubmitReview
}) => {
     const router = useRouter();
     const taskComments = comments.filter(c => c.taskTitle === selectedTask.task);

     return (
          <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="p-4 border-b border-border-default bg-gradient-to-r from-accent/5 to-transparent flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                         <Briefcase size={16} className="text-accent" />
                         Task Details
                    </h3>
                    <button
                         onClick={() => router.push(`/developer/tasks/${selectedTask.id}`)}
                         className="text-xs text-accent hover:text-accent-hover font-bold flex items-center gap-1"
                    >
                         View Full Task <ChevronRight size={12} />
                    </button>
               </div>

               <div className="p-5 space-y-6">
                    {/* Task Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-bg-subtle/50 rounded-lg p-3">
                              <p className="text-[10px] text-text-muted mb-1">Project</p>
                              <p className="text-sm font-bold text-text-primary">{selectedTask.project}</p>
                         </div>
                         <div className="bg-bg-subtle/50 rounded-lg p-3">
                              <p className="text-[10px] text-text-muted mb-1">Deadline</p>
                              <p className={`text-sm font-bold ${selectedTask.isOverdue ? 'text-red-500' : 'text-text-primary'}`}>
                                   {selectedTask.deadline}
                                   {selectedTask.isOverdue && ' (Overdue)'}
                              </p>
                         </div>
                    </div>

                    {/* Description */}
                    <div>
                         <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                              <FileText size={12} /> Description
                         </h4>
                         <div className="bg-bg-subtle/50 p-4 rounded-lg border border-border-subtle">
                              <p className="text-sm text-text-body leading-relaxed">
                                   {selectedTask.description || 'No description provided.'}
                              </p>
                         </div>
                    </div>

                    {/* Attachments */}
                    <div>
                         <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Paperclip size={12} /> Attachments
                         </h4>
                         <div className="border-2 border-dashed border-border-default rounded-lg p-4 hover:border-accent hover:bg-bg-subtle transition-all cursor-pointer group">
                              <div className="flex flex-col items-center gap-2">
                                   <Upload size={20} className="text-text-muted group-hover:text-accent transition-colors" />
                                   <p className="text-xs font-medium text-text-body">Click to upload files</p>
                                   <p className="text-[10px] text-text-disabled">PDF, Images up to 10MB</p>
                              </div>
                         </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                         <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1">
                              <MessageSquare size={12} /> Comments ({taskComments.length})
                         </h4>

                         <div className="space-y-4 max-h-48 overflow-y-auto chat-scroll pr-2 mb-4">
                              {taskComments.map((c, idx) => (
                                   <div key={c.id || idx} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                  <span className="text-[10px] font-bold text-text-primary">
                                                       {c.user}
                                                  </span>
                                                  <span className="text-[8px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-full">
                                                       {c.role}
                                                  </span>
                                             </div>
                                             <span className="text-[10px] text-text-disabled">{c.time}</span>
                                        </div>
                                        <div className="bg-bg-subtle/50 p-3 rounded-lg text-xs text-text-body border border-border-subtle">
                                             {c.text}
                                        </div>
                                   </div>
                              ))}
                         </div>

                         {/* Add Comment */}
                         <div className="relative">
                              <input
                                   type="text"
                                   value={newComment}
                                   onChange={(e) => setNewComment(e.target.value)}
                                   onKeyPress={(e) => e.key === 'Enter' && onAddComment(selectedTask.id)}
                                   placeholder="Type a comment..."
                                   className="w-full bg-bg-subtle border border-border-default rounded-lg py-2 pl-3 pr-10 text-xs focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                              />
                              <button
                                   onClick={() => onAddComment(selectedTask.id)}
                                   disabled={!newComment.trim()}
                                   className="absolute right-2 top-1/2 -translate-y-1/2 text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                   <Send size={14} />
                              </button>
                         </div>
                    </div>

                    {/* Submit for Review Button */}
                    {selectedTask.status === 'COMPLETED' && (
                         <div className="pt-4 border-t border-border-default">
                              <button
                                   onClick={() => onSubmitReview(selectedTask.id)}
                                   className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 group"
                              >
                                   <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
                                   Submit for Review
                              </button>
                         </div>
                    )}
               </div>
          </div>
     );
};

export default DeveloperDashboard;