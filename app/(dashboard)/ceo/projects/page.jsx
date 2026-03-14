'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
     BarChart3,
     TrendingUp,
     AlertCircle,
     Users,
     DollarSign,
     ChevronRight,
     Search,
     Filter,
     X,
     Download,
     RefreshCw,
     Clock,
     CheckCircle2,
     Zap,
     Shield,
     Target
} from 'lucide-react';
import { useCEOProjects } from '../../../../hooks/useCEOProjects';
import Spinner from '../../../Components/common/Spinner';

export default function CEOProjectsPage() {
     const {
          projects,
          stats,
          riskAlerts,
          managerPerformance,
          loading,
          error,
          filters,
          setFilters,
          exportProjectsData
     } = useCEOProjects();

     const [searchInput, setSearchInput] = useState('');
     const [showFilters, setShowFilters] = useState(false);

     // Debounce search
     useEffect(() => {
          const timer = setTimeout(() => {
               setFilters(prev => ({ ...prev, search: searchInput }));
          }, 300);
          return () => clearTimeout(timer);
     }, [searchInput, setFilters]);

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

     if (loading.projects && projects.length === 0) {
          return <Spinner title="Projects..." />;
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x py-page-y">
               {/* Header & Global Stats */}
               <header className="mb-10">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                         <div>
                              <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                                   Executive Project Overview
                              </h1>
                              <p className="text-text-muted mt-1 font-medium italic">
                                   Strategizing organizational growth through project excellence.
                              </p>
                         </div>

                         <div className="flex items-center gap-3">
                              <div className="relative">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                                   <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search projects or clients..."
                                        className="pl-10 pr-4 py-2 bg-bg-surface border border-border-default rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all w-64 text-ui"
                                   />
                                   {searchInput && (
                                        <button
                                             onClick={() => setSearchInput('')}
                                             className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary"
                                        >
                                             <X size={16} />
                                        </button>
                                   )}
                              </div>
                              <button
                                   onClick={() => setShowFilters(!showFilters)}
                                   className={`p-2 bg-bg-surface border rounded-xl transition-colors ${showFilters ? 'border-accent text-accent' : 'border-border-default text-text-body hover:border-accent'
                                        }`}
                              >
                                   <Filter size={20} />
                              </button>
                              <button
                                   onClick={exportProjectsData}
                                   className="p-2 bg-bg-surface border border-border-default rounded-xl text-text-body hover:border-accent transition-colors"
                                   title="Export Data"
                              >
                                   <Download size={20} />
                              </button>
                              <button
                                   onClick={() => window.location.reload()}
                                   className="p-2 bg-bg-surface border border-border-default rounded-xl text-text-body hover:border-accent transition-colors"
                                   title="Refresh"
                              >
                                   <RefreshCw size={20} />
                              </button>
                         </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                         <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                   <AlertCircle size={20} className="text-red-500" />
                                   <p className="text-red-500 text-sm">{error}</p>
                              </div>
                              <button
                                   onClick={() => window.location.reload()}
                                   className="text-red-500 hover:text-red-600 text-xs font-bold"
                              >
                                   Retry
                              </button>
                         </div>
                    )}

                    {/* Filters */}
                    {showFilters && (
                         <div className="mb-6 p-4 bg-bg-surface border border-border-default rounded-xl animate-in slide-in-from-top-2">
                              <div className="flex flex-wrap items-center gap-4">
                                   <select
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                   >
                                        <option value="all">All Status</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="IN_DEVELOPMENT">In Development</option>
                                        <option value="CLIENT_REVIEW">Client Review</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="UPCOMING">Upcoming</option>
                                   </select>

                                   <select
                                        value={filters.risk}
                                        onChange={(e) => setFilters(prev => ({ ...prev, risk: e.target.value }))}
                                        className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                   >
                                        <option value="all">All Risk Levels</option>
                                        <option value="HIGH">High Risk</option>
                                        <option value="MEDIUM">Medium Risk</option>
                                        <option value="LOW">Low Risk</option>
                                   </select>

                                   <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                        className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                   >
                                        <option value="progress">Sort by Progress</option>
                                        <option value="budget">Sort by Budget</option>
                                        <option value="deadline">Sort by Deadline</option>
                                        <option value="risk">Sort by Risk</option>
                                   </select>

                                   <select
                                        value={filters.sortOrder}
                                        onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                                        className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                   >
                                        <option value="desc">Highest First</option>
                                        <option value="asc">Lowest First</option>
                                   </select>

                                   {(filters.status !== 'all' || filters.risk !== 'all' || searchInput) && (
                                        <button
                                             onClick={() => {
                                                  setSearchInput('');
                                                  setFilters({ status: 'all', risk: 'all', search: '', sortBy: 'progress', sortOrder: 'desc' });
                                             }}
                                             className="text-sm text-accent hover:text-accent-hover ml-auto"
                                        >
                                             Clear all filters
                                        </button>
                                   )}
                              </div>
                         </div>
                    )}

                    {/* High-Level CEO Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                         <StatCard
                              icon={<TrendingUp className="text-accent" />}
                              label="Avg. Efficiency"
                              value={`${stats.averageProgress || 0}%`}
                              trend={`${stats.activeProjects} active projects`}
                         />
                         <StatCard
                              icon={<DollarSign className="text-accent-secondary" />}
                              label="Portfolio Value"
                              value={`$${((stats.totalBudget || 0) / 1000).toFixed(1)}k`}
                              trend={`$${((stats.totalCost || 0) / 1000).toFixed(1)}k spent`}
                         />
                         <StatCard
                              icon={<Users className="text-accent" />}
                              label="Active Developers"
                              value={stats.activeDevelopers || 0}
                              trend={`${stats.totalTasks || 0} total tasks`}
                         />
                         <StatCard
                              icon={<AlertCircle className="text-red-500" />}
                              label="High Risk Projects"
                              value={stats.highRiskProjects || 0}
                              isCritical={stats.highRiskProjects > 0}
                              trend={`${stats.delayedProjects || 0} delayed`}
                         />
                    </div>

                    {/* Risk Alerts */}
                    {riskAlerts.length > 0 && (
                         <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                   <AlertCircle size={18} className="text-red-500" />
                                   <h3 className="text-sm font-bold text-text-primary">Attention Required</h3>
                                   <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                                        {riskAlerts.length} alerts
                                   </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                   {riskAlerts.slice(0, 3).map(alert => (
                                        <Link
                                             key={alert.id}
                                             href={`/ceo/projects/${alert.id}`}
                                             className="p-3 bg-bg-surface border border-red-500/20 rounded-lg hover:border-red-500 transition-colors group"
                                        >
                                             <div className="flex justify-between items-start mb-1">
                                                  <span className="font-medium text-text-primary group-hover:text-red-500">
                                                       {alert.projectName}
                                                  </span>
                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getRiskColor(alert.riskLevel)}`}>
                                                       {alert.riskLevel}
                                                  </span>
                                             </div>
                                             <p className="text-xs text-text-muted">Manager: {alert.manager}</p>
                                             {alert.isDelayed && (
                                                  <p className="text-xs text-red-500 mt-1">⚠️ {alert.delayReason || 'Delayed'}</p>
                                             )}
                                        </Link>
                                   ))}
                              </div>
                         </div>
                    )}
               </header>

               {/* Projects Grid */}
               {projects.length === 0 ? (
                    <div className="text-center py-16 bg-bg-surface rounded-2xl border border-dashed border-border-default">
                         <div className="max-w-md mx-auto">
                              <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                   <Target size={40} className="text-text-disabled" />
                              </div>
                              <h3 className="font-bold text-text-primary text-lg mb-2">No projects found</h3>
                              <p className="text-text-muted text-sm mb-6">
                                   {filters.status !== 'all' || filters.risk !== 'all' || searchInput
                                        ? 'Try adjusting your filters to see more results'
                                        : 'No projects have been created yet.'}
                              </p>
                              {(filters.status !== 'all' || filters.risk !== 'all' || searchInput) && (
                                   <button
                                        onClick={() => {
                                             setSearchInput('');
                                             setFilters({ status: 'all', risk: 'all', search: '', sortBy: 'progress', sortOrder: 'desc' });
                                        }}
                                        className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all"
                                   >
                                        Clear Filters
                                   </button>
                              )}
                         </div>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                         {projects.map((project) => (
                              <CEOProjectCard key={project.id} project={project} getRiskColor={getRiskColor} getStatusColor={getStatusColor} />
                         ))}
                    </div>
               )}
          </div>
     );
}

function StatCard({ icon, label, value, isCritical, trend }) {
     return (
          <div className={`p-5 rounded-2xl bg-bg-surface border ${isCritical ? 'border-red-500/20' : 'border-border-default'} shadow-sm hover:shadow-md transition-all`}>
               <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-bg-subtle rounded-lg">{icon}</div>
                    <span className="text-caption font-bold text-text-muted uppercase tracking-wider">{label}</span>
               </div>
               <div className="text-headline font-black text-text-primary">{value}</div>
               {trend && <p className="text-xs text-text-muted mt-1">{trend}</p>}
          </div>
     );
}

function CEOProjectCard({ project, getRiskColor, getStatusColor }) {
     const isAtRisk = project.riskLevel === 'HIGH' || project.isDelayed;
     const budgetUtilization = project.metrics?.budgetUtilization || 0;

     return (
          <Link href={`/ceo/projects/${project.id}`} className="group block">
               <div className="bg-bg-card border border-border-default rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:border-accent relative overflow-hidden h-full flex flex-col">

                    {/* Risk Indicator Ribbon */}
                    {isAtRisk && (
                         <div className="absolute top-0 right-0 px-4 py-1 bg-red-500 text-text-inverse text-[10px] font-black uppercase tracking-widest rounded-bl-xl flex items-center gap-1">
                              <AlertCircle size={12} />
                              Attention Required
                         </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                         <div className="flex-1">
                              <span className="text-[10px] font-black text-accent uppercase tracking-widest">{project.clientName}</span>
                              <h3 className="text-headline font-bold text-text-primary mt-1 group-hover:text-accent transition-colors leading-tight">
                                   {project.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                   <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold border ${getStatusColor(project.status)}`}>
                                        {project.status.replace('_', ' ')}
                                   </span>
                                   <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold border ${getRiskColor(project.riskLevel)}`}>
                                        {project.riskLevel} Risk
                                   </span>
                              </div>
                         </div>
                         <div className="relative w-16 h-16 shrink-0 ml-4">
                              <svg className="w-full h-full transform -rotate-90">
                                   <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="text-border-subtle"
                                   />
                                   <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeDasharray={175.9}
                                        strokeDashoffset={175.9 - (175.9 * project.progress) / 100}
                                        className={isAtRisk ? 'text-red-500' : 'text-accent'}
                                        strokeLinecap="round"
                                   />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                   <span className="text-xs font-black text-text-primary">{project.progress}%</span>
                              </div>
                         </div>
                    </div>

                    {/* Financial Health */}
                    <div className="bg-bg-surface/50 rounded-2xl p-4 mb-6 border border-border-subtle">
                         <div className="grid grid-cols-2 gap-4">
                              <div>
                                   <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                                        <DollarSign size={10} /> Budget
                                   </p>
                                   <p className="text-body font-bold text-text-primary">${(project.budget / 1000).toFixed(1)}k</p>
                              </div>
                              <div className="border-l border-border-subtle pl-4">
                                   <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                                        <DollarSign size={10} /> Cost
                                   </p>
                                   <p className={`text-body font-bold ${project.cost > project.budget ? 'text-red-500' : 'text-text-primary'}`}>
                                        ${(project.cost / 1000).toFixed(1)}k
                                   </p>
                              </div>
                         </div>
                         <div className="mt-3">
                              <div className="flex justify-between text-[10px] font-bold mb-1">
                                   <span className="text-text-muted">Budget Utilization</span>
                                   <span className={budgetUtilization > 100 ? 'text-red-500' : 'text-text-primary'}>
                                        {budgetUtilization}%
                                   </span>
                              </div>
                              <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                                   <div
                                        className={`h-full transition-all duration-700 ${budgetUtilization > 100 ? 'bg-red-500' : 'bg-accent-secondary'
                                             }`}
                                        style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                                   />
                              </div>
                         </div>
                    </div>

                    {/* Progress & Metrics */}
                    <div className="mb-6 space-y-3">
                         <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                   <CheckCircle2 size={14} className="text-accent" />
                                   <span className="text-text-muted">Tasks:</span>
                                   <span className="font-bold text-text-primary border border-accent/80">
                                        {project.metrics?.completedTasks || 0}/{project.metrics?.totalTasks || 0}
                                   </span>
                              </div>
                              <div className="flex items-center gap-2">
                                   <Clock size={14} className="text-yellow-500" />
                                   <span className="text-text-muted">Overdue:</span>
                                   <span className="font-bold text-yellow-500">{project.metrics?.overdueTasks || 0}</span>
                              </div>
                         </div>
                         <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                   <Zap size={14} className="text-orange-500" />
                                   <span className="text-text-muted">Milestones:</span>
                                   <span className="font-bold text-text-primary">{project.milestones?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                   <Shield size={14} className="text-purple-500" />
                                   <span className="text-text-muted">Feedback:</span>
                                   <span className="font-bold text-purple-500">{project._count?.feedbacks || 0}</span>
                              </div>
                         </div>
                    </div>

                    {/* Manager Accountability */}
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-border-subtle">
                         <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center text-[10px] font-bold text-accent border border-accent/20 overflow-hidden">
                                   {project.manager?.avatar ? (
                                        <img src={project.manager.avatar} alt={project.manager.name} className="w-full h-full object-cover" />
                                   ) : (
                                        project.manager?.name?.split(' ').map(n => n[0]).join('')
                                   )}
                              </div>
                              <div>
                                   <p className="text-[10px] font-bold text-text-muted uppercase">Project Manager</p>
                                   <p className="text-ui font-bold text-text-primary">{project.manager?.name || 'Unassigned'}</p>
                              </div>
                         </div>
                         <div className="flex items-center gap-1 font-bold text-accent text-ui">
                              Overview <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                         </div>
                    </div>
               </div>
          </Link>
     );
}