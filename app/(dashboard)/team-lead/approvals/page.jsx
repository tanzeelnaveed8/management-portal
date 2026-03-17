'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
     CheckCircle2,
     XCircle,
     MessageSquare,
     Paperclip,
     Clock,
     User,
     AlertCircle,
     ChevronDown,
     ExternalLink,
     History,
     Filter,
     Download,
     Send,
     Star,
     Flag,
     RefreshCw,
     Calendar,
     Users,
     Briefcase
} from 'lucide-react';
import { useTeamLeadApprovals } from '../../../../hooks/useTeamLeadApprovals';
import { formatDistanceToNow, format } from 'date-fns';
import Swal from 'sweetalert2';
import Spinner from '../../../Components/common/Spinner';
import RefreashBtn from '../../../Components/common/RefreashBtn';


const ApprovalsPage = () => {
     const {
          tasks,
          projects,
          developers,
          stats,
          loading,
          error,
          filters,
          setFilters,
          approveTask,
          requestChanges,
          uploadAttachment,
          refetch
     } = useTeamLeadApprovals();

     const [expandedTaskId, setExpandedTaskId] = useState(null);
     const [feedbackText, setFeedbackText] = useState({});
     const [selectedFiles, setSelectedFiles] = useState({});
     const [uploading, setUploading] = useState({});
     const fileInputRefs = useRef({});

     // Handle approve with feedback
     const handleApprove = async (task) => {
          const feedback = feedbackText[task.id] || '';

          const { value: notifyPM } = await Swal.fire({
               title: 'Approve Task',
               text: feedback ? 'Include feedback with approval?' : 'Approve this task?',
               icon: 'question',
               input: 'checkbox',
               inputValue: 0,
               inputPlaceholder: 'Notify Project Manager for client review',
               showCancelButton: true,
               confirmButtonColor: '#22c55e',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, approve'
          });

          await approveTask(task.id, feedback, notifyPM);

          // Clear feedback
          setFeedbackText(prev => ({ ...prev, [task.id]: '' }));
          setExpandedTaskId(null);
     };

     // Handle request changes
     const handleRequestChanges = async (task) => {
          const feedback = feedbackText[task.id];

          if (!feedback || feedback.trim().length < 10) {
               Swal.fire({
                    title: 'Feedback Required',
                    text: 'Please provide detailed feedback about what needs to be changed (minimum 10 characters)',
                    icon: 'warning',
                    confirmButtonColor: '#eab308'
               });
               return;
          }

          const { value: priority } = await Swal.fire({
               title: 'Revision Priority',
               input: 'select',
               inputOptions: {
                    LOW: 'Low - Can wait',
                    MEDIUM: 'Medium - Normal priority',
                    HIGH: 'High - Needs attention',
                    URGENT: 'Urgent - Critical path'
               },
               inputPlaceholder: 'Select priority',
               showCancelButton: true,
               confirmButtonColor: '#eab308',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Request Changes'
          });

          if (priority) {
               await requestChanges(task.id, feedback, priority);
               setFeedbackText(prev => ({ ...prev, [task.id]: '' }));
               setExpandedTaskId(null);
          }
     };

     // Handle file upload
     const handleFileUpload = async (taskId, file) => {
          if (!file) return;

          setUploading(prev => ({ ...prev, [taskId]: true }));

          const result = await uploadAttachment(taskId, file);

          if (result.success) {
               Swal.fire({
                    title: 'Uploaded!',
                    text: 'File uploaded successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
               });
          }

          setUploading(prev => ({ ...prev, [taskId]: false }));
          setSelectedFiles(prev => ({ ...prev, [taskId]: null }));
          if (fileInputRefs.current[taskId]) {
               fileInputRefs.current[taskId].value = '';
          }
     };

     // Get priority badge color
     const getPriorityColor = (priority) => {
          switch (priority) {
               case 'URGENT': return 'bg-red-500/10 text-red-500 border-red-500/20';
               case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
               case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
               case 'LOW': return 'bg-green-500/10 text-green-500 border-green-500/20';
               default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
          }
     };

     // Get waiting time color
     const getWaitingTimeColor = (hours) => {
          if (hours > 48) return 'text-red-600 bg-red-50';
          if (hours > 24) return 'text-orange-600 bg-orange-50';
          if (hours > 12) return 'text-yellow-600 bg-yellow-50';
          return 'text-green-600 bg-green-50';
     };

     if (loading && tasks.length === 0) {
          return (
               <Spinner refetch={refetch} title="Approvals Queue" />
          );
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y">
               {/* Header */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                         <h1 className="text-4xl font-bold text-text-primary flex flex-col md:flex-row md:items-center gap-3">
                              Quality Assurance Queue
                              <span className=" w-fit text-sm bg-accent/10 text-accent text-ui px-3 py-1 rounded-full border border-accent/20">
                                   {stats.total} Pending
                              </span>
                         </h1>
                         <p className="text-text-muted mt-2 max-w-2xl">
                              Review completed tasks from your developers. Approve to finalize or send back with revision notes.
                              Approved tasks move to the "Completed" state for PM/Client review.
                         </p>
                    </div>

                    <RefreashBtn refetch={refetch} />
               </div>

               {/* Error Message */}
               {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                              <AlertCircle size={20} className="text-red-500" />
                              <p className="text-red-500 text-sm">{error}</p>
                         </div>
                         <button
                              onClick={() => refetch()}
                              className="text-red-500 hover:text-red-600 text-xs font-bold"
                         >
                              Retry
                         </button>
                    </div>
               )}

               {/* Stats Overview */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-accent to-accent-active rounded-2xl p-6 text-white shadow-lg">
                         <div className="flex items-center justify-between mb-2">
                              <Clock size={24} className="opacity-80" />
                              <span className="text-xs font-bold uppercase opacity-80">Queue</span>
                         </div>
                         <p className="text-3xl font-bold mb-1">{stats.total}</p>
                         <p className="text-xs opacity-90">Tasks awaiting review</p>
                    </div>

                    <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
                         <div className="flex items-center justify-between mb-2">
                              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                                   <Flag size={20} />
                              </div>
                         </div>
                         <p className="text-2xl font-bold text-text-primary mb-1">{stats.urgent}</p>
                         <p className="text-xs text-text-muted">Urgent / High priority</p>
                    </div>

                    <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
                         <div className="flex items-center justify-between mb-2">
                              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                                   <History size={20} />
                              </div>
                         </div>
                         <p className="text-2xl font-bold text-text-primary mb-1">{stats.waitingMoreThan24h}</p>
                         <p className="text-xs text-text-muted">Waiting &gt;24h</p>
                    </div>

                    <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
                         <div className="flex items-center justify-between mb-2">
                              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                   <Users size={20} />
                              </div>
                         </div>
                         <p className="text-2xl font-bold text-text-primary mb-1">{developers.length}</p>
                         <p className="text-xs text-text-muted">Active developers</p>
                    </div>
               </div>

               {/* Filters */}
               <div className="bg-bg-surface border border-border-default rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                         <div className="flex items-center gap-2 text-text-muted">
                              <Filter size={16} />
                              <span className="text-sm font-medium">Filters:</span>
                         </div>

                         {/* Project Filter */}
                         <select
                              value={filters.projectId}
                              onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
                              className="w-full md:w-auto px-3 py-1.5 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
                         >
                              <option value="">All Projects</option>
                              {projects.map(project => (
                                   <option key={project.id} value={project.id}>
                                        {project.name} ({stats.byProject.find(p => p.id === project.id)?.count || 0})
                                   </option>
                              ))}
                         </select>

                         {/* Developer Filter */}
                         <select
                              value={filters.developerId}
                              onChange={(e) => setFilters(prev => ({ ...prev, developerId: e.target.value }))}
                              className="w-full md:w-auto px-3 py-1.5 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
                         >
                              <option value="">All Developers</option>
                              {developers.map(dev => (
                                   <option key={dev.id} value={dev.id}>
                                        {dev.name} ({stats.byDeveloper.find(d => d.id === dev.id)?.count || 0})
                                   </option>
                              ))}
                         </select>

                         {/* Priority Filter */}
                         <select
                              value={filters.priority}
                              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                              className="w-full md:w-auto px-3 py-1.5 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
                         >
                              <option value="all">All Priorities</option>
                              <option value="URGENT">Urgent</option>
                              <option value="HIGH">High</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="LOW">Low</option>
                         </select>

                         {/* Time Filter */}
                         <select
                              value={filters.days}
                              onChange={(e) => setFilters(prev => ({ ...prev, days: e.target.value }))}
                              className="w-full md:w-auto px-3 py-1.5 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
                         >
                              <option value="7">Last 7 days</option>
                              <option value="3">Last 3 days</option>
                              <option value="1">Last 24 hours</option>
                              <option value="30">Last 30 days</option>
                         </select>

                         {/* Clear Filters */}
                         {(filters.projectId || filters.developerId || filters.priority !== 'all') && (
                              <button
                                   onClick={() => setFilters({
                                        projectId: '',
                                        developerId: '',
                                        priority: 'all',
                                        days: '7'
                                   })}
                                   className="text-sm text-accent hover:text-accent-hover ml-auto"
                              >
                                   Clear all
                              </button>
                         )}
                    </div>
               </div>

               {/* Approvals List */}
               <div className="space-y-4">
                    {tasks.map((task) => (
                         <ApprovalCard
                              key={task.id}
                              task={task}
                              isExpanded={expandedTaskId === task.id}
                              onToggle={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                              feedback={feedbackText[task.id] || ''}
                              onFeedbackChange={(value) => setFeedbackText(prev => ({ ...prev, [task.id]: value }))}
                              onApprove={() => handleApprove(task)}
                              onRequestChanges={() => handleRequestChanges(task)}
                              onFileSelect={(file) => {
                                   setSelectedFiles(prev => ({ ...prev, [task.id]: file }));
                                   handleFileUpload(task.id, file);
                              }}
                              isUploading={uploading[task.id]}
                              fileInputRef={(el) => fileInputRefs.current[task.id] = el}
                              getPriorityColor={getPriorityColor}
                              getWaitingTimeColor={getWaitingTimeColor}
                         />
                    ))}

                    {tasks.length === 0 && (
                         <div className="flex flex-col items-center justify-center py-20 bg-bg-surface border-2 border-dashed border-border-subtle rounded-3xl">
                              <div className="p-4 bg-green-500/10 rounded-full mb-4">
                                   <CheckCircle2 size={48} className="text-green-500" />
                              </div>
                              <h3 className="text-xl font-bold text-text-primary mb-2">All Caught Up! 🎉</h3>
                              <p className="text-text-muted text-center max-w-md">
                                   No tasks are currently waiting for your review.
                                   New submissions will appear here when developers request review.
                              </p>
                         </div>
                    )}
               </div>
          </div>
     );
};

const ApprovalCard = ({
     task,
     isExpanded,
     onToggle,
     feedback,
     onFeedbackChange,
     onApprove,
     onRequestChanges,
     onFileSelect,
     isUploading,
     fileInputRef,
     getPriorityColor,
     getWaitingTimeColor
}) => {
     const waitingHours = task.waitingTime || 0;

     return (
          <div className={`bg-bg-surface border rounded-2xl transition-all overflow-hidden ${isExpanded ? 'border-accent shadow-xl ring-1 ring-accent/20' : 'border-border-default hover:border-accent/50'
               }`}>
               {/* Summary Row */}
               <div
                    className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                    onClick={onToggle}
               >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                         {/* Avatar/Icon */}
                         <div className="relative shrink-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-lg shadow-md">
                                   {task.assignee?.avatar ? (
                                        <img src={task.assignee.avatar} className="w-full h-full rounded-xl object-cover" />
                                   ) : (
                                        task.assignee?.name?.charAt(0) || 'D'
                                   )}
                              </div>
                              {task.priority === 'URGENT' && (
                                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <span className="text-[8px] text-white font-bold">!</span>
                                   </div>
                              )}
                         </div>

                         {/* Task Info */}
                         <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                   <h3 className="font-bold text-text-primary truncate">{task.title}</h3>
                                   <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                   </span>
                                   <span className={`text-[10px] px-2 py-0.5 rounded-full ${getWaitingTimeColor(waitingHours)}`}>
                                        {waitingHours}h waiting
                                   </span>
                              </div>
                              <p className="text-caption text-text-muted mt-1 flex items-center gap-2 flex-wrap">
                                   <span className="flex items-center gap-1">
                                        <Briefcase size={12} />
                                        {task.project.name}
                                   </span>
                                   <span className="w-1 h-1 bg-border-strong rounded-full" />
                                   <span className="flex items-center gap-1">
                                        <Flag size={12} />
                                        {task.milestone?.name || 'No milestone'}
                                   </span>
                                   {task._count.attachments > 0 && (
                                        <>
                                             <span className="w-1 h-1 bg-border-strong rounded-full" />
                                             <span className="flex items-center gap-1">
                                                  <Paperclip size={12} />
                                                  {task._count.attachments}
                                             </span>
                                        </>
                                   )}
                                   {task._count.comments > 0 && (
                                        <>
                                             <span className="w-1 h-1 bg-border-strong rounded-full" />
                                             <span className="flex items-center gap-1">
                                                  <MessageSquare size={12} />
                                                  {task._count.comments}
                                             </span>
                                        </>
                                   )}
                              </p>
                         </div>
                    </div>

                    <div className="flex items-center gap-8 shrink-0">
                         <div className="hidden lg:block text-right">
                              <p className="text-caption text-text-muted uppercase font-bold tracking-tight">Developer</p>
                              <p className="text-ui font-medium text-text-body">{task.assignee?.name}</p>
                         </div>
                         <div className="hidden sm:block text-right">
                              <p className="text-caption text-text-muted uppercase font-bold tracking-tight">Hours</p>
                              <p className="text-ui font-medium text-text-body">{task.actualHours}h / {task.estimatedHours}h</p>
                         </div>
                         <ChevronDown className={`text-text-disabled transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
               </div>

               {/* Expanded Review Section */}
               {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-border-subtle animate-in slide-in-from-top-2 duration-200">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">

                              {/* Left: Content & Deliverables */}
                              <div className="space-y-6">
                                   <div>
                                        <h4 className="text-ui font-bold text-text-primary mb-3 flex items-center gap-2">
                                             <MessageSquare size={16} />
                                             Task Description
                                        </h4>
                                        <p className="text-body-sm text-text-body bg-bg-subtle p-4 rounded-xl border border-border-subtle">
                                             {task.description || "No detailed description provided."}
                                        </p>
                                   </div>

                                   {/* Attachments */}
                                   {task.attachments && task.attachments.length > 0 && (
                                        <div>
                                             <h4 className="text-ui font-bold text-text-primary mb-3 flex items-center gap-2">
                                                  <Paperclip size={16} />
                                                  Attachments ({task.attachments.length})
                                             </h4>
                                             <div className="space-y-2">
                                                  {task.attachments.map((att) => (
                                                       <a
                                                            key={att.id}
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-3 bg-bg-subtle border border-border-default rounded-xl hover:border-accent transition-colors group"
                                                       >
                                                            <div className="flex items-center gap-3">
                                                                 <div className="p-2 bg-bg-surface rounded-lg text-accent">
                                                                      <Paperclip size={14} />
                                                                 </div>
                                                                 <div>
                                                                      <p className="text-sm font-medium text-text-primary">{att.name}</p>
                                                                      <p className="text-[10px] text-text-muted">
                                                                           {format(new Date(att.uploadedAt), 'MMM dd, yyyy')} • {(att.fileSize / 1024).toFixed(1)} KB
                                                                      </p>
                                                                 </div>
                                                            </div>
                                                            <ExternalLink size={14} className="text-text-disabled group-hover:text-accent" />
                                                       </a>
                                                  ))}
                                             </div>
                                        </div>
                                   )}

                                   {/* Upload new attachment */}
                                   <div>
                                        <h4 className="text-ui font-bold text-text-primary mb-3 flex items-center gap-2">
                                             <Paperclip size={16} />
                                             Add Review Attachment
                                        </h4>
                                        <div className="relative">
                                             <input
                                                  ref={fileInputRef}
                                                  type="file"
                                                  onChange={(e) => {
                                                       if (e.target.files?.[0]) {
                                                            onFileSelect(e.target.files[0]);
                                                       }
                                                  }}
                                                  className="hidden"
                                                  id={`file-${task.id}`}
                                             />
                                             <label
                                                  htmlFor={`file-${task.id}`}
                                                  className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isUploading ? 'bg-accent/5 border-accent' : 'border-border-default hover:border-accent hover:bg-bg-subtle'
                                                       }`}
                                             >
                                                  {isUploading ? (
                                                       <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                                                            <span className="text-sm text-accent">Uploading...</span>
                                                       </div>
                                                  ) : (
                                                       <div className="text-center">
                                                            <Paperclip size={20} className="mx-auto mb-2 text-text-muted" />
                                                            <p className="text-sm font-medium text-text-primary">Click to upload</p>
                                                            <p className="text-[10px] text-text-muted mt-1">PDF, Images, ZIP (max 10MB)</p>
                                                       </div>
                                                  )}
                                             </label>
                                        </div>
                                   </div>
                              </div>

                              {/* Right: Review Section */}
                              <div className="space-y-6">
                                   {/* Review Notes */}
                                   <div>
                                        <h4 className="text-ui font-bold text-text-primary mb-3 flex items-center gap-2">
                                             <MessageSquare size={16} />
                                             Review Feedback
                                        </h4>
                                        <textarea
                                             value={feedback}
                                             onChange={(e) => onFeedbackChange(e.target.value)}
                                             placeholder="Add detailed feedback for the developer (required for changes, optional for approval)..."
                                             className={`w-full min-h-[120px] bg-bg-page border rounded-xl p-3 text-ui focus:ring-1 focus:ring-accent outline-none transition-all ${feedback.length < 10 && feedback.length > 0 ? 'border-red-300' : 'border-border-default'
                                                  }`}
                                        />
                                        {feedback.length > 0 && feedback.length < 10 && (
                                             <p className="text-xs text-red-500 mt-1">
                                                  Please provide at least 10 characters for meaningful feedback
                                             </p>
                                        )}
                                   </div>

                                   {/* Task Metadata */}
                                   <div className="bg-bg-subtle rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                             <span className="text-text-muted">Project:</span>
                                             <span className="font-medium text-text-primary">{task.project.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                             <span className="text-text-muted">Milestone:</span>
                                             <span className="font-medium text-text-primary">{task.milestone?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                             <span className="text-text-muted">Submitted:</span>
                                             <span className="font-medium text-text-primary">
                                                  {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                                             </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                             <span className="text-text-muted">Time Spent:</span>
                                             <span className="font-medium text-text-primary">{task.actualHours}h / {task.estimatedHours}h</span>
                                        </div>
                                   </div>

                                   {/* Recent Comments */}
                                   {task.comments && task.comments.length > 0 && (
                                        <div>
                                             <h4 className="text-ui font-bold text-text-primary mb-3">Recent Comments</h4>
                                             <div className="space-y-3 max-h-40 overflow-y-auto chat-scroll  pr-2">
                                                  {task.comments.slice(0, 3).map((comment) => (
                                                       <div key={comment.id} className="bg-bg-subtle p-3 rounded-lg">
                                                            <div className="flex justify-between items-center mb-1">
                                                                 <span className="text-xs font-bold text-text-primary">{comment.author?.name}</span>
                                                                 <span className="text-[10px] text-text-muted">
                                                                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                                 </span>
                                                            </div>
                                                            <p className="text-xs text-text-body">{comment.content}</p>
                                                       </div>
                                                  ))}
                                             </div>
                                        </div>
                                   )}

                                   {/* Action Buttons */}
                                   <div className="flex gap-3 pt-4">
                                        <button
                                             onClick={onRequestChanges}
                                             className="flex-1 flex items-center justify-center gap-2 py-3 bg-bg-subtle border border-border-strong text-text-body font-bold rounded-xl hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 transition-all group"
                                        >
                                             <XCircle size={18} className="group-hover:scale-110 transition-transform" />
                                             Request Changes
                                        </button>
                                        <button
                                             onClick={onApprove}
                                             className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-secondary text-text-inverse font-bold rounded-xl hover:opacity-90 shadow-lg shadow-accent-secondary/20 transition-all group"
                                        >
                                             <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                             Approve Task
                                        </button>
                                   </div>

                                   {/* Quick Actions */}
                                   <div className="flex gap-2 justify-end text-xs">
                                        <button className="text-accent hover:text-accent-hover flex items-center gap-1">
                                             <MessageSquare size={12} />
                                             View all comments
                                        </button>
                                        <span className="text-border-strong">|</span>
                                        <button className="text-accent hover:text-accent-hover flex items-center gap-1">
                                             <ExternalLink size={12} />
                                             Full details
                                        </button>
                                   </div>
                              </div>

                         </div>
                    </div>
               )}
          </div>
     );
};

export default ApprovalsPage;