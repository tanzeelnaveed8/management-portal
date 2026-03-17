// app/(dashboard)/team-lead/projects/page.jsx
'use client';
import React, { useState } from 'react';
import ProjectCard from '../../../Components/common/ProjectCard';
import { Plus, Search, SlidersHorizontal, LayoutGrid, X } from 'lucide-react';
import { useTeamLeadProjects } from '../../../../hooks/useTeamLeadProjects';
import CreateProjectModal from '../../../Components/team-lead/CreateProjectModal';
import FilterModal from '../../../Components/team-lead/FilterModal';
import Spinner from '../../../Components/common/Spinner';

export default function ProjectsPage() {
     const { projects, loading, error, filters, updateFilters, createProject } = useTeamLeadProjects();
     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
     const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
     const [searchInput, setSearchInput] = useState('');

     const handleSearch = (e) => {
          e.preventDefault();
          updateFilters({ search: searchInput });
     };

     const clearSearch = () => {
          setSearchInput('');
          updateFilters({ search: '' });
     };

     if (loading) {
          return <Spinner title="Your Projects..." />;
     }

     console.log("TeamLead Projects", projects)    
     if (error) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y flex items-center justify-center">
                    <div className="text-center">
                         <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
                         <p className="text-text-muted mb-4">{error}</p>
                         <button
                              onClick={() => window.location.reload()}
                              className="bg-accent text-text-inverse px-6 py-2 rounded-xl"
                         >
                              Try Again
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y">
               <div className="max-w-[1600px] mx-auto space-y-8">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div className="space-y-1">
                              <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                                   Projects
                              </h1>
                              <p className="text-text-muted text-sm">
                                   You have {projects.length} active {projects.length === 1 ? 'project' : 'projects'} to manage
                              </p>
                         </div>

                         {/* <button
                              onClick={() => setIsCreateModalOpen(true)}
                              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-text-inverse px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent/20 active:scale-95"
                         >
                              <Plus size={20} />
                              <span>New Project</span>
                         </button> */}
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                         <form onSubmit={handleSearch} className="relative flex-1 group">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors" size={18} />
                              <input
                                   type="text"
                                   value={searchInput}
                                   onChange={(e) => setSearchInput(e.target.value)}
                                   placeholder="Search by project name, client, or description..."
                                   className="w-full bg-bg-surface border border-border-default rounded-xl py-3 pl-12 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent transition-all"
                              />
                              {searchInput && (
                                   <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                                   >
                                        <X size={16} />
                                   </button>
                              )}
                         </form>
                         <div className="flex gap-2">
                              <button
                                   onClick={() => setIsFilterModalOpen(true)}
                                   className="flex items-center gap-2 px-4 py-3 bg-bg-surface border border-border-default rounded-xl text-sm font-bold text-text-body hover:bg-bg-subtle transition-colors"
                              >
                                   <SlidersHorizontal size={18} />
                                   <span>Filters</span>
                                   {(filters.status || filters.priority || filters.riskLevel) && (
                                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                                   )}
                              </button>
                              <button className="p-3 bg-bg-surface border border-border-default rounded-xl text-accent">
                                   <LayoutGrid size={18} />
                              </button>
                         </div>
                    </div>

                    {/* Active Filters Display */}
                    {(filters.status || filters.priority || filters.riskLevel) && (
                         <div className="flex flex-wrap gap-2">
                              {filters.status && filters.status !== 'ALL' && (
                                   <span className="px-3 py-1 bg-accent-muted text-accent rounded-full text-xs font-medium flex items-center gap-2">
                                        Status: {filters.status.replace('_', ' ')}
                                        <button onClick={() => updateFilters({ status: '' })}>
                                             <X size={14} />
                                        </button>
                                   </span>
                              )}
                              {filters.priority && filters.priority !== 'ALL' && (
                                   <span className="px-3 py-1 bg-accent-muted text-accent rounded-full text-xs font-medium flex items-center gap-2">
                                        Priority: {filters.priority}
                                        <button onClick={() => updateFilters({ priority: '' })}>
                                             <X size={14} />
                                        </button>
                                   </span>
                              )}
                              {filters.riskLevel && filters.riskLevel !== 'ALL' && (
                                   <span className="px-3 py-1 bg-accent-muted text-accent rounded-full text-xs font-medium flex items-center gap-2">
                                        Risk: {filters.riskLevel}
                                        <button onClick={() => updateFilters({ riskLevel: '' })}>
                                             <X size={14} />
                                        </button>
                                   </span>
                              )}
                         </div>
                    )}

                    {/* Projects Grid */}
                    {projects.length === 0 ? (
                         <div className="text-center py-16 bg-bg-surface rounded-3xl border border-border-default">
                              <div className="max-w-md mx-auto space-y-4">
                                   <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto">
                                        <Search size={32} className="text-text-disabled" />
                                   </div>
                                   <h3 className="text-lg font-bold text-text-primary">No projects found</h3>
                                   <p className="text-text-muted text-sm">
                                        {filters.search || filters.status || filters.priority || filters.riskLevel
                                             ? "Try adjusting your search or filters"
                                             : "Get started by creating your first project"}
                                   </p>
                                   {(filters.search || filters.status || filters.priority || filters.riskLevel) && (
                                        <button
                                             onClick={() => {
                                                  setSearchInput('');
                                                  updateFilters({ search: '', status: '', priority: '', riskLevel: '' });
                                             }}
                                             className="text-accent text-sm font-medium hover:underline"
                                        >
                                             Clear all filters
                                        </button>
                                   )}
                              </div>
                         </div>
                    ) : (
                         <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                              {projects.map((project) => (
                                   <ProjectCard role="team-lead" key={project.id} project={project} />
                              ))}

                              {/* Add Project Card */}
                              {/* <div
                                   onClick={() => setIsCreateModalOpen(true)}
                                   className="border-2 border-dashed border-border-strong rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center opacity-40 hover:opacity-100 transition-all cursor-pointer group hover:bg-accent-muted/30"
                              >
                                   <div className="h-12 w-12 rounded-full bg-bg-subtle flex items-center justify-center text-text-disabled group-hover:text-accent group-hover:scale-110 transition-all">
                                        <Plus size={28} />
                                   </div>
                                   <div>
                                        <p className="font-bold text-text-primary">Create New Project</p>
                                        <p className="text-xs text-text-muted">Start a new development cycle</p>
                                   </div>
                              </div> */}
                         </div>
                    )}
               </div>

               {/* Modals */}
               <CreateProjectModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={createProject}
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