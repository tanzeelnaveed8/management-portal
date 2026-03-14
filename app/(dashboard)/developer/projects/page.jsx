
// app/(dashboard)/developer/projects/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import ProjectCard from '../../../Components/common/ProjectCard';
import { Plus, Search, Filter, LayoutGrid, List, X } from 'lucide-react';
import { useDeveloperProjects } from '../../../../hooks/useDeveloperProjects';
import { useRouter } from 'next/navigation';
import Spinner from '../../../Components/common/Spinner';


const ProjectsDashboard = () => {
     const router = useRouter();
     const { projects, loading, error, filters, setFilters } = useDeveloperProjects();
     const [searchInput, setSearchInput] = useState('');
     const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
console.log("Developers Projects", projects)

     // Debounce search input
     useEffect(() => {
          const timer = setTimeout(() => {
               setFilters(prev => ({ ...prev, search: searchInput }));
          }, 300);

          return () => clearTimeout(timer);
     }, [searchInput, setFilters]);

     const handleStatusFilter = (status) => {
          setFilters(prev => ({ ...prev, status }));
     };

     const clearSearch = () => {
          setSearchInput('');
          setFilters(prev => ({ ...prev, search: '' }));
     };

     if (loading && projects.length === 0) {
          return <Spinner title="Projects..." />;
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y">
               <div className="max-w-[1400px] mx-auto space-y-8">

                    {/* Header Area */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                         <div className="space-y-2">
                              <h1 className="text-4xl font-black text-text-primary tracking-tight">Active Projects</h1>
                              <p className="text-text-muted text-sm font-medium">
                                   You are currently working on {projects.length} active project{projects.length !== 1 ? 's' : ''}.
                              </p>
                         </div>

                    </div>

                    {/* Error Message */}
                    {error && (
                         <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
                              <p className="text-red-500 text-sm">{error}</p>
                              <button onClick={() => window.location.reload()} className="text-red-500 hover:text-red-600 text-xs font-bold">
                                   Retry
                              </button>
                         </div>
                    )}

                    {/* Global Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-bg-surface p-2 border border-border-default rounded-2xl">
                         <div className="relative w-full lg:w-96 group">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors" size={18} />
                              <input
                                   type="text"
                                   value={searchInput}
                                   onChange={(e) => setSearchInput(e.target.value)}
                                   placeholder="Search by project or client..."
                                   className="w-full bg-transparent border-none focus:ring-0 py-3 pl-12 pr-10 text-sm text-text-body"
                              />
                              {searchInput && (
                                   <button
                                        onClick={clearSearch}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary"
                                   >
                                        <X size={16} />
                                   </button>
                              )}
                         </div>

                         <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 px-2">
                              <div className="flex items-center gap-1 bg-bg-subtle p-1 rounded-xl border border-border-subtle">
                                   <button
                                        onClick={() => handleStatusFilter('all')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filters.status === 'all'
                                             ? 'bg-bg-surface text-accent shadow-sm'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        All
                                   </button>
                                   <button
                                        onClick={() => handleStatusFilter('ACTIVE')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filters.status === 'ACTIVE'
                                             ? 'bg-bg-surface text-accent shadow-sm'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        Active
                                   </button>
                                   <button
                                        onClick={() => handleStatusFilter('IN_DEVELOPMENT')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filters.status === 'IN_DEVELOPMENT'
                                             ? 'bg-bg-surface text-accent shadow-sm'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        In Dev
                                   </button>
                                   <button
                                        onClick={() => handleStatusFilter('COMPLETED')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filters.status === 'COMPLETED'
                                             ? 'bg-bg-surface text-accent shadow-sm'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        Completed
                                   </button>
                              </div>

                              <div className="h-6 w-px bg-border-default mx-2" />

                              <div className="flex bg-bg-subtle p-1 rounded-xl border border-border-subtle">
                                   <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                             ? 'bg-bg-surface text-accent shadow-sm'
                                             : 'text-text-disabled hover:text-text-muted'
                                             }`}
                                   >
                                        <LayoutGrid size={16} />
                                   </button>
                                   <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                             ? 'bg-bg-surface text-accent shadow-sm'
                                             : 'text-text-disabled hover:text-text-muted'
                                             }`}
                                   >
                                        <List size={16} />
                                   </button>
                              </div>
                         </div>
                    </div>

                    {/* Projects Grid/List */}
                    {projects.length === 0 ? (
                         <div className="text-center py-16 bg-bg-surface rounded-3xl border border-border-default">
                              <div className="max-w-md mx-auto space-y-4">
                                   <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto">
                                        <Search size={32} className="text-text-disabled" />
                                   </div>
                                   <h3 className="font-bold text-text-primary text-lg">No projects found</h3>
                                   <p className="text-text-muted text-sm">
                                        {searchInput || filters.status !== 'all'
                                             ? 'Try adjusting your filters or search terms'
                                             : 'You haven\'t been assigned to any projects yet'}
                                   </p>
                              </div>
                         </div>
                    ) : viewMode === 'grid' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                              {projects.map(project => (
                                   <ProjectCard role="developer" key={project.id} project={project} />
                              ))}
                         </div>
                    ) : (
                         <div className="bg-bg-surface rounded-2xl border border-border-default overflow-hidden">
                              <table className="w-full">
                                   <thead className="bg-bg-subtle border-b border-border-default">
                                        <tr>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Project</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Client</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Progress</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Tasks</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Deadline</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Risk</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {projects.map(project => (
                                             <tr
                                                  key={project.id}
                                                  onClick={() => router.push(`/developer/projects/${project.id}`)}
                                                  className="border-b border-border-default hover:bg-bg-subtle/50 cursor-pointer transition-colors"
                                             >
                                                  <td className="p-4 font-medium text-text-primary">{project.name}</td>
                                                  <td className="p-4 text-text-muted">{project.clientCompany}</td>
                                                  <td className="p-4">
                                                       <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-text-primary">{project.progress}%</span>
                                                            <div className="w-16 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                                                                 <div
                                                                      className={`h-full ${project.progress < 30 ? 'bg-red-500' :
                                                                           project.progress < 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                                           }`}
                                                                      style={{ width: `${project.progress}%` }}
                                                                 />
                                                            </div>
                                                       </div>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className="text-sm text-text-primary">
                                                            {project.completedTaskCount}/{project.taskCount}
                                                       </span>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className={`text-sm ${project.isDelayed ? 'text-red-500' : 'text-text-muted'
                                                            }`}>
                                                            {new Date(project.deadline).toLocaleDateString()}
                                                       </span>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${project.riskLevel === 'LOW' ? 'bg-green-500/10 text-green-500' :
                                                            project.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                            {project.riskLevel}
                                                       </span>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>
          </div>
     );
};

export default ProjectsDashboard;