// app/(dashboard)/project-manager/reports/page.jsx
'use client';
import React, { useState } from 'react';
import {
     BarChart3,
     FileText,
     Download,
     Calendar,
     AlertTriangle,
     CheckCircle2,
     Clock,
     Filter,
     ArrowUpRight,
     PlusCircle,
     Search,
     X,
     RefreshCw,
     PieChart,
     TrendingUp,
     Users,
     DollarSign,
     Flag
} from 'lucide-react';
import Link from 'next/link';
import { useProjectReports } from '../../../../hooks/useProjectReports';
import CustomReportModal from '../../../Components/project-manager/CustomReportModal';
import FilterModal from '../../../Components/project-manager/ReportFilterModal';
import Spinner from '../../../Components/common/Spinner';;
import Swal from 'sweetalert2';


export default function ReportsPage() {
     const {
          reports,
          metrics,
          loading,
          error,
          filters,
          updateFilters,
          clearFilters,
          generateCustomReport,
          exportReport,
          refetch
     } = useProjectReports();

     const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
     const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
     const [searchInput, setSearchInput] = useState('');
     const [exportingId, setExportingId] = useState(null);
     console.log("reports", reports)
     const handleSearch = (e) => {
          e.preventDefault();
          updateFilters({ search: searchInput });
     };

     const clearSearch = () => {
          setSearchInput('');
          updateFilters({ search: '' });
     };

     const handleExport = async (projectId) => {
          setExportingId(projectId);
          await exportReport(projectId, 'pdf');
          setExportingId(null);
     };

     if (loading) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x py-page-y pb-24 md:pb-page-y">
                    <Spinner message="Loading reports dashboard..." />
               </div>
          );
     }

     if (error) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x py-page-y pb-24 md:pb-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Error Loading Reports</h2>
                         <p className="text-text-muted mb-6">{error}</p>
                         <button
                              onClick={refetch}
                              className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Try Again
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x py-page-y pb-24 md:pb-page-y">
               {/* Page Header */}
               <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div>
                         <h1 className="text-headline-lg font-bold text-text-primary tracking-tight flex items-center gap-3">
                              <BarChart3 className="text-accent" />
                              Project Status Reports
                         </h1>
                         <p className="text-text-muted mt-1 font-medium">
                              Generate, track, and export performance metrics for {metrics.totalProjects} projects
                         </p>
                    </div>

                    <div className="flex gap-3">
                         <button
                              onClick={refetch}
                              className="p-2.5 border border-border-strong rounded-lg text-text-body hover:bg-bg-subtle transition-colors"
                              title="Refresh"
                         >
                              <RefreshCw size={18} />
                         </button>
                         <button
                              onClick={() => setIsFilterModalOpen(true)}
                              className="flex items-center gap-2 px-4 py-2.5 border border-border-strong rounded-lg text-text-body font-bold hover:bg-bg-subtle transition-colors"
                         >
                              <Filter size={18} />
                              Filter
                              {(filters.status !== 'ALL' || filters.riskLevel !== 'ALL' || filters.dateRange !== '30days') && (
                                   <span className="w-2 h-2 bg-accent rounded-full"></span>
                              )}
                         </button>
                         <button
                              onClick={() => setIsCustomModalOpen(true)}
                              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-text-inverse px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                         >
                              <PlusCircle size={18} />
                              Custom Report
                         </button>
                    </div>
               </header>

               {/* Search Bar */}
               <div className="mb-8">
                    <form onSubmit={handleSearch} className="relative max-w-md">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                         <input
                              type="text"
                              value={searchInput}
                              onChange={(e) => setSearchInput(e.target.value)}
                              placeholder="Search projects or clients..."
                              className="w-full pl-10 pr-10 py-2.5 bg-bg-surface border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-text-body transition-all"
                         />
                         {searchInput && (
                              <button
                                   type="button"
                                   onClick={clearSearch}
                                   className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                              >
                                   <X size={16} />
                              </button>
                         )}
                    </form>
               </div>

               {/* Quick Insights Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <MetricCard
                         icon={<TrendingUp className="text-accent" />}
                         label="Avg. Velocity"
                         value={`${metrics.avgVelocity}/wk`}
                         trend={metrics.velocityTrend}
                         bgColor="bg-accent/10"
                    />
                    <MetricCard
                         icon={<AlertTriangle className="text-red-500" />}
                         label="At Risk Projects"
                         value={metrics.atRiskProjects}
                         subtext={`${metrics.projectsByRisk.high} high, ${metrics.projectsByRisk.medium} medium`}
                         bgColor="bg-red-500/10"
                         warning={metrics.atRiskProjects > 0}
                    />
                    <MetricCard
                         icon={<CheckCircle2 className="text-green-500" />}
                         label="Completed"
                         value={metrics.completedProjects}
                         subtext={`${metrics.activeProjects} active`}
                         bgColor="bg-green-500/10"
                    />
                    <MetricCard
                         icon={<Calendar className="text-accent-secondary" />}
                         label="Monthly Deliveries"
                         value={metrics.monthlyDeliveries}
                         subtext="Last 30 days"
                         bgColor="bg-accent-secondary/10"
                    />
               </div>

               {/* Active Filters Display */}
               {(filters.status !== 'ALL' || filters.riskLevel !== 'ALL' || filters.dateRange !== '30days' || filters.search) && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                         <span className="text-xs text-text-muted">Active filters:</span>
                         {filters.status !== 'ALL' && (
                              <FilterChip
                                   label={`Status: ${filters.status.replace('_', ' ')}`}
                                   onRemove={() => updateFilters({ status: 'ALL' })}
                              />
                         )}
                         {filters.riskLevel !== 'ALL' && (
                              <FilterChip
                                   label={`Risk: ${filters.riskLevel}`}
                                   onRemove={() => updateFilters({ riskLevel: 'ALL' })}
                              />
                         )}
                         {filters.dateRange !== '30days' && (
                              <FilterChip
                                   label={`Period: ${filters.dateRange}`}
                                   onRemove={() => updateFilters({ dateRange: '30days' })}
                              />
                         )}
                         {filters.search && (
                              <FilterChip
                                   label={`Search: ${filters.search}`}
                                   onRemove={() => {
                                        setSearchInput('');
                                        updateFilters({ search: '' });
                                   }}
                              />
                         )}
                         <button
                              onClick={clearFilters}
                              className="text-xs text-accent hover:underline ml-2"
                         >
                              Clear all
                         </button>
                    </div>
               )}

               {/* Reports Grid */}
               {reports.length === 0 ? (
                    <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-default">
                         <div className="max-w-md mx-auto">
                              <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                   <BarChart3 size={32} className="text-text-disabled" />
                              </div>
                              <h3 className="text-lg font-bold text-text-primary mb-2">No reports found</h3>
                              <p className="text-text-muted text-sm mb-6">
                                   {filters.search || filters.status !== 'ALL' || filters.riskLevel !== 'ALL'
                                        ? "Try adjusting your filters"
                                        : "Generate your first project report"}
                              </p>
                              {filters.search || filters.status !== 'ALL' || filters.riskLevel !== 'ALL' ? (
                                   <button
                                        onClick={clearFilters}
                                        className="text-accent text-sm font-medium hover:underline"
                                   >
                                        Clear all filters
                                   </button>
                              ) : (
                                   <button
                                        onClick={() => setIsCustomModalOpen(true)}
                                        className="bg-accent text-text-inverse px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-all"
                                   >
                                        Generate First Report
                                   </button>
                              )}
                         </div>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                         {reports.map((report) => (
                              <ReportCard
                                   key={report.id}
                                   report={report}
                                   onExport={() => handleExport(report.id)}
                                   isExporting={exportingId === report.id}
                              />
                         ))}
                    </div>
               )}

               {/* Modals */}
               <CustomReportModal
                    isOpen={isCustomModalOpen}
                    onClose={() => setIsCustomModalOpen(false)}
                    onSubmit={generateCustomReport}
                    projects={reports}
               />

               <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    currentFilters={filters}
                    onApply={updateFilters}
               />
          </div>
     );
}

