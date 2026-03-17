
// Components/project-manager/CustomReportModal.jsx
'use client';
import React, { useState } from 'react';
import { X, Calendar, FileText, Download, CheckSquare } from 'lucide-react';

export default function CustomReportModal({ isOpen, onClose, onSubmit, projects }) {
     const [formData, setFormData] = useState({
          projectIds: [],
          dateRange: '30days',
          includeSections: {
               tasks: true,
               milestones: true,
               documents: true,
               feedback: true,
               financials: true
          },
          format: 'pdf'
     });
     const [submitting, setSubmitting] = useState(false);
     const [selectAll, setSelectAll] = useState(false);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
               await onSubmit(formData);
               onClose();
               // Reset form
               setFormData({
                    projectIds: [],
                    dateRange: '30days',
                    includeSections: {
                         tasks: true,
                         milestones: true,
                         documents: true,
                         feedback: true,
                         financials: true
                    },
                    format: 'pdf'
               });
          } catch (error) {
               console.error('Failed to generate report:', error);
          } finally {
               setSubmitting(false);
          }
     };

     const toggleProject = (projectId) => {
          setFormData(prev => ({
               ...prev,
               projectIds: prev.projectIds.includes(projectId)
                    ? prev.projectIds.filter(id => id !== projectId)
                    : [...prev.projectIds, projectId]
          }));
     };

     const toggleSelectAll = () => {
          if (selectAll) {
               setFormData(prev => ({ ...prev, projectIds: [] }));
          } else {
               setFormData(prev => ({
                    ...prev,
                    projectIds: projects.map(p => p.id)
               }));
          }
          setSelectAll(!selectAll);
     };

     const toggleSection = (section) => {
          setFormData(prev => ({
               ...prev,
               includeSections: {
                    ...prev.includeSections,
                    [section]: !prev.includeSections[section]
               }
          }));
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto chat-scroll ">
                    <div className="p-6 border-b border-border-default sticky top-0 bg-bg-surface z-10">
                         <div className="flex items-center justify-between">
                              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                   <FileText size={20} />
                                   Generate Custom Report
                              </h2>
                              <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
                                   <X size={20} />
                              </button>
                         </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                         {/* Project Selection */}
                         <div className="space-y-3">
                              <label className="block text-sm font-bold text-text-primary">Select Projects</label>
                              <div className="flex items-center gap-2 mb-2">
                                   <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className="text-xs text-accent hover:underline"
                                   >
                                        {selectAll ? 'Deselect All' : 'Select All'}
                                   </button>
                                   <span className="text-xs text-text-muted">
                                        ({formData.projectIds.length} selected)
                                   </span>
                              </div>
                              <div className="max-h-48 overflow-y-auto chat-scroll  space-y-2 p-2 border border-border-default rounded-lg">
                                   {projects.map(project => (
                                        <label key={project.id} className="flex items-center gap-3 p-2 hover:bg-bg-subtle rounded-lg cursor-pointer">
                                             <input
                                                  type="checkbox"
                                                  checked={formData.projectIds.includes(project.id)}
                                                  onChange={() => toggleProject(project.id)}
                                                  className="w-4 h-4 text-accent"
                                             />
                                             <div className="flex-1">
                                                  <p className="text-sm font-medium text-text-primary">{project.projectName}</p>
                                                  <p className="text-xs text-text-muted">{project.client}</p>
                                             </div>
                                             <span className={`text-xs px-2 py-1 rounded-full ${project.riskLevel === 'HIGH' ? 'bg-red-500/10 text-red-500' :
                                                  project.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                                                       'bg-green-500/10 text-green-500'
                                                  }`}>
                                                  {project.riskLevel}
                                             </span>
                                        </label>
                                   ))}
                              </div>
                         </div>

                         {/* Date Range */}
                         <div className="space-y-2">
                              <label className="block text-sm font-bold text-text-primary flex items-center gap-2">
                                   <Calendar size={16} />
                                   Date Range
                              </label>
                              <select
                                   value={formData.dateRange}
                                   onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent outline-none"
                              >
                                   <option value="7days">Last 7 Days</option>
                                   <option value="30days">Last 30 Days</option>
                                   <option value="90days">Last 90 Days</option>
                                   <option value="year">Last Year</option>
                                   <option value="custom">Custom Range</option>
                              </select>
                         </div>

                         {/* Sections to Include */}
                         <div className="space-y-2">
                              <label className="block text-sm font-bold text-text-primary flex items-center gap-2">
                                   <CheckSquare size={16} />
                                   Include Sections
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                   {[
                                        { id: 'tasks', label: 'Tasks' },
                                        { id: 'milestones', label: 'Milestones' },
                                        { id: 'documents', label: 'Documents' },
                                        { id: 'feedback', label: 'Feedback' },
                                        { id: 'financials', label: 'Financials' }
                                   ].map(section => (
                                        <label key={section.id} className="flex items-center gap-2 p-2 hover:bg-bg-subtle rounded-lg cursor-pointer">
                                             <input
                                                  type="checkbox"
                                                  checked={formData.includeSections[section.id]}
                                                  onChange={() => toggleSection(section.id)}
                                                  className="w-4 h-4 text-accent"
                                             />
                                             <span className="text-sm text-text-body">{section.label}</span>
                                        </label>
                                   ))}
                              </div>
                         </div>

                         {/* Export Format */}
                         <div className="space-y-2">
                              <label className="block text-sm font-bold text-text-primary flex items-center gap-2">
                                   <Download size={16} />
                                   Export Format
                              </label>
                              <div className="flex gap-4">
                                   {['pdf', 'excel', 'json'].map(format => (
                                        <label key={format} className="flex items-center gap-2">
                                             <input
                                                  type="radio"
                                                  name="format"
                                                  value={format}
                                                  checked={formData.format === format}
                                                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                                  className="w-4 h-4 text-accent"
                                             />
                                             <span className="text-sm uppercase">{format}</span>
                                        </label>
                                   ))}
                              </div>
                         </div>

                         {/* Action Buttons */}
                         <div className="flex gap-3 pt-4 border-t border-border-default">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 px-6 py-3 border border-border-default rounded-lg text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting || formData.projectIds.length === 0}
                                   className="flex-1 bg-accent text-text-inverse rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3"
                              >
                                   {submitting ? 'Generating...' : 'Generate Report'}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
}