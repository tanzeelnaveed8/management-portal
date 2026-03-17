

// // Components/team-lead/CreateTaskModal.jsx
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { X, Calendar, Clock, Flag } from 'lucide-react';

// export default function CreateTaskModal({ isOpen, onClose, onSubmit, projectId }) {
//      const [formData, setFormData] = useState({
//           title: '',
//           description: '',
//           priority: 'MEDIUM',
//           status: 'NOT_STARTED',
//           deadline: '',
//           estimatedHours: '',
//           milestoneId: ''
//      });
//      const [milestones, setMilestones] = useState([]);
//      const [submitting, setSubmitting] = useState(false);

//      useEffect(() => {
//           if (isOpen && projectId) {
//                fetchMilestones();
//           }
//      }, [isOpen, projectId]);

//      const fetchMilestones = async () => {
//           try {
//                const response = await fetch(`/api/team-lead/projects/${projectId}/milestones`);
//                if (response.ok) {
//                     const data = await response.json();
//                     setMilestones(data.milestones || []);
//                }
//           } catch (error) {
//                console.error('Failed to fetch milestones:', error);
//           }
//      };

//      if (!isOpen) return null;

//      const handleSubmit = async (e) => {
//           e.preventDefault();
//           setSubmitting(true);
//           try {
//                await onSubmit(formData);
//                onClose();
//                setFormData({
//                     title: '', description: '', priority: 'MEDIUM',
//                     status: 'NOT_STARTED', deadline: '', estimatedHours: '', milestoneId: ''
//                });
//           } catch (error) {
//                console.error('Failed to create task:', error);
//           } finally {
//                setSubmitting(false);
//           }
//      };

//      const handleChange = (e) => {
//           const { name, value } = e.target;
//           setFormData(prev => ({ ...prev, [name]: value }));
//      };

//      return (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                <div className="bg-bg-surface rounded-3xl max-w-lg w-full">
//                     <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
//                          <h2 className="text-xl font-bold text-text-primary">Create New Task</h2>
//                          <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
//                               <X size={20} />
//                          </button>
//                     </div>

//                     <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                          <div>
//                               <label className="block text-xs font-medium text-text-muted mb-2">Task Title *</label>
//                               <input
//                                    type="text"
//                                    name="title"
//                                    value={formData.title}
//                                    onChange={handleChange}
//                                    required
//                                    className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
//                                    placeholder="e.g., Implement user authentication"
//                               />
//                          </div>

//                          <div>
//                               <label className="block text-xs font-medium text-text-muted mb-2">Description</label>
//                               <textarea
//                                    name="description"
//                                    value={formData.description}
//                                    onChange={handleChange}
//                                    rows="3"
//                                    className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
//                                    placeholder="Detailed description of the task..."
//                               />
//                          </div>

//                          <div className="grid grid-cols-2 gap-4">
//                               <div>
//                                    <label className="block text-xs font-medium text-text-muted mb-2">
//                                         <Flag size={14} className="inline mr-1" /> Priority
//                                    </label>
//                                    <select
//                                         name="priority"
//                                         value={formData.priority}
//                                         onChange={handleChange}
//                                         className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
//                                    >
//                                         <option value="LOW">Low</option>
//                                         <option value="MEDIUM">Medium</option>
//                                         <option value="HIGH">High</option>
//                                         <option value="CRITICAL">Critical</option>
//                                    </select>
//                               </div>

//                               <div>
//                                    <label className="block text-xs font-medium text-text-muted mb-2">
//                                         <Clock size={14} className="inline mr-1" /> Est. Hours
//                                    </label>
//                                    <input
//                                         type="number"
//                                         name="estimatedHours"
//                                         value={formData.estimatedHours}
//                                         onChange={handleChange}
//                                         className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
//                                         placeholder="8"
//                                    />
//                               </div>
//                          </div>

//                          <div>
//                               <label className="block text-xs font-medium text-text-muted mb-2">
//                                    <Calendar size={14} className="inline mr-1" /> Deadline
//                               </label>
//                               <input
//                                    type="date"
//                                    name="deadline"
//                                    value={formData.deadline}
//                                    onChange={handleChange}
//                                    className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
//                               />
//                          </div>

//                          {milestones.length > 0 && (
//                               <div>
//                                    <label className="block text-xs font-medium text-text-muted mb-2">Milestone (Optional)</label>
//                                    <select
//                                         name="milestoneId"
//                                         value={formData.milestoneId}
//                                         onChange={handleChange}
//                                         className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
//                                    >
//                                         <option value="">No milestone</option>
//                                         {milestones.map(m => (
//                                              <option key={m.id} value={m.id}>{m.name}</option>
//                                         ))}
//                                    </select>
//                               </div>
//                          )}

