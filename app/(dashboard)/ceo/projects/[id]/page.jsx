'use client';
import React, { useState, useEffect } from 'react';
import {
     ArrowLeft,
     Target,
     TrendingUp,
     AlertTriangle,
     CheckCircle2,
     Clock,
     Briefcase,
     Zap,
     DollarSign,
     Users,
     MessageSquare,
     FileText,
     Calendar,
     Download,
     Share2,
     MoreVertical,
     Shield,
     Flag,
     BarChart3,
     RefreshCw,
     Activity,
     Award,
     Mail,
     Phone,
     ExternalLink,
     ChevronRight,
     PieChart,
     GitBranch
} from 'lucide-react';
import Link from 'next/link';
import { useCEOProjects } from '../../../../../hooks/useCEOProjects';
import { useRouter } from 'next/navigation';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Spinner from "../../../../Components/common/Spinner";
 

export default function CEOSingleProjectView({ params }) {
     const router = useRouter();
     const unwrappedParams = React.use(params);
     const projectId = unwrappedParams?.id;

     const { getProjectDetails, exportProjectReport } = useCEOProjects();
     const [project, setProject] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [activeTab, setActiveTab] = useState('overview');
     const [timeRange, setTimeRange] = useState('30d');
     const [exporting, setExporting] = useState(false);

     useEffect(() => {
          if (projectId) {
               loadProject();
          } else {
               setError('Invalid project ID');
               setLoading(false);
          }
     }, [projectId]);

     const loadProject = async () => {
          try {
               setLoading(true);
               setError(null);
               const data = await getProjectDetails(projectId);
               if (data) {
                    setProject(data);
               } else {
                    setError('Project not found');
               }
          } catch (err) {
               console.error('Error loading project:', err);
               setError(err.message || 'Failed to load project details');
          } finally {
               setLoading(false);
          }
     };

     // Export functions
     const exportAsPDF = async () => {
          setExporting(true);
          try {
               const doc = new jsPDF();

               // Title
               doc.setFontSize(20);
               doc.setText(37, 99, 235);
               doc.text('Executive Project Report', 20, 20);

               // Project Info
               doc.setFontSize(12);
               doc.setText(0, 0, 0);
               doc.text(`Project: ${project.name}`, 20, 35);
               doc.text(`Client: ${project.clientName}`, 20, 42);
               doc.text(`Status: ${project.status}`, 20, 49);
               doc.text(`Progress: ${project.progress}%`, 20, 56);

               // Key Metrics Table
               autoTable(doc, {
                    startY: 70,
                    head: [['Metric', 'Value']],
                    body: [
                         ['Total Budget', `$${(project.financialMetrics?.budget / 1000).toFixed(1)}k`],
                         ['Actual Cost', `$${(project.financialMetrics?.cost / 1000).toFixed(1)}k`],
                         ['Total Tasks', project.tasks?.length || 0],
                         ['Completed Tasks', project.tasks?.filter(t => t.status === 'COMPLETED').length || 0],
                         ['Team Members', new Set(project.tasks?.map(t => t.assigneeId).filter(Boolean)).size],
                         ['Risk Level', project.riskLevel]
                    ],
                    theme: 'striped',
                    headStyles: { fillColor: [37, 99, 235] }
               });

               // Milestones Table
               if (project.milestoneProgress?.length > 0) {
                    doc.addPage();
                    doc.setFontSize(16);
                    doc.text('Milestone Progress', 20, 20);

                    autoTable(doc, {
                         startY: 30,
                         head: [['Milestone', 'Status', 'Progress', 'Deadline']],
                         body: project.milestoneProgress.map(m => [
                              m.name,
                              m.status,
                              `${m.taskProgress?.toFixed(0)}%`,
                              m.deadline ? new Date(m.deadline).toLocaleDateString() : 'TBD'
                         ]),
                         theme: 'striped',
                         headStyles: { fillColor: [37, 99, 235] }
                    });
               }

               doc.save(`${project.name.replace(/\s+/g, '_')}_report.pdf`);
          } catch (error) {
               console.error('PDF export error:', error);
          } finally {
               setExporting(false);
          }
     };

     const exportAsExcel = () => {
          setExporting(true);
          try {
               const wb = XLSX.utils.book_new();

               // Project Info Sheet
               const projectInfo = [
                    ['Project Information'],
                    ['Name', project.name],
                    ['Client', project.clientName],
                    ['Status', project.status],
                    ['Progress', `${project.progress}%`],
                    ['Risk Level', project.riskLevel],
                    ['Budget', `$${(project.financialMetrics?.budget / 1000).toFixed(1)}k`],
                    ['Cost', `$${(project.financialMetrics?.cost / 1000).toFixed(1)}k`],
                    ['Start Date', project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'],
                    ['Deadline', project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A']
               ];
               const wsInfo = XLSX.utils.aoa_to_sheet(projectInfo);
               XLSX.utils.book_append_sheet(wb, wsInfo, 'Project Info');

               // Tasks Sheet
               if (project.tasks?.length > 0) {
                    const tasksData = [
                         ['Title', 'Status', 'Priority', 'Assignee', 'Deadline']
                    ];
                    project.tasks.forEach(t => {
                         tasksData.push([
                              t.title,
                              t.status,
                              t.priority,
                              t.assignee?.name || 'Unassigned',
                              t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'
                         ]);
                    });
                    const wsTasks = XLSX.utils.aoa_to_sheet(tasksData);
                    XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');
               }

               // Milestones Sheet
               if (project.milestoneProgress?.length > 0) {
                    const milestonesData = [
                         ['Name', 'Status', 'Progress', 'Deadline']
                    ];
                    project.milestoneProgress.forEach(m => {
                         milestonesData.push([
                              m.name,
                              m.status,
                              `${m.taskProgress?.toFixed(0)}%`,
                              m.deadline ? new Date(m.deadline).toLocaleDateString() : 'N/A'
                         ]);
                    });
                    const wsMilestones = XLSX.utils.aoa_to_sheet(milestonesData);
                    XLSX.utils.book_append_sheet(wb, wsMilestones, 'Milestones');
               }

               XLSX.writeFile(wb, `${project.name.replace(/\s+/g, '_')}_report.xlsx`);
          } catch (error) {
               console.error('Excel export error:', error);
          } finally {
               setExporting(false);
          }
     };

     const exportAsCSV = () => {
          setExporting(true);
          try {
               const rows = [
                    ['Metric', 'Value'],
                    ['Project Name', project.name],
                    ['Client', project.clientName],
                    ['Status', project.status],
                    ['Progress', `${project.progress}%`],
                    ['Risk Level', project.riskLevel],
                    ['Budget', `$${(project.financialMetrics?.budget / 1000).toFixed(1)}k`],
                    ['Cost', `$${(project.financialMetrics?.cost / 1000).toFixed(1)}k`],
                    ['Total Tasks', project.tasks?.length || 0],
                    ['Completed Tasks', project.tasks?.filter(t => t.status === 'COMPLETED').length || 0],
                    ['Team Size', new Set(project.tasks?.map(t => t.assigneeId).filter(Boolean)).size]
               ];

               const csv = rows.map(row => row.join(',')).join('\n');
               const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
               saveAs(blob, `${project.name.replace(/\s+/g, '_')}_report.csv`);
          } catch (error) {
               console.error('CSV export error:', error);
          } finally {
               setExporting(false);
          }
     };

     const getTaskDistributionData = () => {
          if (!project?.tasks) return [];
          const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'];
          const colors = {
               'NOT_STARTED': '#94a3b8',
               'IN_PROGRESS': '#2563eb',
               'REVIEW': '#f59e0b',
               'COMPLETED': '#10b981',
               'BLOCKED': '#ef4444'
          };

          return statuses.map(status => ({
               name: status.replace('_', ' '),
               value: project.tasks.filter(t => t.status === status).length,
               color: colors[status]
          })).filter(item => item.value > 0);
     };

     const getRiskColor = (riskLevel) => {
          switch (riskLevel) {
               case 'HIGH': return 'bg-red-500/10 text-red-600 border-red-500/20';
               case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
               case 'LOW': return 'bg-green-500/10 text-green-600 border-green-500/20';
               default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'ACTIVE': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
               case 'IN_DEVELOPMENT': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
               case 'CLIENT_REVIEW': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
               case 'COMPLETED': return 'bg-green-500/10 text-green-600 border-green-500/20';
               case 'UPCOMING': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
               case 'ON_HOLD': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
               default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
          }
     };

     if (loading) {
          return (
               <>
               <Spinner title="Project Data..." />
               </>
          );
     }

     if (error || !project) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x py-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                              <AlertTriangle size={48} className="text-red-500" />
                         </div>
                         <h2 className="text-2xl font-bold text-text-primary mb-3">Project Not Found</h2>
                         <p className="text-text-muted mb-8">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
                         <div className="flex gap-4 justify-center">
                              <button
                                   onClick={() => router.push('/ceo/projects')}
                                   className="bg-accent text-text-inverse px-8 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                              >
                                   Back to Portfolio
                              </button>
                              <button
                                   onClick={loadProject}
                                   className="px-8 py-3 border border-border-default rounded-xl font-bold text-text-primary hover:bg-bg-subtle transition-all flex items-center gap-2"
                              >
                                   <RefreshCw size={16} />
                                   Retry
                              </button>
                         </div>
                    </div>
               </div>
          );
     }

     const taskDistribution = getTaskDistributionData();

     return (
          <div className="min-h-screen bg-bg-page">
               {/* Sticky Header */}
               <div className="sticky top-0 z-30 bg-bg-surface/80 backdrop-blur-lg border-b border-border-default">
                    <div className="p-page-x py-4">
                         <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                   <Link
                                        href="/ceo/projects"
                                        className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors font-medium text-ui group"
                                   >
                                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                        Back to Portfolio
                                   </Link>
                                   <div className="h-4 w-px bg-border-default"></div>
                                   <span className="text-sm text-text-muted font-mono">
                                        ID: {project.id.slice(-8)}
                                   </span>
                              </div>
                              <div className="flex items-center gap-2">
                                   {/* Download Dropdown */}
                                   <div className="relative group">
                                        <button className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted hover:text-accent transition-all flex items-center gap-1">
                                             <Download size={18} />
                                             <ChevronRight size={14} className="rotate-90 group-hover:translate-y-0.5 transition-transform" />
                                        </button>
                                        <div className="absolute right-0 mt-2 w-48 bg-bg-surface border border-border-default rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                             <button
                                                  onClick={exportAsPDF}
                                                  disabled={exporting}
                                                  className="w-full text-left px-4 py-3 hover:bg-bg-subtle first:rounded-t-xl flex items-center gap-2 disabled:opacity-50"
                                             >
                                                  <FileText size={16} className="text-accent" />
                                                  Export as PDF
                                             </button>
                                             <button
                                                  onClick={exportAsExcel}
                                                  disabled={exporting}
                                                  className="w-full text-left px-4 py-3 hover:bg-bg-subtle flex items-center gap-2 disabled:opacity-50"
                                             >
                                                  <BarChart3 size={16} className="text-accent" />
                                                  Export as Excel
                                             </button>
                                             <button
                                                  onClick={exportAsCSV}
                                                  disabled={exporting}
                                                  className="w-full text-left px-4 py-3 hover:bg-bg-subtle last:rounded-b-xl flex items-center gap-2 disabled:opacity-50"
                                             >
                                                  <Activity size={16} className="text-accent" />
                                                  Export as CSV
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Hero Section */}
               <div className="bg-gradient-to-br from-accent/5 via-transparent to-transparent border-b border-border-default">
                    <div className="p-page-x py-10">
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                              <div className="lg:col-span-2">
                                   <div className="flex items-center gap-3 mb-4 flex-wrap">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}>
                                             {project.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getRiskColor(project.riskLevel)}`}>
                                             {project.riskLevel} RISK
                                        </span>
                                        {project.priority === 'CRITICAL' && (
                                             <span className="flex items-center gap-1 text-xs font-black text-orange-500 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 uppercase tracking-widest">
                                                  <Zap size={14} /> Critical Priority
                                             </span>
                                        )}
                                   </div>

                                   <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-4">
                                        {project.name}
                                   </h1>

                                   <p className="text-lg text-text-muted max-w-2xl leading-relaxed">
                                        {project.description || 'No description provided.'}
                                   </p>

                                   <div className="flex items-center gap-6 mt-6 text-sm text-text-muted">
                                        <div className="flex items-center gap-2">
                                             <Calendar size={16} className="text-accent" />
                                             <span>Started: {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not started'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <Clock size={16} className={project.timelineMetrics?.isOverdue ? 'text-red-500' : 'text-accent'} />
                                             <span className={project.timelineMetrics?.isOverdue ? 'text-red-500 font-medium' : ''}>
                                                  Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                                             </span>
                                        </div>
                                   </div>
                              </div>

                              {/* Executive Summary Card */}
                              <div className="bg-gradient-to-br from-accent to-accent-active rounded-3xl p-6 text-white shadow-2xl">
                                   <div className="flex items-center justify-between mb-6">
                                        <span className="text-xs font-bold uppercase opacity-80 tracking-wider">Executive Summary</span>
                                        <Award size={20} className="opacity-80" />
                                   </div>

                                   <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                             <p className="text-3xl font-black">${(project.financialMetrics?.budget / 1000000).toFixed(1)}M</p>
                                             <p className="text-xs font-medium opacity-80 mt-1">Total Budget</p>
                                        </div>
                                        <div>
                                             <p className="text-3xl font-black">{project.progress}%</p>
                                             <p className="text-xs font-medium opacity-80 mt-1">Overall Progress</p>
                                        </div>
                                   </div>

                                   <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                             <span className="opacity-80">Budget Utilization</span>
                                             <span className="font-bold">{Math.round((project.financialMetrics?.cost / project.financialMetrics?.budget) * 100) || 0}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                             <div
                                                  className="h-full bg-white rounded-full transition-all duration-1000"
                                                  style={{ width: `${Math.min((project.financialMetrics?.cost / project.financialMetrics?.budget) * 100, 100) || 0}%` }}
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Quick Stats */}
               <div className="p-page-x py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <StatCard
                              icon={<Target className="text-blue-500" />}
                              label="Total Tasks"
                              value={project.tasks?.length || 0}
                         />
                         <StatCard
                              icon={<Users className="text-purple-500" />}
                              label="Team Members"
                              value={new Set(project.tasks?.map(t => t.assigneeId).filter(Boolean)).size}
                         />
                         <StatCard
                              icon={<MessageSquare className="text-green-500" />}
                              label="Client Feedback"
                              value={project.feedbacks?.length || 0}
                         />
                         <StatCard
                              icon={<Activity className="text-orange-500" />}
                              label="Health Score"
                              value={`${Math.round((project.tasks?.filter(t => t.status === 'COMPLETED').length / (project.tasks?.length || 1)) * 100)}%`}
                         />
                    </div>
               </div>

               {/* Simplified Tabs */}
               <div className="border-b border-border-default px-page-x">
                    <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                         <TabButton
                              active={activeTab === 'overview'}
                              onClick={() => setActiveTab('overview')}
                              icon={<BarChart3 size={16} />}
                              label="Overview"
                         />
                         <TabButton
                              active={activeTab === 'milestones'}
                              onClick={() => setActiveTab('milestones')}
                              icon={<GitBranch size={16} />}
                              label="Milestones"
                         />
                         <TabButton
                              active={activeTab === 'team'}
                              onClick={() => setActiveTab('team')}
                              icon={<Users size={16} />}
                              label="Team"
                         />
                         <TabButton
                              active={activeTab === 'client'}
                              onClick={() => setActiveTab('client')}
                              icon={<MessageSquare size={16} />}
                              label="Client"
                         />
                         <TabButton
                              active={activeTab === 'financial'}
                              onClick={() => setActiveTab('financial')}
                              icon={<DollarSign size={16} />}
                              label="Financial"
                         />
                    </div>
               </div>

               {/* Tab Content */}
               <div className="p-page-x py-8">
                    {activeTab === 'overview' && (
                         <div className="space-y-6">
                              {/* Simple Task Distribution */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-text-primary mb-4">Task Status</h3>
                                        <div className="space-y-3">
                                             {taskDistribution.map((item) => (
                                                  <div key={item.name}>
                                                       <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-text-muted">{item.name}</span>
                                                            <span className="font-bold text-text-primary">{item.value}</span>
                                                       </div>
                                                       <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
                                                            <div
                                                                 className="h-full transition-all duration-500"
                                                                 style={{
                                                                      width: `${(item.value / (project.tasks?.length || 1)) * 100}%`,
                                                                      backgroundColor: item.color
                                                                 }}
                                                            />
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>

                                   {/* Key Metrics */}
                                   <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-text-primary mb-4">Key Metrics</h3>
                                        <div className="space-y-4">
                                             <MetricRow label="Completion Rate" value={`${Math.round((project.tasks?.filter(t => t.status === 'COMPLETED').length / (project.tasks?.length || 1)) * 100)}%`} />
                                             <MetricRow label="On-Time Delivery" value={`${project.metrics?.onTimeRate || 0}%`} />
                                             <MetricRow label="Budget Utilization" value={`${Math.round((project.financialMetrics?.cost / project.financialMetrics?.budget) * 100)}%`} />
                                             <MetricRow label="Milestone Progress" value={`${project.milestoneProgress?.filter(m => m.status === 'COMPLETED').length || 0}/${project.milestoneProgress?.length || 0}`} />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}

                    {activeTab === 'milestones' && (
                         <div className="space-y-4">
                              {project.milestoneProgress?.map((milestone) => (
                                   <MilestoneCard key={milestone.id} milestone={milestone} />
                              ))}
                         </div>
                    )}

                    {activeTab === 'team' && (
                         <div className="space-y-4">
                              {project.workload?.map((dev) => (
                                   <WorkloadItem key={dev.id} dev={dev} />
                              ))}
                         </div>
                    )}

                    {activeTab === 'client' && (
                         <div className="space-y-4">
                              {project.feedbacks?.length > 0 ? (
                                   project.feedbacks.map((feedback) => (
                                        <FeedbackCard key={feedback.id} feedback={feedback} />
                                   ))
                              ) : (
                                   <p className="text-center py-8 text-text-muted">No feedback recorded yet</p>
                              )}
                         </div>
                    )}

                    {activeTab === 'financial' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
                                   <h3 className="text-lg font-bold text-text-primary mb-4">Budget Overview</h3>
                                   <div className="space-y-4">
                                        <FinancialMetric
                                             label="Budget"
                                             value={`$${(project.financialMetrics?.budget / 1000).toFixed(1)}k`}
                                             total={project.financialMetrics?.budget || 1}
                                             current={project.financialMetrics?.cost || 0}
                                        />
                                        <FinancialMetric
                                             label="Cost"
                                             value={`$${(project.financialMetrics?.cost / 1000).toFixed(1)}k`}
                                             total={project.financialMetrics?.budget || 1}
                                             current={project.financialMetrics?.cost || 0}
                                             color={project.financialMetrics?.cost > project.financialMetrics?.budget ? 'text-red-500' : 'text-green-500'}
                                        />
                                        <FinancialMetric
                                             label="Remaining"
                                             value={`$${((project.financialMetrics?.budget - project.financialMetrics?.cost) / 1000).toFixed(1)}k`}
                                             total={project.financialMetrics?.budget || 1}
                                             current={project.financialMetrics?.budget - project.financialMetrics?.cost || 0}
                                        />
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
}

// Simplified Components
const TabButton = ({ active, onClick, icon, label }) => (
     <button
          onClick={onClick}
          className={`py-3 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${active ? 'text-accent' : 'text-text-muted hover:text-text-primary'
               }`}
     >
          {icon}
          {label}
          {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
     </button>
);

const StatCard = ({ icon, label, value }) => (
     <div className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-bg-subtle rounded-lg">{icon}</div>
               <p className="text-sm text-text-muted">{label}</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
     </div>
);

const MetricRow = ({ label, value }) => (
     <div className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0">
          <span className="text-sm text-text-muted">{label}</span>
          <span className="text-sm font-bold text-text-primary">{value}</span>
     </div>
);

const MilestoneCard = ({ milestone }) => (
     <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
               <h4 className="font-bold text-text-primary">{milestone.name}</h4>
               <span className={`text-xs font-bold px-2 py-1 rounded-full ${milestone.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                    milestone.status === 'DELAYED' ? 'bg-red-500/10 text-red-500' :
                         'bg-blue-500/10 text-blue-500'
                    }`}>
                    {milestone.status}
               </span>
          </div>
          <p className="text-sm text-text-muted mb-3">{milestone.description}</p>
          <div className="flex items-center gap-4 text-sm">
               <span className="text-text-muted">Progress:</span>
               <div className="flex-1">
                    <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
                         <div
                              className={`h-full ${milestone.status === 'DELAYED' ? 'bg-red-500' : 'bg-accent'}`}
                              style={{ width: `${milestone.taskProgress || 0}%` }}
                         />
                    </div>
               </div>
               <span className="font-bold">{milestone.taskProgress || 0}%</span>
          </div>
     </div>
);

const WorkloadItem = ({ dev }) => (
     <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-3">
               <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                    {dev.name[0]}
               </div>
               <div>
                    <h4 className="font-bold text-text-primary">{dev.name}</h4>
                    <p className="text-xs text-text-muted">{dev.role}</p>
               </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
               <div>
                    <p className="text-lg font-bold text-blue-500">{dev.inProgressTasks || 0}</p>
                    <p className="text-xs text-text-muted">Active</p>
               </div>
               <div>
                    <p className="text-lg font-bold text-green-500">{dev.completedTasks || 0}</p>
                    <p className="text-xs text-text-muted">Done</p>
               </div>
               <div>
                    <p className="text-lg font-bold text-yellow-500">{dev.reviewTasks || 0}</p>
                    <p className="text-xs text-text-muted">Review</p>
               </div>
               <div>
                    <p className="text-lg font-bold text-red-500">{dev.blockedTasks || 0}</p>
                    <p className="text-xs text-text-muted">Blocked</p>
               </div>
          </div>
     </div>
);

const FeedbackCard = ({ feedback }) => (
     <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                         {feedback.createdBy?.name?.[0] || '?'}
                    </div>
                    <div>
                         <p className="text-sm font-bold text-text-primary">{feedback.stage}</p>
                         <p className="text-xs text-text-muted">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                         </p>
                    </div>
               </div>
               <span className={`text-xs font-bold px-2 py-1 rounded-full ${feedback.isApproved ? 'bg-green-500/10 text-green-600' :
                    feedback.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                         'bg-yellow-500/10 text-yellow-600'
                    }`}>
                    {feedback.status}
               </span>
          </div>
          <p className="text-sm text-text-body italic">"{feedback.content}"</p>
     </div>
);

const FinancialMetric = ({ label, value, total, current, color = 'text-text-primary' }) => {
     const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

     return (
          <div>
               <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
               </div>
               <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
                    <div
                         className="h-full bg-accent transition-all duration-500"
                         style={{ width: `${percentage}%` }}
                    />
               </div>
          </div>
     );
};