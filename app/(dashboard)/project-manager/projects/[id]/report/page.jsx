
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
     ArrowLeft,
     Download,
     FileText,
     Calendar,
     Clock,
     TrendingUp,
     AlertCircle,
     CheckCircle2,
     XCircle,
     Users,
     Briefcase,
     DollarSign,
     Star,
     MessageSquare,
     Printer,
     Share2,
     Loader
} from 'lucide-react';
import { useProjectReports } from '../../../../../../hooks/useProjectReports';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import Spinner from "../../../../../Components/common/Spinner";



export default function ProjectReportPage({ params }) {
     const router = useRouter();
     const unwrappedParams = React.use(params);
     const projectId = unwrappedParams.id;

     const [report, setReport] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [exportFormat, setExportFormat] = useState('pdf');

     const { exportReport } = useProjectReports();

     useEffect(() => {
          fetchReport();
     }, [projectId]);

     const fetchReport = async () => {
          try {
               setLoading(true);
               const response = await fetch(`/api/project-manager/reports/${projectId}/export?format=json`);

               if (!response.ok) {
                    if (response.status === 404) {
                         throw new Error('Report not found');
                    }
                    throw new Error('Failed to fetch report');
               }

               const data = await response.json();
               setReport(data);
          } catch (err) {
               console.error('Error fetching report:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     };

     const handleExport = async () => {
          const result = await exportReport(projectId, exportFormat);
          if (result) {
               Swal.fire({
                    title: 'Success!',
                    text: `Report exported as ${exportFormat.toUpperCase()}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
               });
          }
     };

     const handlePrint = () => {
          window.print();
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'COMPLETED': return 'text-green-600 bg-green-100';
               case 'ACTIVE': return 'text-blue-600 bg-blue-100';
               case 'IN_DEVELOPMENT': return 'text-purple-600 bg-purple-100';
               case 'CLIENT_REVIEW': return 'text-yellow-600 bg-yellow-100';
               case 'ON_HOLD': return 'text-orange-600 bg-orange-100';
               case 'ARCHIVED': return 'text-gray-600 bg-gray-100';
               default: return 'text-gray-600 bg-gray-100';
          }
     };

     const getRiskColor = (risk) => {
          switch (risk) {
               case 'LOW': return 'text-green-600 bg-green-100';
               case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
               case 'HIGH': return 'text-red-600 bg-red-100';
               default: return 'text-gray-600 bg-gray-100';
          }
     };

     if (loading) {
          return <Spinner title="Report..." />;
     }

     if (error || !report) {
          return (
               <div className="min-h-screen bg-bg-page flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                         <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <AlertCircle size={40} className="text-red-500" />
                         </div>
                         <h2 className="text-2xl font-bold text-text-primary mb-2">Report Not Found</h2>
                         <p className="text-text-muted mb-6">
                              {error || 'The requested report could not be found or you don\'t have access to it.'}
                         </p>
                         <button
                              onClick={() => router.push('/project-manager/reports')}
                              className="bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Back to Reports
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-bg-page print:bg-white">
               {/* Header - Hidden when printing */}
               <div className="sticky top-0 z-10 bg-bg-surface border-b border-border-default px-6 py-4 print:hidden">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                              <button
                                   onClick={() => router.back()}
                                   className="p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                              >
                                   <ArrowLeft size={20} />
                              </button>
                              <h1 className="text-xl font-bold text-text-primary">Project Report</h1>
                         </div>
                         <div className="flex items-center gap-3">
                              <select
                                   value={exportFormat}
                                   onChange={(e) => setExportFormat(e.target.value)}
                                   className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                              >
                                   <option value="pdf">PDF Document</option>
                                   <option value="csv">CSV Spreadsheet</option>
                                   <option value="json">JSON Data</option>
                                   <option value="html">HTML Report</option>
                              </select>
                              <button
                                   onClick={handleExport}
                                   className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all"
                              >
                                   <Download size={18} />
                                   Export
                              </button>
                              <button
                                   onClick={handlePrint}
                                   className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-lg hover:bg-bg-subtle transition-all"
                              >
                                   <Printer size={18} />
                                   Print
                              </button>
                              {/* <button className="p-2 hover:bg-bg-subtle rounded-lg">
                                   <Share2 size={18} />
                              </button> */}
                         </div>
                    </div>
               </div>

               {/* Report Content */}
               <div className="max-w-6xl mx-auto p-8 print:p-4">
                    {/* Report Header */}
                    <div className="mb-8 print:mb-6">
                         <div className="flex items-start justify-between">
                              <div>
                                   <h1 className="text-3xl font-bold text-text-primary mb-2">{report.project.name}</h1>
                                   <p className="text-text-muted">Generated on {format(new Date(report.generatedAt), 'MMMM dd, yyyy h:mm a')}</p>
                              </div>
                              <div className="text-right">
                                   <p className="text-sm text-text-muted">Generated by</p>
                                   <p className="font-medium text-text-primary">{report.generatedBy}</p>
                              </div>
                         </div>
                    </div>

                    {/* Project Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                         <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                              <p className="text-xs text-text-muted mb-1">Status</p>
                              <div className="flex items-center gap-2">
                                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(report.project.status)}`}>
                                        {report.project.status}
                                   </span>
                              </div>
                         </div>
                         <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                              <p className="text-xs text-text-muted mb-1">Progress</p>
                              <p className="text-2xl font-bold text-text-primary">{report.project.progress}%</p>
                         </div>
                         <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                              <p className="text-xs text-text-muted mb-1">Risk Level</p>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(report.project.riskLevel)}`}>
                                   {report.project.riskLevel}
                              </span>
                         </div>
                         <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                              <p className="text-xs text-text-muted mb-1">Timeline</p>
                              <p className="text-sm font-medium text-text-primary">
                                   {report.project.startDate ? format(new Date(report.project.startDate), 'MMM dd') : 'N/A'} -
                                   {report.project.deadline ? format(new Date(report.project.deadline), 'MMM dd, yyyy') : 'No deadline'}
                              </p>
                         </div>
                    </div>

                    {/* Client Information */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8">
                         <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                              <Users size={20} className="text-accent" />
                              Client Information
                         </h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                   <p className="text-sm text-text-muted mb-1">Name</p>
                                   <p className="font-medium text-text-primary">{report.client.name}</p>
                              </div>
                              <div>
                                   <p className="text-sm text-text-muted mb-1">Company</p>
                                   <p className="font-medium text-text-primary">{report.client.company || 'N/A'}</p>
                              </div>
                              <div>
                                   <p className="text-sm text-text-muted mb-1">Email</p>
                                   <p className="font-medium text-text-primary">{report.client.email}</p>
                              </div>
                              <div>
                                   <p className="text-sm text-text-muted mb-1">Phone</p>
                                   <p className="font-medium text-text-primary">{report.client.phone || 'Not provided'}</p>
                              </div>
                         </div>
                    </div>

                    {/* Team Information */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8">
                         <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                              <Briefcase size={20} className="text-accent" />
                              Team
                         </h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                   <p className="text-sm text-text-muted mb-1">Project Manager</p>
                                   <p className="font-medium text-text-primary">{report.team.manager?.name || 'N/A'}</p>
                              </div>
                              <div>
                                   <p className="text-sm text-text-muted mb-1">Team Lead</p>
                                   <p className="font-medium text-text-primary">{report.team.teamLead?.name || 'Not Assigned'}</p>
                              </div>
                         </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         {/* Task Metrics */}
                         <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                   <CheckCircle2 size={18} className="text-green-500" />
                                   Task Metrics
                              </h3>
                              <div className="space-y-3">
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Total Tasks:</span>
                                        <span className="font-bold">{report.metrics.tasks.total}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Completed:</span>
                                        <span className="font-bold text-green-600">{report.metrics.tasks.completed}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">In Progress:</span>
                                        <span className="font-bold text-blue-600">{report.metrics.tasks.inProgress}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Review:</span>
                                        <span className="font-bold text-yellow-600">{report.metrics.tasks.review}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Blocked:</span>
                                        <span className="font-bold text-red-600">{report.metrics.tasks.blocked}</span>
                                   </div>
                                   <div className="flex justify-between pt-2 border-t">
                                        <span className="text-text-muted">Completion Rate:</span>
                                        <span className="font-bold">{report.metrics.tasks.completionRate}%</span>
                                   </div>
                              </div>
                         </div>

                         {/* Milestone Metrics */}
                         <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                   <TrendingUp size={18} className="text-purple-500" />
                                   Milestone Metrics
                              </h3>
                              <div className="space-y-3">
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Total Milestones:</span>
                                        <span className="font-bold">{report.metrics.milestones.total}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Completed:</span>
                                        <span className="font-bold text-green-600">{report.metrics.milestones.completed}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">In Progress:</span>
                                        <span className="font-bold text-blue-600">{report.metrics.milestones.inProgress}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Delayed:</span>
                                        <span className="font-bold text-red-600">{report.metrics.milestones.delayed}</span>
                                   </div>
                                   <div className="flex justify-between pt-2 border-t">
                                        <span className="text-text-muted">Completion Rate:</span>
                                        <span className="font-bold">{report.metrics.milestones.completionRate}%</span>
                                   </div>
                              </div>
                         </div>

                         {/* Time Tracking */}
                         <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                   <Clock size={18} className="text-orange-500" />
                                   Time Tracking
                              </h3>
                              <div className="space-y-3">
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Estimated Hours:</span>
                                        <span className="font-bold">{report.metrics.time.estimatedHours}h</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Actual Hours:</span>
                                        <span className="font-bold">{report.metrics.time.actualHours}h</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Variance:</span>
                                        <span className={`font-bold ${report.metrics.time.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                             {report.metrics.time.variance > 0 ? '+' : ''}{report.metrics.time.variance}%
                                        </span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Efficiency:</span>
                                        <span className="font-bold">{report.metrics.time.efficiency}%</span>
                                   </div>
                              </div>
                         </div>

                         {/* Financial Summary */}
                         <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                   <DollarSign size={18} className="text-green-500" />
                                   Financial Summary
                              </h3>
                              <div className="space-y-3">
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Budget:</span>
                                        <span className="font-bold">${report.metrics.financial.budget?.toLocaleString() || 0}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Actual Cost:</span>
                                        <span className="font-bold">${report.metrics.financial.cost?.toLocaleString() || 0}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Profit:</span>
                                        <span className={`font-bold ${report.metrics.financial.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                             ${report.metrics.financial.profit?.toLocaleString() || 0}
                                        </span>
                                   </div>
                                   <div className="flex justify-between pt-2 border-t">
                                        <span className="text-text-muted">ROI:</span>
                                        <span className={`font-bold ${report.metrics.financial.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                             {report.metrics.financial.roi}%
                                        </span>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Milestones List */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8">
                         <h2 className="text-lg font-bold text-text-primary mb-4">Milestones</h2>
                         <div className="overflow-x-auto">
                              <table className="w-full">
                                   <thead>
                                        <tr className="border-b border-border-default">
                                             <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Milestone</th>
                                             <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                                             <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Deadline</th>
                                             <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Tasks</th>
                                             <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Completed</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {report.milestones.map((milestone, index) => (
                                             <tr key={index} className="border-b border-border-default hover:bg-bg-subtle">
                                                  <td className="py-3 px-4 font-medium text-text-primary">{milestone.name}</td>
                                                  <td className="py-3 px-4">
                                                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${milestone.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                 milestone.status === 'DELAYED' ? 'bg-red-100 text-red-700' :
                                                                      milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                                           'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {milestone.status}
                                                       </span>
                                                  </td>
                                                  <td className="py-3 px-4 text-text-muted">
                                                       {milestone.deadline ? format(new Date(milestone.deadline), 'MMM dd, yyyy') : 'N/A'}
                                                  </td>
                                                  <td className="py-3 px-4 text-text-primary">{milestone.taskCount}</td>
                                                  <td className="py-3 px-4 text-text-primary">{milestone.completedTasks}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>

                    {/* Recent Feedback */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                         <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                              <MessageSquare size={18} className="text-accent" />
                              Recent Feedback
                         </h2>
                         <div className="space-y-4">
                              {report.recentFeedback.map((feedback, index) => (
                                   <div key={index} className="border-l-4 border-accent pl-4 py-2">
                                        <p className="text-text-body mb-2">"{feedback.content}"</p>
                                        <div className="flex items-center gap-4 text-xs text-text-muted">
                                             <span>From: {feedback.from}</span>
                                             <span>•</span>
                                             <span>{format(new Date(feedback.createdAt), 'MMM dd, yyyy')}</span>
                                             {feedback.isApproved && (
                                                  <>
                                                       <span>•</span>
                                                       <span className="text-green-600 flex items-center gap-1">
                                                            <CheckCircle2 size={12} />
                                                            Approved
                                                       </span>
                                                  </>
                                             )}
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>
          </div>
     );
}