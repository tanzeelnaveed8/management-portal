// app/(dashboard)/team-lead/my-developers/page.jsx
'use client';
import React, { useState } from 'react';
import {
     Mail,
     Phone,
     MoreVertical,
     Search,
     Filter,
     UserPlus,
     ExternalLink,
     CheckCircle,
     Clock,
     AlertTriangle,
     X,
     SlidersHorizontal,
     ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useTeamLeadDevelopers } from '../../../../hooks/useTeamLeadDevelopers';
import InviteDeveloperModal from '../../../Components/team-lead/InviteDeveloperModal';
import DeveloperFiltersModal from '../../../Components/team-lead/DeveloperFiltersModal';
import Spinner from '../../../Components/common/Spinner';
import DeveloperDetailsModal from '../../../Components/team-lead/DeveloperDetailsModal';

const Page = () => {
     const {
          developers,
          loading,
          error,
          filters,
          updateFilters,
          clearFilters,
          addDeveloper,
          deactivateDeveloper,
          refetch
     } = useTeamLeadDevelopers();


     const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
     const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
     const [searchInput, setSearchInput] = useState('');
     const [selectedDeveloper, setSelectedDeveloper] = useState(null);
     const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

     console.log(developers)
     // Add the handler
     const handleViewTasks = (developer) => {
          setSelectedDeveloper(developer);
          setIsDetailsModalOpen(true);
     };

     // Add deactivate handler
     const handleDeactivate = async (developerId) => {
          // This will be called from the modal
          const result = await deactivateDeveloper(developerId);
          if (result.success) {
               // Refresh the list
               refetch();
          }
          return result;
     };

     const handleSearch = (e) => {
          e.preventDefault();
          updateFilters({ search: searchInput });
     };

     const clearSearch = () => {
          setSearchInput('');
          updateFilters({ search: '' });
     };



     const getWorkloadColor = (workload) => {
          if (workload > 85) return 'text-red-500';
          if (workload > 70) return 'text-yellow-500';
          return 'text-green-500';
     };

     const getWorkloadBarColor = (workload) => {
          if (workload > 85) return 'bg-red-500';
          if (workload > 70) return 'bg-yellow-500';
          return 'bg-accent-secondary';
     };

     if (loading) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y">
                    <Spinner title="Your Team..." />
               </div>
          );
     }

     if (error) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Error Loading Team</h2>
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
               {/* Header section */}
               <div className="grid grid-cols-1 lg:grid-cols-2 md:items-center justify-between gap-6 mb-8">
                    <div>
                         <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                              My Developers
                         </h1>
                         <p className="text-text-muted text-ui mt-1">
                              You have {developers.length} developer{developers.length !== 1 ? 's' : ''} in your team
                         </p>
                    </div>

                    <div className=" w-full flex flex-col sm:flex-wrap justify-start md:justify-end items-end gap-3 text-sm">
                         <form onSubmit={handleSearch} className="relative w-full">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                              <input
                                   type="text"
                                   value={searchInput}
                                   onChange={(e) => setSearchInput(e.target.value)}
                                   placeholder="Search by name, or skill..."
                                   className=" w-full pl-10 pr-10 py-2.5 bg-bg-surface border border-border-default rounded-xl focus:ring-1 focus:ring-accent outline-none text-ui "
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

                         <div className=" w-full  grid grid-cols-2 gap-2">
                              <button
                                   onClick={() => setIsFilterModalOpen(true)}
                                   className="px-4 py-2.5 bg-bg-surface border border-border-default rounded-xl text-ui font-medium text-text-body hover:bg-bg-subtle transition-colors flex items-center gap-2"
                              >
                                   <SlidersHorizontal size={18} />
                                   <span>Filters</span>
                                   {(filters.department || filters.status || filters.workload) && (
                                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                                   )}
                              </button>

                              {/* <button
                                   onClick={() => setIsInviteModalOpen(true)}
                                   className="bg-accent hover:bg-accent-hover text-text-inverse px-4 py-2.5 rounded-xl font-bold text-ui flex items-center gap-2 transition-all"
                              >
                                   <UserPlus size={18} />
                                   Invite Developer
                              </button> */}       
                         </div>
                    </div>
               </div>

               {/* Active Filters Display */}
               {(filters.department || filters.status || filters.workload) && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                         <span className="text-xs text-text-muted">Active filters:</span>
                         {filters.department && filters.department !== 'ALL' && (
                              <span className="px-3 py-1 bg-accent-muted text-accent rounded-full text-xs font-medium flex items-center gap-2">
                                   Department: {filters.department}
                                   <button onClick={() => updateFilters({ department: '' })}>
                                        <X size={14} />
                                   </button>
                              </span>
                         )}
                         {filters.status && filters.status !== 'ALL' && (
                              <span className="px-3 py-1 bg-accent-muted text-accent rounded-full text-xs font-medium flex items-center gap-2">
                                   Status: {filters.status}
                                   <button onClick={() => updateFilters({ status: '' })}>
                                        <X size={14} />
                                   </button>
                              </span>
                         )}
                         {filters.workload && (
                              <span className="px-3 py-1 bg-accent-muted text-accent rounded-full text-xs font-medium flex items-center gap-2">
                                   Workload: {filters.workload}
                                   <button onClick={() => updateFilters({ workload: '' })}>
                                        <X size={14} />
                                   </button>
                              </span>
                         )}
                         <button
                              onClick={clearFilters}
                              className="text-xs text-accent hover:underline ml-2"
                         >
                              Clear all
                         </button>
                    </div>
               )}

               {/* Developer Grid */}
               {developers.length === 0 ? (
                    <div className="text-center py-16 bg-bg-surface rounded-3xl border border-border-default">
                         <div className="max-w-md mx-auto">
                              <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                   <UserPlus size={32} className="text-text-disabled" />
                              </div>
                              <h3 className="text-lg font-bold text-text-primary mb-2">No developers found</h3>
                              <p className="text-text-muted text-sm mb-6">
                                   {filters.search || filters.department || filters.status || filters.workload
                                        ? "Try adjusting your search filters"
                                        : "Start by inviting developers to your team"}
                              </p>
                              {filters.search || filters.department || filters.status || filters.workload ? (
                                   <button
                                        onClick={clearFilters}
                                        className="text-accent text-sm font-medium hover:underline"
                                   >
                                        Clear all filters
                                   </button>
                              ) : (
                                   <button
                                        onClick={() => setIsInviteModalOpen(true)}
                                        className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                                   >
                                        Invite Your First Developer
                                   </button>
                              )}
                         </div>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                         {developers.map((dev) => (
                              <DeveloperCard
                                   key={dev.id}
                                   dev={dev}
                                   onViewTasks={() => handleViewTasks(dev)}
                                   getWorkloadColor={getWorkloadColor}
                                   getWorkloadBarColor={getWorkloadBarColor}
                              />
                         ))}
                    </div>
               )}
               {/* Modals */}
               {isDetailsModalOpen && (
                    <DeveloperDetailsModal
                         isOpen={isDetailsModalOpen}
                         onClose={() => {
                              setIsDetailsModalOpen(false);
                              setSelectedDeveloper(null);
                         }}
                         developer={selectedDeveloper}
                         onDeactivate={handleDeactivate}
                    />
               )}
              
               <InviteDeveloperModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSubmit={addDeveloper}
               />

               <DeveloperFiltersModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    currentFilters={filters}
                    onApply={updateFilters}
               />
          </div>
     );
};

