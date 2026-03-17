
// app/(dashboard)/project-manager/projects/[id]/page.jsx
// app/(dashboard)/project-manager/projects/[id]/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import {
     ArrowLeft,
     Calendar,
     Users,
     Target,
     FileText,
     Clock,
     Wallet,
     Phone,
     Mail,
     AlertCircle,
     TrendingUp,
     CheckCircle2,
     ChevronLeft,
     Plus,
     Upload,
     Download,
     MessageSquare,
     Edit,
     Trash2,
     MoreVertical,
     Flag,
     User,
     Paperclip,
     Image,
     File,
     X,
     CheckCircle,
     Loader,
     Play,
     Pause,
     RefreshCw,
     BarChart2,
     Link as LinkIcon,
     Star,
     ThumbsUp,
     ThumbsDown,
     MessageCircle, Building, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Spinner from '../../../../Components/common/Spinner';

const ProjectDetailPage = ({ params }) => {
     const router = useRouter();
     const unwrappedParams = React.use(params);
     const projectId = unwrappedParams.id;

     const [project, setProject] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [activeTab, setActiveTab] = useState('overview');
     const [refreshing, setRefreshing] = useState(false);

     // Modal states
     const [showMilestoneModal, setShowMilestoneModal] = useState(false);
     const [showDocumentModal, setShowDocumentModal] = useState(false);
     const [showFeedbackModal, setShowFeedbackModal] = useState(false);
     const [showTaskModal, setShowTaskModal] = useState(false);
     const [selectedMilestone, setSelectedMilestone] = useState(null);
     const [uploadProgress, setUploadProgress] = useState(0);

     useEffect(() => {
          if (projectId) {
               fetchProjectDetails();
          }
     }, [projectId]);

     const fetchProjectDetails = async () => {
          try {
               setLoading(true);
               setError(null);

               console.log('Fetching project:', projectId);
               const response = await fetch(`/api/project-manager/projects/${projectId}`);

               // Check if response is OK
               if (!response.ok) {
                    // Try to get error message from response
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                         const errorData = await response.json();
                         throw new Error(errorData.error || 'Failed to fetch project');
                    } else {
                         // If not JSON, it might be an HTML error page
                         const text = await response.text();
                         console.error('Non-JSON response:', text.substring(0, 200));
                         throw new Error(`Server error: ${response.status}`);
                    }
               }

               const data = await response.json();
               console.log("Project Data ", data)

               if (!data.project) {
                    throw new Error('Project data not found in response');
               }

               setProject(data.project);
          } catch (err) {
               console.error('Error fetching project:', err);
               setError(err.message);

               // Handle specific error cases
               if (err.message.includes('401')) {
                    router.push('/auth/login');
               }
          } finally {
               setLoading(false);
          }
     };

     const handleRefresh = async () => {
          setRefreshing(true);
          await fetchProjectDetails();
          setRefreshing(false);
     };

     // Milestone Management
     const handleCreateMilestone = async (milestoneData) => {
          try {
               const response = await fetch(`/api/project-manager/projects/${projectId}/milestones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(milestoneData)
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create milestone');
               }

               await fetchProjectDetails();
               setShowMilestoneModal(false);

               Swal.fire({
                    title: 'Success!',
                    text: 'Milestone created successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });
          } catch (err) {
               Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
          }
     };

     const handleUpdateMilestone = async (milestoneId, updates) => {
          try {
               const response = await fetch(`/api/project-manager/milestones/${milestoneId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
               });

               if (!response.ok) throw new Error('Failed to update milestone');

               await fetchProjectDetails();
          } catch (err) {
               console.error('Error updating milestone:', err);
          }
     };

     // Document Management
     const handleUploadDocument = async (file, type, description) => {
          try {
               const formData = new FormData();
               formData.append('file', file);
               formData.append('type', type);
               if (description) formData.append('description', description);

               const response = await fetch(`/api/project-manager/projects/${projectId}/documents`, {
                    method: 'POST',
                    body: formData
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to upload document');
               }

               await fetchProjectDetails();
               setShowDocumentModal(false);

               Swal.fire({
                    title: 'Uploaded!',
                    text: 'Document uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });
          } catch (err) {
               Swal.fire({
                    title: 'Upload Failed',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
          }
     };

     const handleDeleteDocument = async (documentId) => {
          const result = await Swal.fire({
               title: 'Delete Document?',
               text: 'This action cannot be undone',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#b91c1c',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, delete'
          });

          if (result.isConfirmed) {
               try {
                    const response = await fetch(`/api/project-manager/documents/${documentId}`, {
                         method: 'DELETE'
                    });

                    if (!response.ok) throw new Error('Failed to delete document');

                    await fetchProjectDetails();

                    Swal.fire({
                         title: 'Deleted!',
                         text: 'Document deleted successfully',
                         icon: 'success',
                         timer: 2000,
                         showConfirmButton: false
                    });
               } catch (err) {
                    Swal.fire({
                         title: 'Error',
                         text: err.message,
                         icon: 'error',
                         confirmButtonColor: '#b91c1c'
                    });
               }
          }
     };

     // Feedback Management
     const handleAddFeedback = async (feedbackData) => {
          try {
               const response = await fetch(`/api/project-manager/projects/${projectId}/feedback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feedbackData)
               });

               if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to add feedback');
               }

               await fetchProjectDetails();
               setShowFeedbackModal(false);

               Swal.fire({
                    title: feedbackData.isApproved ? 'Approved! 🎉' : 'Feedback Added',
                    text: feedbackData.isApproved ? 'Client approval recorded' : 'Feedback saved successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });
          } catch (err) {
               Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
          }
     };

     const handleUpdateFeedbackStatus = async (feedbackId, status, isApproved) => {
          try {
               const response = await fetch(`/api/project-manager/feedback/${feedbackId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status, isApproved })
               });

               if (!response.ok) throw new Error('Failed to update feedback');

               await fetchProjectDetails();
          } catch (err) {
               console.error('Error updating feedback:', err);
          }
     };

     if (loading) {
          return <Spinner title="Project Details..." />
     }

     if (error || !project) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x py-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Project Not Found</h2>
                         <p className="text-text-muted mb-6">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
                         <button
                              onClick={() => router.push('/project-manager/projects')}
                              className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Back to Projects
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x py-page-y">
               <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Header with Navigation */}
                    <div className="flex items-center justify-between">
                         <Link
                              href="/project-manager/projects"
                              className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs font-bold uppercase tracking-widest group"
                         >
                              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                              Back to Projects
                         </Link>
                         <div className="flex items-center gap-3">
                              <button
                                   onClick={handleRefresh}
                                   disabled={refreshing}
                                   className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
                              >
                                   <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                              </button>
                              <button
                                   onClick={() => router.push(`/project-manager/projects/${projectId}/report`)}
                                   className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-lg text-sm font-medium text-text-body hover:bg-bg-subtle transition-colors"
                              >
                                   <BarChart2 size={16} />
                                   Generate Report
                              </button>
                         </div>
                    </div>

                    {/* Project Hero Section */}
                    <div className="bg-gradient-to-br from-accent to-accent-active rounded-3xl p-8 text-text-inverse">
                         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="space-y-4">
                                   <div className="flex items-center gap-3 flex-wrap">
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                                             {project.status?.replace('_', ' ')}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold flex items-center gap-1">
                                             <Flag size={12} />
                                             {project.priority} Priority
                                        </span>
                                        {project.riskLevel && (
                                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.riskLevel === 'HIGH' ? 'bg-red-500/30' :
                                                       project.riskLevel === 'MEDIUM' ? 'bg-yellow-500/30' :
                                                            'bg-green-500/30'
                                                  }`}>
                                                  {project.riskLevel} Risk
                                             </span>
                                        )}
                                   </div>
                                   <h1 className="text-4xl font-bold">{project.name}</h1>
                                   <p className="text-white/80 max-w-2xl">{project.description}</p>

                                   {/* Quick Stats */}
                                   <div className="flex items-center gap-8 pt-4">
                                        <div>
                                             <p className="text-xs text-white/60 uppercase">Progress</p>
                                             <div className="flex items-center gap-3">
                                                  <span className="text-2xl font-bold">{project.progress}%</span>
                                                  <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                                                       <div
                                                            className="h-full bg-white rounded-full"
                                                            style={{ width: `${project.progress}%` }}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div>
                                             <p className="text-xs text-white/60 uppercase">Tasks</p>
                                             <p className="text-2xl font-bold">{project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0}</p>
                                        </div>
                                        <div>
                                             <p className="text-xs text-white/60 uppercase">Milestones</p>
                                             <p className="text-2xl font-bold">{project.milestones?.length || 0}</p>
                                        </div>
                                   </div>
                              </div>

                              {/* Client Avatar */}
                              <div className="lg:text-right">
                                   <div className="inline-flex items-center gap-3 bg-white/10 rounded-2xl px-6 py-4">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                             {project.clientName?.charAt(0)}
                                        </div>
                                        <div>
                                             <p className="text-sm font-medium">Client</p>
                                             <p className="text-lg font-bold">{project.clientName}</p>
                                             <p className="text-xs text-white/60">{project.clientCompany}</p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Main Content Tabs */}
                    <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden">
                         {/* Tab Navigation */}
                         <div className="flex border-b border-border-default bg-bg-subtle/50 px-6 overflow-x-auto">
                              {[
                                   { id: 'overview', label: 'Overview', icon: <Target size={18} /> },
                                   { id: 'milestones', label: 'Milestones', icon: <Flag size={18} />, count: project.milestones?.length },
                                   { id: 'tasks', label: 'Tasks', icon: <CheckCircle size={18} />, count: project.tasks?.length },
                                   { id: 'documents', label: 'Documents', icon: <FileText size={18} />, count: project.documents?.length },
                                   { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} />, count: project.feedbacks?.length }
                              ].map(tab => (
                                   <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                                  ? 'text-accent'
                                                  : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                        {tab.count > 0 && (
                                             <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                                                       ? 'bg-accent/10 text-accent'
                                                       : 'bg-bg-subtle text-text-muted'
                                                  }`}>
                                                  {tab.count}
                                             </span>
                                        )}
                                        {activeTab === tab.id && (
                                             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                        )}
                                   </button>
                              ))}
                         </div>

                         {/* Tab Content */}
                         <div className="p-6">
                              {/* Overview Tab */}
                              {activeTab === 'overview' && (
                                   <OverviewTab
                                        project={project}
                                        onAddMilestone={() => setShowMilestoneModal(true)}
                                        onUploadDocument={() => setShowDocumentModal(true)}
                                   />
                              )}

                              {/* Milestones Tab */}
                              {activeTab === 'milestones' && (
                                   <MilestonesTab
                                        milestones={project.milestones || []}
                                        onCreateMilestone={() => setShowMilestoneModal(true)}
                                        onUpdateMilestone={handleUpdateMilestone}
                                        onSelectMilestone={setSelectedMilestone}
                                   />
                              )}

                              {/* Tasks Tab */}
                              {activeTab === 'tasks' && (
                                   <TasksTab
                                        tasks={project.tasks || []}
                                        milestones={project.milestones || []}
                                        onRefresh={fetchProjectDetails}
                                   />
                              )}

                              {/* Documents Tab */}
                              {activeTab === 'documents' && (
                                   <DocumentsTab
                                        documents={project.documents || []}
                                        onUpload={() => setShowDocumentModal(true)}
                                        onDelete={handleDeleteDocument}
                                   />
                              )}

                              {/* Feedback Tab */}
                              {activeTab === 'feedback' && (
                                   <FeedbackTab
                                        feedbacks={project.feedbacks || []}
                                        onAddFeedback={() => setShowFeedbackModal(true)}
                                        onUpdateStatus={handleUpdateFeedbackStatus}
                                   />
                              )}
                         </div>
                    </div>
               </div>

               {/* Modals */}
               <MilestoneModal
                    isOpen={showMilestoneModal}
                    onClose={() => setShowMilestoneModal(false)}
                    onSubmit={handleCreateMilestone}
                    projectId={projectId}
               />

               <DocumentUploadModal
                    isOpen={showDocumentModal}
                    onClose={() => setShowDocumentModal(false)}
                    onUpload={handleUploadDocument}
               />

               <FeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmit={handleAddFeedback}
               />

               {selectedMilestone && (
                    <TaskCreationModal
                         isOpen={!!selectedMilestone}
                         onClose={() => setSelectedMilestone(null)}
                         milestone={selectedMilestone}
                         projectId={projectId}
                         onTaskCreated={fetchProjectDetails}
                    />
               )}
          </div>
     );
};

