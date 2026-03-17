

// Components/team-lead/TaskApprovalModal.jsx
'use client';
import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function TaskApprovalModal({ isOpen, onClose, onApprove, onRevision, task }) {
     const [feedback, setFeedback] = useState('');
     const [action, setAction] = useState(null);
     const [submitting, setSubmitting] = useState(false);

     if (!isOpen || !task) return null;

     const handleApprove = async () => {
          setAction('approve');
          setSubmitting(true);
          try {
               await onApprove(task.id, feedback);
               onClose();
          } catch (error) {
               console.error('Approval failed:', error);
          } finally {
               setSubmitting(false);
          }
     };

     const handleRevision = async () => {
          if (!feedback.trim()) {
               alert('Please provide feedback for revision');
               return;
          }
          setAction('revision');
          setSubmitting(true);
          try {
               await onRevision(task.id, feedback);
               onClose();
          } catch (error) {
               console.error('Revision request failed:', error);
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border-default overflow-hidden">
                    <div className="p-6 border-b border-border-default flex justify-between items-center bg-bg-subtle">
                         <h2 className="text-headline font-bold text-text-primary">Review Task</h2>
                         <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                              <X size={20} />
                         </button>
                    </div>

                    <div className="p-6 space-y-6">
                         {/* Task Details */}
                         <div className="bg-bg-subtle p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                   <span className="text-xs font-bold text-text-muted uppercase">Task</span>
                                   <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.priority === 'URGENT' ? 'bg-red-100 text-red-600' :
                                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                                             'bg-blue-100 text-blue-600'
                                        }`}>
                                        {task.priority}
                                   </span>
                              </div>
                              <p className="font-bold text-text-primary">{task.task}</p>

                              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                                   <div>
                                        <span className="text-text-muted">Developer:</span>
                                        <span className="ml-2 font-medium text-text-primary">{task.developer}</span>
                                   </div>
                                   <div>
                                        <span className="text-text-muted">Project:</span>
                                        <span className="ml-2 font-medium text-text-primary">{task.project}</span>
                                   </div>
                              </div>
                         </div>

                         {/* Feedback Input */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                                   <MessageSquare size={14} />
                                   Review Feedback
                              </label>
                              <textarea
                                   value={feedback}
                                   onChange={(e) => setFeedback(e.target.value)}
                                   rows="4"
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                   placeholder="Add comments, suggestions, or approval notes..."
                              />
                         </div>

                         {/* Action Buttons */}
                         <div className="flex gap-3 pt-4">
                              <button
                                   onClick={handleRevision}
                                   disabled={submitting}
                                   className="flex-1 px-4 py-3 border border-red-200 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                   <AlertCircle size={16} />
                                   Request Revision
                              </button>
                              <button
                                   onClick={handleApprove}
                                   disabled={submitting}
                                   className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                   {submitting && action === 'approve' ? (
                                        <Loader size={16} className="animate-spin" />
                                   ) : (
                                        <CheckCircle size={16} />
                                   )}
                                   Approve Task
                              </button>
                         </div>

                         {submitting && action === 'revision' && (
                              <p className="text-xs text-center text-text-muted">Sending feedback...</p>
                         )}
                    </div>
               </div>
          </div>
     );
}