const DeveloperCard = ({ dev, onViewTasks, getWorkloadColor, getWorkloadBarColor }) => {
     const [showMenu, setShowMenu] = useState(false);

     return (
          
          <div className="group bg-bg-surface border border-border-default rounded-2xl p-5 hover:border-accent/40 hover:shadow-xl transition-all relative overflow-hidden">
               {/* Workload Indicator Strip */}
               <div
                    className={`absolute top-0 left-0 w-full h-1 transition-colors ${dev.workload > 85 ? 'bg-red-500' :
                         dev.workload > 70 ? 'bg-yellow-500' :
                              'bg-accent-secondary'
                         }`}
               />

               <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                         <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center text-accent font-bold text-headline overflow-hidden border border-border-subtle">
                                   {dev.avatar ? (
                                        <img src={dev.avatar} alt={dev.name} className="w-full h-full object-cover" />
                                   ) : (
                                        <span className="text-xl">{dev.name?.charAt(0) || 'D'}</span>
                                   )}
                              </div>
                              <span
                                   className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-bg-surface ${dev.status === 'ACTIVE' ? 'bg-green-500' :
                                        dev.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}
                                   title={dev.status}
                              />

                         </div>

                         <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                                   {dev.name}
                              </h3>
                              <p className="text-caption text-text-muted truncate">{dev.jobTitle}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                   <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-card text-text-body border border-border-subtle">
                                        {dev.department || 'Engineering'}
                                   </span>
                                   {dev.skills && dev.skills.slice(0, 2).map((skill, i) => (
                                        <span
                                             key={i}
                                             className="text-[10px] px-2 py-0.5 rounded bg-accent-muted/30 text-accent border border-accent/10"
                                        >
                                             {skill}
                                        </span>
                                   ))}
                                   {dev.skills && dev.skills.length > 2 && (
                                        <span className="text-[10px] text-text-muted">
                                             +{dev.skills.length - 2}
                                        </span>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* <div className="relative">
                         <button
                              onClick={() => setShowMenu(!showMenu)}
                              className="text-text-disabled hover:text-text-primary transition-colors p-1"
                         >
                              <MoreVertical size={20} />
                         </button>

                         {showMenu && (
                              
                                  <button className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                                        Deactivate
                                   </button> 
                         )}
                    </div> */}
               </div>

               {/* Quick Stats Grid */}
               <div className="grid grid-cols-3 gap-2 mb-6 py-4 border-y border-border-subtle">
                    <div className="text-center">
                         <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                              <CheckCircle size={14} />
                              <span className="text-ui font-bold">{dev.stats.completed}</span>
                         </div>
                         <p className="text-[10px] text-text-muted uppercase font-medium">Done</p>
                    </div>
                    <div className="text-center border-x border-border-subtle">
                         <div className="flex items-center justify-center gap-1 text-accent mb-1">
                              <Clock size={14} />
                              <span className="text-ui font-bold">{dev.stats.ongoing}</span>
                         </div>
                         <p className="text-[10px] text-text-muted uppercase font-medium">Active</p>
                    </div>
                    <div className="text-center">
                         <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                              <AlertTriangle size={14} />
                              <span className="text-ui font-bold">{dev.stats.overdue}</span>
                         </div>
                         <p className="text-[10px] text-text-muted uppercase font-medium">Overdue</p>
                    </div>
               </div>

               {/* Workload Progress */}
               <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-caption font-bold text-text-body">Current Workload</span>
                         <span className={`text-caption font-bold ${getWorkloadColor(dev.workload)}`}>
                              {dev.workload}%
                         </span>
                    </div>
                    <div className="w-full h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                         <div
                              className={`h-full transition-all duration-500 ${getWorkloadBarColor(dev.workload)}`}
                              style={{ width: `${dev.workload}%` }}
                         />
                    </div>
                    <div className="flex justify-between mt-1">
                         <span className="text-[10px] text-text-muted">
                              {dev.currentTasks || 0} active tasks
                         </span>
                         <span className="text-[10px] text-text-muted">
                              Max: {dev.maxWorkload || 8}
                         </span>
                    </div>
               </div>

               {/* Recent Tasks Preview */}
               {dev.recentTasks && dev.recentTasks.length > 0 && (
                    <div className="mb-4">
                         <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Recent Tasks</p>
                         <div className="space-y-2">
                              {dev.recentTasks.map(task => (
                                   <div key={task.id} className="flex items-center justify-between text-xs">
                                        <span className="truncate max-w-[150px] text-text-primary">
                                             {task.project?.name}: {task.title?.substring(0, 20)}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                             task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                                  task.status === 'REVIEW' ? 'bg-yellow-500/10 text-yellow-500' :
                                                       task.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-gray-500/10 text-gray-500'
                                             }`}>
                                             {task.status?.replace('_', ' ')}
                                        </span>
                                   </div>
                              ))}
                         </div>
                    </div>
               )}

               {/* Footer Actions */}
               <div className="flex items-center gap-2 pt-2">
                    <a
                         href={`mailto:${dev.email}`}
                         className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-border-strong rounded-lg text-ui font-medium text-text-body hover:bg-bg-subtle transition-all"
                    >
                         <Mail size={16} />
                         Email
                    </a>
                    <button
                         onClick={() => onViewTasks(dev)}
                         className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-bg-card border border-accent/20 rounded-lg text-ui font-bold text-accent hover:bg-accent hover:text-text-inverse transition-all"
                    >
                         <ExternalLink size={16} />
                         View Tasks
                    </button>
               </div>
               {dev.status === 'INACTIVE' && ( 
               <h4 className=' mx-auto my-3 text-text-muted text-center text-xs relative bottom-0'>Deactivated by Team Lead</h4>
               )}
          </div>
          
     );
};

export default Page;