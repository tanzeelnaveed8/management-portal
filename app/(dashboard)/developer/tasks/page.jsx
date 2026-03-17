

// app/(dashboard)/developer/tasks/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import TaskCard from '../../../Components/common/TaskCard';
import {
     LayoutGrid,
     List,
     Filter,
     Plus,
     Search,
     X,
     AlertCircle,
     Clock,
     CheckCircle2,
     Loader,
     Calendar,
     Flag,
     BarChart3,
     TrendingUp,
     PieChart,
     ChevronDown,
     ArrowUpDown,
     CalendarDays,
     Star,
     Timer,
     AlertTriangle
} from 'lucide-react';
import { useDeveloperTasks } from '../../../../hooks/useDeveloperTasks';
import { useRouter } from 'next/navigation';
import {
     PieChart as RePieChart,
     Pie,
     Cell,
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend
} from 'recharts';
import Spinner from '../../../Components/common/Spinner';


export default function TasksPage() {
     const router = useRouter();
     const {
          tasks,
          stats,
          loading,
          error,
          filters,
          setFilters,
          sortBy,
          setSortBy,
          sortOrder,
          setSortOrder
     } = useDeveloperTasks();

     const [view, setView] = useState('grid');
     const [searchInput, setSearchInput] = useState('');
     const [showFilters, setShowFilters] = useState(false);
     const [showStats, setShowStats] = useState(true);
     const [hoveredChart, setHoveredChart] = useState(null);

     // Debounce search input
     useEffect(() => {
          const timer = setTimeout(() => {
               setFilters(prev => ({ ...prev, search: searchInput }));
          }, 300);

          return () => clearTimeout(timer);
     }, [searchInput, setFilters]);

     const clearSearch = () => {
          setSearchInput('');
          setFilters(prev => ({ ...prev, search: '' }));
     };

     const getStatusCount = (status) => {
          switch (status) {
               case 'NOT_STARTED': return stats.notStarted;
               case 'IN_PROGRESS': return stats.inProgress;
               case 'REVIEW': return stats.review;
               case 'COMPLETED': return stats.completed;
               case 'BLOCKED': return stats.blocked;
               default: return 0;
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'NOT_STARTED': return 'bg-slate-500';
               case 'IN_PROGRESS': return 'bg-accent';
               case 'REVIEW': return 'bg-yellow-500';
               case 'COMPLETED': return 'bg-green-500';
               case 'BLOCKED': return 'bg-red-500';
               default: return 'bg-slate-500';
          }
     };

     const getStatusBgColor = (status) => {
          switch (status) {
               case 'NOT_STARTED': return 'bg-slate-500/10 text-slate-600';
               case 'IN_PROGRESS': return 'bg-accent/10 text-accent';
               case 'REVIEW': return 'bg-yellow-500/10 text-yellow-600';
               case 'COMPLETED': return 'bg-green-500/10 text-green-600';
               case 'BLOCKED': return 'bg-red-500/10 text-red-600';
               default: return 'bg-slate-500/10 text-slate-600';
          }
     };

     // Data for pie chart
     const pieData = [
          { name: 'Not Started', value: stats.notStarted, color: '#64748b' },
          { name: 'In Progress', value: stats.inProgress, color: '#2563eb' },
          { name: 'Review', value: stats.review, color: '#eab308' },
          { name: 'Completed', value: stats.completed, color: '#22c55e' },
          { name: 'Blocked', value: stats.blocked, color: '#ef4444' }
     ].filter(item => item.value > 0);

     // Data for bar chart - priority distribution
     const priorityData = [
          { name: 'Urgent', count: tasks.filter(t => t.priority === 'URGENT').length, color: '#ef4444' },
          { name: 'High', count: tasks.filter(t => t.priority === 'HIGH').length, color: '#f97316' },
          { name: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length, color: '#eab308' },
          { name: 'Low', count: tasks.filter(t => t.priority === 'LOW').length, color: '#22c55e' }
     ];

     // Timeline data for upcoming deadlines
     const upcomingDeadlines = tasks
          .filter(t => t.deadline && t.status !== 'COMPLETED')
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 5);

     const completedPercentage = stats.total > 0
          ? Math.round((stats.completed / stats.total) * 100)
          : 0;

     if (loading && tasks.length === 0) {
          return <Spinner title="Your Tasks" />
     }

     return (
          <div className="flex flex-col h-full bg-bg-page">
               {/* Header with Stats */}
               <header className="border-b border-border-default bg-bg-surface sticky top-0 z-20 shadow-sm">
                    {/* Main Header */}
                    <div className="h-16 px-6 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                   <div className="p-2 bg-accent/10 rounded-lg">
                                        <CheckCircle2 size={20} className="text-accent" />
                                   </div>
                                   <div>
                                        <h2 className="text-xl font-bold text-text-primary">My Tasks</h2>
                                        <p className="text-xs text-text-muted">Manage and track your assignments</p>
                                   </div>
                              </div>
                              <div className="h-8 w-px bg-border-default"></div>
                              <div className="flex items-center gap-2">
                                   <span className="text-xs text-text-muted">Total:</span>
                                   <span className="text-sm font-bold bg-accent-muted text-accent px-2.5 py-1 rounded-full">
                                        {stats.total}
                                   </span>
                              </div>
                         </div>

                         <div className="flex items-center gap-3">
                              {/* View Toggle */}
                              <div className="flex bg-bg-subtle p-1 rounded-lg border border-border-default">
                                   <button
                                        onClick={() => setView('grid')}
                                        className={`p-2 rounded-md transition-all ${view === 'grid'
                                             ? 'bg-bg-surface shadow-sm text-accent'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                        title="Grid View"
                                   >
                                        <LayoutGrid size={18} />
                                   </button>
                                   <button
                                        onClick={() => setView('list')}
                                        className={`p-2 rounded-md transition-all ${view === 'list'
                                             ? 'bg-bg-surface shadow-sm text-accent'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                        title="List View"
                                   >
                                        <List size={18} />
                                   </button>
                              </div>

                              {/* Stats Toggle */}
                              <button
                                   onClick={() => setShowStats(!showStats)}
                                   className={`p-2 rounded-lg transition-all ${showStats
                                        ? 'bg-accent text-text-inverse'
                                        : 'bg-bg-surface border border-border-strong text-text-muted hover:text-text-primary hover:bg-bg-subtle'
                                        }`}
                                   title="Toggle Statistics"
                              >
                                   <BarChart3 size={18} />
                              </button>

                              {/* Filter Button */}
                              <button
                                   onClick={() => setShowFilters(!showFilters)}
                                   className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${showFilters
                                        ? 'bg-accent text-text-inverse'
                                        : 'text-text-body bg-bg-surface border border-border-strong hover:bg-bg-subtle'
                                        }`}
                              >
                                   <Filter size={16} />
                                   <span>Filter</span>
                                   {(filters.status !== 'all' || filters.priority !== 'all' || filters.search) && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                                             {Object.values(filters).filter(v => v !== 'all' && v !== null && v !== '').length}
                                        </span>
                                   )}
                              </button>

                              
                         </div>
                    </div>

                    {/* Stats Overview Cards */}
                    {showStats && (
                         <div className="px-6 py-4 bg-gradient-to-br from-bg-surface to-bg-subtle border-t border-border-default animate-in slide-in-from-top-2">
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                   <StatCard
                                        title="Not Started"
                                        value={stats.notStarted}
                                        icon={<Clock size={16} />}
                                        color="slate"
                                        percentage={stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0}
                                   />
                                   <StatCard
                                        title="In Progress"
                                        value={stats.inProgress}
                                        icon={<Loader size={16} />}
                                        color="blue"
                                        percentage={stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}
                                   />
                                   <StatCard
                                        title="Review"
                                        value={stats.review}
                                        icon={<Star size={16} />}
                                        color="yellow"
                                        percentage={stats.total > 0 ? Math.round((stats.review / stats.total) * 100) : 0}
                                   />
                                   <StatCard
                                        title="Completed"
                                        value={stats.completed}
                                        icon={<CheckCircle2 size={16} />}
                                        color="green"
                                        percentage={stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}
                                   />
                                   <StatCard
                                        title="Blocked"
                                        value={stats.blocked}
                                        icon={<AlertTriangle size={16} />}
                                        color="red"
                                        percentage={stats.total > 0 ? Math.round((stats.blocked / stats.total) * 100) : 0}
                                   />
                              </div>

                              {/* Charts Row */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                                   {/* Progress Overview */}
                                   <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
                                        <div className="flex items-center justify-between mb-3">
                                             <h3 className="text-xs font-bold text-text-muted uppercase">Overall Progress</h3>
                                             <div className="flex items-center gap-2">
                                                  <span className="text-lg font-bold text-accent">{completedPercentage}%</span>
                                                  <TrendingUp size={16} className="text-green-500" />
                                             </div>
                                        </div>
                                        <div className="h-2 w-full bg-bg-subtle rounded-full overflow-hidden">
                                             <div
                                                  className="h-full bg-accent transition-all duration-500"
                                                  style={{ width: `${completedPercentage}%` }}
                                             />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] text-text-muted">
                                             <span>{stats.completed} completed</span>
                                             <span>{stats.total - stats.completed} remaining</span>
                                        </div>
                                   </div>

                                   {/* Priority Distribution */}
                                   <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
                                        <h3 className="text-xs font-bold text-text-muted uppercase mb-3">Priority Distribution</h3>
                                        <div className="space-y-2">
                                             {priorityData.map(item => (
                                                  <div key={item.name} className="flex items-center gap-2">
                                                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                       <span className="text-xs text-text-muted flex-1">{item.name}</span>
                                                       <span className="text-xs font-bold text-text-primary">{item.count}</span>
                                                       <div className="w-20 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                                                            <div
                                                                 className="h-full transition-all"
                                                                 style={{
                                                                      width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%`,
                                                                      backgroundColor: item.color
                                                                 }}
                                                            />
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>

                                   {/* Upcoming Deadlines */}
                                   <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
                                        <h3 className="text-xs font-bold text-text-muted uppercase mb-3">Upcoming Deadlines</h3>
                                        {upcomingDeadlines.length > 0 ? (
                                             <div className="space-y-2">
                                                  {upcomingDeadlines.map(task => (
                                                       <div key={task.id} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                 <CalendarDays size={12} className="text-text-muted" />
                                                                 <span className="text-text-primary truncate max-w-[120px]">{task.title}</span>
                                                            </div>
                                                            <span className={`font-bold ${new Date(task.deadline) < new Date()
                                                                      ? 'text-red-500'
                                                                      : 'text-accent'
                                                                 }`}>
                                                                 {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <p className="text-xs text-text-muted text-center py-2">No upcoming deadlines</p>
                                        )}
                                   </div>
                              </div>

                              {/* Stats Bar (Legacy) - Keep for backward compatibility */}
                              <div className="flex items-center gap-6 text-xs mt-4 pt-4 border-t border-border-default">
                                   <div className="flex items-center gap-2">
                                        <span className="text-text-muted">Overdue:</span>
                                        <span className="font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                             {stats.overdue}
                                        </span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                        <span className="text-text-muted">High Priority:</span>
                                        <span className="font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                             {stats.highPriority}
                                        </span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                        <span className="text-text-muted">Completion Rate:</span>
                                        <span className="font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                             {completedPercentage}%
                                        </span>
                                   </div>
                              </div>
                         </div>
                    )}

                    {/* Filter Bar */}
                    {showFilters && (
                         <div className="px-6 py-4 border-t border-border-default bg-bg-surface animate-in slide-in-from-top-2">
                              <div className="flex flex-wrap items-center gap-3">
                                   {/* Search */}
                                   <div className="relative flex-1 min-w-[250px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={16} />
                                        <input
                                             type="text"
                                             value={searchInput}
                                             onChange={(e) => setSearchInput(e.target.value)}
                                             placeholder="Search by task title, project, or description..."
                                             className="w-full bg-bg-subtle border border-border-default rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                                        />
                                        {searchInput && (
                                             <button
                                                  onClick={clearSearch}
                                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary"
                                             >
                                                  <X size={14} />
                                             </button>
                                        )}
                                   </div>

                                   {/* Status Filter */}
                                   <div className="relative">
                                        <select
                                             value={filters.status}
                                             onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                             className="appearance-none px-4 py-2.5 pr-10 bg-bg-subtle border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 min-w-[140px]"
                                        >
                                             <option value="all">All Status</option>
                                             <option value="NOT_STARTED">Not Started ({stats.notStarted})</option>
                                             <option value="IN_PROGRESS">In Progress ({stats.inProgress})</option>
                                             <option value="REVIEW">Review ({stats.review})</option>
                                             <option value="COMPLETED">Completed ({stats.completed})</option>
                                             <option value="BLOCKED">Blocked ({stats.blocked})</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                   </div>

                                   {/* Priority Filter */}
                                   <div className="relative">
                                        <select
                                             value={filters.priority}
                                             onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                                             className="appearance-none px-4 py-2.5 pr-10 bg-bg-subtle border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 min-w-[140px]"
                                        >
                                             <option value="all">All Priorities</option>
                                             <option value="URGENT">Urgent</option>
                                             <option value="HIGH">High</option>
                                             <option value="MEDIUM">Medium</option>
                                             <option value="LOW">Low</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                   </div>

                                   {/* Sort By */}
                                   <div className="relative">
                                        <select
                                             value={sortBy}
                                             onChange={(e) => setSortBy(e.target.value)}
                                             className="appearance-none px-4 py-2.5 pr-10 bg-bg-subtle border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 min-w-[140px]"
                                        >
                                             <option value="deadline">Sort by Deadline</option>
                                             <option value="priority">Sort by Priority</option>
                                             <option value="status">Sort by Status</option>
                                             <option value="createdAt">Sort by Created</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                   </div>

                                   {/* Sort Order */}
                                   <button
                                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-bg-subtle border border-border-default rounded-lg text-sm hover:bg-bg-page transition-all"
                                   >
                                        <ArrowUpDown size={14} />
                                        <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                                   </button>

                                   {/* Clear Filters */}
                                   {(filters.status !== 'all' || filters.priority !== 'all' || filters.search) && (
                                        <button
                                             onClick={() => {
                                                  setFilters({ status: 'all', priority: 'all', projectId: null, search: '' });
                                                  setSearchInput('');
                                             }}
                                             className="text-sm text-accent hover:text-accent-hover font-medium px-3 py-2"
                                        >
                                             Clear all filters
                                        </button>
                                   )}
                              </div>
                         </div>
                    )}
               </header>

               {/* Error Message */}
               {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                         <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-500/20 rounded-lg">
                                   <AlertCircle size={20} className="text-red-500" />
                              </div>
                              <div>
                                   <p className="text-red-500 text-sm font-medium">Error loading tasks</p>
                                   <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                              </div>
                         </div>
                         <button
                              onClick={() => window.location.reload()}
                              className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors"
                         >
                              Retry
                         </button>
                    </div>
               )}

               {/* Task Grid/List Area */}
               <main className="flex-1 overflow-y-auto chat-scroll p-6">
                    {tasks.length === 0 ? (
                         <div className="h-full flex items-center justify-center">
                              <div className="text-center max-w-md">
                                   <div className="p-6 bg-bg-surface rounded-2xl w-fit mx-auto mb-6 shadow-sm border border-border-default">
                                        <CheckCircle2 size={48} className="text-text-disabled" />
                                   </div>
                                   <h3 className="font-bold text-text-primary text-xl mb-2">No tasks found</h3>
                                   <p className="text-text-muted text-sm mb-8">
                                        {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                                             ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                                             : "You don't have any tasks assigned yet. Tasks will appear here when your team lead assigns them."}
                                   </p>
                                   {(filters.search || filters.status !== 'all' || filters.priority !== 'all') && (
                                        <button
                                             onClick={() => {
                                                  setFilters({ status: 'all', priority: 'all', projectId: null, search: '' });
                                                  setSearchInput('');
                                             }}
                                             className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
                                        >
                                             Clear Filters
                                        </button>
                                   )}
                              </div>
                         </div>
                    ) : view === 'grid' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                              {tasks.map((task) => (
                                   <div key={task.id} className="transform transition-all hover:-translate-y-1 hover:shadow-lg">
                                        <TaskCard role="developer" key={task.id} task={task} />
                                   </div>
                              ))}
                         </div>
                    ) : (
                         <div className="bg-bg-surface rounded-xl border border-border-default overflow-hidden shadow-sm">
                              <table className="w-full">
                                   <thead className="bg-bg-subtle border-b border-border-default">
                                        <tr>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase tracking-wider">Task</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase tracking-wider">Project</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase tracking-wider">Status</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase tracking-wider">Priority</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase tracking-wider">Deadline</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase tracking-wider">Progress</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {tasks.map((task, index) => (
                                             <tr
                                                  key={task.id}
                                                  onClick={() => router.push(`/developer/tasks/${task.id}`)}
                                                  className="border-b border-border-default hover:bg-bg-subtle/50 cursor-pointer transition-colors group"
                                             >
                                                  <td className="p-4">
                                                       <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)} group-hover:scale-110 transition-transform`} />
                                                            <div>
                                                                 <p className="font-medium text-text-primary group-hover:text-accent transition-colors">
                                                                      {task.title}
                                                                 </p>
                                                                 {task.description && (
                                                                      <p className="text-xs text-text-muted line-clamp-1">{task.description}</p>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className="text-sm text-text-muted">{task.project?.name}</span>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBgColor(task.status)}`}>
                                                            {task.status.replace('_', ' ')}
                                                       </span>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                                                                 task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                                                                      task.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-600' :
                                                                           'bg-green-500/10 text-green-600'
                                                            }`}>
                                                            {task.priority}
                                                       </span>
                                                  </td>
                                                  <td className="p-4">
                                                       <div className="flex items-center gap-2">
                                                            <Calendar size={12} className={task.isOverdue ? 'text-red-500' : 'text-text-muted'} />
                                                            <span className={`text-sm ${task.isOverdue ? 'text-red-500 font-bold' : 'text-text-muted'}`}>
                                                                 {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', {
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                      year: 'numeric'
                                                                 }) : 'No deadline'}
                                                            </span>
                                                            {task.isOverdue && (
                                                                 <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-full">
                                                                      Overdue
                                                                 </span>
                                                            )}
                                                       </div>
                                                  </td>
                                                  <td className="p-4">
                                                       <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-text-primary min-w-[60px]">
                                                                 {task.actualHours || 0}/{task.estimatedHours || 0}h
                                                            </span>
                                                            <div className="w-20 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                                                                 <div
                                                                      className="h-full bg-accent transition-all duration-500"
                                                                      style={{
                                                                           width: `${task.estimatedHours
                                                                                ? Math.min(100, ((task.actualHours || 0) / task.estimatedHours) * 100)
                                                                                : 0}%`
                                                                      }}
                                                                 />
                                                            </div>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </main>
          </div>
     );
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, percentage }) => {
     const getColorClasses = () => {
          switch (color) {
               case 'slate': return 'bg-slate-500/10 text-slate-600';
               case 'blue': return 'bg-accent/10 text-accent';
               case 'yellow': return 'bg-yellow-500/10 text-yellow-600';
               case 'green': return 'bg-green-500/10 text-green-600';
               case 'red': return 'bg-red-500/10 text-red-600';
               default: return 'bg-accent/10 text-accent';
          }
     };

     return (
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default hover:border-accent/30 transition-all group">
               <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</span>
                    <div className={`p-1.5 rounded-lg ${getColorClasses()} group-hover:scale-110 transition-transform`}>
                         {icon}
                    </div>
               </div>
               <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-text-primary">{value}</span>
                    <span className="text-xs text-text-muted">{percentage}%</span>
               </div>
               <div className="mt-2 h-1 w-full bg-bg-subtle rounded-full overflow-hidden">
                    <div
                         className={`h-full transition-all duration-500 ${color === 'slate' ? 'bg-slate-500' :
                                   color === 'blue' ? 'bg-accent' :
                                        color === 'yellow' ? 'bg-yellow-500' :
                                             color === 'green' ? 'bg-green-500' :
                                                  color === 'red' ? 'bg-red-500' : 'bg-accent'
                              }`}
                         style={{ width: `${percentage}%` }}
                    />
               </div>
          </div>
     );
};