//                          <div className="flex gap-3 pt-4">
//                               <button
//                                    type="button"
//                                    onClick={onClose}
//                                    className="flex-1 px-6 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors"
//                               >
//                                    Cancel
//                               </button>
//                               <button
//                                    type="submit"
//                                    disabled={submitting}
//                                    className="flex-1 bg-accent text-text-inverse rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3"
//                               >
//                                    {submitting ? 'Creating...' : 'Create Task'}
//                               </button>
//                          </div>
//                     </form>
//                </div>
//           </div>
//      );
// }


// Components/team-lead/CreateTaskModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onSubmit, projectId }) {
     const [formData, setFormData] = useState({
          title: '',
          description: '',
          priority: 'MEDIUM',
          status: 'NOT_STARTED',
          deadline: '',
          estimatedHours: '',
          milestoneId: ''
     });
     const [milestones, setMilestones] = useState([]);
     const [loading, setLoading] = useState(false);
     const [submitting, setSubmitting] = useState(false);
     const [error, setError] = useState(null);

     useEffect(() => {
          if (isOpen && projectId) {
               fetchMilestones();
          }
     }, [isOpen, projectId]);

     const fetchMilestones = async () => {
          try {
               setLoading(true);
               setError(null);

               const response = await fetch(`/api/team-lead/projects/${projectId}/milestones`);

               if (!response.ok) {
                    throw new Error('Failed to fetch milestones');
               }

               const data = await response.json();
               setMilestones(data.milestones || []);
          } catch (error) {
               console.error('Failed to fetch milestones:', error);
               setError(error.message);
          } finally {
               setLoading(false);
          }
     };

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               // Validate required fields
               if (!formData.title.trim()) {
                    throw new Error('Task title is required');
               }

               // Prepare data for submission
               const taskData = {
                    ...formData,
                    estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
                    deadline: formData.deadline || null,
                    milestoneId: formData.milestoneId || null
               };

               await onSubmit(taskData);

               // Reset form on success
               setFormData({
                    title: '', description: '', priority: 'MEDIUM',
                    status: 'NOT_STARTED', deadline: '', estimatedHours: '', milestoneId: ''
               });

               onClose();
          } catch (error) {
               console.error('Failed to create task:', error);
               setError(error.message);
          } finally {
               setSubmitting(false);
          }
     };

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto chat-scroll ">
                    <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
                         <h2 className="text-xl font-bold text-text-primary">Create New Task</h2>
                         <button
                              onClick={onClose}
                              className="p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                              disabled={submitting}
                         >
                              <X size={20} />
                         </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                         {error && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                   {error}
                              </div>
                         )}

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">
                                   Task Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                   type="text"
                                   name="title"
                                   value={formData.title}
                                   onChange={handleChange}
                                   required
                                   disabled={submitting}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   placeholder="e.g., Implement user authentication"
                              />
                         </div>

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">Description</label>
                              <textarea
                                   name="description"
                                   value={formData.description}
                                   onChange={handleChange}
                                   rows="3"
                                   disabled={submitting}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   placeholder="Detailed description of the task..."
                              />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">
                                        <Flag size={14} className="inline mr-1" /> Priority
                                   </label>
                                   <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                   </select>
                              </div>

                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">
                                        <Clock size={14} className="inline mr-1" /> Est. Hours
                                   </label>
                                   <input
                                        type="number"
                                        name="estimatedHours"
                                        value={formData.estimatedHours}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        min="0"
                                        step="0.5"
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                        placeholder="8"
                                   />
                              </div>
                         </div>

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">
                                   <Calendar size={14} className="inline mr-1" /> Deadline
                              </label>
                              <input
                                   type="date"
                                   name="deadline"
                                   value={formData.deadline}
                                   onChange={handleChange}
                                   disabled={submitting}
                                   min={new Date().toISOString().split('T')[0]}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                              />
                         </div>

                         {loading ? (
                              <div className="text-center py-4">
                                   <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto"></div>
                                   <p className="text-xs text-text-muted mt-2">Loading milestones...</p>
                              </div>
                         ) : milestones.length > 0 && (
                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">Milestone (Optional)</label>
                                   <select
                                        name="milestoneId"
                                        value={formData.milestoneId}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   >
                                        <option value="">No milestone</option>
                                        {milestones.map(m => (
                                             <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                   </select>
                              </div>
                         )}

                         <div className="flex gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   disabled={submitting}
                                   className="flex-1 px-6 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors disabled:opacity-50"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting}
                                   className="flex-1 bg-accent text-text-inverse rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3"
                              >
                                   {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                             Creating...
                                        </span>
                                   ) : 'Create Task'}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
}