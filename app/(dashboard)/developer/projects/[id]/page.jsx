

// app/(dashboard)/developer/projects/[id]/page.jsx
'use client';
import React, { useState } from 'react';
import {
     Calendar,
     Target,
     Wallet,
     Phone,
     Mail,
     AlertCircle,
     TrendingUp,
     CheckCircle2,
     ChevronLeft,
     Clock,
     Users,
     FileText,
     Download,
     Play,
     Pause,
     CheckCircle,
     Loader
} from 'lucide-react';
import Link from 'next/link';
import { useDeveloperProject } from '../../../../../hooks/useDeveloperProjects';
import { useRouter } from 'next/navigation';
import Spinner from "../../../../Components/common/Spinner";
import Swal from 'sweetalert2';


const ProjectDetailPage = ({ params }) => {
     const unwrappedParams = React.use(params);
     const router = useRouter();
     const { project, loading, error, activeTab, setActiveTab, refetch } =
          useDeveloperProject(unwrappedParams.id);
     const [updatingTask, setUpdatingTask] = useState(null);


     const handleTaskStatusUpdate = async (taskId, newStatus) => {
          try {
               setUpdatingTask(taskId);

               // Show loading alert
               Swal.fire({
                    title: 'Updating Task...',
                    text: 'Please wait',
                    allowOutsideClick: false,
                    didOpen: () => {
                         Swal.showLoading();
                    }
               });

               const response = await fetch(`/api/developer/tasks/${taskId}/status`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
               });

               const data = await response.json();

               // Close loading alert
               Swal.close();

               if (!response.ok) {
                    // Show error alert
                    await Swal.fire({
                         title: 'Error',
                         text: data.error || 'Failed to update task',
                         icon: 'error',
                         confirmButtonColor: '#b91c1c',
                         confirmButtonText: 'OK'
                    });
                    return;
               }

               // Show success alert based on status change
               let successMessage = '';
               let successIcon = 'success';

               switch (newStatus) {
                    case 'COMPLETED':
                         successMessage = 'Task marked as completed! Great job! 🎉';
                         break;
                    case 'IN_PROGRESS':
                         successMessage = 'Task status updated to In Progress. Keep going! 💪';
                         break;
                    case 'REVIEW':
                         successMessage = 'Task sent for review. Your team lead has been notified. 👀';
                         break;
                    case 'BLOCKED':
                         successMessage = 'Task marked as blocked. Project manager has been notified. ⚠️';
                         break;
                    case 'NOT_STARTED':
                         successMessage = 'Task status updated successfully';
                         break;
                    default:
                         successMessage = 'Task status updated successfully';
               }

               await Swal.fire({
                    title: 'Updated!',
                    text: successMessage,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                    toast: true,
                    position: 'top-end'
               });

               // Refresh project data to show updated status
               await refetch();

          } catch (error) {
               console.error('Failed to update task:', error);

               // Close any existing alert
               Swal.close();

               // Show error alert
               await Swal.fire({
                    title: 'Network Error',
                    text: 'Could not connect to server. Please check your connection.',
                    icon: 'error',
                    confirmButtonColor: '#b91c1c',
                    confirmButtonText: 'Try Again'
               });
          } finally {
               setUpdatingTask(null);
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

     if (loading) {
          return <Spinner title="Project Details..." />;
     }

     if (error || !project) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Project Not Found</h2>
                         <p className="text-text-muted mb-6">{error || 'The project you\'re looking for doesn\'t exist or you don\'t have access.'}</p>
                         <button
                              onClick={() => router.push('/developer/projects')}
                              className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Back to Projects
                         </button>
                    </div>
               </div>
          );
     }

     const daysUntilDeadline = project.deadline
          ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
          : null;

     return (
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y animate-in fade-in duration-500">
               <div className="max-w-[1400px] mx-auto space-y-6">

                    {/* Navigation & Breadcrumbs */}
                    <div className="flex items-center justify-between">
                         <Link href="/developer/projects" className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs font-bold uppercase tracking-widest group">
                              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
                         </Link>
                         <div className="flex items-center gap-2 text-xs text-text-muted">
                              <span>Project ID:</span>
                              <span className="font-mono bg-bg-subtle px-2 py-1 rounded">{project.id}</span>
                         </div>
                    </div>

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
                                        {project.taskStats?.completed || 0}/{project.taskStats?.total || 0}
                                   </div>
                                   <p className="text-[10px] text-text-muted mt-1">Completed</p>
                              </div>
                         </div>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                         {/* LEFT COLUMN: Tasks & Milestones */}
                         <div className="lg:col-span-2 space-y-6">

                              {/* Quick Metrics Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-5 flex items-center gap-4">
                                        <div className="p-3 bg-accent/10 rounded-xl">
                                             <Target className="text-accent" size={20} />
                                        </div>
                                        <div>
                                             <p className="text-[10px] font-bold text-text-disabled uppercase">My Tasks</p>
                                             <p className="text-lg font-black text-text-primary">
                                                  {project.taskStats?.completed}/{project.taskStats?.total}
                                             </p>
                                             <p className="text-[10px] text-text-muted">Completed</p>
                                        </div>
                                   </div>

                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-5 flex items-center gap-4">
                                        <div className="p-3 bg-accent-secondary/10 rounded-xl">
                                             <Wallet className="text-accent-secondary" size={20} />
                                        </div>
                                        <div>
                                             <p className="text-[10px] font-bold text-text-disabled uppercase">Budget Used</p>
                                             <p className="text-lg font-black text-text-primary">
                                                  ${project.cost?.toLocaleString() || 0}
                                             </p>
                                             <p className="text-[10px] text-text-muted">of ${project.budget?.toLocaleString() || 0}</p>
                                        </div>
                                   </div>

                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-5 flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 rounded-xl">
                                             <Calendar className="text-amber-500" size={20} />
                                        </div>
                                        <div>
                                             <p className="text-[10px] font-bold text-text-disabled uppercase">Deadline</p>
                                             <p className="text-lg font-black text-text-primary">
                                                  {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                                             </p>
                                             <p className="text-[10px] text-text-muted">
                                                  {daysUntilDeadline ? `${daysUntilDeadline} days left` : 'No deadline'}
                                             </p>
                                        </div>
                                   </div>
                              </div>

                              {/* Tabs Navigation */}
                              <div className="bg-bg-surface border border-border-default rounded-3xl overflow-hidden">
                                   <div className="flex border-b border-border-subtle px-6 bg-bg-subtle/50">
                                        <button
                                             onClick={() => setActiveTab('tasks')}
                                             className={`px-6 py-4 text-sm font-bold transition-colors relative ${activeTab === 'tasks'
                                                  ? 'text-accent'
                                                  : 'text-text-muted hover:text-text-primary'
                                                  }`}
                                        >
                                             My Tasks ({project.taskStats?.total || 0})
                                             {activeTab === 'tasks' && (
                                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                             )}
                                        </button>
                                        <button
                                             onClick={() => setActiveTab('milestones')}
                                             className={`px-6 py-4 text-sm font-bold transition-colors relative ${activeTab === 'milestones'
                                                  ? 'text-accent'
                                                  : 'text-text-muted hover:text-text-primary'
                                                  }`}
                                        >
                                             Milestones ({project.milestones?.length || 0})
                                             {activeTab === 'milestones' && (
                                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent " />
                                             )}
                                        </button>
                                        <button
                                             onClick={() => setActiveTab('documents')}
                                             className={`px-6 py-4 text-sm font-bold transition-colors relative ${activeTab === 'documents'
                                                  ? 'text-accent'
                                                  : 'text-text-muted hover:text-text-primary'
                                                  }`}
                                        >
                                             Documents ({project.documents?.length || 0})
                                             {activeTab === 'documents' && (
                                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                             )}
                                        </button>
                                   </div>

                                   {/* Tab Content */}
                                   <div className="p-6">
                                        {activeTab === 'tasks' && (
                                             <div className="space-y-4">
                                                  {project.tasks && project.tasks.length > 0 ? (
                                                       project.tasks.map(task => (
                                                            <div
                                                                 key={task.id}
                                                                 className="flex items-center justify-between p-4 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent/30 transition-all"
                                                            >
                                                                 <div className="flex items-center gap-4">
                                                                      <div className={`w-8 h-8 rounded-full ${getStatusColor(task.status)} flex items-center justify-center text-white`}>
                                                                           {getStatusIcon(task.status)}
                                                                      </div>
                                                                      <div>
                                                                           <h4 className="font-bold text-text-primary">{task.title}</h4>
                                                                           <p className="text-xs text-text-muted">
                                                                                {task.milestone?.name} • Priority: {task.priority}
                                                                           </p>
                                                                      </div>
                                                                 </div>
                                                                 <div className="flex items-center gap-3">
                                                                      {task.deadline && (
                                                                           <span className={`text-xs ${new Date(task.deadline) < new Date() && task.status !== 'COMPLETED'
                                                                                ? 'text-red-500'
                                                                                : 'text-text-muted'
                                                                                }`}>
                                                                                {new Date(task.deadline).toLocaleDateString()}
                                                                           </span>
                                                                      )}
                                                                      <select
                                                                           value={task.status}
                                                                           onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                                                                           disabled={updatingTask === task.id}
                                                                           className="px-3 py-1 bg-bg-surface border border-border-default rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-accent/20"
                                                                      >
                                                                           <option value="NOT_STARTED">Not Started</option>
                                                                           <option value="IN_PROGRESS">In Progress</option>
                                                                           <option value="REVIEW">Review</option>
                                                                           <option value="COMPLETED">Completed</option>
                                                                           <option value="BLOCKED">Blocked</option>
                                                                      </select>
                                                                 </div>
                                                            </div>
                                                       ))
                                                  ) : (
                                                       <div className="text-center py-12">
                                                            <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                                                 <CheckCircle2 size={32} className="text-text-disabled" />
                                                            </div>
                                                            <h3 className="font-bold text-text-primary mb-2">No tasks assigned</h3>
                                                            <p className="text-xs text-text-muted">You don't have any tasks in this project yet.</p>
                                                       </div>
                                                  )}
                                             </div>
                                        )}

                                        {activeTab === 'milestones' && (
                                             <div className="space-y-4">
                                                  {project.milestones && project.milestones.length > 0 ? (
                                                       project.milestones.map(milestone => (
                                                            <div
                                                                 key={milestone.id}
                                                                 className="p-4 bg-bg-subtle/30 rounded-xl border border-border-default"
                                                            >
                                                                 <div className="flex items-center justify-between mb-3">
                                                                      <div>
                                                                           <h4 className="font-bold text-text-primary">{milestone.name}</h4>
                                                                           <p className="text-xs text-text-muted">{milestone.description}</p>
                                                                      </div>
                                                                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${milestone.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                                           milestone.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                                                                'bg-yellow-500/10 text-yellow-500'
                                                                           }`}>
                                                                           {milestone.status}
                                                                      </span>
                                                                 </div>
                                                                 <div className="space-y-2">
                                                                      <div className="flex justify-between text-xs">
                                                                           <span className="text-text-muted">Your progress</span>
                                                                           <span className="font-bold text-text-primary  ">{milestone.progress?.toFixed(0)}%</span>
                                                                      </div>
                                                                      <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden  border border-accent/80">
                                                                           <div
                                                                                className="h-full bg-accent transition-all"
                                                                                style={{ width: `${milestone.progress || 0}%` }}
                                                                           />
                                                                      </div>
                                                                      <div className="flex justify-between text-xs text-text-muted">
                                                                           <span>Tasks: {milestone.completedByMe || 0}/{milestone.assignedToMe || 0}</span>
                                                                           {milestone.deadline && (
                                                                                <span>Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                                                                           )}
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       ))
                                                  ) : (
                                                       <div className="text-center py-12">
                                                            <p className="text-text-muted">No milestones found</p>
                                                       </div>
                                                  )}
                                             </div>
                                        )}

                                        {activeTab === 'documents' && (
                                             <div className="space-y-4">
                                                  {project.documents && project.documents.length > 0 ? (
                                                       project.documents.map(doc => (
                                                            <div
                                                                 key={doc.id}
                                                                 className="flex items-center justify-between p-4 bg-bg-subtle/30 rounded-xl border border-border-default"
                                                            >
                                                                 <div className="flex items-center gap-3">
                                                                      <FileText size={20} className="text-accent" />
                                                                      <div>
                                                                           <p className="font-bold text-text-primary">{doc.name}</p>
                                                                           <p className="text-xs text-text-muted">
                                                                                {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(1)} KB
                                                                           </p>
                                                                      </div>
                                                                 </div>
                                                                 <a
                                                                      href={doc.url}
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                      className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
                                                                 >
                                                                      <Download size={16} className="text-text-muted" />
                                                                 </a>
                                                            </div>
                                                       ))
                                                  ) : (
                                                       <div className="text-center py-12">
                                                            <p className="text-text-muted">No documents available</p>
                                                       </div>
                                                  )}
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

                              {/* Team Assigned */}
                              <div className="bg-bg-surface border border-border-default rounded-3xl p-6 space-y-6 shadow-sm">
                                   <h3 className="text-xs font-black text-text-primary uppercase tracking-widest border-b border-border-subtle pb-4">
                                        Project Stakeholders
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
                                   </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="bg-gradient-to-br from-accent to-accent-active rounded-3xl p-6 text-text-inverse shadow-xl shadow-accent/20">
                                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Project Health</p>
                                   <p className="text-sm leading-relaxed mb-6 font-medium">
                                        This project is currently
                                        <span className="underline decoration-accent-secondary underline-offset-4 mx-1">
                                             {project.riskLevel === 'LOW' ? 'on track' :
                                                  project.riskLevel === 'MEDIUM' ? 'at risk' : 'critical'}
                                        </span>
                                        based on current velocity.
                                   </p>
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
          </div>
     );
};

export default ProjectDetailPage;