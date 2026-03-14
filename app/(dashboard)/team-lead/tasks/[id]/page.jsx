// app/(dashboard)/team-lead/tasks/[id]/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import {
     ArrowLeft,
     Calendar,
     Clock,
     Paperclip,
     MessageSquare,
     Send,
     MoreVertical,
     CheckCircle2,
     AlertCircle,
     FileText,
     ExternalLink,
     ChevronDown,
     User,
     Tag,
     Flag,
     Edit3
} from 'lucide-react';
import Link from 'next/link';
import { useTeamLeadTask } from '../../../../../hooks/useTeamLeadTasks'; // ✅ Correct hook for Team Lead
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Spinner from "../../../../Components/common/Spinner";


const TaskDetailPage = ({ params }) => {
     // ✅ Correctly unwrap params
     const unwrappedParams = React.use(params);
     const taskId = unwrappedParams.id;

     const router = useRouter();
     // ✅ Use the correct Team Lead hook
     const { task, loading, error, updateTaskStatus, addComment, refetch } = useTeamLeadTask(taskId);

     const [status, setStatus] = useState('');
     const [comment, setComment] = useState('');
     const [comments, setComments] = useState([]);
     const [updating, setUpdating] = useState(false);
     const [showReviewModal, setShowReviewModal] = useState(false);
     const [reviewNotes, setReviewNotes] = useState('');

     useEffect(() => {
          if (task) {
               setStatus(task.status);
               setComments(task.comments || []);
          }
     }, [task]);

     const statusOptions = [
          { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-slate-500' },
          { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-accent' },
          { value: 'REVIEW', label: 'Review', color: 'bg-yellow-500' },
          { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
          { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-500' },
     ];

     const priorityColors = {
          'URGENT': 'text-red-500 bg-red-500/10',
          'HIGH': 'text-orange-500 bg-orange-500/10',
          'MEDIUM': 'text-yellow-500 bg-yellow-500/10',
          'LOW': 'text-green-500 bg-green-500/10'
     };

     // In your page component, update the handlers:
     const handleStatusChange = async (newStatus) => {
          try {
               setUpdating(true);
               // ✅ Now just pass status (taskId is already in the hook)
               const result = await updateTaskStatus(newStatus, newStatus === 'COMPLETED');

               if (result.success) {
                    setStatus(newStatus);
                    setShowReviewModal(false);
                    setReviewNotes('');
                    refetch();
               }
          } catch (error) {
               console.error('Failed to update status:', error);
          } finally {
               setUpdating(false);
          }
     };

     const handleAddComment = async () => {
          if (!comment.trim()) return;

          try {
               // ✅ Now just pass content (taskId is already in the hook)
               const result = await addComment(comment);

               if (result.success) {
                    setComment('');
                    refetch();
               }
          } catch (error) {
               console.error('Failed to add comment:', error);
          }
     };

     if (loading) {
          return  <Spinner title="Tasks" />
     }

     if (error || !task) {
          return (
               <div className="flex flex-col h-full bg-bg-page items-center justify-center p-6">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Task Not Found</h2>
                         <p className="text-text-muted mb-6">{error || 'The task you\'re looking for doesn\'t exist or you don\'t have access.'}</p>
                         <button
                              onClick={() => router.push('/team-lead/tasks')}
                              className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Back to Tasks
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="flex flex-col h-full bg-bg-page animate-in fade-in duration-500">
               {/* Top Navigation Bar */}
               <header className="h-14 px-6 border-b border-border-default bg-bg-surface flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                         <Link href="/team-lead/tasks" className="p-2 hover:bg-bg-subtle rounded-full text-text-muted hover:text-accent transition-colors">
                              <ArrowLeft size={20} />
                         </Link>
                         <div className="h-6 w-px bg-border-default"></div>
                         <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                              Task ID: {task.id.slice(-8)}
                         </span>
                         <div className={`ml-2 w-2 h-2 rounded-full text-xs  ${task.status === 'COMPLETED' ? 'bg-green-500' :
                              task.status === 'IN_PROGRESS' ? 'bg-accent' :
                                   task.status === 'REVIEW' ? 'bg-yellow-500' :
                                        task.status === 'BLOCKED' ? 'bg-red-500' :
                                             'bg-slate-500'
                              }`} />
                    </div>
                    {/* <div className="flex items-center gap-3">
                         <button className="text-xs font-bold text-accent px-3 py-1.5 rounded-lg hover:bg-accent-muted transition-colors">
                              Share Task
                         </button>
                         <button className="p-2 text-text-muted hover:text-text-primary">
                              <MoreVertical size={20} />
                         </button>
                    </div> */}
               </header>

               {/* Review Request Modal */}
               {showReviewModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                         <div className="bg-bg-surface rounded-2xl max-w-md w-full p-6 space-y-4">
                              <h3 className="text-lg font-bold text-text-primary">Request Code Review</h3>
                              <p className="text-sm text-text-muted">Add any notes for the reviewer (optional)</p>
                              <textarea
                                   value={reviewNotes}
                                   onChange={(e) => setReviewNotes(e.target.value)}
                                   placeholder="e.g., Focus on the error handling in the Prisma middleware..."
                                   className="w-full h-32 p-3 bg-bg-subtle border border-border-default rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                              />
                              <div className="flex gap-3 pt-2">
                                   <button
                                        onClick={() => handleStatusChange('REVIEW')}
                                        disabled={updating}
                                        className="flex-1 bg-accent text-text-inverse py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all disabled:opacity-50"
                                   >
                                        {updating ? 'Submitting...' : 'Request Review'}
                                   </button>
                                   <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="flex-1 bg-bg-subtle text-text-primary py-3 rounded-xl font-bold text-sm hover:bg-bg-page transition-all"
                                   >
                                        Cancel
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               {/* Main Content Grid */}
               <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                    {/* LEFT COLUMN: Task Details */}
                    <main className="flex-1 overflow-y-auto chat-scroll p-8">
                         <div className="max-w-4xl mx-auto space-y-10">

                              {/* Title & Metadata */}
                              <section className="space-y-4">
                                   <div className="flex items-center gap-2 text-accent-secondary font-bold text-xs uppercase">
                                        <CheckCircle2 size={14} />
                                        {task.project?.name}
                                        {task.milestone && <span className="text-text-muted">/ {task.milestone.name}</span>}
                                   </div>
                                   <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                                        {task.title}
                                   </h1>
                                   <div className="flex flex-wrap gap-6 text-sm text-text-muted">
                                        <div className="flex items-center gap-1.5">
                                             <Calendar size={16} />
                                             Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                             <Clock size={16} />
                                             Est: {task.estimatedHours || 0}h • Spent: {task.actualHours || 0}h
                                        </div>
                                        {task.progress > 0 && (
                                             <div className="flex items-center gap-1.5">
                                                  <div className="w-16 h-1.5 bg-bg-subtle rounded-full overflow-hidden border border-accent/80">
                                                       <div className="h-full bg-accent border border-accent/80" style={{ width: `${task.progress}%` }} />
                                                  </div>
                                                  <span>{task.progress}%</span>
                                             </div>
                                        )}
                                   </div>
                              </section>

                              {/* Description */}
                              {task.description && (
                                   <section className="space-y-3">
                                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Description</h3>
                                        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl text-text-body leading-relaxed shadow-sm">
                                             <p className="whitespace-pre-wrap">{task.description}</p>
                                        </div>
                                   </section>
                              )}

                              {/* Attachments */}
                              {task.attachments && task.attachments.length > 0 && (
                                   <section className="space-y-3">
                                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                                             Attachments ({task.attachments.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                             {task.attachments.map((file) => (
                                                  <a
                                                       key={file.id}
                                                       href={file.url}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       className="flex items-center justify-between p-4 bg-bg-subtle border border-border-default rounded-xl hover:border-accent transition-all cursor-pointer group"
                                                  >
                                                       <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-bg-surface rounded-lg text-accent shadow-sm">
                                                                 <FileText size={18} />
                                                            </div>
                                                            <div>
                                                                 <span className="text-sm font-medium text-text-primary">{file.name}</span>
                                                                 <p className="text-[10px] text-text-muted">
                                                                      {(file.fileSize / 1024).toFixed(1)} KB
                                                                 </p>
                                                            </div>
                                                       </div>
                                                       <ExternalLink size={14} className="text-text-disabled group-hover:text-accent" />
                                                  </a>
                                             ))}
                                        </div>
                                   </section>
                              )}

                              {/* Comments Section */}
                              <section className="space-y-6 pt-6 border-t border-border-default">
                                   <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                                        <MessageSquare size={18} /> Discussion ({comments.length})
                                   </h3>

                                   {/* Comments List */}
                                   <div className="space-y-6">
                                        {comments.map((comment) => (
                                             <div key={comment.id} className="flex gap-4">
                                                  <div className="h-10 w-10 rounded-full bg-accent-secondary shrink-0 flex items-center justify-center text-text-inverse font-bold text-sm">
                                                       {comment.author?.name?.charAt(0) || 'U'}
                                                  </div>
                                                  <div className="flex-1 space-y-1.5">
                                                       <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-text-primary">{comment.author?.name}</span>
                                                            <span className="text-[10px] text-text-disabled">
                                                                 {format(new Date(comment.createdAt), 'MMM dd, h:mm a')}
                                                            </span>
                                                            {comment.author?.role && (
                                                                 <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-full">
                                                                      {comment.author.role}
                                                                 </span>
                                                            )}
                                                       </div>
                                                       <div className="bg-bg-subtle p-4 rounded-2xl rounded-tl-none border border-border-subtle text-sm text-text-body">
                                                            {comment.content}
                                                       </div>

                                                       {/* Replies */}
                                                       {comment.replies && comment.replies.length > 0 && (
                                                            <div className="ml-6 mt-4 space-y-4">
                                                                 {comment.replies.map(reply => (
                                                                      <div key={reply.id} className="flex gap-3">
                                                                           <div className="h-8 w-8 rounded-full bg-accent/50 shrink-0 flex items-center justify-center text-text-inverse font-bold text-xs">
                                                                                {reply.author?.name?.charAt(0)}
                                                                           </div>
                                                                           <div>
                                                                                <div className="flex items-center gap-2">
                                                                                     <span className="text-xs font-bold text-text-primary">{reply.author?.name}</span>
                                                                                     <span className="text-[10px] text-text-disabled">
                                                                                          {format(new Date(reply.createdAt), 'MMM dd, h:mm a')}
                                                                                     </span>
                                                                                </div>
                                                                                <p className="text-sm text-text-body mt-1">{reply.content}</p>
                                                                           </div>
                                                                      </div>
                                                                 ))}
                                                            </div>
                                                       )}
                                                  </div>
                                             </div>
                                        ))}
                                   </div>

                                   {/* Comment Input */}
                                   <div className="bg-bg-surface border border-border-strong rounded-2xl p-2 focus-within:ring-1 focus-within:ring-accent/20 transition-all shadow-sm">
                                        <textarea
                                             value={comment}
                                             onChange={(e) => setComment(e.target.value)}
                                             placeholder="Type your update..."
                                             className="w-full bg-transparent border-none focus:ring-0 p-3 text-sm min-h-[100px] text-text-body outline-none resize-none"
                                        />
                                        <div className="flex items-center justify-between p-2 border-t border-border-subtle">
                                             <button className="p-2 text-text-muted hover:text-accent rounded-lg">
                                                  <Paperclip size={18} />
                                             </button>
                                             <button
                                                  onClick={handleAddComment}
                                                  disabled={!comment.trim()}
                                                  className="bg-accent hover:bg-accent-hover text-text-inverse px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                             >
                                                  Post Comment <Send size={14} />
                                             </button>
                                        </div>
                                   </div>
                              </section>
                         </div>
                    </main>

                    {/* RIGHT SIDEBAR: Actions & Metadata */}
                    <aside className="w-full lg:w-80 border-l border-border-default bg-bg-surface p-6 space-y-8 overflow-y-auto">

                         {/* Status Control */}
                         <div className="space-y-4">
                              <h3 className="text-[10px] font-black text-text-disabled uppercase tracking-widest">Update Status</h3>
                              <div className="space-y-3">
                                   {statusOptions.map(option => (
                                        <button
                                             key={option.value}
                                             onClick={() => {
                                                  if (option.value === 'REVIEW') {
                                                       setShowReviewModal(true);
                                                  } else {
                                                       handleStatusChange(option.value);
                                                  }
                                             }}
                                             disabled={updating || status === option.value}
                                             className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${status === option.value
                                                  ? `${option.color} border-transparent text-white`
                                                  : 'border-border-default hover:border-accent hover:bg-bg-subtle'
                                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                             <span className="text-sm font-bold">{option.label}</span>
                                             {status === option.value && <CheckCircle2 size={16} />}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         <div className="h-px bg-border-subtle"></div>

                         {/* Task Details */}
                         <div className="space-y-6">
                              {/* Priority */}
                              <div className="space-y-2">
                                   <span className="text-[10px] font-black text-text-disabled uppercase flex items-center gap-1">
                                        <Flag size={12} /> Priority
                                   </span>
                                   <div className={`px-3 py-2 rounded-lg text-sm font-bold inline-block ${priorityColors[task.priority]}`}>
                                        {task.priority}
                                   </div>
                              </div>

                              {/* Deadline */}
                              {task.deadline && (
                                   <div className="space-y-2">
                                        <span className="text-[10px] font-black text-text-disabled uppercase flex items-center gap-1">
                                             <Calendar size={12} /> Deadline
                                        </span>
                                        <div className={`text-sm font-bold ${task.isOverdue ? 'text-red-500' : 'text-text-primary'}`}>
                                             {format(new Date(task.deadline), 'MMMM dd, yyyy')}
                                        </div>
                                        {task.daysUntilDeadline && (
                                             <div className={`text-[10px] font-bold ${task.isOverdue ? 'text-red-500' : 'text-text-muted'}`}>
                                                  {task.isOverdue ? `${Math.abs(task.daysUntilDeadline)} days overdue` : `${task.daysUntilDeadline} days remaining`}
                                             </div>
                                        )}
                                   </div>
                              )}

                              {/* Assignee */}
                              {task.assignee && (
                                   <div className="space-y-2">
                                        <span className="text-[10px] font-black text-text-disabled uppercase flex items-center gap-1">
                                             <User size={12} /> Assigned To
                                        </span>
                                        <div className="flex items-center gap-3">
                                             <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-text-inverse font-bold text-xs">
                                                  {task.assignee.name?.charAt(0)}
                                             </div>
                                             <div>
                                                  <div className="text-sm font-bold text-text-primary">{task.assignee.name}</div>
                                                  <div className="text-[10px] text-text-muted">{task.assignee.jobTitle || 'Developer'}</div>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* Created By */}
                              {task.createdBy && (
                                   <div className="space-y-2">
                                        <span className="text-[10px] font-black text-text-disabled uppercase flex items-center gap-1">
                                             <Edit3 size={12} /> Created By
                                        </span>
                                        <div className="flex items-center gap-3">
                                             <div className="h-8 w-8 rounded-full bg-accent-secondary/50 flex items-center justify-center text-text-inverse font-bold text-xs">
                                                  {task.createdBy.name?.charAt(0)}
                                             </div>
                                             <div className="text-sm font-bold text-text-primary">{task.createdBy.name}</div>
                                        </div>
                                   </div>
                              )}
                         </div>

                         <div className="h-px bg-border-subtle"></div>

                         {/* Time Tracking */}
                         <div className="space-y-4">
                              <h3 className="text-[10px] font-black text-text-disabled uppercase">Time Tracking</h3>
                              <div className="space-y-3">
                                   <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Estimated:</span>
                                        <span className="font-bold text-text-primary">{task.estimatedHours || 0}h</span>
                                   </div>
                                   <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Actual:</span>
                                        <span className="font-bold text-text-primary">{task.actualHours || 0}h</span>
                                   </div>
                                   {task.estimatedHours && task.actualHours && (
                                        <div className="space-y-1">
                                             <div className="flex justify-between text-xs">
                                                  <span className="text-text-muted">Progress:</span>
                                                  <span className="font-bold">{Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100))}%</span>
                                             </div>
                                             <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                                                  <div
                                                       className="h-full bg-accent"
                                                       style={{ width: `${Math.min(100, (task.actualHours / task.estimatedHours) * 100)}%` }}
                                                  />
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>

                         <div className="h-px bg-border-subtle"></div>

                         {/* Quick Actions */}
                         <div className="space-y-3 pt-2">
                              <button
                                   onClick={() => setShowReviewModal(true)}
                                   disabled={status === 'COMPLETED'}
                                   className="w-full bg-accent-muted text-accent font-bold py-3 rounded-xl text-xs hover:bg-accent hover:text-text-inverse transition-all border border-accent/20 disabled:opacity-50"
                              >
                                   Request Code Review
                              </button>
                              <button
                                   onClick={() => handleStatusChange('BLOCKED')}
                                   disabled={status === 'BLOCKED'}
                                   className="w-full bg-bg-subtle text-text-muted font-bold py-3 rounded-xl text-xs hover:bg-bg-page hover:text-red-500 transition-all border border-border-subtle disabled:opacity-50"
                              >
                                   Mark as Blocked
                              </button>
                         </div>

                         {/* Task Metadata */}
                         <div className="text-[10px] text-text-disabled space-y-1 pt-4">
                              <p>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}</p>
                              <p>Last Updated: {format(new Date(task.updatedAt), 'MMM dd, yyyy')}</p>
                              {task.completedAt && (
                                   <p>Completed: {format(new Date(task.completedAt), 'MMM dd, yyyy')}</p>
                              )}
                         </div>
                    </aside>
               </div>
          </div>
     );
};

export default TaskDetailPage;