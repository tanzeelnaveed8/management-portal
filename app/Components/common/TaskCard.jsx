

// components/dashboard/TaskCard.jsx
'use client';
import React from 'react';
import Link from 'next/link';
import {
     Clock,
     AlertCircle,
     MessageSquare,
     Paperclip,
     ChevronRight,
     CheckCircle2,
     Play,
     Pause,
     Loader
} from 'lucide-react';

const TaskCard = ({ role, task }) => {
     const getPriorityColor = (priority) => {
          switch (priority) {
               case 'URGENT': return 'text-red-500 bg-red-500/10';
               case 'HIGH': return 'text-orange-500 bg-orange-500/10';
               case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
               case 'LOW': return 'text-green-500 bg-green-500/10';
               default: return 'text-text-muted bg-bg-subtle';
          }
     };

     const getStatusIcon = (status) => {
          switch (status) {
               case 'NOT_STARTED': return <Play size={14} />;
               case 'IN_PROGRESS': return <Loader size={14} />;
               case 'REVIEW': return <Clock size={14} />;
               case 'COMPLETED': return <CheckCircle2 size={14} />;
               case 'BLOCKED': return <Pause size={14} />;
               default: return null;
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

     const formatDate = (dateString) => {
          if (!dateString) return 'No deadline';
          const date = new Date(dateString);
          const today = new Date();
          const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) return 'Overdue';
          if (diffDays === 0) return 'Today';
          if (diffDays === 1) return 'Tomorrow';
          if (diffDays <= 7) return `${diffDays} days left`;
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
     };

     const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

     return (
          <Link href={`/${role}/tasks/${task.id}`}>
               <div className="group h-[18rem] bg-bg-surface border border-border-default rounded-xl p-5 hover:shadow-xl hover:border-accent/30 transition-all cursor-pointer">
                    <div className="space-y-4">
                         {/* Header with Priority */}
                         <div className="flex items-start justify-between">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                                   {task.priority}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                         </div>

                         {/* Title & Project */}
                         <div>
                              <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                                   {task.title}
                              </h3>
                              <p className="text-xs text-text-muted mt-1">
                                   {task.project?.name}
                              </p>
                         </div>

                         {/* Description Snippet */}
                         {task.description && (
                              <p className="text-xs text-text-muted line-clamp-2">
                                   {task.description}
                              </p>
                         )}

                         {/* Metadata */}
                         <div className="flex flex-wrap items-center gap-3 text-xs">
                              {/* Status Badge */}
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white ${getStatusColor(task.status)}`}>
                                   {getStatusIcon(task.status)}
                                   <span>{task.status.replace('_', ' ')}</span>
                              </div>

                              {/* Deadline */}
                              {task.deadline && (
                                   <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-text-muted'
                                        }`}>
                                        <Clock size={12} />
                                        <span className="text-[10px] font-medium">
                                             {formatDate(task.deadline)}
                                        </span>
                                   </div>
                              )}

                              {/* Review Requested Indicator */}
                              {task.reviewRequested && task.status === 'REVIEW' && (
                                   <div className="flex items-center gap-1 text-yellow-500">
                                        <AlertCircle size={12} />
                                        <span className="text-[10px] font-medium">Review</span>
                                   </div>
                              )}
                         </div>

                         {/* Footer with Counts */}
                         <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                              <div className="flex items-center gap-3 text-text-muted">
                                   {task._count?.comments > 0 && (
                                        <div className="flex items-center gap-1">
                                             <MessageSquare size={12} />
                                             <span className="text-[10px]">{task._count.comments}</span>
                                        </div>
                                   )}
                                   {task._count?.attachments > 0 && (
                                        <div className="flex items-center gap-1">
                                             <Paperclip size={12} />
                                             <span className="text-[10px]">{task._count.attachments}</span>
                                        </div>
                                   )}
                                   {task.estimatedHours && (
                                        <div className="flex items-center gap-1">
                                             <Clock size={12} />
                                             <span className="text-[10px]">{task.estimatedHours}h</span>
                                        </div>
                                   )}
                              </div>

                              <ChevronRight size={14} className="text-text-disabled group-hover:text-accent group-hover:translate-x-1 transition-all" />
                         </div>
                    </div>
               </div>
          </Link>
     );
};

export default TaskCard;