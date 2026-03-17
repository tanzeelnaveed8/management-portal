// app/(dashboard)/team-lead/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
     BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
     PieChart, Pie, Cell
} from 'recharts';
import {
     Plus,
     LayoutDashboard,
     Briefcase,
     Users,
     Calendar,
     CheckCircle2,
     AlertCircle,
     FileText,
     MessageSquare,
     Upload,
     MoreVertical,
     ChevronRight,
     TrendingUp,
     Clock,
     UserPlus,
     CheckSquare,
     ListTodo,
     Flag,
     UserCheck,
     ArrowUpRight,
     X,
     UserMinus,
     Search,
     Loader,
     BarChart3,
     PieChart as PieChartIcon
} from 'lucide-react';
import { useTeamLeadDashboard } from '../../../hooks/useTeamLeadDashboard';
import CreateTaskModal from '../../Components/team-lead/CreateTaskModal';
import IssueReportModal from '../../Components/team-lead/IssueReportModal';
import TaskApprovalModal from '../../Components/team-lead/TaskApprovalModal';
import Spinner from '../../Components/common/Spinner';
import TaskAssignmentModal from '../../Components/team-lead/TaskAssignmentModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRouter } from 'next/navigation';
const MySwal = withReactContent(Swal);

// Animation variants
const containerVariants = {
     hidden: { opacity: 0 },
     visible: {
          opacity: 1,
          transition: {
               staggerChildren: 0.1,
               delayChildren: 0.2,
          },
     },
};

const itemVariants = {
     hidden: { y: 20, opacity: 0 },
     visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 24 },
     },
};