// Overview Tab Component
const OverviewTab = ({ project, onAddMilestone, onUploadDocument }) => {
     return (
          <div className="space-y-8">
               {/* Project Info Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Project Details</h3>
                         <div className="bg-bg-subtle/30 rounded-xl p-5 space-y-3">
                              <InfoRow icon={<Calendar size={16} />} label="Timeline">
                                   {new Date(project.startDate).toLocaleDateString()} - {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                              </InfoRow>
                              <InfoRow icon={<Wallet size={16} />} label="Budget">
                                   ${project.budget?.toLocaleString() || 'Not set'}
                              </InfoRow>
                              <InfoRow icon={<Users size={16} />} label="Team Lead">
                                   {project.teamLead?.name || 'Not assigned'}
                              </InfoRow>
                              <InfoRow icon={<Target size={16} />} label="Project Manager">
                                   {project.manager?.name}
                              </InfoRow>
                         </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Client Information</h3>
                         <div className="bg-bg-subtle/30 rounded-xl p-5 space-y-3">
                              <InfoRow icon={<User size={16} />} label="Name">
                                   {project.clientName}
                              </InfoRow>
                              <InfoRow icon={<Mail size={16} />} label="Email">
                                   <a href={`mailto:${project.clientEmail}`} className="text-accent hover:underline">
                                        {project.clientEmail}
                                   </a>
                              </InfoRow>
                              {project.clientPhone && (
                                   <InfoRow icon={<Phone size={16} />} label="Phone">
                                        {project.clientPhone}
                                   </InfoRow>
                              )}
                              {project.clientCompany && (
                                   <InfoRow icon={<Building size={16} />} label="Company">
                                        {project.clientCompany}
                                   </InfoRow>
                              )}
                         </div>
                    </div>
               </div>

               {/* Quick Actions */}
               <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         <QuickActionCard
                              icon={<Flag className="text-accent" />}
                              title="Add Milestone"
                              description="Break project into phases"
                              onClick={onAddMilestone}
                         />
                         <QuickActionCard
                              icon={<FileText className="text-accent-secondary" />}
                              title="Upload Document"
                              description="Add requirements or files"
                              onClick={onUploadDocument}
                         />
                         <QuickActionCard
                              icon={<MessageSquare className="text-green-500" />}
                              title="Record Feedback"
                              description="Log client feedback"
                              onClick={() => { }}
                         />
                         <QuickActionCard
                              icon={<BarChart2 className="text-purple-500" />}
                              title="Generate Report"
                              description="Export project status"
                              onClick={() => { }}
                         />
                    </div>
               </div>

               {/* Recent Activity */}
               <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Recent Activity</h3>
                    <div className="bg-bg-subtle/30 rounded-xl p-5">
                         <p className="text-text-muted text-sm text-center py-4">
                              Activity log coming soon...
                         </p>
                    </div>
               </div>
          </div>
     );
};

