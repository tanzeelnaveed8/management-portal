// Components/team-lead/CreateProjectModal.jsx
'use client';
import React, { useState } from 'react';
import { X, Calendar, DollarSign, User, Mail, Building, Phone } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onSubmit }) {
     const [formData, setFormData] = useState({
          name: '',
          description: '',
          status: 'UPCOMING',
          priority: 'MEDIUM',
          startDate: '',
          deadline: '',
          budget: '',
          clientName: '',
          clientEmail: '',
          clientCompany: '',
          clientPhone: ''
     });
     const [submitting, setSubmitting] = useState(false);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
               await onSubmit(formData);
               onClose();
               // Reset form
               setFormData({
                    name: '', description: '', status: 'UPCOMING', priority: 'MEDIUM',
                    startDate: '', deadline: '', budget: '', clientName: '',
                    clientEmail: '', clientCompany: '', clientPhone: ''
               });
          } catch (error) {
               console.error('Failed to create project:', error);
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
               <div className="bg-bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto chat-scroll ">
                    <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
                         <h2 className="text-xl font-bold text-text-primary">Create New Project</h2>
                         <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
                              <X size={20} />
                         </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                         {/* Project Details */}
                         <div className="space-y-4">
                              <h3 className="text-sm font-bold text-text-primary">Project Details</h3>

                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">Project Name *</label>
                                   <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        placeholder="e.g., E-Commerce Platform"
                                   />
                              </div>

                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">Description</label>
                                   <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        placeholder="Brief description of the project..."
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-xs font-medium text-text-muted mb-2">Status</label>
                                        <select
                                             name="status"
                                             value={formData.status}
                                             onChange={handleChange}
                                             className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        >
                                             <option value="UPCOMING">Upcoming</option>
                                             <option value="ACTIVE">Active</option>
                                             <option value="IN_DEVELOPMENT">In Development</option>
                                             <option value="CLIENT_REVIEW">Client Review</option>
                                        </select>
                                   </div>
                                   <div>
                                        <label className="block text-xs font-medium text-text-muted mb-2">Priority</label>
                                        <select
                                             name="priority"
                                             value={formData.priority}
                                             onChange={handleChange}
                                             className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        >
                                             <option value="LOW">Low</option>
                                             <option value="MEDIUM">Medium</option>
                                             <option value="HIGH">High</option>
                                             <option value="CRITICAL">Critical</option>
                                        </select>
                                   </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-xs font-medium text-text-muted mb-2">
                                             <Calendar size={14} className="inline mr-1" /> Start Date
                                        </label>
                                        <input
                                             type="date"
                                             name="startDate"
                                             value={formData.startDate}
                                             onChange={handleChange}
                                             className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        />
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
                                             className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        />
                                   </div>
                              </div>

                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">
                                        <DollarSign size={14} className="inline mr-1" /> Budget
                                   </label>
                                   <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        placeholder="15000"
                                   />
                              </div>
                         </div>

                         {/* Client Information */}
                         <div className="space-y-4">
                              <h3 className="text-sm font-bold text-text-primary">Client Information</h3>

                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">
                                        <User size={14} className="inline mr-1" /> Client Name *
                                   </label>
                                   <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        placeholder="John Doe"
                                   />
                              </div>

                              <div>
                                   <label className="block text-xs font-medium text-text-muted mb-2">
                                        <Mail size={14} className="inline mr-1" /> Client Email *
                                   </label>
                                   <input
                                        type="email"
                                        name="clientEmail"
                                        value={formData.clientEmail}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                        placeholder="client@example.com"
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-xs font-medium text-text-muted mb-2">
                                             <Building size={14} className="inline mr-1" /> Company
                                        </label>
                                        <input
                                             type="text"
                                             name="clientCompany"
                                             value={formData.clientCompany}
                                             onChange={handleChange}
                                             className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                             placeholder="Company Name"
                                        />
                                   </div>
                                   <div>
                                        <label className="block text-xs font-medium text-text-muted mb-2">
                                             <Phone size={14} className="inline mr-1" /> Phone
                                        </label>
                                        <input
                                             type="tel"
                                             name="clientPhone"
                                             value={formData.clientPhone}
                                             onChange={handleChange}
                                             className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                                             placeholder="+1 234 567 890"
                                        />
                                   </div>
                              </div>
                         </div>

                         <div className="flex gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 px-6 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting}
                                   className="flex-1 bg-accent text-text-inverse rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3"
                              >
                                   {submitting ? 'Creating...' : 'Create Project'}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
}