//  Metric Card Component
function MetricCard({ icon, label, value, trend, subtext, bgColor, warning }) {
     // Ensure value is displayed properly
     const displayValue = value !== undefined && value !== null ? value : '0';

     return (
          <div className={`bg-bg-surface border ${warning ? 'border-red-200' : 'border-border-default'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all`}>
               <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${bgColor} rounded-xl`}>
                         {icon}
                    </div>
                    {trend && (
                         <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              {trend}
                         </span>
                    )}
               </div>
               <div>
                    <p className="text-sm font-medium text-text-muted mb-1">{label}</p>
                    <div className="flex items-baseline gap-2">
                         <span className={`text-3xl font-black ${warning ? 'text-red-500' : 'text-text-primary'}`}>
                              {displayValue}
                         </span>
                         {subtext && (
                              <span className="text-xs text-text-muted">{subtext}</span>
                         )}
                    </div>
               </div>
          </div>
     );
}

// Filter Chip Component
function FilterChip({ label, onRemove }) {
     return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-muted text-accent rounded-full text-xs font-medium">
               {label}
               <button onClick={onRemove} className="hover:text-accent-hover">
                    <X size={14} />
               </button>
          </span>
     );
}

// Enhanced Report Card Component
function ReportCard({ report, onExport, isExporting }) {
     const [showDetails, setShowDetails] = useState(false);
     // In the ReportCard component, add fallback values
     const {
          projectName = 'Unnamed Project',
          client = 'Unknown Client',
          status = 'UNKNOWN',
          riskLevel = 'LOW',
          progress = 0,
          tasksCompleted = 0,
          totalTasks = 0,
          overdueTasks = 0,
          budgetBurn = null,
          velocity = 0,
          completedMilestones = 0,
          milestonesCount = 0,
          feedbackCount = 0,
          deadline = null,
          daysUntilDeadline = null,
          isDelayed = false,
          delayReason = null,
          onTrack = true,
          teamLead = { name: 'Not assigned' },
          lastGenerated = new Date().toLocaleDateString()
     } = report;
     const getRiskColor = (risk) => {
          switch (risk) {
               case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20';
               case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
               default: return 'bg-green-500/10 text-green-500 border-green-500/20';
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'COMPLETED': return 'bg-green-500/10 text-green-500';
               case 'IN_DEVELOPMENT': return 'bg-blue-500/10 text-blue-500';
               case 'CLIENT_REVIEW': return 'bg-purple-500/10 text-purple-500';
               case 'ON_HOLD': return 'bg-orange-500/10 text-orange-500';
               default: return 'bg-gray-500/10 text-gray-500';
          }
     };

     return (
          <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all group">
               <div className="p-6">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-6">
                         <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                   <span className={`text-[10px] font-black px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                                        {report.status.replace('_', ' ')}
                                   </span>
                                   <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${getRiskColor(report.riskLevel)}`}>
                                        {report.riskLevel} RISK
                                   </span>
                                   {report.isDelayed && (
                                        <span className="text-[10px] font-black px-2 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                                             <AlertTriangle size={10} />
                                             DELAYED
                                        </span>
                                   )}
                              </div>
                              <h3 className="text-subheading font-bold text-text-primary group-hover:text-accent transition-colors">
                                   {report.projectName}
                              </h3>
                              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                   <Users size={12} />
                                   {report.client}
                              </p>
                         </div>
                         <div className="text-right">
                              <p className="text-xs text-text-muted flex items-center gap-1">
                                   <Calendar size={12} />
                                   Updated {report.lastGenerated}
                              </p>
                              <p className="text-xs font-medium text-accent mt-1">
                                   Lead: {report.teamLead?.name || 'Not assigned'}
                              </p>
                         </div>
                    </div>

                    {/* Core Metrics Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-4">
                         {/* Progress Section */}
                         <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                   <span className="text-text-muted">PROGRESS</span>
                                   <span className="text-text-primary">{report.progress}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-bg-subtle border border-border-subtle rounded-full overflow-hidden">
                                   <div
                                        className={`h-full transition-all duration-1000 ${report.onTrack ? 'bg-accent' :
                                             report.isDelayed ? 'bg-red-500' : 'bg-orange-500'
                                             }`}
                                        style={{ width: `${report.progress}%` }}
                                   />
                              </div>
                              <div className="flex justify-between mt-2 text-[11px]">
                                   <span className="text-text-muted">
                                        Tasks: {report.tasksCompleted}/{report.totalTasks}
                                   </span>
                                   {report.overdueTasks > 0 && (
                                        <span className="text-red-500 font-medium">
                                             {report.overdueTasks} overdue
                                        </span>
                                   )}
                              </div>
                         </div>

                         {/* Budget & Velocity Section */}
                         <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                   <span className="text-text-muted">BUDGET</span>
                                   {report.budgetBurn !== null && (
                                        <span className={report.budgetBurn > 90 ? 'text-red-500' : 'text-text-primary'}>
                                             {report.budgetBurn}%
                                        </span>
                                   )}
                              </div>
                              <div className="w-full h-2.5 bg-bg-subtle border border-border-subtle rounded-full overflow-hidden">
                                   {report.budgetBurn !== null && (
                                        <div
                                             className="h-full bg-text-primary transition-all duration-1000"
                                             style={{ width: `${report.budgetBurn}%` }}
                                        />
                                   )}
                              </div>
                              <div className="flex justify-between mt-2 text-[11px]">
                                   <span className="text-text-muted">Velocity</span>
                                   <span className="font-medium text-accent">{report.velocity}/wk</span>
                              </div>
                         </div>
                    </div>

                    {/* Additional Metrics Row */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-bg-subtle/30 rounded-xl">
                         <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary">
                                   <Flag size={12} className="text-accent" />
                                   {report.completedMilestones}/{report.milestonesCount}
                              </div>
                              <p className="text-[10px] text-text-muted mt-1">Milestones</p>
                         </div>
                         <div className="text-center border-x border-border-subtle">
                              <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary">
                                   <Clock size={12} className="text-accent-secondary" />
                                   {report.feedbackCount}
                              </div>
                              <p className="text-[10px] text-text-muted mt-1">Feedback</p>
                         </div>
                         <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary">
                                   <Calendar size={12} className={report.daysUntilDeadline < 0 ? 'text-red-500' : 'text-green-500'} />
                                   {report.deadline ? new Date(report.deadline).toLocaleDateString() : 'TBD'}
                              </div>
                              <p className="text-[10px] text-text-muted mt-1">Deadline</p>
                         </div>
                    </div>

                    {/* Delay Warning Banner */}
                    {report.delayReason && (
                         <div className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl mb-4">
                              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                              <div>
                                   <p className="text-xs font-bold text-red-700">Delay Reason:</p>
                                   <p className="text-xs text-red-600/80">{report.delayReason}</p>
                              </div>
                         </div>
                    )}

                    {/* Expandable Details */}
                    {showDetails && (
                         <div className="mb-4 p-4 bg-bg-subtle/30 rounded-xl space-y-3">
                              <h4 className="text-xs font-bold text-text-primary">Quick Stats</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Start Date:</span>
                                        <span className="font-medium">
                                             {report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Priority:</span>
                                        <span className="font-medium">{report.priority}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Tasks Completed:</span>
                                        <span className="font-medium">{report.tasksCompleted}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span className="text-text-muted">Completion Rate:</span>
                                        <span className="font-medium">{Math.round((report.tasksCompleted / report.totalTasks) * 100) || 0}%</span>
                                   </div>
                              </div>
                         </div>
                    )}

                    {/* Action Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                         <button
                              onClick={() => setShowDetails(!showDetails)}
                              className="text-xs font-bold text-text-muted hover:text-accent transition-colors"
                         >
                              {showDetails ? 'Show Less' : 'Quick Stats'}
                         </button>
                         <div className="flex gap-2">
                              <button
                                   onClick={onExport}
                                   disabled={isExporting}
                                   className="p-2 text-text-body hover:bg-bg-subtle rounded-lg border border-border-strong transition-all disabled:opacity-50"
                                   title="Download PDF"
                              >
                                   {isExporting ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                   ) : (
                                        <Download size={18} />
                                   )}
                              </button>
                              <Link
                                   href={`/project-manager/projects/${report.id}/report`}
                                   className="flex items-center gap-2 bg-accent text-text-inverse px-4 py-2 rounded-lg text-ui font-bold hover:bg-accent-hover transition-all"
                              >
                                   Full Report
                                   <ArrowUpRight size={16} />
                              </Link>
                         </div>
                    </div>
               </div>
          </div>
     );
}