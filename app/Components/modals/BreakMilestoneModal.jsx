// app/Components/modals/BreakMilestoneModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Flag, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const BreakMilestoneModal = ({ onClose, onSuccess, projects, developers }) => {
     const [loading, setLoading] = useState(false);
     const [selectedProject, setSelectedProject] = useState('');
     const [milestones, setMilestones] = useState([]);
     const [formData, setFormData] = useState({
          title: '',
          description: '',
          milestoneId: '',
          assigneeId: '',
          priority: 'MEDIUM',
          deadline: '',
          estimatedHours: ''
     });

     // Fetch milestones when project is selected
     useEffect(() => {
          if (selectedProject) {
               fetchMilestones(selectedProject);
          }
     }, [selectedProject]);

     const fetchMilestones = async (projectId) => {
          try {
               const response = await fetch(`/api/team-lead/projects/${projectId}/milestones`);
               if (response.ok) {
                    const data = await response.json();
                    setMilestones(data.milestones);
               }
          } catch (error) {
               console.error('Failed to fetch milestones:', error);
          }
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          // Validate form
          if (!formData.title || !formData.milestoneId || !formData.assigneeId) {
               Swal.fire({
                    title: 'Validation Error',
                    text: 'Please fill in all required fields',
                    icon: 'error',
                    confirmButtonColor: '#2563eb'
               });
               return;
          }

          setLoading(true);

          try {
               const response = await fetch('/api/team-lead/tasks', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
               });

               const data = await response.json();

               if (response.ok) {
                    Swal.fire({
                         title: 'Success!',
                         text: 'Task created successfully',
                         icon: 'success',
                         timer: 2000,
                         showConfirmButton: false
                    });
                    onSuccess?.(data.task);
                    onClose();
               } else {
                    throw new Error(data.error);
               }
          } catch (error) {
               Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
          } finally {
               setLoading(false);
          }
     };

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
               <div className="bg-bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto chat-scroll  shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex items-center justify-between">
                         <div>
                              <h2 className="text-xl font-bold text-text-primary">Break Milestone into Tasks</h2>
                              <p className="text-sm text-text-muted mt-1">Create developer-level tasks from a milestone</p>
                         </div>
                         <button
                              onClick={onClose}
                              className="p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                         >
                              <X size={20} />
                         </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                         {/* Project Selection */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                   Select Project <span className="text-red-500">*</span>
                              </label>
                              <select
                                   value={selectedProject}
                                   onChange={(e) => setSelectedProject(e.target.value)}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none"
                                   required
                              >
                                   <option value="">Choose a project...</option>
                                   {projects?.map(project => (
                                        <option key={project.id} value={project.id}>
                                             {project.name}
                                        </option>
                                   ))}
                              </select>
                         </div>

                         {/* Milestone Selection */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                   Milestone <span className="text-red-500">*</span>
                              </label>
                              <select
                                   name="milestoneId"
                                   value={formData.milestoneId}
                                   onChange={handleChange}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none"
                                   required
                                   disabled={!selectedProject}
                              >
                                   <option value="">Select milestone...</option>
                                   {milestones.map(milestone => (
                                        <option key={milestone.id} value={milestone.id}>
                                             {milestone.name} {milestone.status !== 'PENDING' ? `(${milestone.status})` : ''}
                                        </option>
                                   ))}
                              </select>
                         </div>

                         {/* Task Title */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                   Task Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                   type="text"
                                   name="title"
                                   value={formData.title}
                                   onChange={handleChange}
                                   placeholder="e.g., Implement authentication middleware"
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none"
                                   required
                              />
                         </div>

                         {/* Description */}
                         <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                   Description
                              </label>
                              <textarea
                                   name="description"
                                   value={formData.description}
                                   onChange={handleChange}
                                   rows="3"
                                   placeholder="Describe the task requirements..."
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none resize-none"
                              />
                         </div>

                         {/* Two Column Layout */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Assignee */}
                              <div className="space-y-2">
                                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                                        <User size={14} /> Assignee <span className="text-red-500">*</span>
                                   </label>
                                   <select
                                        name="assigneeId"
                                        value={formData.assigneeId}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none"
                                        required
                                   >
                                        <option value="">Select developer...</option>
                                        {developers?.map(dev => (
                                             <option key={dev.id} value={dev.id}>
                                                  {dev.name} {dev._count?.assignedTasks > 0 ? `(${dev._count.assignedTasks} tasks)` : ''}
                                             </option>
                                        ))}
                                   </select>
                              </div>

                              {/* Priority */}
                              <div className="space-y-2">
                                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                                        <Flag size={14} /> Priority
                                   </label>
                                   <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none"
                                   >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                   </select>
                              </div>

                              {/* Deadline */}
                              <div className="space-y-2">
                                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                                        <Calendar size={14} /> Deadline
                                   </label>
                                   <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none"
                                   />
                              </div>

                              {/* Estimated Hours */}
                              <div className="space-y-2">
                                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={14} /> Est. Hours
                                   </label>
                                   <input
                                        type="number"
                                        name="estimatedHours"
                                        value={formData.estimatedHours}
                                        onChange={handleChange}
                                        min="0.5"
                                        step="0.5"
                                        placeholder="e.g., 4"
                                        className="w-full p-3 bg-bg-subtle border border-border-default rounded-xl focus:ring-1 focus:ring-accent/20 outline-none"
                                   />
                              </div>
                         </div>

                         {/* Info Box */}
                         <div className="bg-accent-muted/30 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
                              <AlertCircle size={20} className="text-accent shrink-0 mt-0.5" />
                              <div className="text-sm text-text-muted">
                                   <p className="font-medium text-text-primary mb-1">Breaking down milestones</p>
                                   <p>Tasks created here will be visible to assigned developers in their workspace. You can always edit task details later.</p>
                              </div>
                         </div>

                         {/* Actions */}
                         <div className="flex gap-3 pt-4 border-t border-border-default">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 py-3 border border-border-strong rounded-xl text-text-primary font-bold hover:bg-bg-subtle transition-colors"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="flex-1 bg-accent hover:bg-accent-hover text-text-inverse py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                   {loading ? (
                                        <>
                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                             Creating...
                                        </>
                                   ) : (
                                        'Create Task'
                                   )}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default BreakMilestoneModal;