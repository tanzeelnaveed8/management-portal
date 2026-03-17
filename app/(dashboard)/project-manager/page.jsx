
// app/(dashboard)/project-manager/page.js
'use client';
import React, { useState, useEffect } from 'react';
import {
     Plus,
     Briefcase,
     Users,
     Calendar,
     CheckCircle2,
     AlertCircle,
     FileText,
     MessageSquare,
     Upload,
     MoreVertical,
     ChevronRight,
     TrendingUp,
     Clock,
     UserPlus,
     Download,
     Filter,
     X,
     Send,
     Star,
     LogOut
} from 'lucide-react';
import { useProjectManager } from '../../../hooks/useProjectManager';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import Swal from 'sweetalert2';
import Spinner from '../../Components/common/Spinner';


const ProjectManagerDashboard = () => {
     const router = useRouter();
     const {
          projects,
          stats,
          recentDocuments,
          recentFeedback,
          upcomingMilestones,
          projectsWithoutLead,
          teamLeads,
          loading,
          error,
          createProject,
          assignTeamLead,
          uploadDocument,
          recordFeedback,
          generateReport,
          refetch
     } = useProjectManager();

     console.log("Team Leads", teamLeads);

     console.log("Projects", projects);
     const [showCreateModal, setShowCreateModal] = useState(false);
     const [showFeedbackModal, setShowFeedbackModal] = useState(false);
     const [showDocumentModal, setShowDocumentModal] = useState(false);
     const [selectedProject, setSelectedProject] = useState(null);
     const [formData, setFormData] = useState({
          name: '',
          description: '',
          deadline: '',
          priority: 'MEDIUM',
          teamLeadId: '',
          clientName: '',
          clientEmail: '',
          clientCompany: '',
          clientPhone: '',
          budget: ''
     });
     const [feedbackData, setFeedbackData] = useState({
          content: '',
          stage: 'review',
          status: 'PENDING',
          rating: 5,
          isApproved: false
     });
     const [uploading, setUploading] = useState(false);
     const [formErrors, setFormErrors] = useState({});

     // Handle input change
     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
          if (formErrors[name]) {
               setFormErrors(prev => ({ ...prev, [name]: null }));
          }
     };

     // Validate form
     const validateForm = () => {
          const errors = {};

          if (!formData.name.trim()) {
               errors.name = 'Project name is required';
          } else if (formData.name.length < 3) {
               errors.name = 'Project name must be at least 3 characters';
          }

          if (!formData.clientName.trim()) {
               errors.clientName = 'Client name is required';
          }

          if (!formData.clientEmail.trim()) {
               errors.clientEmail = 'Client email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
               errors.clientEmail = 'Invalid email format';
          }

          return errors;
     };

     // Handle create project
     const handleCreateProject = async (e) => {
          e.preventDefault();

          const errors = validateForm();
          if (Object.keys(errors).length > 0) {
               setFormErrors(errors);
               return;
          }

          const result = await createProject({
               ...formData,
               budget: formData.budget ? parseFloat(formData.budget) : undefined
          });

          if (result.success) {
               setShowCreateModal(false);
               setFormData({
                    name: '',
                    description: '',
                    deadline: '',
                    priority: 'MEDIUM',
                    teamLeadId: '',
                    clientName: '',
                    clientEmail: '',
                    clientCompany: '',
                    clientPhone: '',
                    budget: ''
               });
          }
     };

     // Handle assign team lead
     const handleAssignTeamLead = async (projectId) => {
          const { value: teamLeadId } = await Swal.fire({
               title: 'Assign Team Lead',
               input: 'select',
               inputOptions: teamLeads.reduce((acc, tl) => {
                    acc[tl.id] = `${tl.name} (${tl._count.projectsLed} active projects)`;
                    return acc;
               }, {}),
               inputPlaceholder: 'Select a team lead',
               showCancelButton: true,
               confirmButtonColor: '#2563eb',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Assign',
               preConfirm: (value) => {
                    if (!value) {
                         Swal.showValidationMessage('Please select a team lead');
                    }
                    return value;
               }
          });

          if (teamLeadId) {
               await assignTeamLead(projectId, teamLeadId);
          }
     };

     // Handle document upload
     const handleDocumentUpload = async (e, projectId) => {
          const file = e.target.files[0];
          if (!file) return;

          const { value: documentType } = await Swal.fire({
               title: 'Document Type',
               input: 'select',
               inputOptions: {
                    CLIENT_REQUIREMENT: 'Client Requirements',
                    PROJECT_DOC: 'Project Documentation',
                    CONTRACT: 'Contract',
                    OTHER: 'Other'
               },
               inputPlaceholder: 'Select document type',
               showCancelButton: true,
               confirmButtonColor: '#2563eb'
          });

          if (documentType) {
               const { value: description } = await Swal.fire({
                    title: 'Description',
                    input: 'textarea',
                    inputPlaceholder: 'Enter document description (optional)',
                    showCancelButton: true,
                    confirmButtonColor: '#2563eb'
               });

               setUploading(true);
               await uploadDocument(projectId, file, documentType, description);
               setUploading(false);
          }
     };

     // Handle record feedback
     const handleRecordFeedback = async (project) => {
          setSelectedProject(project);
          setShowFeedbackModal(true);
     };

     // Handle submit feedback
     const handleSubmitFeedback = async () => {
          if (!feedbackData.content.trim()) {
               Swal.fire({
                    title: 'Error',
                    text: 'Feedback content is required',
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
               return;
          }

          await recordFeedback(selectedProject.id, feedbackData);
          setShowFeedbackModal(false);
          setFeedbackData({
               content: '',
               stage: 'review',
               status: 'PENDING',
               rating: 5,
               isApproved: false
          });
     };

     // Handle generate report
     const handleGenerateReport = async (projectId) => {
          const report = await generateReport(projectId);

          if (report) {
               // Create a downloadable file
               const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `project-report-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
               a.click();

               Swal.fire({
                    title: 'Report Generated',
                    text: 'Report has been downloaded',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });
          }
     };


     if (loading.dashboard && projects.length === 0) {
          return <Spinner title = "Project Manager Dashboard" />;
     }

     return (
          <div className="min-h-screen bg-bg-page text-text-body font-sans flex">
               {/* Main Content */}
               <main className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="h-16 border-b border-border-default bg-bg-surface flex items-center justify-between px-page-x sticky top-0 z-10">
                         <h1 className="text-headline font-bold text-text-primary">Project Manager Panel</h1>
                         <div className="flex items-center gap-4">
                              <button
                                   onClick={() => setShowCreateModal(true)}
                                   className="bg-accent hover:bg-accent-hover text-text-inverse px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                              >
                                   <Plus size={18} />
                                   <span>Create New Project</span>
                              </button>
                             
                         </div>
                    </header>

                    {/* Error Message */}
                    {error && (
                         <div className="mx-page-x mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
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

                    {/* Dashboard Content */}
                    <div className="p-page-y px-page-x space-y-8 overflow-y-auto chat-scroll ">

                         {/* Quick Stats */}
                         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <StatCard
                                   label="Active Projects"
                                   value={stats.activeProjects}
                                   icon={<Briefcase className="text-accent" />}
                                   trend={`${projects.length} total`}
                              />
                              <StatCard
                                   label="Total Milestones"
                                   value={stats.totalMilestones}
                                   icon={<CheckCircle2 className="text-accent-secondary" />}
                                   trend={`${stats.completionRate}% complete`}
                              />
                              <StatCard
                                   label="Pending Approvals"
                                   value={stats.pendingApprovals}
                                   icon={<MessageSquare className="text-amber-500" />}
                                   trend={`${projectsWithoutLead.length} need leads`}
                              />
                              <StatCard
                                   label="Deadlines Hit"
                                   value={`${stats.deadlinesHit}%`}
                                   icon={<TrendingUp className="text-emerald-500" />}
                                   trend="High performance"
                              />
                         </section>

                         {/* Main Grid */}
                         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                              {/* Project List Section */}
                              <div className="xl:col-span-2 space-y-6">
                                   <div className="flex items-center justify-between">
                                        <h2 className="text-subheading font-bold text-text-primary flex items-center gap-2">
                                             Ongoing Projects <span className="text-xs font-normal px-2 py-0.5 bg-accent-muted text-accent rounded-full">{projects.length}</span>
                                        </h2>
                                        <button
                                             onClick={() => router.push('/project-manager/projects')}
                                             className="text-ui text-accent font-medium hover:underline"
                                        >
                                             View All
                                        </button>
                                   </div>

                                   <div className="space-y-4">
                                        {projects.slice(0, 5).map((project) => (
                                             <ProjectRow
                                                  key={project.id}
                                                  project={project}
                                                  onAssignLead={() => handleAssignTeamLead(project.id)}
                                                  onUploadDoc={(e) => handleDocumentUpload(e, project.id)}
                                                  onAddFeedback={() => handleRecordFeedback(project)}
                                                  onGenerateReport={() => handleGenerateReport(project.id)}
                                                  uploading={uploading}
                                             />
                                        ))}
                                   </div>

                                   {/* Milestones & Timeline Focus */}
                                   <div className="bg-bg-card rounded-xl p-6 border border-border-subtle">
                                        <h3 className="text-ui font-bold text-text-primary mb-4 flex items-center gap-2">
                                             <Clock size={18} className="text-accent" />
                                             Upcoming Milestones
                                        </h3>
                                        <div className="space-y-3">
                                             {upcomingMilestones.length > 0 ? (
                                                  upcomingMilestones.map((milestone) => (
                                                       <MilestoneItem
                                                            key={milestone.id}
                                                            title={milestone.name}
                                                            project={milestone.project.name}
                                                            date={format(new Date(milestone.deadline), 'MMM dd')}
                                                            status={milestone.isDelayed ? 'urgent' : 'normal'}
                                                       />
                                                  ))
                                             ) : (
                                                  <p className="text-sm text-text-muted text-center py-4">
                                                       No upcoming milestones
                                                  </p>
                                             )}
                                        </div>
                                   </div>
                              </div>

                              {/* Side Panel: Actions & Feedback */}
                              <div className="space-y-8">
                                   {/* Assign Team Leads Card */}
                                   <div className="bg-bg-surface rounded-xl p-6 border border-border-default shadow-sm">
                                        <h3 className="text-ui font-bold text-text-primary mb-4 flex items-center gap-2">
                                             <UserPlus size={18} className="text-accent" />
                                             Assign Team Leads
                                        </h3>
                                        <div className="space-y-4">
                                             <p className="text-xs text-text-muted mb-2">
                                                  Projects waiting for lead assignment: {projectsWithoutLead.length}
                                             </p>
                                             {projectsWithoutLead.slice(0, 3).map((project) => (
                                                  <div key={project.id} className="p-3 bg-bg-subtle border border-border-subtle rounded-lg flex items-center justify-between">
                                                       <span className="text-sm font-medium">{project.name}</span>
                                                       <button
                                                            onClick={() => handleAssignTeamLead(project.id)}
                                                            className="text-xs bg-accent text-text-inverse px-3 py-1.5 rounded-md hover:bg-accent-hover transition-colors"
                                                       >
                                                            Assign
                                                       </button>
                                                  </div>
                                             ))}
                                             {projectsWithoutLead.length === 0 && (
                                                  <p className="text-sm text-green-600 text-center py-2">
                                                       All projects have leads assigned ✓
                                                  </p>
                                             )}
                                        </div>
                                   </div>

                                   {/* Client Requirements & Docs */}
                                   <div className="bg-bg-surface rounded-xl p-6 border border-border-default shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                             <h3 className="text-ui font-bold text-text-primary flex items-center gap-2">
                                                  <Upload size={18} className="text-accent" />
                                                  Client Documents
                                             </h3>
                                             <label className="cursor-pointer">
                                                  <input
                                                       type="file"
                                                       className="hidden"
                                                       onChange={(e) => {
                                                            if (projects.length > 0) {
                                                                 handleDocumentUpload(e, projects[0].id);
                                                            }
                                                       }}
                                                  />
                                                  <button className="p-1 hover:bg-bg-subtle rounded">
                                                       <Plus size={16} />
                                                  </button>
                                             </label>
                                        </div>
                                        <div className="space-y-3">
                                             {recentDocuments.length > 0 ? (
                                                  recentDocuments.map((doc) => (
                                                       <DocItem
                                                            key={doc.id}
                                                            name={doc.name}
                                                            size={`${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`}
                                                            date={formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                                                            project={doc.project?.name}
                                                       />
                                                  ))
                                             ) : (
                                                  <p className="text-sm text-text-muted text-center py-4">
                                                       No documents uploaded yet
                                                  </p>
                                             )}
                                        </div>
                                   </div>

                                   {/* Recent Client Feedback */}
                                   <div className="bg-bg-surface rounded-xl p-6 border border-border-default shadow-sm">
                                        <h3 className="text-ui font-bold text-text-primary mb-4 flex items-center gap-2">
                                             <MessageSquare size={18} className="text-accent-secondary" />
                                             Recent Feedback
                                        </h3>
                                        <div className="space-y-4">
                                             {recentFeedback.length > 0 ? (
                                                  recentFeedback.map((feedback) => (
                                                       <div key={feedback.id} className={`border-l-2 pl-3 py-1 ${feedback.isApproved ? 'border-emerald-500' :
                                                            feedback.status === 'REJECTED' ? 'border-red-500' : 'border-accent'
                                                            }`}>
                                                            <p className="text-xs font-semibold text-text-primary line-clamp-2">
                                                                 "{feedback.content}"
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                 <span className="text-[10px] text-text-muted">
                                                                      {feedback.project?.clientName || feedback.project?.name}
                                                                 </span>
                                                                 <span className="text-[8px] text-text-disabled">•</span>
                                                                 <span className="text-[10px] text-text-muted">
                                                                      {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                                                                 </span>
                                                                 {feedback.isApproved && (
                                                                      <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                                                                           Approved
                                                                      </span>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  ))
                                             ) : (
                                                  <p className="text-sm text-text-muted text-center py-4">
                                                       No feedback recorded yet
                                                  </p>
                                             )}
                                        </div>
                                   </div>
                              </div>

                         </div>
                    </div>
               </main>

               {/* Create Project Modal */}
               {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                         <div className="bg-bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border-default  animate-in fade-in zoom-in duration-200 h-[90vh]">
                              <div className="p-6 border-b border-border-default flex justify-between items-center bg-bg-subtle">
                                   <h2 className="text-headline font-bold text-text-primary">Define New Project</h2>
                                   <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary">
                                        <X size={20} />
                                   </button>
                              </div>

                              <form onSubmit={handleCreateProject} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto chat-scroll  chat-scroll text-sm">
                                   {/* Basic Info */}
                                   <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                  Project Name <span className="text-red-500">*</span>
                                             </label>
                                             <input
                                                  type="text"
                                                  name="name"
                                                  value={formData.name}
                                                  onChange={handleInputChange}
                                                  className={`w-full p-3 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none ${formErrors.name ? 'border-red-500' : 'border-border-default'
                                                       }`}
                                                  placeholder="e.g. Q4 Growth Campaign"
                                             />
                                             {formErrors.name && (
                                                  <p className="text-xs text-red-500">{formErrors.name}</p>
                                             )}
                                        </div>
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                  Target Deadline
                                             </label>
                                             <input
                                                  type="date"
                                                  name="deadline"
                                                  value={formData.deadline}
                                                  onChange={handleInputChange}
                                                  min={new Date().toISOString().split('T')[0]}
                                                  className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                             />
                                        </div>
                                   </div>

                                   {/* Description */}
                                   <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                             Project Scope
                                        </label>
                                        <textarea
                                             name="description"
                                             value={formData.description}
                                             onChange={handleInputChange}
                                             className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg h-24 focus:ring-1 focus:ring-accent outline-none"
                                             placeholder="Describe the key deliverables..."
                                        />
                                   </div>

                                   {/* Client Info */}
                                   <div className="border-t border-border-subtle pt-4">
                                        <h3 className="text-sm font-bold text-text-primary mb-4">Client Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Client Name <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                       type="text"
                                                       name="clientName"
                                                       value={formData.clientName}
                                                       onChange={handleInputChange}
                                                       className={`w-full p-3 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none ${formErrors.clientName ? 'border-red-500' : 'border-border-default'
                                                            }`}
                                                       placeholder="e.g. Acme Corporation"
                                                  />
                                                  {formErrors.clientName && (
                                                       <p className="text-xs text-red-500">{formErrors.clientName}</p>
                                                  )}
                                             </div>
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Client Email <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                       type="email"
                                                       name="clientEmail"
                                                       value={formData.clientEmail}
                                                       onChange={handleInputChange}
                                                       className={`w-full p-3 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none ${formErrors.clientEmail ? 'border-red-500' : 'border-border-default'
                                                            }`}
                                                       placeholder="client@company.com"
                                                  />
                                                  {formErrors.clientEmail && (
                                                       <p className="text-xs text-red-500">{formErrors.clientEmail}</p>
                                                  )}
                                             </div>
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Company
                                                  </label>
                                                  <input
                                                       type="text"
                                                       name="clientCompany"
                                                       value={formData.clientCompany}
                                                       onChange={handleInputChange}
                                                       className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                                       placeholder="Optional"
                                                  />
                                             </div>
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Phone
                                                  </label>
                                                  <input
                                                       type="tel"
                                                       name="clientPhone"
                                                       value={formData.clientPhone}
                                                       onChange={handleInputChange}
                                                       className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                                       placeholder="Optional"
                                                  />
                                             </div>
                                        </div>
                                   </div>

                                   {/* Assignment & Priority */}
                                   <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                  Assign Lead
                                             </label>
                                             <select
                                                  name="teamLeadId"
                                                  value={formData.teamLeadId}
                                                  onChange={handleInputChange}
                                                  className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none appearance-none"
                                             >
                                                  <option value="">Select a Team Lead</option>
                                                  {teamLeads.map(tl => (
                                                       <option key={tl.id} value={tl.id}>
                                                            {tl.name} ({tl._count.projectsLed} active)
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                  Priority
                                             </label>
                                             <select
                                                  name="priority"
                                                  value={formData.priority}
                                                  onChange={handleInputChange}
                                                  className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                             >
                                                  <option value="LOW">Low</option>
                                                  <option value="MEDIUM">Medium</option>
                                                  <option value="HIGH">High</option>
                                                  <option value="CRITICAL">Critical</option>
                                             </select>
                                        </div>
                                   </div>

                                   {/* Budget */}
                                   <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                             Budget (Optional)
                                        </label>
                                        <input
                                             type="number"
                                             name="budget"
                                             value={formData.budget}
                                             onChange={handleInputChange}
                                             min="0"
                                             step="1000"
                                             className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                             placeholder="e.g. 50000"
                                        />
                                   </div>
                              </form>

                              <div className="p-6 bg-bg-subtle border-t border-border-default flex justify-end gap-3">
                                   <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2 rounded-lg font-medium text-text-body hover:bg-border-default"
                                   >
                                        Cancel
                                   </button>
                                   <button
                                        onClick={handleCreateProject}
                                        disabled={loading.createProject}
                                        className="px-6 py-2 rounded-lg font-medium bg-accent text-text-inverse hover:bg-accent-hover shadow-lg disabled:opacity-50 flex items-center gap-2"
                                   >
                                        {loading.createProject ? (
                                             <>
                                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                  Creating...
                                             </>
                                        ) : (
                                             'Launch Project'
                                        )}
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               {/* Feedback Modal */}
               {showFeedbackModal && selectedProject && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                         <div className="bg-bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border-default overflow-hidden">
                              <div className="p-6 border-b border-border-default flex justify-between items-center">
                                   <h2 className="text-headline font-bold text-text-primary">
                                        Record Feedback - {selectedProject.name}
                                   </h2>
                                   <button onClick={() => setShowFeedbackModal(false)} className="text-text-muted hover:text-text-primary">
                                        <X size={20} />
                                   </button>
                              </div>

                              <div className="p-6 space-y-4">
                                   <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                             Stage
                                        </label>
                                        <select
                                             value={feedbackData.stage}
                                             onChange={(e) => setFeedbackData(prev => ({ ...prev, stage: e.target.value }))}
                                             className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        >
                                             <option value="initial">Initial Review</option>
                                             <option value="review">Progress Review</option>
                                             <option value="revision">Revision</option>
                                             <option value="approval">Final Approval</option>
                                        </select>
                                   </div>

                                   <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                             Feedback
                                        </label>
                                        <textarea
                                             value={feedbackData.content}
                                             onChange={(e) => setFeedbackData(prev => ({ ...prev, content: e.target.value }))}
                                             rows="4"
                                             className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                             placeholder="Enter client feedback..."
                                        />
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                  Rating
                                             </label>
                                             <select
                                                  value={feedbackData.rating}
                                                  onChange={(e) => setFeedbackData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                                                  className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                             >
                                                  {[1, 2, 3, 4, 5].map(r => (
                                                       <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                  Status
                                             </label>
                                             <select
                                                  value={feedbackData.status}
                                                  onChange={(e) => setFeedbackData(prev => ({ ...prev, status: e.target.value, isApproved: e.target.value === 'APPROVED' }))}
                                                  className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                             >
                                                  <option value="PENDING">Pending</option>
                                                  <option value="APPROVED">Approved</option>
                                                  <option value="REJECTED">Rejected</option>
                                                  <option value="REVISION_REQUESTED">Revision Requested</option>
                                             </select>
                                        </div>
                                   </div>

                                   {feedbackData.status === 'APPROVED' && (
                                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                             <p className="text-sm text-green-600 flex items-center gap-2">
                                                  <CheckCircle2 size={16} />
                                                  This will mark the project as completed if it's the final approval stage.
                                             </p>
                                        </div>
                                   )}
                              </div>

                              <div className="p-6 bg-bg-subtle border-t border-border-default flex justify-end gap-3">
                                   <button
                                        onClick={() => setShowFeedbackModal(false)}
                                        className="px-6 py-2 rounded-lg font-medium text-text-body hover:bg-border-default"
                                   >
                                        Cancel
                                   </button>
                                   <button
                                        onClick={handleSubmitFeedback}
                                        className="px-6 py-2 rounded-lg font-medium bg-accent text-text-inverse hover:bg-accent-hover shadow-lg flex items-center gap-2"
                                   >
                                        <Send size={16} />
                                        Save Feedback
                                   </button>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
};

// UI Components
const StatCard = ({ label, value, icon, trend }) => (
     <div className="bg-bg-surface border border-border-default p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-bg-subtle rounded-lg">{icon}</div>
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
          </div>
          <div className="flex items-baseline gap-2">
               <span className="text-4xl font-bold text-text-primary">{value}</span>
               <span className="text-xs text-emerald-500 font-medium">{trend}</span>
          </div>
     </div>
);

const ProjectRow = ({ project, onAssignLead, onUploadDoc, onAddFeedback, onGenerateReport, uploading }) => {
     const router = useRouter();

     const getHealthColor = (project) => {
          if (project.isDelayed) return 'bg-red-100 text-red-700';
          if (project.riskLevel === 'HIGH') return 'bg-amber-100 text-amber-700';
          return 'bg-emerald-100 text-emerald-700';
     };

     const getHealthText = (project) => {
          if (project.isDelayed) return 'Delayed';
          if (project.riskLevel === 'HIGH') return 'At Risk';
          if (project.status === 'COMPLETED') return 'Completed';
          if (project.status === 'CLIENT_REVIEW') return 'In Review';
          return 'On Track';
     };

     return (
          <div
               onClick={() => router.push(`/project-manager/projects/${project.id}`)}
               className="group bg-bg-surface border border-border-default p-4 rounded-xl hover:shadow-md hover:border-accent transition-all cursor-pointer"
          >
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                         <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-text-primary group-hover:text-accent transition-colors">
                                   {project.name}
                              </h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getHealthColor(project)}`}>
                                   {getHealthText(project)}
                              </span>
                         </div>
                         <div className="flex items-center gap-4 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                   <Users size={12} />
                                   {project.teamLead?.name || 'Unassigned'}
                              </span>
                              <span className="flex items-center gap-1">
                                   <Calendar size={12} />
                                   {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'No deadline'}
                              </span>
                              <span className="flex items-center gap-1">
                                   <CheckCircle2 size={12} />
                                   {project.milestonesCount} milestones
                              </span>
                         </div>
                    </div>

                    <div className="w-full md:w-48">
                         <div className="flex justify-between text-[10px] font-bold text-text-muted mb-1 uppercase tracking-tighter">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                         </div>
                         <div className="h-2 bg-bg-subtle rounded-full overflow-hidden border border-border-subtle">
                              <div
                                   className={`h-full transition-all duration-500 rounded-full ${project.isDelayed ? 'bg-amber-500' : 'bg-accent'
                                        }`}
                                   style={{ width: `${project.progress}%` }}
                              />
                         </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                         {!project.teamLeadId && (
                              <button
                                   onClick={onAssignLead}
                                   className="p-2 hover:bg-accent/10 rounded-lg text-accent"
                                   title="Assign Team Lead"
                              >
                                   <UserPlus size={18} />
                              </button>
                         )}
                         <label className="cursor-pointer">
                              <input
                                   type="file"
                                   className="hidden"
                                   onChange={onUploadDoc}
                                   disabled={uploading}
                              />
                              <button
                                   className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted hover:text-accent"
                                   title="Upload Document"
                              >
                                   <Upload size={18} />
                              </button>
                         </label>
                         <button
                              onClick={onAddFeedback}
                              className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted hover:text-accent"
                              title="Record Feedback"
                         >
                              <MessageSquare size={18} />
                         </button>
                         <button
                              onClick={onGenerateReport}
                              className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted hover:text-accent"
                              title="Generate Report"
                         >
                              <Download size={18} />
                         </button>
                         <button className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted">
                              <MoreVertical size={18} />
                         </button>
                         <ChevronRight size={18} className="text-border-strong group-hover:text-accent" />
                    </div>
               </div>
          </div>
     );
};

const MilestoneItem = ({ title, project, date, status }) => (
     <div className="flex items-center justify-between p-3 bg-bg-surface border border-border-subtle rounded-lg">
          <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${status === 'urgent' ? 'bg-red-500 animate-pulse' : 'bg-accent'}`} />
               <div>
                    <p className="text-sm font-semibold text-text-primary">{title}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-tight">{project}</p>
               </div>
          </div>
          <span className={`text-xs font-bold ${status === 'urgent' ? 'text-red-600' : 'text-text-muted'}`}>
               {date}
          </span>
     </div>
);

const DocItem = ({ name, size, date, project }) => (
     <div className="flex items-center justify-between text-ui group hover:bg-bg-subtle p-2 rounded-lg transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
               <FileText size={16} className="text-text-muted group-hover:text-accent" />
               <div>
                    <p className="text-sm font-medium text-text-body">{name}</p>
                    <p className="text-[10px] text-text-disabled uppercase">
                         {size} • {date} • {project}
                    </p>
               </div>
          </div>
          <button className="text-text-muted hover:text-accent">
               <Download size={14} />
          </button>
     </div>
);

export default ProjectManagerDashboard;