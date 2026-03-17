
'use client';
import React, { useState, useEffect } from 'react';
import {
     X,
     Mail,
     Phone,
     Calendar,
     Clock,
     CheckCircle,
     AlertTriangle,
     Briefcase,
     MapPin,
     Award,
     MoreVertical,
     ChevronRight,
     User,
     Flag,
     Star,
     ExternalLink,
     UserMinus,
     AlertCircle,
     Loader
} from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

const DeveloperDetailsModal = ({ isOpen, onClose, developer, onDeactivate }) => {
     const [activeTab, setActiveTab] = useState('tasks');
     const [loading, setLoading] = useState(false);
     const [developerTasks, setDeveloperTasks] = useState([]);
     const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

     useEffect(() => {
          if (isOpen && developer?.id) {
               fetchDeveloperTasks();
          }
     }, [isOpen, developer]);

     const fetchDeveloperTasks = async () => {
          setLoading(true);
          try {
               const response = await fetch(`/api/team-lead/developers/${developer.id}/tasks`);
               if (response.ok) {
                    const data = await response.json();
                    setDeveloperTasks(data.tasks || []);
               }
          } catch (error) {
               console.error('Failed to fetch developer tasks:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleDeactivate = async () => {
          const result = await Swal.fire({
               title: 'Deactivate Developer?',
               html: `
                    <div class="text-left space-y-3">
                         <p class="text-sm text-gray-600">Are you sure you want to deactivate <strong>${developer?.name}</strong>?</p>
                         <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                              <p class="font-medium mb-1">This will:</p>
                              <ul class="list-disc pl-4 space-y-1">
                                   <li>Prevent them from accessing the system</li>
                                   <li>Reassign their active tasks to unassigned</li>
                                   <li>Notify the Project Manager</li>
                              </ul>
                         </div>
                    </div>
               `,
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#ef4444',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, deactivate',
               cancelButtonText: 'Cancel'
          });

          if (result.isConfirmed) {
               setLoading(true);
               try {
                    await onDeactivate(developer.id);
                    Swal.fire({
                         title: 'Deactivated!',
                         text: 'Developer has been deactivated successfully.',
                         icon: 'success',
                         timer: 2000,
                         showConfirmButton: false
                    });
                    onClose();
               } catch (error) {
                    Swal.fire({
                         title: 'Error',
                         text: error.message || 'Failed to deactivate developer',
                         icon: 'error',
                         confirmButtonColor: '#b91c1c'
                    });
               } finally {
                    setLoading(false);
               }
          }
     };

     if (!isOpen || !developer) return null;

     const getPriorityColor = (priority) => {
          switch (priority) {
               case 'URGENT': return 'bg-red-500/10 text-red-500';
               case 'HIGH': return 'bg-orange-500/10 text-orange-500';
               case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500';
               default: return 'bg-green-500/10 text-green-500';
          }
     };

     const getStatusIcon = (status) => {
          switch (status) {
               case 'COMPLETED': return <CheckCircle size={14} className="text-green-500" />;
               case 'IN_PROGRESS': return <Loader size={14} className="text-blue-500 animate-spin" />;
               case 'REVIEW': return <Clock size={14} className="text-yellow-500" />;
               case 'BLOCKED': return <AlertTriangle size={14} className="text-red-500" />;
               default: return <Clock size={14} className="text-gray-400" />;
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in">
               <div className="bg-bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                              <button
                                   onClick={onClose}
                                   className="p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                              >
                                   <X size={20} />
                              </button>
                              <div>
                                   <h2 className="text-xl font-bold text-text-primary">Developer Details</h2>
                                   <p className="text-sm text-text-muted">View tasks and manage developer</p>
                              </div>
                         </div>
                         <div className="relative">
                              <button
                                   onClick={() => setShowDeactivateConfirm(!showDeactivateConfirm)}
                                   className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                   title="Deactivate Developer"
                              >
                                   <UserMinus size={20} />
                              </button>

                              {showDeactivateConfirm && (
                                   <div className="absolute right-0 top-12 w-64 bg-bg-surface border border-border-default rounded-xl shadow-xl p-4 z-10">
                                        <p className="text-sm text-text-primary font-medium mb-3">
                                             Deactivate {developer.name}?
                                        </p>
                                        <div className="flex gap-2">
                                             <button
                                                  onClick={handleDeactivate}
                                                  disabled={loading}
                                                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                             >
                                                  {loading ? '...' : 'Confirm'}
                                             </button>
                                             <button
                                                  onClick={() => setShowDeactivateConfirm(false)}
                                                  className="flex-1 px-3 py-2 border border-border-default rounded-lg text-xs font-bold hover:bg-bg-subtle transition-colors"
                                             >
                                                  Cancel
                                             </button>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Developer Profile Summary */}
                    <div className="p-6 border-b border-border-default bg-gradient-to-r from-accent/5 to-accent-secondary/5">
                         <div className="flex items-start gap-6">
                              <div className="relative">
                                   <div className="w-20 h-20 rounded-2xl bg-accent-muted flex items-center justify-center text-accent font-bold text-3xl overflow-hidden border-2 border-accent/20">
                                        {developer.avatar ? (
                                             <img src={developer.avatar} alt={developer.name} className="w-full h-full object-cover" />
                                        ) : (
                                             <span>{developer.name?.charAt(0)}</span>
                                        )}
                                   </div>
                                   <span
                                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-bg-surface ${developer.status === 'ACTIVE' ? 'bg-green-500' :
                                             developer.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-400'
                                             }`}
                                   />
                              </div>

                              <div className="flex-1">
                                   <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-text-primary">{developer.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${developer.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                                             developer.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                  'bg-gray-500/10 text-gray-500'
                                             }`}>
                                             {developer.status}
                                        </span>
                                   </div>

                                   <p className="text-text-muted mb-3">{developer.jobTitle}</p>

                                   <div className="flex flex-wrap gap-4">
                                        {developer.email && (
                                             <div className="flex items-center gap-2 text-sm text-text-body">
                                                  <Mail size={16} className="text-text-muted" />
                                                  <a href={`mailto:${developer.email}`} className="hover:text-accent">
                                                       {developer.email}
                                                  </a>
                                             </div>
                                        )}
                                        {developer.phone && (
                                             <div className="flex items-center gap-2 text-sm text-text-body">
                                                  <Phone size={16} className="text-text-muted" />
                                                  <span>{developer.phone}</span>
                                             </div>
                                        )}
                                        {developer.department && (
                                             <div className="flex items-center gap-2 text-sm text-text-body">
                                                  <Briefcase size={16} className="text-text-muted" />
                                                  <span>{developer.department}</span>
                                             </div>
                                        )}
                                   </div>
                              </div>

                              {/* Quick Stats */}
                              <div className="grid grid-cols-3 gap-3 bg-bg-surface/50 rounded-xl p-3">
                                   <div className="text-center">
                                        <p className="text-2xl font-bold text-green-500">{developer.stats?.completed || 0}</p>
                                        <p className="text-[10px] text-text-muted">Completed</p>
                                   </div>
                                   <div className="text-center px-3 border-x border-border-subtle">
                                        <p className="text-2xl font-bold text-accent">{developer.stats?.ongoing || 0}</p>
                                        <p className="text-[10px] text-text-muted">In Progress</p>
                                   </div>
                                   <div className="text-center">
                                        <p className="text-2xl font-bold text-red-500">{developer.stats?.overdue || 0}</p>
                                        <p className="text-[10px] text-text-muted">Overdue</p>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-border-default px-6">
                         <div className="flex gap-6">
                              <button
                                   onClick={() => setActiveTab('tasks')}
                                   className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tasks'
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-text-muted hover:text-text-primary'
                                        }`}
                              >
                                   Tasks ({developerTasks.length})
                              </button>
                              <button
                                   onClick={() => setActiveTab('details')}
                                   className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-text-muted hover:text-text-primary'
                                        }`}
                              >
                                   Details & Stats
                              </button>
                              <button
                                   onClick={() => setActiveTab('activity')}
                                   className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity'
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-text-muted hover:text-text-primary'
                                        }`}
                              >
                                   Activity Log
                              </button>
                         </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 overflow-y-auto chat-scroll" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                         {/* Tasks Tab */}
                         {activeTab === 'tasks' && (
                              <div className="space-y-4">
                                   <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-text-primary">Assigned Tasks</h3>
                                        <select className="text-xs px-3 py-1.5 bg-bg-subtle border border-border-default rounded-lg">
                                             <option>All Tasks</option>
                                             <option>In Progress</option>
                                             <option>Completed</option>
                                             <option>Overdue</option>
                                        </select>
                                   </div>

                                   {loading ? (
                                        <div className="text-center py-12">
                                             <Loader size={32} className="animate-spin text-accent mx-auto mb-4" />
                                             <p className="text-text-muted">Loading tasks...</p>
                                        </div>
                                   ) : developerTasks.length === 0 ? (
                                        <div className="text-center py-12 bg-bg-subtle/30 rounded-xl">
                                             <CheckCircle size={32} className="text-text-muted mx-auto mb-3" />
                                             <p className="text-text-muted">No tasks assigned to this developer</p>
                                        </div>
                                   ) : (
                                        <div className="space-y-3">
                                             {developerTasks.map(task => (
                                                  <Link
                                                       key={task.id}
                                                       href={`/team-lead/tasks/${task.id}`}
                                                       target="_blank"
                                                       className="block p-4 bg-bg-subtle/30 border border-border-default rounded-xl hover:border-accent/30 hover:bg-bg-subtle/50 transition-all group"
                                                  >
                                                       <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                 <div className="flex items-center gap-3 mb-2">
                                                                      {getStatusIcon(task.status)}
                                                                      <h4 className="font-bold text-text-primary group-hover:text-accent">
                                                                           {task.title}
                                                                      </h4>
                                                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPriorityColor(task.priority)}`}>
                                                                           {task.priority}
                                                                      </span>
                                                                 </div>

                                                                 <div className="flex items-center gap-4 text-xs text-text-muted">
                                                                      <span className="flex items-center gap-1">
                                                                           <Briefcase size={12} />
                                                                           {task.project?.name}
                                                                      </span>
                                                                      {task.milestone && (
                                                                           <span className="flex items-center gap-1">
                                                                                <Flag size={12} />
                                                                                {task.milestone.name}
                                                                           </span>
                                                                      )}
                                                                      {task.deadline && (
                                                                           <span className={`flex items-center gap-1 ${new Date(task.deadline) < new Date() && task.status !== 'COMPLETED'
                                                                                ? 'text-red-500'
                                                                                : ''
                                                                                }`}>
                                                                                <Calendar size={12} />
                                                                                Due: {new Date(task.deadline).toLocaleDateString()}
                                                                           </span>
                                                                      )}
                                                                 </div>
                                                            </div>
                                                            <ExternalLink size={16} className="text-text-disabled group-hover:text-accent" />
                                                       </div>
                                                  </Link>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         )}

                         {/* Details Tab */}
                         {activeTab === 'details' && (
                              <div className="space-y-6">
                                   {/* Skills */}
                                   {developer.skills && developer.skills.length > 0 && (
                                        <div>
                                             <h3 className="text-xs font-bold text-text-muted uppercase mb-3">Skills & Expertise</h3>
                                             <div className="flex flex-wrap gap-2">
                                                  {developer.skills.map((skill, i) => (
                                                       <span
                                                            key={i}
                                                            className="px-3 py-1.5 bg-accent-muted/30 text-accent rounded-lg text-xs font-medium border border-accent/10"
                                                       >
                                                            {skill}
                                                       </span>
                                                  ))}
                                             </div>
                                        </div>
                                   )}

                                   {/* Workload Distribution */}
                                   <div>
                                        <h3 className="text-xs font-bold text-text-muted uppercase mb-3">Workload Distribution</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div className="p-4 bg-bg-subtle/30 rounded-xl">
                                                  <p className="text-2xl font-bold text-accent">{developer.stats?.ongoing || 0}</p>
                                                  <p className="text-xs text-text-muted">Active Tasks</p>
                                             </div>
                                             <div className="p-4 bg-bg-subtle/30 rounded-xl">
                                                  <p className="text-2xl font-bold text-green-500">{developer.stats?.completed || 0}</p>
                                                  <p className="text-xs text-text-muted">Completed Tasks</p>
                                             </div>
                                             <div className="p-4 bg-bg-subtle/30 rounded-xl">
                                                  <p className="text-2xl font-bold text-yellow-500">{developer.stats?.ongoing || 0}</p>
                                                  <p className="text-xs text-text-muted">In Review</p>
                                             </div>
                                             <div className="p-4 bg-bg-subtle/30 rounded-xl">
                                                  <p className="text-2xl font-bold text-red-500">{developer.stats?.overdue || 0}</p>
                                                  <p className="text-xs text-text-muted">Overdue</p>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Performance Metrics */}
                                   <div>
                                        <h3 className="text-xs font-bold text-text-muted uppercase mb-3">Performance Metrics</h3>
                                        <div className="space-y-3">
                                             <div>
                                                  <div className="flex justify-between text-sm mb-1">
                                                       <span>Task Completion Rate</span>
                                                       <span className="font-bold">
                                                            {Math.round((developer.stats?.completed / (developer.stats?.completed + developer.stats?.ongoing)) * 100) || 0}%
                                                       </span>
                                                  </div>
                                                  <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
                                                       <div
                                                            className="h-full bg-green-500"
                                                            style={{ width: `${Math.round((developer.stats?.completed / (developer.stats?.completed + developer.stats?.ongoing)) * 100) || 0}%` }}
                                                       />
                                                  </div>
                                             </div>
                                             <div>
                                                  <div className="flex justify-between text-sm mb-1">
                                                       <span>On-Time Delivery</span>
                                                       <span className="font-bold">
                                                            {Math.round(((developer.stats?.completed - developer.stats?.overdue) / developer.stats?.completed) * 100) || 0}%
                                                       </span>
                                                  </div>
                                                  <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
                                                       <div
                                                            className="h-full bg-accent"
                                                            style={{ width: `${Math.round(((developer.stats?.completed - developer.stats?.overdue) / developer.stats?.completed) * 100) || 0}%` }}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {/* Activity Tab */}
                         {activeTab === 'activity' && (
                              <div className="space-y-4">
                                   <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
                                   <div className="space-y-3">
                                        <div className="text-center py-12 bg-bg-subtle/30 rounded-xl">
                                             <Clock size={32} className="text-text-muted mx-auto mb-3" />
                                             <p className="text-text-muted">Activity log coming soon</p>
                                        </div>
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
};

export default DeveloperDetailsModal;