// app/(dashboard)/project-manager/clients/[clientEmail]/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
     ArrowLeft,
     Mail,
     Phone,
     Building,
     Briefcase,
     Calendar,
     Star,
     MessageSquare,
     FileText,
     CheckCircle,
     AlertCircle,
     Clock,
     Download,
     ChevronRight,
     RefreshCw,
     TrendingUp,
     DollarSign,
     Users,
     Flag,
     ThumbsUp,
     ThumbsDown
} from 'lucide-react';
import { useProjectManagerClients } from '../../../../../hooks/useProjectManagerClients';
import Spinner from '../../../../Components/common/Spinner';

const ClientDetailPage = ({ params }) => {
     const router = useRouter();
     const unwrappedParams = React.use(params);
     const clientEmail = decodeURIComponent(unwrappedParams.clientEmail);

     const { getClientDetails, loading, error } = useProjectManagerClients();
     const [client, setClient] = useState(null);
     const [activeTab, setActiveTab] = useState('overview');

     useEffect(() => {
          loadClientDetails();
     }, [clientEmail]);

     const loadClientDetails = async () => {
          const data = await getClientDetails(clientEmail);
          if (data) {
               setClient(data);
          }
     };

     if (loading && !client) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x py-page-y">
                    <Spinner message="Loading client details..." />
               </div>
          );
     }

     if (error || !client) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x py-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Client Not Found</h2>
                         <p className="text-text-muted mb-6">{error || 'The client you\'re looking for doesn\'t exist.'}</p>
                         <button
                              onClick={() => router.push('/project-manager/clients')}
                              className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Back to Clients
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x py-page-y">
               <div className="max-w-[1400px] mx-auto space-y-6">

                    {/* Header with Navigation */}
                    <div className="flex items-center justify-between">
                         <Link
                              href="/project-manager/clients"
                              className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs font-bold uppercase tracking-widest group"
                         >
                              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                              Back to Clients
                         </Link>
                         <button
                              onClick={loadClientDetails}
                              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
                         >
                              <RefreshCw size={18} />
                         </button>
                    </div>

                    {/* Client Hero Section */}
                    <div className="bg-gradient-to-br from-accent to-accent-active rounded-3xl p-8 text-text-inverse">
                         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="flex items-center gap-6">
                                   <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                                        {client.name?.charAt(0)}
                                   </div>
                                   <div>
                                        <h1 className="text-3xl font-bold">{client.name}</h1>
                                        <p className="text-white/80 mt-1">{client.company}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                             <div className="flex items-center gap-2">
                                                  <Mail size={16} className="text-white/60" />
                                                  <span>{client.email}</span>
                                             </div>
                                             {client.phone && client.phone !== 'Not provided' && (
                                                  <div className="flex items-center gap-2">
                                                       <Phone size={16} className="text-white/60" />
                                                       <span>{client.phone}</span>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              </div>

                              {/* Quick Stats */}
                              <div className="flex items-center gap-8 bg-white/10 rounded-2xl px-6 py-4">
                                   <div className="text-center">
                                        <p className="text-2xl font-bold">{client.stats.totalProjects}</p>
                                        <p className="text-xs text-white/80">Projects</p>
                                   </div>
                                   <div className="text-center">
                                        <p className="text-2xl font-bold">{client.stats.totalFeedbacks}</p>
                                        <p className="text-xs text-white/80">Feedbacks</p>
                                   </div>
                                   <div className="text-center">
                                        <p className="text-2xl font-bold">{client.stats.approvedFeedbacks}</p>
                                        <p className="text-xs text-white/80">Approved</p>
                                   </div>
                                   <div className="text-center">
                                        <p className="text-2xl font-bold">{client.stats.averageRating.toFixed(1)}</p>
                                        <p className="text-xs text-white/80">Avg Rating</p>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden">
                         <div className="flex border-b border-border-default bg-bg-subtle/50 px-6">
                              {[
                                   { id: 'overview', label: 'Overview', icon: <Briefcase size={18} /> },
                                   { id: 'projects', label: 'Projects', icon: <Flag size={18} />, count: client.projects.length },
                                   { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} />, count: client.feedbacks.length },
                                   { id: 'documents', label: 'Documents', icon: <FileText size={18} />, count: client.documents.length }
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

                         <div className="p-6">
                              {activeTab === 'overview' && (
                                   <OverviewTab client={client} />
                              )}
                              {activeTab === 'projects' && (
                                   <ProjectsTab projects={client.projects} />
                              )}
                              {activeTab === 'feedback' && (
                                   <FeedbackTab
                                        feedbacks={client.feedbacks}
                                        stats={client.stats}
                                   />
                              )}
                              {activeTab === 'documents' && (
                                   <DocumentsTab documents={client.documents} />
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
};

// Tab Components
const OverviewTab = ({ client }) => {
     return (
          <div className="space-y-8">
               {/* Key Metrics */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                         icon={<DollarSign className="text-green-500" />}
                         label="Total Budget"
                         value={`$${client.totalBudget?.toLocaleString() || 0}`}
                    />
                    <MetricCard
                         icon={<TrendingUp className="text-blue-500" />}
                         label="Active Projects"
                         value={client.activeProjects}
                    />
                    <MetricCard
                         icon={<CheckCircle className="text-green-500" />}
                         label="Completed"
                         value={client.completedProjects}
                    />
                    <MetricCard
                         icon={<Star className="text-yellow-500" />}
                         label="Avg Rating"
                         value={client.stats.averageRating.toFixed(1)}
                         suffix="/5"
                    />
               </div>

               {/* Recent Projects */}
               <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Recent Projects</h3>
                    <div className="space-y-3">
                         {client.projects.slice(0, 3).map(project => (
                              <Link
                                   key={project.id}
                                   href={`/project-manager/projects/${project.id}`}
                                   className="block p-4 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent transition-all"
                              >
                                   <div className="flex items-center justify-between">
                                        <div>
                                             <h4 className="font-bold text-text-primary">{project.name}</h4>
                                             <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                                                  <span>Status: {project.status}</span>
                                                  <span>Progress: {project.progress}%</span>
                                                  {project.teamLead && (
                                                       <span>Lead: {project.teamLead.name}</span>
                                                  )}
                                             </div>
                                        </div>
                                        <ChevronRight size={20} className="text-text-muted" />
                                   </div>
                              </Link>
                         ))}
                    </div>
               </div>

               {/* Recent Feedback */}
               {client.feedbacks.length > 0 && (
                    <div>
                         <h3 className="text-lg font-bold text-text-primary mb-4">Recent Feedback</h3>
                         <div className="space-y-3">
                              {client.feedbacks.slice(0, 3).map(feedback => (
                                   <div
                                        key={feedback.id}
                                        className="p-4 bg-bg-subtle/30 rounded-xl border border-border-default"
                                   >
                                        <div className="flex items-start justify-between mb-2">
                                             <div className="flex items-center gap-2">
                                                  <span className={`text-xs px-2 py-1 rounded-full ${feedback.isApproved ? 'bg-green-500/10 text-green-500' :
                                                            feedback.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                                                 'bg-yellow-500/10 text-yellow-500'
                                                       }`}>
                                                       {feedback.isApproved ? 'Approved' : feedback.status}
                                                  </span>
                                                  <span className="text-xs text-text-muted">
                                                       {new Date(feedback.createdAt).toLocaleDateString()}
                                                  </span>
                                             </div>
                                             {feedback.rating && (
                                                  <div className="flex items-center gap-1">
                                                       <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                       <span className="text-sm">{feedback.rating}</span>
                                                  </div>
                                             )}
                                        </div>
                                        <p className="text-text-primary">{feedback.content.substring(0, 150)}...</p>
                                   </div>
                              ))}
                         </div>
                    </div>
               )}
          </div>
     );
};

const ProjectsTab = ({ projects }) => {
     return (
          <div className="space-y-4">
               {projects.map(project => (
                    <Link
                         key={project.id}
                         href={`/project-manager/projects/${project.id}`}
                         className="block p-5 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent transition-all"
                    >
                         <div className="flex items-start justify-between mb-3">
                              <div>
                                   <h4 className="font-bold text-text-primary text-lg">{project.name}</h4>
                                   <div className="flex items-center gap-4 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                  project.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500' :
                                                       'bg-yellow-500/10 text-yellow-500'
                                             }`}>
                                             {project.status}
                                        </span>
                                        {project.isDelayed && (
                                             <span className="text-xs text-red-500 flex items-center gap-1">
                                                  <AlertCircle size={12} />
                                                  Delayed
                                             </span>
                                        )}
                                   </div>
                              </div>
                              <div className="text-right">
                                   <p className="text-sm font-medium text-text-primary">Progress</p>
                                   <p className="text-2xl font-bold text-accent">{project.progress}%</p>
                              </div>
                         </div>

                         <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border-subtle">
                              <div>
                                   <p className="text-xs text-text-muted">Budget</p>
                                   <p className="font-medium">${project.budget?.toLocaleString() || 0}</p>
                              </div>
                              <div>
                                   <p className="text-xs text-text-muted">Milestones</p>
                                   <p className="font-medium">{project.milestoneCount}</p>
                              </div>
                              <div>
                                   <p className="text-xs text-text-muted">Tasks</p>
                                   <p className="font-medium">{project.taskCount}</p>
                              </div>
                              <div>
                                   <p className="text-xs text-text-muted">Pending Reviews</p>
                                   <p className="font-medium">{project.pendingReviews}</p>
                              </div>
                         </div>

                         {project.teamLead && (
                              <div className="mt-3 flex items-center gap-2">
                                   <Users size={14} className="text-text-muted" />
                                   <span className="text-sm text-text-muted">
                                        Team Lead: {project.teamLead.name}
                                   </span>
                              </div>
                         )}
                    </Link>
               ))}
          </div>
     );
};

const FeedbackTab = ({ feedbacks, stats }) => {
     return (
          <div className="space-y-6">
               {/* Feedback Stats */}
               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <FeedbackStatCard
                         label="Total"
                         value={stats.totalFeedbacks}
                         icon={<MessageSquare size={16} />}
                         color="bg-blue-500"
                    />
                    <FeedbackStatCard
                         label="Approved"
                         value={stats.approvedFeedbacks}
                         icon={<ThumbsUp size={16} />}
                         color="bg-green-500"
                    />
                    <FeedbackStatCard
                         label="Pending"
                         value={stats.pendingFeedbacks}
                         icon={<Clock size={16} />}
                         color="bg-yellow-500"
                    />
                    <FeedbackStatCard
                         label="Rejected"
                         value={stats.rejectedFeedbacks || 0}
                         icon={<ThumbsDown size={16} />}
                         color="bg-red-500"
                    />
                    <FeedbackStatCard
                         label="Avg Rating"
                         value={stats.averageRating.toFixed(1)}
                         icon={<Star size={16} />}
                         color="bg-purple-500"
                    />
               </div>

               {/* Feedback List */}
               <div className="space-y-4">
                    {feedbacks.map(feedback => (
                         <div
                              key={feedback.id}
                              className="p-5 bg-bg-subtle/30 rounded-xl border border-border-default"
                         >
                              <div className="flex items-start justify-between mb-3">
                                   <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${feedback.isApproved ? 'bg-green-500/10 text-green-500' :
                                                  feedback.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                                       feedback.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                             }`}>
                                             {feedback.isApproved ? 'APPROVED' : feedback.status}
                                        </span>
                                        <span className="text-xs text-text-muted">
                                             {new Date(feedback.createdAt).toLocaleDateString()}
                                        </span>
                                   </div>
                                   <span className="text-xs text-text-muted">
                                        Project: {feedback.project?.name}
                                   </span>
                              </div>

                              <p className="text-text-primary mb-3">{feedback.content}</p>

                              {feedback.rating && (
                                   <div className="flex items-center gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map(star => (
                                             <Star
                                                  key={star}
                                                  size={16}
                                                  className={star <= feedback.rating
                                                       ? 'text-yellow-500 fill-yellow-500'
                                                       : 'text-gray-300'
                                                  }
                                             />
                                        ))}
                                   </div>
                              )}

                              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                                   <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-muted">
                                             By: {feedback.createdBy?.name} ({feedback.createdBy?.role})
                                        </span>
                                   </div>
                                   {feedback.attachments?.length > 0 && (
                                        <div className="flex items-center gap-1">
                                             <FileText size={14} className="text-text-muted" />
                                             <span className="text-xs text-text-muted">
                                                  {feedback.attachments.length} attachments
                                             </span>
                                        </div>
                                   )}
                              </div>
                         </div>
                    ))}
               </div>
          </div>
     );
};

