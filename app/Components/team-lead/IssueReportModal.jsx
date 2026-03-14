// Components/team-lead/IssueReportModal.jsx
'use client';
import React, { useState } from 'react';
import { X, AlertCircle, Flag, Users, MessageSquare } from 'lucide-react';

// Simple spinner component if you don't have one
const SimpleSpinner = () => (
     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export default function IssueReportModal({ isOpen, onClose, onSubmit, projects }) {
     const [formData, setFormData] = useState({
          projectId: '',
          title: '',
          description: '',
          severity: 'MEDIUM',
          affectedTasks: '',
          proposedSolution: ''
     });
     const [submitting, setSubmitting] = useState(false);
     const [error, setError] = useState(null);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               // Validate required fields
               if (!formData.projectId) {
                    throw new Error('Please select a project');
               }
               if (!formData.title.trim()) {
                    throw new Error('Please enter an issue title');
               }
               if (!formData.description.trim()) {
                    throw new Error('Please provide a description');
               }

               // Process affected tasks - split by comma and clean up
               const affectedTasksArray = formData.affectedTasks
                    .split(',')
                    .map(task => task.trim())
                    .filter(task => task.length > 0);

               await onSubmit({
                    projectId: formData.projectId,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    severity: formData.severity,
                    affectedTasks: affectedTasksArray,
                    proposedSolution: formData.proposedSolution.trim() || null
               });

               // Reset form on success
               setFormData({
                    projectId: '',
                    title: '',
                    description: '',
                    severity: 'MEDIUM',
                    affectedTasks: '',
                    proposedSolution: ''
               });

               onClose();
          } catch (err) {
               setError(err.message);
               console.error('Issue report error:', err);
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-bg-surface w-full max-w-xl rounded-2xl shadow-2xl border border-border-default max-h-[90vh] overflow-y-auto chat-scroll">
                    <div className="p-6 border-b border-border-default flex justify-between items-center bg-bg-subtle sticky top-0 z-10">
                         <h2 className="text-headline font-bold text-text-primary flex items-center gap-2">
                              <AlertCircle size={20} className="text-red-500" />
                              Report Issue to Project Manager
                         </h2>
                         <button
                              onClick={onClose}
                              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-surface"
                         >
                              <X size={20} />
                         </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                         {error && (
                              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                   <p className="text-red-500 text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {error}
                                   </p>
                              </div>
                         )}

                         {/* Project Selection */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                                   <Flag size={14} />
                                   Project <span className="text-red-500">*</span>
                              </label>
                              <select
                                   value={formData.projectId}
                                   onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                   required
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                              >
                                   <option value="">Select a project</option>
                                   {projects && projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                   ))}
                              </select>
                         </div>

                         {/* Issue Title */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                   Issue Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                   type="text"
                                   value={formData.title}
                                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                   required
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                   placeholder="e.g., API Integration Blocked"
                              />
                         </div>

                         {/* Severity */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                   Severity Level
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                   {[
                                        { value: 'LOW', label: 'Low', color: 'text-green-500', bg: 'bg-green-500/10' },
                                        { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                                        { value: 'HIGH', label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                        { value: 'CRITICAL', label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10' }
                                   ].map(level => (
                                        <label
                                             key={level.value}
                                             className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.severity === level.value
                                                  ? `${level.bg} border-${level.value === 'LOW' ? 'green' : level.value === 'MEDIUM' ? 'yellow' : level.value === 'HIGH' ? 'orange' : 'red'}-500`
                                                  : 'border-border-default hover:border-accent/30'
                                                  }`}
                                        >
                                             <input
                                                  type="radio"
                                                  name="severity"
                                                  value={level.value}
                                                  checked={formData.severity === level.value}
                                                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                                  className="sr-only"
                                             />
                                             <span className={`text-xs font-bold ${level.color}`}>
                                                  {level.label}
                                             </span>
                                        </label>
                                   ))}
                              </div>
                         </div>

                         {/* Description */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                   Description <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                   value={formData.description}
                                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                   required
                                   rows="4"
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none"
                                   placeholder="Describe the issue in detail..."
                              />
                         </div>

                         {/* Affected Tasks */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                                   <Users size={14} />
                                   Affected Tasks (comma-separated)
                              </label>
                              <input
                                   type="text"
                                   value={formData.affectedTasks}
                                   onChange={(e) => setFormData({ ...formData, affectedTasks: e.target.value })}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                   placeholder="e.g., Task 1, Task 2, Task 3"
                              />
                              <p className="text-[10px] text-text-muted mt-1">
                                   Enter task names or IDs separated by commas
                              </p>
                         </div>

                         {/* Proposed Solution */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                                   <MessageSquare size={14} />
                                   Proposed Solution
                              </label>
                              <textarea
                                   value={formData.proposedSolution}
                                   onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
                                   rows="3"
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none"
                                   placeholder="Suggest how to resolve this issue..."
                              />
                         </div>

                         {/* Action Buttons */}
                         <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   disabled={submitting}
                                   className="px-6 py-2.5 rounded-lg font-medium text-text-body hover:bg-border-default transition-colors disabled:opacity-50"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting}
                                   className="px-6 py-2.5 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                   {submitting ? (
                                        <>
                                             <SimpleSpinner />
                                             <span>Reporting...</span>
                                        </>
                                   ) : (
                                        <>
                                             <AlertCircle size={16} />
                                             <span>Report Issue</span>
                                        </>
                                   )}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
}