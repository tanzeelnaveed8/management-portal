// app/(dashboard)/project-manager/projects/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
     Plus,
     Search,
     Calendar,
     User,
     BarChart2,
     Clock,
     MoreVertical,
     AlertCircle,
     Filter,
     RefreshCw,
     FileText,
     CheckCircle,
     XCircle,
     TrendingUp,
     Users,Flag,
     Briefcase
} from 'lucide-react';
import { useProjectManager } from '../../../../hooks/useProjectManager';
import CreateProjectModal from '../../../Components/project-manager/CreateProjectModal';
import ProjectFiltersModal from '../../../Components/project-manager/ProjectFiltersModal';
import Spinner from '../../../Components/common/Spinner';

export default function ProjectsPage() {
     const {
          projects,
          stats,
          loading,
          error,
          createProject,
          refetch
     } = useProjectManager();

     console.log("Projects", projects)
     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
     const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState('ALL');
     const [filteredProjects, setFilteredProjects] = useState([]);

     useEffect(() => {
          if (projects.length > 0) {
               filterProjects();
          }
     }, [projects, searchTerm, statusFilter]);

     const filterProjects = () => {
          let filtered = [...projects];

          // Apply search filter
          if (searchTerm) {
               filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.teamLead?.toLowerCase().includes(searchTerm.toLowerCase())
               );
          }

          // Apply status filter
          if (statusFilter !== 'ALL') {
               filtered = filtered.filter(p => p.status === statusFilter);
          }

          setFilteredProjects(filtered);
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
               case 'IN_PROGRESS':
               case 'IN_DEVELOPMENT': return 'bg-accent-muted text-accent border-accent/20';
               case 'CLIENT_REVIEW': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
               case 'ON_HOLD': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
               case 'ARCHIVED': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
               default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
          }
     };

     const getPriorityIcon = (priority) => {
          switch (priority) {
               case 'CRITICAL': return <AlertCircle size={14} className="text-red-500" />;
               case 'HIGH': return <TrendingUp size={14} className="text-orange-500" />;
               case 'MEDIUM': return <Clock size={14} className="text-yellow-500" />;
               default: return <CheckCircle size={14} className="text-green-500" />;
          }
     };

     if (loading.dashboard) {
          return <Spinner title="Projects Dashboard..." />
         
     }

     if (error) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Error Loading Projects</h2>
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
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y">
               {/* Header Section */}
               <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                         <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                              Projects Dashboard
                         </h1>
                         <p className="text-text-muted mt-1">
                              Manage {stats.totalProjects} projects • {stats.activeProjects} active • {stats.completionRate}% completion rate
                         </p>
                    </div>

                    <div className="flex items-center gap-3">
                         <button
                              onClick={refetch}
                              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
                              title="Refresh"
                         >
                              <RefreshCw size={18} />
                         </button>
                         <button
                              onClick={() => setIsCreateModalOpen(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg transition-colors font-medium"
                         >
                              <Plus size={18} />
                              Create New Project
                         </button>
                    </div>
               </header>

               {/* Stats Overview */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                         icon={<Briefcase className="text-accent" />}
                         label="Total Projects"
                         value={stats.totalProjects}
                         bgColor="bg-accent/10"
                    />
                    <StatCard
                         icon={<Users className="text-blue-500" />}
                         label="Active Projects"
                         value={stats.activeProjects}
                         bgColor="bg-blue-500/10"
                    />
                    <StatCard
                         icon={<AlertCircle className="text-red-500" />}
                         label="Without Team Lead"
                         value={stats.projectsWithoutLead}
                         bgColor="bg-red-500/10"
                         warning={stats.projectsWithoutLead > 0}
                    />
                    <StatCard
                         icon={<CheckCircle className="text-green-500" />}
                         label="Completion Rate"
                         value={`${stats.completionRate}%`}
                         bgColor="bg-green-500/10"
                    />
               </div>

               {/* Filters & Search */}
               <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-border-subtle">
                    <div className="relative flex-1 min-w-[300px]">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                         <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search projects, clients, or team leads..."
                              className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-default rounded-lg focus:ring-1 focus:ring-focus-ring outline-none text-text-body transition-all"
                         />
                    </div>

                    <select
                         value={statusFilter}
                         onChange={(e) => setStatusFilter(e.target.value)}
                         className="px-4 py-2 bg-bg-surface border border-border-default rounded-lg text-text-body outline-none"
                    >
                         <option value="ALL">All Statuses</option>
                         <option value="ACTIVE">Active</option>
                         <option value="IN_DEVELOPMENT">In Development</option>
                         <option value="CLIENT_REVIEW">Client Review</option>
                         <option value="COMPLETED">Completed</option>
                         <option value="ON_HOLD">On Hold</option>
                    </select>

                    <button
                         onClick={() => setIsFilterModalOpen(true)}
                         className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-lg text-text-body hover:bg-bg-subtle transition-colors"
                    >
                         <Filter size={18} />
                         More Filters
                    </button>
               </div>

               {/* Projects Grid */}
               {filteredProjects.length === 0 ? (
                    <div className="text-center py-16 bg-bg-surface rounded-xl border border-border-default">
                         <div className="max-w-md mx-auto">
                              <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                   <Briefcase size={32} className="text-text-disabled" />
                              </div>
                              <h3 className="text-lg font-bold text-text-primary mb-2">No projects found</h3>
                              <p className="text-text-muted text-sm mb-6">
                                   {searchTerm || statusFilter !== 'ALL'
                                        ? "Try adjusting your search filters"
                                        : "Get started by creating your first project"}
                              </p>
                              {searchTerm || statusFilter !== 'ALL' ? (
                                   <button
                                        onClick={() => {
                                             setSearchTerm('');
                                             setStatusFilter('ALL');
                                        }}
                                        className="text-accent text-sm font-medium hover:underline"
                                   >
                                        Clear all filters
                                   </button>
                              ) : (
                                   <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="bg-accent text-text-inverse px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-all"
                                   >
                                        Create Your First Project
                                   </button>
                              )}
                         </div>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                         {filteredProjects.map((project) => (
                              <ProjectCard
                                   key={project.id}
                                   project={project}
                                   getStatusColor={getStatusColor}
                                   getPriorityIcon={getPriorityIcon}
                              />
                         ))}
                    </div>
               )}

               {/* Modals */}
               <CreateProjectModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={createProject}
               />

               <ProjectFiltersModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    currentFilters={{ status: statusFilter, search: searchTerm }}
                    onApply={(filters) => {
                         if (filters.status) setStatusFilter(filters.status);
                         if (filters.search) setSearchTerm(filters.search);
                         setIsFilterModalOpen(false);
                    }}
               />
          </div>
     );
}

function ProjectCard({ project, getStatusColor, getPriorityIcon }) {
     const [showMenu, setShowMenu] = useState(false);
console.log("Project Cardprojects" , project)
     return (
          <Link href={`/project-manager/projects/${project.id}`} className="group block">
               <div className="h-full bg-bg-card border border-border-default rounded-xl p-5 hover:border-accent transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden">

                    {/* Overdue Alert Decoration */}
                    {project.isOverdue && (
                         <div className="absolute top-0 right-0 p-2 bg-red-500/10 rounded-bl-lg">
                              <AlertCircle size={16} className="text-red-500" />
                         </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-2">
                              <span className={`text-caption font-bold px-2 py-1 rounded uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                                   {project.status.replace('_', ' ')}
                              </span>
                              {project.priority && (
                                   <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-bg-subtle rounded">
                                        {getPriorityIcon(project.priority)}
                                        {project.priority}
                                   </span>
                              )}
                         </div>

                         <div className="relative">
                              <button
                                   onClick={(e) => {
                                        e.preventDefault();
                                        setShowMenu(!showMenu);
                                   }}
                                   className="text-text-disabled hover:text-text-primary p-1 rounded-lg hover:bg-bg-subtle"
                              >
                                   <MoreVertical size={18} />
                              </button>

                              {showMenu && (
                                   <div className="absolute right-0 mt-1 w-48 bg-bg-surface border border-border-default rounded-lg shadow-lg z-10 py-1">
                                        <Link
                                             href={`/project-manager/projects/${project.id}/edit`}
                                             className="block px-4 py-2 text-sm text-text-body hover:bg-bg-subtle"
                                             onClick={() => setShowMenu(false)}
                                        >
                                             Edit Project
                                        </Link>
                                        <Link
                                             href={`/project-manager/projects/${project.id}/report`}
                                             className="block px-4 py-2 text-sm text-text-body hover:bg-bg-subtle"
                                             onClick={() => setShowMenu(false)}
                                        >
                                             Generate Report
                                        </Link>
                                        <button
                                             className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                                             onClick={() => {
                                                  setShowMenu(false);
                                                  // Handle archive
                                             }}
                                        >
                                             Archive Project
                                        </button>
                                   </div>
                              )}
                         </div>
                    </div>

                    <h3 className="text-headline font-bold text-text-primary group-hover:text-accent transition-colors mb-2">
                         {project.name}
                    </h3>

                    {project.clientName && (
                         <p className="text-xs text-text-muted mb-3">
                              Client: {project.clientName}
                         </p>
                    )}

                    <div className="space-y-2 mb-4">
                         <div className="flex items-center gap-2 text-ui text-text-body">
                              <User size={14} className="text-text-muted" />
                              <span className="font-medium">Lead:</span>
                              <span className={!project.teamLead?.name ? 'text-orange-500' : ''}>
                                   {project.teamLead?.name || 'Not Assigned'}
                              </span>
                         </div>
                         <div className="flex items-center gap-2 text-ui text-text-body">
                              <Calendar size={14} className="text-text-muted" />
                              <span className="font-medium">Deadline:</span>
                              <span className={project.isOverdue ? 'text-red-500 font-bold' : ''}>
                                   {project.deadline || 'TBD'}
                                   {project.daysUntilDeadline > 0 && !project.isOverdue && (
                                        <span className="ml-1 text-[10px] text-text-muted">
                                             ({project.daysUntilDeadline} days left)
                                        </span>
                                   )}
                              </span>
                         </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2">
                         <div className="flex justify-between text-caption font-bold">
                              <span className="text-text-muted">PROJECT PROGRESS</span>
                              <span className="text-text-primary">{project.progress}%</span>
                         </div>
                         <div className="w-full h-2 bg-border-subtle rounded-full overflow-hidden">
                              <div
                                   className="h-full bg-accent transition-all duration-500"
                                   style={{ width: `${project.progress}%` }}
                              />
                         </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center text-ui">
                         <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-text-muted">
                                   <BarChart2 size={14} />
                                   {project.tasksCount || 0} Tasks
                              </div>
                              {project.milestonesCount > 0 && (
                                   <div className="flex items-center gap-1 text-text-muted">
                                        <Flag size={14} />
                                        {project.milestonesCount} Milestones
                                   </div>
                              )}
                         </div>
                         <div className="flex items-center gap-1 font-medium text-accent group-hover:gap-2 transition-all">
                              View Details
                              <span className="text-lg">→</span>
                         </div>
                    </div>
               </div>
          </Link>
     );
}

function StatCard({ icon, label, value, bgColor, warning }) {
     return (
          <div className={`bg-bg-surface border ${warning ? 'border-red-200' : 'border-border-default'} rounded-xl p-5 shadow-sm`}>
               <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${bgColor} rounded-lg`}>
                         {icon}
                    </div>
                    <span className="text-xs font-medium text-text-muted uppercase">{label}</span>
               </div>
               <div className="flex items-end justify-between">
                    <span className={`text-2xl font-bold ${warning ? 'text-red-500' : 'text-text-primary'}`}>
                         {value}
                    </span>
               </div>
          </div>
     );
}