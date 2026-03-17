// app/Components/project-manager/CreateProjectModal.jsx
'use client';
import React, { useState } from 'react';
import { X, Calendar, User, Building2, Mail, Phone, AlertCircle, DollarSign } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onSubmit }) {
     const [formData, setFormData] = useState({
          name: '',
          description: '',
          clientName: '',
          clientEmail: '',
          clientCompany: '',
          clientPhone: '',
          startDate: '',
          deadline: '',
          budget: '',
          priority: 'MEDIUM',
          riskLevel: 'LOW',
          teamLeadId: '',
          status: 'UPCOMING'
     });
     const [loading, setLoading] = useState(false);
     const [errors, setErrors] = useState({});

     if (!isOpen) return null;

     const validateForm = () => {
          const newErrors = {};

          if (!formData.name.trim()) newErrors.name = 'Project name is required';
          if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
          if (!formData.clientEmail.trim()) {
               newErrors.clientEmail = 'Client email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
               newErrors.clientEmail = 'Invalid email format';
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          if (!validateForm()) return;

          setLoading(true);

          try {
               // Format dates properly
               const formattedData = {
                    ...formData,
                    startDate: formData.startDate || null,
                    deadline: formData.deadline || null,
                    budget: formData.budget ? parseFloat(formData.budget) : null,
               };

               const result = await onSubmit(formattedData);

               if (result?.success) {
                    // Reset form on success
                    setFormData({
                         name: '',
                         description: '',
                         clientName: '',
                         clientEmail: '',
                         clientCompany: '',
                         clientPhone: '',
                         startDate: '',
                         deadline: '',
                         budget: '',
                         priority: 'MEDIUM',
                         riskLevel: 'LOW',
                         teamLeadId: '',
                         status: 'UPCOMING'
                    });
                    onClose();
               }
          } catch (error) {
               console.error('Form submission error:', error);
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
                         <h2 className="text-xl font-bold text-text-primary">Create New Project</h2>
                         <button
                              onClick={onClose}
                              className="text-text-muted hover:text-text-primary transition-colors"
                         >
                              <X size={20} />
                         </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                         {/* Project Details Section */}
                         <div className="space-y-4">
                              <h3 className="text-sm font-semibold text-text-primary">Project Details</h3>

                              <div>
                                   <label className="block text-sm font-medium text-text-muted mb-1">
                                        Project Name *
                                   </label>
                                   <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-3 py-2 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body ${errors.name ? 'border-red-500' : 'border-border-default'
                                             }`}
                                        placeholder="Enter project name"
                                   />
                                   {errors.name && (
                                        <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                                   )}
                              </div>

                              <div>
                                   <label className="block text-sm font-medium text-text-muted mb-1">
                                        Description
                                   </label>
                                   <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                        placeholder="Describe the project..."
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Start Date
                                        </label>
                                        <div className="relative">
                                             <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                             <input
                                                  type="date"
                                                  value={formData.startDate}
                                                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                  className="w-full pl-10 pr-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                             />
                                        </div>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Deadline
                                        </label>
                                        <div className="relative">
                                             <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                             <input
                                                  type="date"
                                                  value={formData.deadline}
                                                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                  className="w-full pl-10 pr-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Client Information Section */}
                         <div className="space-y-4 pt-4 border-t border-border-default">
                              <h3 className="text-sm font-semibold text-text-primary">Client Information</h3>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Client Name *
                                        </label>
                                        <div className="relative">
                                             <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                             <input
                                                  type="text"
                                                  value={formData.clientName}
                                                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                  className={`w-full pl-10 pr-3 py-2 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body ${errors.clientName ? 'border-red-500' : 'border-border-default'
                                                       }`}
                                                  placeholder="Client name"
                                             />
                                        </div>
                                        {errors.clientName && (
                                             <p className="mt-1 text-xs text-red-500">{errors.clientName}</p>
                                        )}
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Client Email *
                                        </label>
                                        <div className="relative">
                                             <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                             <input
                                                  type="email"
                                                  value={formData.clientEmail}
                                                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                                  className={`w-full pl-10 pr-3 py-2 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body ${errors.clientEmail ? 'border-red-500' : 'border-border-default'
                                                       }`}
                                                  placeholder="client@example.com"
                                             />
                                        </div>
                                        {errors.clientEmail && (
                                             <p className="mt-1 text-xs text-red-500">{errors.clientEmail}</p>
                                        )}
                                   </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Company
                                        </label>
                                        <div className="relative">
                                             <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                             <input
                                                  type="text"
                                                  value={formData.clientCompany}
                                                  onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                                                  className="w-full pl-10 pr-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                                  placeholder="Company name"
                                             />
                                        </div>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Phone
                                        </label>
                                        <div className="relative">
                                             <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                             <input
                                                  type="tel"
                                                  value={formData.clientPhone}
                                                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                                  className="w-full pl-10 pr-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                                  placeholder="+1 (555) 000-0000"
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Project Settings Section */}
                         <div className="space-y-4 pt-4 border-t border-border-default">
                              <h3 className="text-sm font-semibold text-text-primary">Project Settings</h3>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Priority
                                        </label>
                                        <select
                                             value={formData.priority}
                                             onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                             className="w-full px-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                        >
                                             <option value="LOW">Low</option>
                                             <option value="MEDIUM">Medium</option>
                                             <option value="HIGH">High</option>
                                             <option value="CRITICAL">Critical</option>
                                        </select>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">
                                             Risk Level
                                        </label>
                                        <select
                                             value={formData.riskLevel}
                                             onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                                             className="w-full px-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                        >
                                             <option value="LOW">Low</option>
                                             <option value="MEDIUM">Medium</option>
                                             <option value="HIGH">High</option>
                                        </select>
                                   </div>
                              </div>

                              <div>
                                   <label className="block text-sm font-medium text-text-muted mb-1">
                                        Budget (USD)
                                   </label>
                                   <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                             type="number"
                                             value={formData.budget}
                                             onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                             className="w-full pl-10 pr-3 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none text-text-body"
                                             placeholder="50000"
                                             min="0"
                                             step="1000"
                                        />
                                   </div>
                              </div>
                         </div>

                         {/* Form Actions */}
                         <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="px-4 py-2 border border-border-default rounded-lg text-text-body hover:bg-bg-subtle transition-colors"
                                   disabled={loading}
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   className="px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                   disabled={loading}
                              >
                                   {loading ? (
                                        <>
                                             <span className="animate-spin">⚪</span>
                                             Creating...
                                        </>
                                   ) : (
                                        'Create Project'
                                   )}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
}