// Milestones Tab Component
const MilestonesTab = ({ milestones, onCreateMilestone, onUpdateMilestone, onSelectMilestone }) => {
     const getStatusColor = (status) => {
          switch (status) {
               case 'COMPLETED': return 'bg-green-500';
               case 'IN_PROGRESS': return 'bg-blue-500';
               case 'DELAYED': return 'bg-red-500';
               default: return 'bg-yellow-500';
          }
     };

     return (
          <div className="space-y-6">
               <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-primary">Project Milestones</h3>
                    <button
                         onClick={onCreateMilestone}
                         className="flex items-center gap-2 bg-accent text-text-inverse px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                         <Plus size={16} />
                         Add Milestone
                    </button>
               </div>

               {milestones.length === 0 ? (
                    <div className="text-center py-12 bg-bg-subtle/30 rounded-xl">
                         <Flag size={48} className="text-text-disabled mx-auto mb-4" />
                         <h4 className="font-bold text-text-primary mb-2">No Milestones Yet</h4>
                         <p className="text-sm text-text-muted mb-4">Break down your project into manageable phases</p>
                         <button
                              onClick={onCreateMilestone}
                              className="bg-accent text-text-inverse px-6 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                         >
                              Create First Milestone
                         </button>
                    </div>
               ) : (
                    <div className="space-y-4">
                         {milestones.map((milestone) => (
                              <div
                                   key={milestone.id}
                                   className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-accent transition-colors"
                              >
                                   <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                             <div className={`w-3 h-3 rounded-full ${getStatusColor(milestone.status)}`} />
                                             <div>
                                                  <h4 className="font-bold text-text-primary">{milestone.name}</h4>
                                                  {milestone.description && (
                                                       <p className="text-sm text-text-muted mt-1">{milestone.description}</p>
                                                  )}
                                             </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <span className="text-xs px-2 py-1 bg-bg-subtle rounded-full">
                                                  {milestone.tasksCount || 0} tasks
                                             </span>
                                             <button
                                                  onClick={() => onSelectMilestone(milestone)}
                                                  className="p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                                                  title="Add Tasks"
                                             >
                                                  <Plus size={16} className="text-accent" />
                                             </button>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                             <p className="text-xs text-text-muted mb-1">Deadline</p>
                                             <p className="text-sm font-medium">
                                                  {milestone.deadline ? new Date(milestone.deadline).toLocaleDateString() : 'Not set'}
                                             </p>
                                        </div>
                                        <div>
                                             <p className="text-xs text-text-muted mb-1">Progress</p>
                                             <div className="flex items-center gap-2">
                                                  <div className="flex-1 h-2 bg-bg-subtle rounded-full overflow-hidden border border-accent/30">
                                                       <div
                                                            className="h-full bg-accent"
                                                            style={{ width: `${milestone.progress || 0.34}%` }}
                                                       />
                                                  </div>
                                                  <span className="text-sm font-medium">{milestone.progress || 0}%</span>
                                             </div>
                                        </div>
                                        <div>
                                             <p className="text-xs text-text-muted mb-1">Status</p>
                                             <span className={`text-xs px-2 py-1 rounded-full ${milestone.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                       milestone.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                                            milestone.status === 'DELAYED' ? 'bg-red-500/10 text-red-500' :
                                                                 'bg-yellow-500/10 text-yellow-500'
                                                  }`}>
                                                  {milestone.status?.replace('_', ' ')}
                                             </span>
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               )}
          </div>
     );
};

// Tasks Tab Component
const TasksTab = ({ tasks, milestones, onRefresh }) => {
     const [filter, setFilter] = useState('all');
     const [selectedMilestone, setSelectedMilestone] = useState('all');

     const filteredTasks = tasks.filter(task => {
          if (filter !== 'all' && task.status !== filter) return false;
          if (selectedMilestone !== 'all' && task.milestoneId !== selectedMilestone) return false;
          return true;
     });

     const getStatusIcon = (status) => {
          switch (status) {
               case 'NOT_STARTED': return <Play size={14} />;
               case 'IN_PROGRESS': return <Loader size={14} />;
               case 'REVIEW': return <Clock size={14} />;
               case 'COMPLETED': return <CheckCircle size={14} />;
               case 'BLOCKED': return <Pause size={14} />;
               default: return null;
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'NOT_STARTED': return 'bg-slate-500';
               case 'IN_PROGRESS': return 'bg-blue-500';
               case 'REVIEW': return 'bg-yellow-500';
               case 'COMPLETED': return 'bg-green-500';
               case 'BLOCKED': return 'bg-red-500';
               default: return 'bg-slate-500';
          }
     };

     const getPriorityColor = (priority) => {
          switch (priority) {
               case 'URGENT': return 'bg-red-500/10 text-red-500';
               case 'HIGH': return 'bg-orange-500/10 text-orange-500';
               case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500';
               default: return 'bg-green-500/10 text-green-500';
          }
     };

     return (
          <div className="space-y-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-text-primary">Project Tasks</h3>

                    <div className="flex items-center gap-3">
                         <select
                              value={selectedMilestone}
                              onChange={(e) => setSelectedMilestone(e.target.value)}
                              className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm outline-none"
                         >
                              <option value="all">All Milestones</option>
                              {milestones.map(m => (
                                   <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                         </select>
                         <select
                              value={filter}
                              onChange={(e) => setFilter(e.target.value)}
                              className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm outline-none"
                         >
                              <option value="all">All Status</option>
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="BLOCKED">Blocked</option>
                         </select>
                    </div>
               </div>

               {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 bg-bg-subtle/30 rounded-xl">
                         <CheckCircle size={48} className="text-text-disabled mx-auto mb-4" />
                         <h4 className="font-bold text-text-primary mb-2">No Tasks Found</h4>
                         <p className="text-sm text-text-muted">Tasks will appear here when assigned by the team lead</p>
                    </div>
               ) : (
                    <div className="space-y-3">
                         {filteredTasks.map((task) => (
                              <div
                                   key={task.id}
                                   className="flex items-center justify-between p-4 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent/30 transition-all"
                              >
                                   <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-8 h-8 rounded-full ${getStatusColor(task.status)} flex items-center justify-center text-white`}>
                                             {getStatusIcon(task.status)}
                                        </div>
                                        <div className="flex-1">
                                             <div className="flex items-center gap-3">
                                                  <h4 className="font-bold text-text-primary">{task.title}</h4>
                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPriorityColor(task.priority)}`}>
                                                       {task.priority}
                                                  </span>
                                             </div>
                                             <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                                                  <span>Assigned to: {task.assignee?.name || 'Unassigned'}</span>
                                                  {task.milestone && (
                                                       <span>Milestone: {task.milestone.name}</span>
                                                  )}
                                                  {task.deadline && (
                                                       <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                                  )}
                                             </div>
                                        </div>
                                   </div>
                                   <button className="p-2 hover:bg-bg-surface rounded-lg transition-colors">
                                        <MoreVertical size={16} />
                                   </button>
                              </div>
                         ))}
                    </div>
               )}
          </div>
     );
};

// Documents Tab Component
const DocumentsTab = ({ documents, onUpload, onDelete }) => {
     const getFileIcon = (fileType) => {
          if (fileType?.startsWith('image/')) return <Image size={20} className="text-purple-500" />;
          if (fileType?.includes('pdf')) return <FileText size={20} className="text-red-500" />;
          if (fileType?.includes('word')) return <FileText size={20} className="text-blue-500" />;
          return <File size={20} className="text-gray-500" />;
     };

     const formatFileSize = (bytes) => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
     };

     return (
          <div className="space-y-6">
               <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-primary">Project Documents</h3>
                    <button
                         onClick={onUpload}
                         className="flex items-center gap-2 bg-accent text-text-inverse px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                         <Upload size={16} />
                         Upload Document
                    </button>
               </div>

               {documents.length === 0 ? (
                    <div className="text-center py-12 bg-bg-subtle/30 rounded-xl">
                         <FileText size={48} className="text-text-disabled mx-auto mb-4" />
                         <h4 className="font-bold text-text-primary mb-2">No Documents Yet</h4>
                         <p className="text-sm text-text-muted mb-4">Upload client requirements, contracts, or project files</p>
                         <button
                              onClick={onUpload}
                              className="bg-accent text-text-inverse px-6 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                         >
                              Upload First Document
                         </button>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 gap-3">
                         {documents.map((doc) => (
                              <div
                                   key={doc.id}
                                   className="flex items-center justify-between p-4 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent/30 transition-all"
                              >
                                   <div className="flex items-center gap-4">
                                        {getFileIcon(doc.fileType)}
                                        <div>
                                             <h4 className="font-bold text-text-primary">{doc.name}</h4>
                                             <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                                  <span>{doc.type?.replace('_', ' ')}</span>
                                                  <span>•</span>
                                                  <span>{formatFileSize(doc.fileSize)}</span>
                                                  <span>•</span>
                                                  <span>Uploaded by {doc.uploadedBy?.name}</span>
                                                  <span>•</span>
                                                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                             </div>
                                             {doc.description && (
                                                  <p className="text-xs text-text-muted mt-1">{doc.description}</p>
                                             )}
                                        </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                        <a
                                             href={doc.url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
                                             title="Download"
                                        >
                                             <Download size={16} className="text-text-muted" />
                                        </a>
                                        <button
                                             onClick={() => onDelete(doc.id)}
                                             className="p-2 hover:bg-bg-surface rounded-lg transition-colors text-red-500"
                                             title="Delete"
                                        >
                                             <Trash2 size={16} />
                                        </button>
                                   </div>
                              </div>
                         ))}
                    </div>
               )}
          </div>
     );
};

// Feedback Tab Component
const FeedbackTab = ({ feedbacks, onAddFeedback, onUpdateStatus }) => {
     const getStatusColor = (status) => {
          switch (status) {
               case 'APPROVED': return 'bg-green-500/10 text-green-500';
               case 'REJECTED': return 'bg-red-500/10 text-red-500';
               case 'REVISION_REQUESTED': return 'bg-yellow-500/10 text-yellow-500';
               default: return 'bg-blue-500/10 text-blue-500';
          }
     };

     return (
          <div className="space-y-6">
               <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-primary">Client Feedback</h3>
                    <button
                         onClick={onAddFeedback}
                         className="flex items-center gap-2 bg-accent text-text-inverse px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                         <MessageSquare size={16} />
                         Add Feedback
                    </button>
               </div>

               {feedbacks.length === 0 ? (
                    <div className="text-center py-12 bg-bg-subtle/30 rounded-xl">
                         <MessageCircle size={48} className="text-text-disabled mx-auto mb-4" />
                         <h4 className="font-bold text-text-primary mb-2">No Feedback Yet</h4>
                         <p className="text-sm text-text-muted mb-4">Record client feedback and approvals</p>
                         <button
                              onClick={onAddFeedback}
                              className="bg-accent text-text-inverse px-6 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                         >
                              Add First Feedback
                         </button>
                    </div>
               ) : (
                    <div className="space-y-4">
                         {feedbacks.map((feedback) => (
                              <div
                                   key={feedback.id}
                                   className="bg-bg-subtle/30 rounded-xl p-5 border border-border-default"
                              >
                                   <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                             <div className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(feedback.status)}`}>
                                                  {feedback.status.replace('_', ' ')}
                                             </div>
                                             {feedback.isApproved && (
                                                  <span className="flex items-center gap-1 text-xs text-green-500">
                                                       <CheckCircle size={12} />
                                                       Approved
                                                  </span>
                                             )}
                                             {feedback.stage && (
                                                  <span className="text-xs text-text-muted">
                                                       Stage: {feedback.stage}
                                                  </span>
                                             )}
                                        </div>
                                        <span className="text-xs text-text-muted">
                                             {new Date(feedback.createdAt).toLocaleDateString()}
                                        </span>
                                   </div>

                                   <p className="text-text-primary mb-4">{feedback.content}</p>

                                   {feedback.rating && (
                                        <div className="flex items-center gap-1 mb-3">
                                             {[1, 2, 3, 4, 5].map((star) => (
                                                  <Star
                                                       key={star}
                                                       size={16}
                                                       className={star <= feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                  />
                                             ))}
                                        </div>
                                   )}

                                   <div className="flex items-center justify-between pt-3 border-t border-border-default">
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                             <User size={12} />
                                             <span>By: {feedback.createdBy?.name} ({feedback.createdBy?.role})</span>
                                        </div>

                                        {!feedback.isApproved && (
                                             <div className="flex items-center gap-2">
                                                  <button
                                                       onClick={() => onUpdateStatus(feedback.id, 'APPROVED', true)}
                                                       className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                                       title="Approve"
                                                  >
                                                       <ThumbsUp size={16} />
                                                  </button>
                                                  <button
                                                       onClick={() => onUpdateStatus(feedback.id, 'REJECTED', false)}
                                                       className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                       title="Reject"
                                                  >
                                                       <ThumbsDown size={16} />
                                                  </button>
                                                  <button
                                                       onClick={() => onUpdateStatus(feedback.id, 'REVISION_REQUESTED', false)}
                                                       className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                       title="Request Revision"
                                                  >
                                                       <RefreshCw size={16} />
                                                  </button>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         ))}
                    </div>
               )}
          </div>
     );
};

// Helper Components
const InfoRow = ({ icon, label, children }) => (
     <div className="flex items-start gap-3">
          <div className="p-1 bg-bg-subtle rounded-lg text-text-muted">
               {icon}
          </div>
          <div>
               <p className="text-xs text-text-muted">{label}</p>
               <p className="text-sm font-medium text-text-primary">{children}</p>
          </div>
     </div>
);

const QuickActionCard = ({ icon, title, description, onClick }) => (
     <button
          onClick={onClick}
          className="flex items-start gap-3 p-4 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent transition-all text-left group"
     >
          <div className="p-2 bg-bg-surface rounded-lg group-hover:scale-110 transition-transform">
               {icon}
          </div>
          <div>
               <h4 className="font-bold text-text-primary text-sm">{title}</h4>
               <p className="text-xs text-text-muted">{description}</p>
          </div>
     </button>
);

// Modals (simplified versions - you can expand these as needed)
const MilestoneModal = ({ isOpen, onClose, onSubmit, projectId }) => {
     const [formData, setFormData] = useState({
          name: '',
          description: '',
          deadline: '',
          startDate: ''
     });
     const [submitting, setSubmitting] = useState(false);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
               await onSubmit(formData);
               setFormData({ name: '', description: '', deadline: '', startDate: '' });
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-2xl max-w-md w-full">
                    <div className="p-6 border-b border-border-default">
                         <h3 className="text-lg font-bold text-text-primary">Create Milestone</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                         <input
                              type="text"
                              placeholder="Milestone Name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                              required
                         />
                         <textarea
                              placeholder="Description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows="3"
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                         />
                         <input
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                         />
                         <input
                              type="date"
                              placeholder="Deadline"
                              value={formData.deadline}
                              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                         />
                         <div className="flex gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 px-4 py-2 border border-border-default rounded-lg"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting}
                                   className="flex-1 px-4 py-2 bg-accent text-text-inverse rounded-lg"
                              >
                                   {submitting ? 'Creating...' : 'Create'}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

const DocumentUploadModal = ({ isOpen, onClose, onUpload }) => {
     const [file, setFile] = useState(null);
     const [type, setType] = useState('PROJECT_DOC');
     const [description, setDescription] = useState('');
     const [uploading, setUploading] = useState(false);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          if (!file) return;

          setUploading(true);
          try {
               await onUpload(file, type, description);
               setFile(null);
               setDescription('');
          } finally {
               setUploading(false);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-2xl max-w-md w-full">
                    <div className="p-6 border-b border-border-default">
                         <h3 className="text-lg font-bold text-text-primary">Upload Document</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                         <div className="border-2 border-dashed border-border-default rounded-lg p-6 text-center">
                              <input
                                   type="file"
                                   onChange={(e) => setFile(e.target.files[0])}
                                   className="hidden"
                                   id="file-upload"
                                   required
                              />
                              <label
                                   htmlFor="file-upload"
                                   className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                   <Upload size={24} className="text-text-muted" />
                                   <span className="text-sm text-text-muted">
                                        {file ? file.name : 'Click to select a file'}
                                   </span>
                              </label>
                         </div>

                         <select
                              value={type}
                              onChange={(e) => setType(e.target.value)}
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                         >
                              <option value="CLIENT_REQUIREMENT">Client Requirement</option>
                              <option value="PROJECT_DOC">Project Document</option>
                              <option value="CONTRACT">Contract</option>
                              <option value="INVOICE">Invoice</option>
                              <option value="OTHER">Other</option>
                         </select>

                         <textarea
                              placeholder="Description (optional)"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows="3"
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                         />

                         <div className="flex gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 px-4 py-2 border border-border-default rounded-lg"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={!file || uploading}
                                   className="flex-1 px-4 py-2 bg-accent text-text-inverse rounded-lg disabled:opacity-50"
                              >
                                   {uploading ? 'Uploading...' : 'Upload'}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
     const [formData, setFormData] = useState({
          content: '',
          stage: 'review',
          status: 'PENDING',
          isApproved: false,
          rating: 5,
          feedbackType: 'functionality'
     });
     const [submitting, setSubmitting] = useState(false);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
               await onSubmit(formData);
               setFormData({
                    content: '', stage: 'review', status: 'PENDING',
                    isApproved: false, rating: 5, feedbackType: 'functionality'
               });
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-2xl max-w-md w-full">
                    <div className="p-6 border-b border-border-default">
                         <h3 className="text-lg font-bold text-text-primary">Record Client Feedback</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                         <textarea
                              placeholder="Feedback content..."
                              value={formData.content}
                              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                              rows="4"
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                              required
                         />

                         <select
                              value={formData.feedbackType}
                              onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                         >
                              <option value="design">Design Feedback</option>
                              <option value="functionality">Functionality Feedback</option>
                              <option value="bug">Bug Report</option>
                              <option value="enhancement">Enhancement Request</option>
                         </select>

                         <select
                              value={formData.stage}
                              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg"
                         >
                              <option value="initial">Initial Review</option>
                              <option value="review">In Review</option>
                              <option value="revision">Revision</option>
                              <option value="approval">Final Approval</option>
                         </select>

                         <div>
                              <label className="block text-sm font-medium text-text-muted mb-2">Rating (1-5)</label>
                              <input
                                   type="range"
                                   min="1"
                                   max="5"
                                   value={formData.rating}
                                   onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                   className="w-full"
                              />
                              <div className="flex justify-between mt-1">
                                   {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                             key={star}
                                             size={16}
                                             className={star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                        />
                                   ))}
                              </div>
                         </div>

                         <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                   type="checkbox"
                                   checked={formData.isApproved}
                                   onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                                   className="w-4 h-4 text-accent"
                              />
                              <span className="text-sm text-text-primary">Mark as Approved</span>
                         </label>

                         <div className="flex gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 px-4 py-2 border border-border-default rounded-lg"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting}
                                   className="flex-1 px-4 py-2 bg-accent text-text-inverse rounded-lg"
                              >
                                   {submitting ? 'Saving...' : 'Save Feedback'}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

const TaskCreationModal = ({ isOpen, onClose, milestone, projectId, onTaskCreated }) => {
     const [formData, setFormData] = useState({
          title: '',
          description: '',
          priority: 'MEDIUM',
          deadline: '',
          assigneeId: '' // Add assignee field
     });
     const [teamMembers, setTeamMembers] = useState([]);
     const [submitting, setSubmitting] = useState(false);

     useEffect(() => {
          if (isOpen) {
               fetchTeamMembers();
          }
     }, [isOpen]);

     const fetchTeamMembers = async () => {
          try {
               const response = await fetch('/api/project-manager/team-members');
               if (response.ok) {
                    const data = await response.json();
                    setTeamMembers(data.members || []);
               }
          } catch (error) {
               console.error('Error fetching team members:', error);
          }
     };

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
               const response = await fetch(`/api/project-manager/projects/${projectId}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         ...formData,
                         milestoneId: milestone.id
                    })
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to create task');
               }

               await onTaskCreated();
               onClose();

               Swal.fire({
                    title: 'Success!',
                    text: 'Task created successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });
          } catch (err) {
               console.error('Error creating task:', err);
               Swal.fire({
                    title: 'Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonColor: '#b91c1c'
               });
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-2xl max-w-md w-full">
                    <div className="p-6 border-b border-border-default flex justify-between items-center">
                         <h3 className="text-lg font-bold text-text-primary">
                              Add Task to "{milestone.name}"
                         </h3>
                         <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                              <X size={20} />
                         </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                         <input
                              type="text"
                              placeholder="Task Title *"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                              required
                         />
                         <textarea
                              placeholder="Description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows="3"
                              className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                         />

                         <div className="grid grid-cols-2 gap-3">
                              <select
                                   value={formData.priority}
                                   onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                   className="p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                              >
                                   <option value="LOW">Low Priority</option>
                                   <option value="MEDIUM">Medium Priority</option>
                                   <option value="HIGH">High Priority</option>
                                   <option value="URGENT">Urgent</option>
                              </select>

                              <input
                                   type="date"
                                   value={formData.deadline}
                                   onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                   className="p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                              />
                         </div>

                         {teamMembers.length > 0 && (
                              <select
                                   value={formData.assigneeId}
                                   onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                              >
                                   <option value="">Assign to...</option>
                                   {teamMembers.map(member => (
                                        <option key={member.id} value={member.id}>
                                             {member.name} ({member.role})
                                        </option>
                                   ))}
                              </select>
                         )}

                         <div className="flex gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 px-4 py-2 border border-border-default rounded-lg hover:bg-bg-subtle transition-colors"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   disabled={submitting}
                                   className="flex-1 px-4 py-2 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                              >
                                   {submitting ? 'Creating...' : 'Create Task'}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default ProjectDetailPage;