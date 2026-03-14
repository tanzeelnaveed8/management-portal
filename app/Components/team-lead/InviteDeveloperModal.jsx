
// Components/team-lead/InviteDeveloperModal.jsx
'use client';
import React, { useState } from 'react';
import { X, Mail, User, Briefcase, Code, Send } from 'lucide-react';

export default function InviteDeveloperModal({ isOpen, onClose, onSubmit }) {
     const [formData, setFormData] = useState({
          name: '',
          email: '',
          jobTitle: '',
          department: '',
          skills: ''
     });
     const [submitting, setSubmitting] = useState(false);
     const [error, setError] = useState(null);
     const [success, setSuccess] = useState(false);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               // Validate email
               const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
               if (!emailRegex.test(formData.email)) {
                    throw new Error('Please enter a valid email address');
               }

               // Process skills (comma-separated to array)
               const skillsArray = formData.skills
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);

               await onSubmit({
                    ...formData,
                    skills: skillsArray
               });

               setSuccess(true);

               // Reset form after 2 seconds and close
               setTimeout(() => {
                    setFormData({
                         name: '', email: '', jobTitle: '', department: '', skills: ''
                    });
                    setSuccess(false);
                    onClose();
               }, 2000);

          } catch (err) {
               setError(err.message);
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
                         <h2 className="text-xl font-bold text-text-primary">Invite Developer</h2>
                         <button
                              onClick={onClose}
                              className="p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                              disabled={submitting}
                         >
                              <X size={20} />
                         </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                         {error && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                   {error}
                              </div>
                         )}

                         {success && (
                              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm flex items-center gap-2">
                                   <Send size={16} />
                                   Invitation sent successfully!
                              </div>
                         )}

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">
                                   <User size={14} className="inline mr-1" /> Full Name *
                              </label>
                              <input
                                   type="text"
                                   name="name"
                                   value={formData.name}
                                   onChange={handleChange}
                                   required
                                   disabled={submitting || success}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   placeholder="John Doe"
                              />
                         </div>

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">
                                   <Mail size={14} className="inline mr-1" /> Email Address *
                              </label>
                              <input
                                   type="email"
                                   name="email"
                                   value={formData.email}
                                   onChange={handleChange}
                                   required
                                   disabled={submitting || success}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   placeholder="john@company.com"
                              />
                         </div>

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">
                                   <Briefcase size={14} className="inline mr-1" /> Job Title
                              </label>
                              <input
                                   type="text"
                                   name="jobTitle"
                                   value={formData.jobTitle}
                                   onChange={handleChange}
                                   disabled={submitting || success}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   placeholder="Senior Frontend Developer"
                              />
                         </div>

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">Department</label>
                              <select
                                   name="department"
                                   value={formData.department}
                                   onChange={handleChange}
                                   disabled={submitting || success}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                              >
                                   <option value="">Select department</option>
                                   <option value="Engineering">Engineering</option>
                                   <option value="Product">Product</option>
                                   <option value="Design">Design</option>
                                   <option value="QA">QA</option>
                                   <option value="DevOps">DevOps</option>
                              </select>
                         </div>

                         <div>
                              <label className="block text-xs font-medium text-text-muted mb-2">
                                   <Code size={14} className="inline mr-1" /> Skills (comma-separated)
                              </label>
                              <input
                                   type="text"
                                   name="skills"
                                   value={formData.skills}
                                   onChange={handleChange}
                                   disabled={submitting || success}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
                                   placeholder="React, Node.js, TypeScript"
                              />
                              <p className="text-[10px] text-text-muted mt-1">
                                   Separate skills with commas (e.g., React, Node.js, Python)
                              </p>
                         </div>

                         <div className="bg-accent-muted/10 rounded-xl p-4 border border-accent/10">
                              <p className="text-xs text-text-body mb-2">
                                   <span className="font-bold">What happens next?</span>
                              </p>
                              <ul className="text-[10px] text-text-muted space-y-1 list-disc pl-4">
                                   <li>An invitation email will be sent to the developer</li>
                                   <li>They'll receive instructions to set up their account</li>
                                   <li>You can assign tasks once they accept the invitation</li>
                                   <li>The invitation expires in 7 days</li>
                              </ul>
                         </div>

                         <div className="flex gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   disabled={submitting || success}
                                   className="flex-1 px-6 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors disabled:opacity-50"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting || success}
                                   className="flex-1 bg-accent text-text-inverse rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3 flex items-center justify-center gap-2"
                              >
                                   {submitting ? (
                                        <>
                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                             Sending...
                                        </>
                                   ) : success ? (
                                        <>
                                             <CheckCircle size={16} />
                                             Sent!
                                        </>
                                   ) : (
                                        <>
                                             <Send size={16} />
                                             Send Invitation
                                        </>
                                   )}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
}