const TeamLeadDashboard = () => {
     const [activeTab, setActiveTab] = useState('overview');
     const [showTaskModal, setShowTaskModal] = useState(false);
     const [showIssueModal, setShowIssueModal] = useState(false);
     const [selectedApproval, setSelectedApproval] = useState(null);
     const [selectedProject, setSelectedProject] = useState('all');
     const [showAssignmentModal, setShowAssignmentModal] = useState(false);
     const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState(null);
     const [showChart, setShowChart] = useState('bar'); // 'bar' or 'pie'

     const {
          projects,
          pendingApprovals,
          developerTasks,
          deadlines,
          stats,
          loading,
          error,
          createTask,
          approveTask,
          requestRevision,
          reportIssue,
          refetch,
          assignTask,
          unassignTask,
     } = useTeamLeadDashboard();
     const router = useRouter();

     // Prepare data for charts
     const taskStatusData = [
          { name: 'Completed', value: stats.completedTasks || 0, color: '#10b981' },
          { name: 'In Progress', value: stats.inProgressTasks || 0, color: '#3b82f6' },
          { name: 'Review', value: stats.reviewTasks || 0, color: '#f59e0b' },
          { name: 'Blocked', value: stats.blockedTasks || 0, color: '#ef4444' },
     ].filter(item => item.value > 0);

     const projectProgressData = projects.slice(0, 5).map(p => ({
          name: p.name.length > 15 ? p.name.substring(0, 12) + '…' : p.name,
          progress: p.progress,
     }));

     if (loading) {
          return (
               <div className="min-h-screen bg-bg-page flex items-center justify-center">
                    <Spinner title="your dashboard..." />
               </div>
          );
     }

     if (error) {
          return (
               <div className="min-h-screen bg-bg-page flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Error Loading Dashboard</h2>
                         <p className="text-text-muted mb-6">{error}</p>
                         <button
                              onClick={refetch}
                              className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Try Again
                         </button>
                    </div>
               </div>
          );
     }

     const handleAssignClick = (task) => {
          setSelectedTaskForAssignment(task);
          setShowAssignmentModal(true);
     };

     const filteredTasks = selectedProject === 'all'
          ? developerTasks
          : developerTasks.filter(task => task.projectId === selectedProject);

     return (
          <div className="min-h-screen bg-bg-page text-text-body font-sans flex pb-32 md:pb-0">
               <main className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <motion.header
                         initial={{ y: -20, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         transition={{ duration: 0.4 }}
                         className="h-16 md:h-20 border-b border-border-default bg-bg-surface flex items-center justify-between px-page-x sticky top-0 z-40 shadow-sm"
                    >
                         <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                              <div className="flex flex-col">
                                   <h1 className="text-ui md:text-headline font-bold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none">
                                        Team Lead
                                   </h1>
                                   <span className="text-[10px] md:hidden font-black uppercase text-accent leading-none">Control</span>
                              </div>
                              <div className="h-6 w-px bg-border-default hidden sm:block"></div>
                              <div className="relative flex items-center">
                                   <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="bg-bg-subtle md:bg-transparent text-[11px] md:text-sm font-bold text-text-muted outline-none cursor-pointer hover:text-accent transition-colors py-1 px-2 md:p-0 rounded-lg appearance-none max-w-[100px] md:max-w-[200px] truncate"
                                   >
                                        <option value="all">All Projects</option>
                                        {projects.map(project => (
                                             <option key={project.id} value={project.id}>{project.name}</option>
                                        ))}
                                   </select>
                              </div>
                         </div>
                         <div className="flex items-center gap-2 md:gap-4">
                              <motion.button
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => setShowIssueModal(true)}
                                   className="p-2.5 md:px-4 md:py-2 border border-border-default hover:bg-bg-subtle text-text-body rounded-xl md:rounded-lg font-bold flex items-center gap-2 transition-all group"
                                   title="Report Issue"
                              >
                                   <AlertCircle size={20} className="text-red-500 md:text-text-body" />
                                   <span className="hidden lg:inline">Report Issue</span>
                              </motion.button>
                              <motion.button
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => setShowTaskModal(true)}
                                   className="p-2.5 md:px-5 md:py-2.5 bg-accent hover:bg-accent-hover text-text-inverse rounded-xl md:rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent/20"
                                   title="Create Dev Task"
                              >
                                   <Plus size={20} />
                                   <span className="hidden sm:inline">New Task</span>
                                   <span className="hidden lg:inline">Dev Task</span>
                              </motion.button>
                         </div>
                    </motion.header>

                    {/* Dashboard Content */}
                    <motion.div
                         variants={containerVariants}
                         initial="hidden"
                         animate="visible"
                         className="p-page-y px-page-x space-y-8 overflow-y-auto chat-scroll pb-12"
                    >
                         {/* Stats Overview */}
                         <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <StatCard
                                   icon={<Briefcase className="text-accent" />}
                                   label="Active Projects"
                                   value={stats.activeProjects}
                                   total={stats.totalProjects}
                                   bgColor="bg-accent/10"
                              />
                              <StatCard
                                   icon={<Users className="text-accent-secondary" />}
                                   label="Team Members"
                                   value={stats.totalDevelopers}
                                   bgColor="bg-accent-secondary/10"
                              />
                              <StatCard
                                   icon={<UserCheck className="text-yellow-500" />}
                                   label="Pending Reviews"
                                   value={stats.pendingReviews}
                                   bgColor="bg-yellow-500/10"
                              />
                              <StatCard
                                   icon={<Clock className="text-red-500" />}
                                   label="Overdue Tasks"
                                   value={stats.overdueTasks}
                                   bgColor="bg-red-500/10"
                              />
                         </motion.div>

                         {/* Charts Section */}
                         <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Project Progress Chart */}
                              <div className="bg-bg-surface rounded-xl border border-border-default p-5 shadow-sm">
                                   <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                             <BarChart3 size={18} className="text-accent" />
                                             Project Progress
                                        </h3>
                                        <button
                                             onClick={() => setShowChart(showChart === 'bar' ? 'pie' : 'bar')}
                                             className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
                                        >
                                             {showChart === 'bar' ? <PieChartIcon size={14} /> : <BarChart3 size={14} />}
                                             Switch to {showChart === 'bar' ? 'Pie' : 'Bar'}
                                        </button>
                                   </div>
                                   <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                             {showChart === 'bar' ? (
                                                  <BarChart data={projectProgressData} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
                                                       <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                                                       <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
                                                       <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={80} />
                                                       <Tooltip
                                                            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: 8 }}
                                                            labelStyle={{ color: 'var(--text-primary)' }}
                                                       />
                                                       <Bar dataKey="progress" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
                                                  </BarChart>
                                             ) : (
                                                  <PieChart>
                                                       <Pie
                                                            data={taskStatusData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={2}
                                                            dataKey="value"
                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                            labelLine={false}
                                                       >
                                                            {taskStatusData.map((entry, index) => (
                                                                 <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                       </Pie>
                                                       <Tooltip
                                                            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: 8 }}
                                                       />
                                                  </PieChart>
                                             )}
                                        </ResponsiveContainer>
                                   </div>
                                   {showChart === 'pie' && (
                                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                                             {taskStatusData.map((item, i) => (
                                                  <div key={i} className="flex items-center gap-1 text-xs">
                                                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                       <span className="text-text-muted">{item.name}: {item.value}</span>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>

                              {/* Quick Stats & Performance */}
                              <div className="bg-gradient-to-br from-accent to-accent-active rounded-xl p-6 text-text-inverse shadow-lg">
                                   <h3 className="text-ui font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} />
                                        Team Performance
                                   </h3>
                                   <div className="space-y-3">
                                        <div>
                                             <div className="flex justify-between text-sm mb-1">
                                                  <span>Completion Rate</span>
                                                  <span>{stats.completionRate}%</span>
                                             </div>
                                             <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                  <motion.div
                                                       initial={{ width: 0 }}
                                                       animate={{ width: `${stats.completionRate}%` }}
                                                       transition={{ duration: 1, delay: 0.5 }}
                                                       className="h-full bg-white rounded-full"
                                                  />
                                             </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                             <div>
                                                  <p className="text-xs opacity-80">Completed</p>
                                                  <p className="text-xl font-bold">{stats.completedTasks}</p>
                                             </div>
                                             <div>
                                                  <p className="text-xs opacity-80">Total Tasks</p>
                                                  <p className="text-xl font-bold">{stats.totalTasks}</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </motion.div>

                         {/* Active Projects Overview */}
                         <motion.section variants={itemVariants}>
                              <div className="flex items-center justify-between mb-4">
                                   <h2 className="text-subheading font-bold text-text-primary">Active Projects</h2>
                                   <a
                                        href="/team-lead/projects"
                                        className="text-sm text-accent hover:underline flex items-center gap-1 transition-colors"
                                   >
                                        View All <ChevronRight size={16} />
                                   </a>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {projects.slice(0, 4).map((proj, idx) => (
                                        <ProjectCard key={proj.id} project={proj} index={idx} />
                                   ))}
                              </div>
                         </motion.section>

                         {/* Main Workspace Split */}
                         <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                              {/* Task Tracking Table */}
                              <div className="xl:col-span-2 space-y-6">
                                   <div className="flex items-center justify-between">
                                        <h2 className="text-subheading font-bold text-text-primary flex items-center gap-2">
                                             Developer Task Queue
                                             <span className="text-xs font-normal px-2 py-0.5 bg-accent-muted text-accent rounded-full">
                                                  {filteredTasks.length}
                                             </span>
                                        </h2>
                                        <a
                                             href="/team-lead/tasks"
                                             className="text-xs font-medium px-3 py-1 rounded border border-border-default hover:bg-bg-subtle hover:border-accent transition-colors flex items-center gap-1"
                                        >
                                             View All
                                        </a>
                                   </div>

                                   <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                             <table className="w-full text-left border-collapse">
                                                  <thead>
                                                       <tr className="bg-bg-subtle border-b border-border-default">
                                                            <th className="p-4 text-xs font-bold text-text-muted uppercase">Task & Developer</th>
                                                            <th className="p-4 text-xs font-bold text-text-muted uppercase">Priority</th>
                                                            <th className="p-4 text-xs font-bold text-text-muted uppercase">Status</th>
                                                            <th className="p-4 text-xs font-bold text-text-muted uppercase">Internal Deadline</th>
                                                            <th className="p-4 text-xs font-bold text-text-muted uppercase text-right">Action</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-border-default">
                                                       <AnimatePresence>
                                                            {filteredTasks.slice(0, 5).map((item) => (
                                                                 <TaskRow
                                                                      key={item.id}
                                                                      task={item}
                                                                      onAssignClick={handleAssignClick}
                                                                 />
                                                            ))}
                                                       </AnimatePresence>
                                                       {filteredTasks.length === 0 && (
                                                            <tr>
                                                                 <td colSpan="5" className="p-8 text-center text-text-muted">
                                                                      No tasks found for the selected project
                                                                 </td>
                                                            </tr>
                                                       )}
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>

                                   {/* Issue Reporting CTA */}
                                   <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="bg-red-50/50 border border-red-100 rounded-xl p-6 flex items-center justify-between"
                                   >
                                        <div className="flex items-center gap-4">
                                             <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                                  <AlertCircle size={24} />
                                             </div>
                                             <div>
                                                  <h4 className="text-sm font-bold text-red-900">Blocking Issues?</h4>
                                                  <p className="text-xs text-red-700">Report delays or technical hurdles directly to the Project Manager.</p>
                                             </div>
                                        </div>
                                        <button
                                             onClick={() => setShowIssueModal(true)}
                                             className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                                        >
                                             Escalate to PM
                                        </button>
                                   </motion.div>
                              </div>

                              {/* Quality Control Sidebar */}
                              <aside className="space-y-8">
                                   {/* Approval Queue */}
                                   <motion.div
                                        variants={itemVariants}
                                        className="bg-bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden"
                                   >
                                        <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-subtle">
                                             <h3 className="text-ui font-bold text-text-primary flex items-center gap-2">
                                                  <UserCheck size={18} className="text-accent-secondary" />
                                                  Review Pipeline
                                             </h3>
                                             {pendingApprovals.length > 0 && (
                                                  <motion.span
                                                       initial={{ scale: 0 }}
                                                       animate={{ scale: 1 }}
                                                       className="text-[10px] font-bold bg-accent-secondary text-text-inverse px-1.5 py-0.5 rounded"
                                                  >
                                                       {pendingApprovals.length} NEW
                                                  </motion.span>
                                             )}
                                        </div>
                                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto chat-scroll">
                                             <AnimatePresence>
                                                  {pendingApprovals.length > 0 ? (
                                                       pendingApprovals.map(app => (
                                                            <ApprovalItem
                                                                 key={app.id}
                                                                 approval={app}
                                                                 onApprove={() => setSelectedApproval(app)}
                                                            />
                                                       ))
                                                  ) : (
                                                       <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-center py-8"
                                                       >
                                                            <CheckCircle2 size={32} className="text-text-muted mx-auto mb-3" />
                                                            <p className="text-sm text-text-muted">No pending approvals</p>
                                                       </motion.div>
                                                  )}
                                             </AnimatePresence>
                                        </div>
                                   </motion.div>

                                   {/* Internal Deadlines Tracker */}
                                   <motion.div
                                        variants={itemVariants}
                                        className="bg-bg-card rounded-xl p-6 border border-border-subtle"
                                   >
                                        <h3 className="text-ui font-bold text-text-primary mb-4 flex items-center gap-2">
                                             <Calendar size={18} className="text-accent" />
                                             Upcoming Deadlines
                                        </h3>
                                        <div className="space-y-4">
                                             {deadlines.length > 0 ? (
                                                  deadlines.map(deadline => (
                                                       <DeadlineItem key={deadline.id} deadline={deadline} />
                                                  ))
                                             ) : (
                                                  <p className="text-sm text-text-muted text-center py-4">
                                                       No upcoming deadlines this week
                                                  </p>
                                             )}
                                        </div>
                                   </motion.div>
                              </aside>
                         </motion.div>
                    </motion.div>
               </main>

               {/* Modals with animation */}
               <AnimatePresence>
                    {showTaskModal && (
                         <CreateTaskModal
                              isOpen={showTaskModal}
                              onClose={() => setShowTaskModal(false)}
                              onSubmit={createTask}
                              projects={projects}
                         />
                    )}
                    {showIssueModal && (
                         <IssueReportModal
                              isOpen={showIssueModal}
                              onClose={() => setShowIssueModal(false)}
                              onSubmit={reportIssue}
                              projects={projects}
                         />
                    )}
                    {selectedApproval && (
                         <TaskApprovalModal
                              isOpen={!!selectedApproval}
                              onClose={() => setSelectedApproval(null)}
                              onApprove={approveTask}
                              onRevision={requestRevision}
                              task={selectedApproval}
                         />
                    )}
                    {showAssignmentModal && (
                         <TaskAssignmentModal
                              isOpen={showAssignmentModal}
                              onClose={() => {
                                   setShowAssignmentModal(false);
                                   setSelectedTaskForAssignment(null);
                              }}
                              task={selectedTaskForAssignment}
                              onAssign={assignTask}
                              onUnassign={unassignTask}
                         />
                    )}
               </AnimatePresence>
          </div>
     );
};

// Enhanced Stat Card with animation
const StatCard = ({ icon, label, value, total, bgColor }) => {
     return (
          <motion.div
               whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.2)' }}
               className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm transition-all"
          >
               <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${bgColor} rounded-lg`}>
                         {icon}
                    </div>
                    <span className="text-xs font-medium text-text-muted uppercase">{label}</span>
               </div>
               <div className="flex items-end justify-between">
                    <motion.span
                         initial={{ opacity: 0, scale: 0.5 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ duration: 0.5, delay: 0.1 }}
                         className="text-2xl font-bold text-text-primary"
                    >
                         {value}
                    </motion.span>
                    {total && (
                         <span className="text-xs text-text-muted">of {total}</span>
                    )}
               </div>
          </motion.div>
     );
};

// Project Card with hover animation
const ProjectCard = ({ project, index }) => {
     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.1), 0 10px 10px -5px rgba(37, 99, 235, 0.04)' }}
               className="bg-bg-surface border border-border-default p-5 rounded-xl shadow-sm hover:border-accent transition-colors cursor-pointer"
          >
               <div className="flex justify-between items-start mb-4">
                    <div>
                         <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">{project.name}</h3>
                         <p className="text-xs text-text-muted">{project.client}</p>
                    </div>
                    <span className="text-xs font-bold text-accent px-2 py-1 bg-accent-muted rounded">
                         Deadline: {project.deadline}
                    </span>
               </div>
               <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase">
                         <span>Progress</span>
                         <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-bg-subtle rounded-full overflow-hidden border border-border-subtle">
                         <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                              className="h-full bg-accent rounded-full"
                         />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                         <span>{project.taskCount} tasks</span>
                         <span>{project.milestoneCount} milestones</span>
                    </div>
               </div>
          </motion.div>
     );
};

// Enhanced Task Row with animations
const TaskRow = ({ task, onAssignClick }) => {
     const [showActions, setShowActions] = useState(false);

     const getPriorityColor = (priority) => {
          switch (priority) {
               case 'URGENT':
               case 'HIGH': return 'bg-red-100 text-red-600 border-red-200';
               case 'MEDIUM': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
               default: return 'bg-green-100 text-green-600 border-green-200';
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'COMPLETED': return 'text-green-600 bg-green-50';
               case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
               case 'REVIEW': return 'text-yellow-600 bg-yellow-50';
               case 'BLOCKED': return 'text-red-600 bg-red-50';
               default: return 'text-gray-600 bg-gray-50';
          }
     };

     return (
          <motion.tr
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, x: -20 }}
               className="hover:bg-bg-subtle/50 transition-colors relative"
          >
               <td className="p-4">
                    <div className="flex items-start gap-3">
                         <div className="flex-1">
                              <p className="text-sm font-semibold text-text-primary">{task.task || task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                   {task.dev ? (
                                        <>
                                             <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                                                  {task.dev?.charAt(0)}
                                             </div>
                                             <p className="text-[10px] text-text-muted">{task.dev}</p>
                                        </>
                                   ) : (
                                        <span className="text-[10px] text-red-500 flex items-center gap-1">
                                             <AlertCircle size={10} />
                                             Unassigned
                                        </span>
                                   )}
                              </div>
                         </div>
                    </div>
               </td>
               <td className="p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                         {task.priority}
                    </span>
               </td>
               <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                         {task.status?.replace('_', ' ')}
                    </span>
               </td>
               <td className="p-4">
                    <div className="flex items-center gap-2">
                         <Clock size={12} className={task.isDelayed ? 'text-red-500' : 'text-text-muted'} />
                         <span className={`text-xs ${task.isDelayed ? 'text-red-600 font-bold' : 'text-text-body'}`}>
                              {task.deadline}
                         </span>
                    </div>
               </td>
               <td className="p-4 text-right relative">
                    <motion.button
                         whileTap={{ scale: 0.9 }}
                         onClick={() => setShowActions(!showActions)}
                         className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
                    >
                         <MoreVertical size={16} />
                    </motion.button>

                    <AnimatePresence>
                         {showActions && (
                              <motion.div
                                   initial={{ opacity: 0, y: -10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   exit={{ opacity: 0, y: -10 }}
                                   className="absolute right-4 top-12 mt-2 w-48 bg-bg-surface border border-border-default rounded-lg shadow-lg z-10 overflow-hidden"
                              >
                                   <button
                                        onClick={() => {
                                             onAssignClick(task);
                                             setShowActions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-bg-subtle text-sm flex items-center gap-2 transition-colors"
                                   >
                                        <UserPlus size={14} className="text-accent" />
                                        {task.dev ? 'Reassign Task' : 'Assign to Developer'}
                                   </button>
                                   {task.dev && (
                                        <button
                                             onClick={() => {
                                                  // handle unassign
                                                  setShowActions(false);
                                             }}
                                             className="w-full text-left px-4 py-2 hover:bg-bg-subtle text-sm flex items-center gap-2 text-red-500 transition-colors"
                                        >
                                             <UserMinus size={14} />
                                             Unassign
                                        </button>
                                   )}
                              </motion.div>
                         )}
                    </AnimatePresence>
               </td>
          </motion.tr>
     );
};

// Enhanced Approval Item with hover
const ApprovalItem = ({ approval, onApprove }) => (
     <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 20 }}
          whileHover={{ scale: 1.02, borderColor: 'var(--accent-secondary)' }}
          className="p-3 border border-border-subtle rounded-lg hover:border-accent-secondary transition-all group"
     >
          <div className="flex justify-between mb-2">
               <span className="text-[10px] text-text-muted font-bold uppercase">{approval.project}</span>
               <span className="text-[10px] text-text-disabled">{approval.time}</span>
          </div>
          <p className="text-xs font-bold text-text-primary mb-1">{approval.task}</p>
          <div className="flex items-center justify-between">
               <span className="text-[10px] text-text-muted italic">Dev: {approval.developer}</span>
               <motion.button
               

                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onApprove(approval)}
                    className="p-1 text-accent-secondary hover:bg-accent-secondary/10 rounded transition-colors"
                    title="Review Task"
               >
                    <CheckCircle2 size={14} />
               </motion.button>
          </div>
     </motion.div>
);

// Deadline Item with subtle animation
const DeadlineItem = ({ deadline }) => {
     const isToday = deadline.deadline.includes('Today');
     return (
          <motion.div
               whileHover={{ x: 4 }}
               className="flex items-center gap-3 group cursor-pointer"
          >
               <div className={`w-1 h-10 rounded-full transition-colors ${isToday ? 'bg-red-500' : 'bg-accent group-hover:bg-accent-hover'}`} />
               <div className="flex-1">
                    <p className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                         {deadline.title}
                    </p>
                    <p className="text-[10px] text-text-muted">
                         {deadline.project} • {deadline.developer}
                    </p>
                    <p className={`text-[10px] font-medium mt-1 ${isToday ? 'text-red-500' : 'text-accent'}`}>
                         {deadline.deadline}
                    </p>
               </div>
          </motion.div>
     );
};

export default TeamLeadDashboard;