const DocumentsTab = ({ documents }) => {
     const formatFileSize = (bytes) => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
     };

     return (
          <div className="space-y-4">
               {documents.map(doc => (
                    <div
                         key={doc.id}
                         className="flex items-center justify-between p-4 bg-bg-subtle/30 rounded-xl border border-border-default hover:border-accent transition-all"
                    >
                         <div className="flex items-center gap-4">
                              <FileText size={24} className="text-accent" />
                              <div>
                                   <h4 className="font-bold text-text-primary">{doc.name}</h4>
                                   <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                        <span>Project: {doc.project?.name}</span>
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
                         <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
                         >
                              <Download size={16} className="text-text-muted" />
                         </a>
                    </div>
               ))}

               {documents.length === 0 && (
                    <div className="text-center py-12">
                         <FileText size={48} className="text-text-disabled mx-auto mb-4" />
                         <p className="text-text-muted">No documents uploaded yet</p>
                    </div>
               )}
          </div>
     );
};

// Helper Components
const MetricCard = ({ icon, label, value, suffix = '' }) => (
     <div className="bg-bg-subtle/30 rounded-xl p-4 border border-border-default">
          <div className="flex items-center gap-2 mb-2">
               <div className="p-2 bg-bg-surface rounded-lg">
                    {icon}
               </div>
               <span className="text-xs text-text-muted">{label}</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
               {value}{suffix}
          </p>
     </div>
);

const FeedbackStatCard = ({ label, value, icon, color }) => (
     <div className="bg-bg-subtle/30 rounded-xl p-4 border border-border-default">
          <div className="flex items-center justify-between mb-2">
               <span className="text-xs text-text-muted">{label}</span>
               <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
                    {icon}
               </div>
          </div>
          <p className="text-xl font-bold text-text-primary">{value}</p>
     </div>
);

export default ClientDetailPage;