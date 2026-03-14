// app/(dashboard)/team-lead/projects/[id]/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import {
     Calendar,
     Users,
     Target,
     FileText,
     Clock,
     Wallet,
     Phone,
     Mail,
     AlertCircle,
     TrendingUp,
     CheckCircle2,
     ChevronLeft,
     Plus,
     UserPlus,
     CheckCircle,
     Loader,
     Play,
     Pause
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTeamLeadTasks } from '../../../../../hooks/useTeamLeadTasks';
import CreateTaskModal from '../../../../Components/team-lead/CreateTaskModal';
import AssignDeveloperModal from '../../../../Components/team-lead/AssignDeveloperModal';
import Spinner from '../../../../Components/common/Spinner';

const ProjectDetailPage = ({ params }) => {
     const router = useRouter();
     // Unwrap params properly
     const unwrappedParams = React.use(params);
     const projectId = unwrappedParams.id;

     const [project, setProject] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [activeTab, setActiveTab] = useState('tasks');
     const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
     const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
     const [selectedTask, setSelectedTask] = useState(null);

     const { tasks, fetchTasks, createTask, assignTask, approveTask } = useTeamLeadTasks(projectId);

     useEffect(() => {
          if (projectId) {
               fetchProject();
          }
     }, [projectId]);

     useEffect(() => {
          if (projectId) {
               fetchTasks();
          }
     }, [projectId, fetchTasks]);

     const fetchProject = async () => {
          try {
               setLoading(true);
               setError(null);

               const response = await fetch(`/api/team-lead/projects/${projectId}`);

               // Check if response is OK before trying to parse JSON
               if (!response.ok) {
                    // Try to get error message from response
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                         const errorData = await response.json();
                         throw new Error(errorData.error || 'Failed to fetch project');
                    } else {
                         // If not JSON, it might be an HTML error page
                         const text = await response.text();
                         console.error('Non-JSON response:', text.substring(0, 200));
                         throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }
               }

               const data = await response.json();

               if (!data.project) {
                    throw new Error('Project data not found in response');
               }

               setProject(data.project);
          } catch (err) {
               console.error('Error fetching project:', err);
               setError(err.message);

               // Handle specific error cases
               if (err.message.includes('401')) {
                    router.push('/auth/login');
               }
          } finally {
               setLoading(false);
          }
     };

     const getStatusIcon = (status) => {
          switch (status) {
               case 'NOT_STARTED': return <Play size={14} />;
               case 'IN_PROGRESS': return <Loader size={14} />;
               case 'REVIEW': return <Clock size={14} />;
               case 'COMPLETED': return <CheckCircle size={14} />;
               case 'BLOCKED': return <Pause size={14} />;
               default: return null;
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'NOT_STARTED': return 'bg-slate-500';
               case 'IN_PROGRESS': return 'bg-blue-500';
               case 'REVIEW': return 'bg-yellow-500';
               case 'COMPLETED': return 'bg-green-500';
               case 'BLOCKED': return 'bg-red-500';
               default: return 'bg-slate-500';
          }
     };

     const handleAssignClick = (task) => {
          setSelectedTask(task);
          setIsAssignModalOpen(true);
     };

     const handleAssign = async (developerId) => {
          if (selectedTask) {
               try {
                    await assignTask(selectedTask.id, developerId);
                    setIsAssignModalOpen(false);
                    setSelectedTask(null);
                    // Refresh tasks to show updated assignment
                    await fetchTasks();
               } catch (error) {
                    console.error('Failed to assign task:', error);
                    // Show error to user (you might want to add a toast notification here)
               }
          }
     };

     const handleApprove = async (taskId) => {
          try {
               await approveTask(taskId);
               // Refresh tasks to show updated status
               await fetchTasks();
          } catch (error) {
               console.error('Failed to approve task:', error);
               // Show error to user
          }
     };

     if (loading) {
          return <Spinner title="Project Details..." />;
     }

     if (error || !project) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Error Loading Project</h2>
                         <p className="text-text-muted mb-6">{error || 'The project you\'re looking for doesn\'t exist or you don\'t have access.'}</p>
                         <div className="space-y-3">
                              <button
                                   onClick={() => fetchProject()}
                                   className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all w-full"
                              >
                                   Try Again
                              </button>
                              <button
                                   onClick={() => router.push('/team-lead/projects')}
                                   className="bg-bg-surface text-text-primary px-6 py-3 rounded-xl font-bold hover:bg-bg-subtle transition-all w-full border border-border-default"
                              >
                                   Back to Projects
                              </button>
                         </div>
                    </div>
               </div>
          );
     }

     const daysUntilDeadline = project.deadline
          ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
          : null;

     const taskStats = {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'COMPLETED').length,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          review: tasks.filter(t => t.status === 'REVIEW').length,
          blocked: tasks.filter(t => t.status === 'BLOCKED').length
     };

     return (
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y animate-in fade-in duration-500">
               <div className="max-w-[1400px] mx-auto space-y-6">

                    {/* Navigation & Breadcrumbs */}
                    <Link href="/team-lead/projects" className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs font-bold uppercase tracking-widest group">
                         <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
                    </Link>

                    {/* Project Hero Header */}
                    <div className="bg-bg-surface border border-border-default rounded-3xl p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
                         <div className="space-y-4 max-w-2xl">
                              <div className="flex flex-wrap items-center gap-3">
                                   <span className="px-3 py-1 bg-accent-muted text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/10">
                                        {project.status?.replace('_', ' ')}
                                   </span>
                                   {project.isDelayed && (
                                        <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                             <AlertCircle size={12} /> Delayed
                                        </span>
                                   )}
                                   {daysUntilDeadline && daysUntilDeadline <= 7 && !project.isDelayed && (
                                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                             {daysUntilDeadline} days left
                                        </span>
                                   )}
                              </div>
                              <h1 className="text-4xl font-black text-text-primary leading-tight">{project.name}</h1>
                              <p className="text-text-body text-sm leading-relaxed">{project.description}</p>
                         </div>

                         {/* Quick Stats */}
                         <div className="flex items-center gap-8 px-8 lg:border-l border-border-subtle">
                              <div className="text-center">
                                   <p className="text-[10px] font-black text-text-disabled uppercase tracking-widest mb-1">Progress</p>
                                   <div className="text-3xl font-black text-accent">{project.progress}%</div>
                                   <div className="h-1.5 w-24 bg-bg-subtle rounded-full mt-2 overflow-hidden">
                                        <div
                                             className="h-full bg-accent transition-all duration-500"
                                             style={{ width: `${project.progress}%` }}
                                        />
                                   </div>
                              </div>
                              <div className="text-center">
                                   <p className="text-[10px] font-black text-text-disabled uppercase tracking-widest mb-1">Tasks</p>
                                   <div className="text-2xl font-black text-text-primary">
                                        {taskStats.completed}/{taskStats.total}
                                   </div>
                                   <p className="text-[10px] text-text-muted mt-1">Completed</p>
                              </div>
                         </div>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                         {/* LEFT COLUMN: Tasks */}
                         <div className="lg:col-span-2 space-y-6">

                              {/* Quick Metrics Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-text-disabled uppercase">Total Tasks</p>
                                        <p className="text-2xl font-black text-text-primary">{taskStats.total}</p>
                                   </div>
                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-text-disabled uppercase">In Progress</p>
                                        <p className="text-2xl font-black text-blue-500">{taskStats.inProgress}</p>
                                   </div>
                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-text-disabled uppercase">Review</p>
                                        <p className="text-2xl font-black text-yellow-500">{taskStats.review}</p>
                                   </div>
                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-text-disabled uppercase">Blocked</p>
                                        <p className="text-2xl font-black text-red-500">{taskStats.blocked}</p>
                                   </div>
                              </div>

                              {/* Tasks Header with Create Button */}
                              <div className="flex items-center justify-between">
                                   <h2 className="text-lg font-bold text-text-primary">Project Tasks</h2>
                                   <button
                                        onClick={() => setIsCreateTaskModalOpen(true)}
                                        className="flex items-center gap-2 bg-accent text-text-inverse px-4 py-2 rounded-xl text-sm font-bold hover:bg-accent-hover transition-all"
                                   >
                                        <Plus size={16} />
                                        Create Task
                                   </button>
                              </div>

                              {/* Tasks List */}
                              <div className="bg-bg-surface border border-border-default rounded-3xl overflow-hidden">
                                   <div className="p-6">
                                        {tasks.length > 0 ? (
                                             <div className="space-y-3">
                                                  {tasks.map(task => (
                                                       <div
                                                            key={task.id}
                                                            className="flex items-center justify-between p-4 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent/30 transition-all"
                                                       >
                                                            <div className="flex items-center gap-4 flex-1">
                                                                 <div className={`w-8 h-8 rounded-full ${getStatusColor(task.status)} flex items-center justify-center text-white`}>
                                                                      {getStatusIcon(task.status)}
                                                                 </div>
                                                                 <div className="flex-1">
                                                                      <div className="flex items-center gap-3">
                                                                           <h4 className="font-bold text-text-primary">{task.title}</h4>
                                                                           {task.priority && (
                                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                                                                                     task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                                                                                          task.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                                               'bg-green-500/10 text-green-500'
                                                                                     }`}>
                                                                                     {task.priority}
                                                                                </span>
                                                                           )}
                                                                      </div>
                                                                      <div className="flex items-center gap-4 mt-1 text-xs">
                                                                           {task.assignee ? (
                                                                                <span className="text-text-muted">
                                                                                     Assigned to: <span className="font-medium text-text-primary">{task.assignee.name}</span>
                                                                                </span>
                                                                           ) : (
                                                                                <span className="text-orange-500">Unassigned</span>
                                                                           )}
                                                                           {task.deadline && (
                                                                                <span className={`flex items-center gap-1 ${new Date(task.deadline) < new Date() && task.status !== 'COMPLETED'
                                                                                     ? 'text-red-500'
                                                                                     : 'text-text-muted'
                                                                                     }`}>
                                                                                     <Calendar size={12} />
                                                                                     {new Date(task.deadline).toLocaleDateString()}
                                                                                </span>
                                                                           )}
                                                                           {task.milestone && (
                                                                                <span className="text-text-muted">
                                                                                     Milestone: {task.milestone.name}
                                                                                </span>
                                                                           )}
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                 {!task.assignee && (
                                                                      <button
                                                                           onClick={() => handleAssignClick(task)}
                                                                           className="p-2 hover:bg-bg-surface rounded-lg transition-colors text-accent"
                                                                           title="Assign Developer"
                                                                      >
                                                                           <UserPlus size={16} />
                                                                      </button>
                                                                 )}
                                                                 {task.status === 'REVIEW' && (
                                                                      <button
                                                                           onClick={() => handleApprove(task.id)}
                                                                           className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                                                                      >
                                                                           Approve
                                                                      </button>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <div className="text-center py-12">
                                                  <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                                       <Target size={32} className="text-text-disabled" />
                                                  </div>
                                                  <h3 className="font-bold text-text-primary mb-2">No tasks yet</h3>
                                                  <p className="text-xs text-text-muted mb-4">Break down this project into manageable tasks.</p>
                                                  <button
                                                       onClick={() => setIsCreateTaskModalOpen(true)}
                                                       className="bg-accent text-text-inverse px-6 py-2 rounded-xl text-xs font-bold hover:bg-accent-hover transition-all"
                                                  >
                                                       Create First Task
                                                  </button>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {/* RIGHT COLUMN: Team & Client Info */}
                         <aside className="space-y-6">

                              {/* Client Card */}
                              <div className="bg-bg-surface border border-border-default rounded-3xl p-6 space-y-6 shadow-sm">
                                   <h3 className="text-xs font-black text-text-primary uppercase tracking-widest border-b border-border-subtle pb-4">
                                        Client Information
                                   </h3>
                                   <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-accent-secondary flex items-center justify-center text-text-inverse font-black text-lg">
                                             {project.clientName?.charAt(0)}
                                        </div>
                                        <div>
                                             <p className="font-bold text-text-primary">{project.clientName}</p>
                                             <p className="text-xs text-text-muted">{project.clientCompany || "Independent Client"}</p>
                                        </div>
                                   </div>

                                   <div className="space-y-3 pt-2">
                                        <a href={`mailto:${project.clientEmail}`} className="flex items-center gap-3 text-sm text-text-body hover:text-accent transition-colors">
                                             <div className="p-2 bg-bg-subtle rounded-lg"><Mail size={14} /></div>
                                             {project.clientEmail}
                                        </a>
                                        <div className="flex items-center gap-3 text-sm text-text-body">
                                             <div className="p-2 bg-bg-subtle rounded-lg"><Phone size={14} /></div>
                                             {project.clientPhone || "No phone listed"}
                                        </div>
                                   </div>
                              </div>

                              {/* Team */}
                              <div className="bg-bg-surface border border-border-default rounded-3xl p-6 space-y-6 shadow-sm">
                                   <h3 className="text-xs font-black text-text-primary uppercase tracking-widest border-b border-border-subtle pb-4">
                                        Team
                                   </h3>

                                   <div className="space-y-4">
                                        {project.manager && (
                                             <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-3">
                                                       <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-text-inverse">
                                                            PM
                                                       </div>
                                                       <div>
                                                            <p className="text-xs font-bold text-text-primary">Project Manager</p>
                                                            <p className="text-[10px] text-text-muted">{project.manager.name}</p>
                                                       </div>
                                                  </div>
                                                  <CheckCircle2 size={16} className="text-accent-secondary" />
                                             </div>
                                        )}

                                        {project.teamLead && (
                                             <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-3">
                                                       <div className="h-8 w-8 rounded-full bg-accent-secondary flex items-center justify-center text-[10px] font-bold text-text-inverse">
                                                            TL
                                                       </div>
                                                       <div>
                                                            <p className="text-xs font-bold text-text-primary">Team Lead</p>
                                                            <p className="text-[10px] text-text-muted">{project.teamLead.name}</p>
                                                       </div>
                                                  </div>
                                                  <CheckCircle2 size={16} className="text-accent-secondary" />
                                             </div>
                                        )}

                                        {/* Developer Count */}
                                        {taskStats.total > 0 && (
                                             <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
                                                  <div className="p-2 bg-bg-subtle rounded-lg">
                                                       <Users size={14} className="text-text-muted" />
                                                  </div>
                                                  <div>
                                                       <p className="text-xs font-bold text-text-primary">Assigned Developers</p>
                                                       <p className="text-[10px] text-text-muted">
                                                            {new Set(tasks.map(t => t.assigneeId).filter(Boolean)).size} developers working
                                                       </p>
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              </div>

                              {/* Quick Stats */}
                              <div className="bg-gradient-to-br from-accent to-accent-active rounded-3xl p-6 text-text-inverse shadow-xl shadow-accent/20">
                                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Sprint Health</p>
                                   <div className="space-y-3 mb-6">
                                        <div>
                                             <div className="flex justify-between text-xs mb-1">
                                                  <span>Completion Rate</span>
                                                  <span>{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%</span>
                                             </div>
                                             <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                  <div
                                                       className="h-full bg-white rounded-full"
                                                       style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                                                  />
                                             </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                             <div>
                                                  <p className="opacity-80">In Review</p>
                                                  <p className="font-bold text-lg">{taskStats.review}</p>
                                             </div>
                                             <div>
                                                  <p className="opacity-80">Blocked</p>
                                                  <p className="font-bold text-lg">{taskStats.blocked}</p>
                                             </div>
                                        </div>
                                   </div>
                                   <button
                                        onClick={() => window.print()}
                                        className="w-full bg-white text-accent font-black py-3 rounded-xl text-xs hover:bg-bg-subtle transition-all active:scale-95"
                                   >
                                        Generate Report
                                   </button>
                              </div>
                         </aside>
                    </div>
               </div>

               {/* Modals */}
               <CreateTaskModal
                    isOpen={isCreateTaskModalOpen}
                    onClose={() => setIsCreateTaskModalOpen(false)}
                    onSubmit={createTask}
                    projectId={projectId}  // Changed from params.id
               />

               <AssignDeveloperModal
                    isOpen={isAssignModalOpen}
                    onClose={() => {
                         setIsAssignModalOpen(false);
                         setSelectedTask(null);
                    }}
                    onAssign={handleAssign}
                    task={selectedTask}
               />
          </div>
     );
};

export default ProjectDetailPage;