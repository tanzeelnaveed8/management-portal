
'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
     AlertOctagon,
     Send,
     Paperclip,
     Info,
     ChevronRight,
     Layers,
     Target,
     Flag,
     Save,
     X,
     CheckCircle2,
     AlertCircle,
     FileText,
     Download,
     Trash2
} from 'lucide-react';
import { useTeamLeadIssueReport } from '../../../../hooks/useTeamLeadIssueReport';

const Page = () => {
     const {
          projects,
          milestones,
          tasks,
          loading,
          error,
          selectedProject,
          selectedMilestone,
          handleProjectChange,
          handleMilestoneChange,
          submitIssue,
          saveDraft,
          uploadFile
     } = useTeamLeadIssueReport();

     const [urgency, setUrgency] = useState('MEDIUM');
     const [formData, setFormData] = useState({
          projectId: '',
          milestoneId: '',
          taskId: '',
          subject: '',
          description: '',
          impact: '',
          suggestedResolution: ''
     });
     const [attachments, setAttachments] = useState([]);
     const [uploading, setUploading] = useState(false);
     const [formErrors, setFormErrors] = useState({});
     const fileInputRef = useRef(null);

     // Update form when selections change
     useEffect(() => {
          setFormData(prev => ({
               ...prev,
               projectId: selectedProject || '',
               milestoneId: selectedMilestone || ''
          }));
     }, [selectedProject, selectedMilestone]);

     // Handle input changes
     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));

          // Clear error for this field
          if (formErrors[name]) {
               setFormErrors(prev => ({ ...prev, [name]: null }));
          }
     };

     // Handle file upload
     const handleFileUpload = async (e) => {
          const files = Array.from(e.target.files);

          for (const file of files) {
               setUploading(true);
               const result = await uploadFile(file, formData.projectId);

               if (result.success) {
                    setAttachments(prev => [...prev, {
                         id: result.document?.id || Date.now(),
                         name: result.fileName,
                         url: result.fileUrl,
                         size: result.fileSize,
                         uploading: false
                    }]);
               }

               setUploading(false);
          }

          // Clear input
          if (fileInputRef.current) {
               fileInputRef.current.value = '';
          }
     };

     // Remove attachment
     const removeAttachment = (index) => {
          setAttachments(prev => prev.filter((_, i) => i !== index));
     };

     // Validate form
     const validateForm = () => {
          const errors = {};

          if (!formData.projectId) {
               errors.projectId = 'Please select a project';
          }

          if (!formData.subject.trim()) {
               errors.subject = 'Subject is required';
          } else if (formData.subject.length < 5) {
               errors.subject = 'Subject must be at least 5 characters';
          }

          if (!formData.description.trim()) {
               errors.description = 'Description is required';
          } else if (formData.description.length < 20) {
               errors.description = 'Description must be at least 20 characters';
          }

          return errors;
     };

     // Handle submit
     const handleSubmit = async () => {
          const errors = validateForm();

          if (Object.keys(errors).length > 0) {
               setFormErrors(errors);

               // Scroll to first error
               const firstErrorField = Object.keys(errors)[0];
               document.getElementsByName(firstErrorField)[0]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
               });

               return;
          }

          const result = await submitIssue({
               ...formData,
               urgency,
               attachments: attachments.map(a => a.url)
          });

          if (result.success) {
               // Reset form
               setFormData({
                    projectId: '',
                    milestoneId: '',
                    taskId: '',
                    subject: '',
                    description: '',
                    impact: '',
                    suggestedResolution: ''
               });
               setUrgency('MEDIUM');
               setAttachments([]);
               handleProjectChange('');
          }
     };

     // Handle save draft
     const handleSaveDraft = async () => {
          const result = await saveDraft({
               ...formData,
               urgency,
               attachments
          });
     };

     // Get urgency color
     const getUrgencyColor = (level) => {
          switch (level) {
               case 'LOW': return 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500 hover:text-white';
               case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500 hover:text-white';
               case 'HIGH': return 'bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500 hover:text-white';
               case 'CRITICAL': return 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500 hover:text-white';
               default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
          }
     };

     return (
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y">
               {/* Header Section */}
               <div className="w-full mx-auto mb-10">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                              <AlertOctagon size={24} />
                         </div>
                         <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                              Escalate Issue to Project Manager
                         </h1>
                    </div>
                    <p className="text-text-muted text-ui">
                         Use this form to report blockers, resource shortages, or technical risks that require PM intervention or client communication.
                    </p>
               </div>

               {/* Error Message */}
               {error && (
                    <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                              <AlertCircle size={20} className="text-red-500" />
                              <p className="text-red-500 text-sm">{error}</p>
                         </div>
                    </div>
               )}

               <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Escalation Form */}
                    <div className="lg:col-span-2 space-y-6">
                         <section className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-sm">
                              <h2 className="text-ui font-bold text-text-primary mb-6 flex items-center gap-2">
                                   <Info size={18} className="text-accent" />
                                   Issue Context
                              </h2>

                              <div className="space-y-5">
                                   {/* Project Selection */}
                                   <div>
                                        <label className="block text-caption font-bold text-text-muted uppercase mb-2">
                                             Related Project <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                             value={selectedProject || ''}
                                             onChange={(e) => handleProjectChange(e.target.value)}
                                             className={`w-full bg-bg-page border rounded-xl px-4 py-3 text-ui focus:ring-1 focus:ring-accent outline-none appearance-none cursor-pointer ${formErrors.projectId ? 'border-red-500' : 'border-border-default'
                                                  }`}
                                        >
                                             <option value="">Select Assigned Project...</option>
                                             {loading.projects ? (
                                                  <option disabled>Loading projects...</option>
                                             ) : (
                                                  projects.map(project => (
                                                       <option key={project.id} value={project.id}>
                                                            {project.name} {project.manager ? `(PM: ${project.manager.name})` : '(No PM)'}
                                                       </option>
                                                  ))
                                             )}
                                        </select>
                                        {formErrors.projectId && (
                                             <p className="text-xs text-red-500 mt-1">{formErrors.projectId}</p>
                                        )}
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                        {/* Milestone */}
                                        <div>
                                             <label className="block text-caption font-bold text-text-muted uppercase mb-2">
                                                  Milestone
                                             </label>
                                             <select
                                                  value={selectedMilestone || ''}
                                                  onChange={(e) => handleMilestoneChange(e.target.value)}
                                                  className="w-full bg-bg-page border border-border-default rounded-xl px-4 py-2 text-ui focus:ring-1 focus:ring-accent outline-none"
                                                  disabled={!selectedProject}
                                             >
                                                  <option value="">Optional</option>
                                                  {loading.milestones ? (
                                                       <option disabled>Loading...</option>
                                                  ) : (
                                                       milestones.map(milestone => (
                                                            <option key={milestone.id} value={milestone.id}>
                                                                 {milestone.name} {milestone.status === 'DELAYED' ? '(Delayed)' : ''}
                                                            </option>
                                                       ))
                                                  )}
                                             </select>
                                        </div>

                                        {/* Task */}
                                        <div>
                                             <label className="block text-caption font-bold text-text-muted uppercase mb-2">
                                                  Specific Task
                                             </label>
                                             <select
                                                  name="taskId"
                                                  value={formData.taskId}
                                                  onChange={handleInputChange}
                                                  className="w-full bg-bg-page border border-border-default rounded-xl px-4 py-2 text-ui focus:ring-1 focus:ring-accent outline-none"
                                                  disabled={!selectedMilestone}
                                             >
                                                  <option value="">Optional</option>
                                                  {loading.tasks ? (
                                                       <option disabled>Loading...</option>
                                                  ) : (
                                                       tasks.map(task => (
                                                            <option key={task.id} value={task.id}>
                                                                 {task.title} {task.assignee ? `(${task.assignee.name})` : ''}
                                                            </option>
                                                       ))
                                                  )}
                                             </select>
                                        </div>
                                   </div>

                                   <hr className="border-border-subtle" />

                                   {/* Subject */}
                                   <div>
                                        <label className="block text-caption font-bold text-text-muted uppercase mb-2">
                                             Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             name="subject"
                                             value={formData.subject}
                                             onChange={handleInputChange}
                                             placeholder="e.g., Critical API Downtime / Budget Overrun Risk"
                                             className={`w-full bg-bg-page border rounded-xl px-4 py-3 text-ui focus:ring-1 focus:ring-accent outline-none ${formErrors.subject ? 'border-red-500' : 'border-border-default'
                                                  }`}
                                        />
                                        {formErrors.subject && (
                                             <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>
                                        )}
                                   </div>

                                   {/* Description */}
                                   <div>
                                        <label className="block text-caption font-bold text-text-muted uppercase mb-2">
                                             Detailed Report <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                             name="description"
                                             value={formData.description}
                                             onChange={handleInputChange}
                                             rows={6}
                                             placeholder="Describe the issue, its impact on the deadline, and suggested resolution..."
                                             className={`w-full bg-bg-page border rounded-xl px-4 py-3 text-ui focus:ring-1 focus:ring-accent outline-none ${formErrors.description ? 'border-red-500' : 'border-border-default'
                                                  }`}
                                        />
                                        {formErrors.description && (
                                             <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                                        )}
                                        <p className="text-right text-xs text-text-muted mt-1">
                                             {formData.description.length}/20 minimum characters
                                        </p>
                                   </div>

                                   {/* Impact (Optional) */}
                                   <div>
                                        <label className="block text-caption font-bold text-text-muted uppercase mb-2">
                                             Impact Assessment
                                        </label>
                                        <textarea
                                             name="impact"
                                             value={formData.impact}
                                             onChange={handleInputChange}
                                             rows={3}
                                             placeholder="e.g., This will delay the sprint by 3 days, affecting the client demo..."
                                             className="w-full bg-bg-page border border-border-default rounded-xl px-4 py-3 text-ui focus:ring-1 focus:ring-accent outline-none"
                                        />
                                   </div>

                                   {/* Suggested Resolution (Optional) */}
                                   <div>
                                        <label className="block text-caption font-bold text-text-muted uppercase mb-2">
                                             Suggested Resolution
                                        </label>
                                        <textarea
                                             name="suggestedResolution"
                                             value={formData.suggestedResolution}
                                             onChange={handleInputChange}
                                             rows={3}
                                             placeholder="e.g., We need additional developer resources or scope adjustment..."
                                             className="w-full bg-bg-page border border-border-default rounded-xl px-4 py-3 text-ui focus:ring-1 focus:ring-accent outline-none"
                                        />
                                   </div>

                                   {/* File Upload */}
                                   <div>
                                        <input
                                             ref={fileInputRef}
                                             type="file"
                                             multiple
                                             onChange={handleFileUpload}
                                             className="hidden"
                                             id="file-upload"
                                        />
                                        <label
                                             htmlFor="file-upload"
                                             className={`border-2 border-dashed rounded-xl p-8 text-center hover:bg-bg-subtle transition-colors cursor-pointer group block ${uploading ? 'border-accent bg-accent/5' : 'border-border-subtle'
                                                  }`}
                                        >
                                             {uploading ? (
                                                  <div className="flex items-center justify-center gap-2">
                                                       <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                                                       <span className="text-accent">Uploading...</span>
                                                  </div>
                                             ) : (
                                                  <>
                                                       <Paperclip className="mx-auto text-text-disabled group-hover:text-accent mb-2" size={24} />
                                                       <p className="text-caption text-text-body font-medium">Attach logs, screenshots, or requirement docs</p>
                                                       <p className="text-[10px] text-text-disabled mt-1">PDF, PNG, JPG, ZIP up to 10MB</p>
                                                  </>
                                             )}
                                        </label>
                                   </div>

                                   {/* Attachments List */}
                                   {attachments.length > 0 && (
                                        <div className="space-y-2">
                                             <p className="text-xs font-bold text-text-muted uppercase">Attached Files</p>
                                             {attachments.map((file, index) => (
                                                  <div
                                                       key={file.id || index}
                                                       className="flex items-center justify-between p-2 bg-bg-subtle rounded-lg border border-border-default"
                                                  >
                                                       <div className="flex items-center gap-2">
                                                            <FileText size={14} className="text-accent" />
                                                            <div>
                                                                 <p className="text-xs font-medium text-text-primary">{file.name}</p>
                                                                 <p className="text-[10px] text-text-muted">
                                                                      {(file.size / 1024).toFixed(1)} KB
                                                                 </p>
                                                            </div>
                                                       </div>
                                                       <div className="flex items-center gap-2">
                                                            {file.url && (
                                                                 <a
                                                                      href={file.url}
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                      className="p-1 hover:bg-bg-surface rounded"
                                                                 >
                                                                      <Download size={14} className="text-text-muted" />
                                                                 </a>
                                                            )}
                                                            <button
                                                                 onClick={() => removeAttachment(index)}
                                                                 className="p-1 hover:bg-bg-surface rounded text-red-500"
                                                            >
                                                                 <Trash2 size={14} />
                                                            </button>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         </section>

                         {/* Form Actions */}
                         <div className="flex justify-end gap-3">
                              <button
                                   onClick={handleSaveDraft}
                                   className="px-6 py-3 rounded-xl font-bold text-ui text-text-body hover:bg-bg-subtle transition-all flex items-center gap-2"
                              >
                                   <Save size={18} />
                                   Save Draft
                              </button>
                              <button
                                   onClick={handleSubmit}
                                   disabled={loading.submit}
                                   className="bg-accent hover:bg-accent-hover text-text-inverse px-8 py-3 rounded-xl font-bold text-ui flex items-center gap-2 shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
                              >
                                   {loading.submit ? (
                                        <>
                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                             Submitting...
                                        </>
                                   ) : (
                                        <>
                                             <Send size={18} />
                                             Send Report to PM
                                        </>
                                   )}
                              </button>
                         </div>
                    </div>

                    {/* Sidebar: Escalation Guidelines */}
                    <aside className="space-y-6">
                         {/* Urgency Selection */}
                         <div className="bg-bg-card border border-accent-muted rounded-2xl p-6">
                              <h3 className="text-ui font-bold text-text-primary mb-4 flex items-center gap-2">
                                   <Flag size={18} className="text-accent" />
                                   Set Urgency Level
                              </h3>
                              <div className="space-y-2">
                                   {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((level) => (
                                        <button
                                             key={level}
                                             onClick={() => setUrgency(level)}
                                             className={`w-full text-left px-4 py-3 rounded-xl text-caption font-bold transition-all border ${getUrgencyColor(level)} ${urgency === level ? 'ring-1 ring-accent/20' : ''
                                                  }`}
                                        >
                                             <div className="flex items-center justify-between">
                                                  <span>{level}</span>
                                                  {urgency === level && <CheckCircle2 size={16} />}
                                             </div>
                                        </button>
                                   ))}
                              </div>

                              {/* Urgency Descriptions */}
                              <div className="mt-4 pt-4 border-t border-border-subtle text-xs text-text-muted space-y-2">
                                   <p><span className="font-bold text-green-600">LOW:</span> Minor issue, can be addressed later</p>
                                   <p><span className="font-bold text-yellow-600">MEDIUM:</span> Needs attention, but not critical</p>
                                   <p><span className="font-bold text-orange-600">HIGH:</span> Significant impact, requires prompt action</p>
                                   <p><span className="font-bold text-red-600">CRITICAL:</span> Blocking progress, immediate intervention needed</p>
                              </div>
                         </div>

                         {/* Workflow Info */}
                         <div className="bg-bg-subtle rounded-2xl p-6 border border-border-subtle">
                              <h3 className="text-caption font-bold text-text-primary uppercase tracking-widest mb-4">
                                   What happens next?
                              </h3>
                              <ul className="space-y-4">
                                   <li className="flex gap-3 text-ui">
                                        <div className="p-1 bg-accent/10 rounded-lg h-fit">
                                             <Layers className="text-accent" size={16} />
                                        </div>
                                        <span className="text-text-body text-sm">
                                             Report is logged in <span className="font-bold">ActivityLog</span> for audit trail
                                        </span>
                                   </li>
                                   <li className="flex gap-3 text-ui">
                                        <div className="p-1 bg-accent/10 rounded-lg h-fit">
                                             <Target className="text-accent" size={16} />
                                        </div>
                                        <span className="text-text-body text-sm">
                                             <span className="font-bold">Project Manager</span> receives instant notification
                                        </span>
                                   </li>
                                   <li className="flex gap-3 text-ui">
                                        <div className="p-1 bg-red-500/10 rounded-lg h-fit">
                                             <AlertOctagon className="text-red-500" size={16} />
                                        </div>
                                        <span className="text-text-body text-sm">
                                             {urgency === 'CRITICAL' ? (
                                                  <>Task will be marked as <span className="font-bold text-red-500">BLOCKED</span></>
                                             ) : urgency === 'HIGH' ? (
                                                  <>Task may be marked for <span className="font-bold">priority review</span></>
                                             ) : (
                                                  <>Issue will be tracked for <span className="font-bold">resolution</span></>
                                             )}
                                        </span>
                                   </li>
                              </ul>
                         </div>

                         {/* Quick Tips */}
                         <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10">
                              <h3 className="text-caption font-bold text-accent uppercase tracking-widest mb-3">
                                   💡 Pro Tips
                              </h3>
                              <ul className="space-y-2 text-xs text-text-muted">
                                   <li>• Be specific about the impact on timeline</li>
                                   <li>• Include error logs or screenshots when possible</li>
                                   <li>• Mention any attempted solutions</li>
                                   <li>• Specify what kind of help you need from PM</li>
                              </ul>
                         </div>
                    </aside>

               </div>
          </div>
     );
};

export default Page;