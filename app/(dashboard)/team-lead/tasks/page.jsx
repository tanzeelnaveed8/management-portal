

// app/(dashboard)/team-lead/tasks/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import TaskCard from '../../../Components/common/TaskCard';
import { Plus, Filter, Search, Users, LayoutGrid, List, Clock, AlertCircle, CheckCircle2, Download, RefreshCw } from 'lucide-react';
import BreakMilestoneModal from '../../../Components/modals/BreakMilestoneModal';
import { useTeamLeadTasks } from '../../../../hooks/useTeamLeadTasks';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Spinner from '../../../Components/common/Spinner';
import RefreashBtn from '../../../Components/common/RefreashBtn';


const TeamLeadTasksPage = () => {
     const router = useRouter();
     const {
          tasks,
          projects,
          developers,
          stats,
          loading,
          error,
          filters,
          setFilters,
          sortBy,
          setSortBy,
          sortOrder,
          setSortOrder,
          updateTask,
          reportIssue,
          refetch
     } = useTeamLeadTasks();

     console.log('Projects from hook:', projects);
     console.log('Developers from hook:', developers);
     const [showMilestoneModal, setShowMilestoneModal] = useState(false);
     const [view, setView] = useState('grid');
     const [searchInput, setSearchInput] = useState('');
     const [selectedAssignee, setSelectedAssignee] = useState('');
     const [selectedProject, setSelectedProject] = useState('');

     // Debounce search
     useEffect(() => {
          const timer = setTimeout(() => {
               setFilters(prev => ({ ...prev, search: searchInput }));
          }, 300);
          return () => clearTimeout(timer);
     }, [searchInput, setFilters]);

     // Handle filter changes
     useEffect(() => {
          setFilters(prev => ({
               ...prev,
               assigneeId: selectedAssignee,
               projectId: selectedProject
          }));
     }, [selectedAssignee, selectedProject, setFilters]);

     const handleApproveTask = async (taskId) => {
          const result = await Swal.fire({
               title: 'Approve Task?',
               text: 'This will mark the task as completed and notify the developer.',
               icon: 'question',
               showCancelButton: true,
               confirmButtonColor: '#22c55e',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, approve'
          });

          if (result.isConfirmed) {
               const updateResult = await updateTask(taskId, {
                    status: 'COMPLETED',
                    reviewApproved: true
               });

               if (updateResult.success) {
                    Swal.fire({
                         title: 'Approved!',
                         text: 'Task has been approved and completed.',
                         icon: 'success',
                         timer: 2000
                    });
               }
          }
     };

     const handleRejectTask = async (taskId) => {
          const { value: feedback } = await Swal.fire({
               title: 'Request Changes',
               input: 'textarea',
               inputLabel: 'Feedback for Developer',
               inputPlaceholder: 'What needs to be improved?',
               showCancelButton: true,
               confirmButtonColor: '#eab308',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Send Feedback'
          });

          if (feedback) {
               const updateResult = await updateTask(taskId, {
                    status: 'IN_PROGRESS',
                    reviewNotes: feedback
               });

               if (updateResult.success) {
                    Swal.fire({
                         title: 'Feedback Sent',
                         text: 'Developer has been notified to make changes.',
                         icon: 'success',
                         timer: 2000
                    });
               }
          }
     };

     const handleReportIssue = async (taskId) => {
          const { value: formValues } = await Swal.fire({
               title: 'Report Issue to PM',
               html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="text-xs font-bold text-gray-600">Issue Type</label>
            <select id="issueType" class="w-full p-2 border rounded mt-1">
              <option value="BLOCKER">Blocker</option>
              <option value="DELAY">Delay</option>
              <option value="RESOURCE">Resource Issue</option>
              <option value="TECHNICAL">Technical Problem</option>
              <option value="CLIENT">Client Feedback</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-600">Priority</label>
            <select id="priority" class="w-full p-2 border rounded mt-1">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-600">Description</label>
            <textarea id="description" rows="3" class="w-full p-2 border rounded mt-1" 
              placeholder="Describe the issue in detail..."></textarea>
          </div>
        </div>
      `,
               focusConfirm: false,
               preConfirm: () => {
                    return {
                         issue: document.getElementById('issueType').value,
                         priority: document.getElementById('priority').value,
                         description: document.getElementById('description').value
                    };
               },
               showCancelButton: true,
               confirmButtonColor: '#ef4444',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Report Issue'
          });

          if (formValues) {
               const result = await reportIssue(taskId, formValues);

               if (result.success) {
                    Swal.fire({
                         title: 'Reported!',
                         text: 'Issue has been reported to the Project Manager.',
                         icon: 'success',
                         timer: 2000
                    });
               }
          }
     };

     if (loading && tasks.length === 0) {
          return (
               <Spinner title="Tasks" />
          );
     }


     return (
          <>
               <div className="min-h-screen bg-bg-page p-page-x pb-32 md:py-page-y">
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                         <div>
                              <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                                   Team Tasks
                              </h1>
                              <p className="text-text-muted text-ui">
                                   Manage your team's workload, review submissions, and track milestone progress.
                              </p>
                         </div>

                         <div className="flex items-center gap-3">
                              {/* <RefreashBtn   refetch={refetch} /> */}
                              <button
                                   onClick={() => setShowMilestoneModal(true)}
                                   className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg text-ui font-bold shadow-lg shadow-accent/20 transition-all"
                              >
                                   <Plus size={18} />
                                   Break Milestone
                              </button>
                         </div>
                    </header>

                    {/* Error Message */}
                    {error && (
                         <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                   <AlertCircle size={20} className="text-red-500" />
                                   <p className="text-red-500 text-sm">{error}</p>
                              </div>
                              <button
                                   onClick={() => refetch()}
                                   className="text-red-500 hover:text-red-600 text-xs font-bold"
                              >
                                   Retry
                              </button>
                         </div>
                    )}

                    {/* Analytics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                         <div className="bg-bg-surface border-l-4 border-accent p-4 rounded-r-xl shadow-sm">
                              <p className="text-caption text-text-muted uppercase font-bold tracking-wider">Total Tasks</p>
                              <p className="text-headline font-bold text-text-primary">{stats.totalTasks}</p>
                         </div>
                         <div className="bg-bg-surface border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-sm">
                              <p className="text-caption text-text-muted uppercase font-bold tracking-wider">In Review</p>
                              <p className="text-headline font-bold text-text-primary">{stats.inReview}</p>
                              {stats.inReview > 0 && (
                                   <span className="text-xs text-yellow-600 mt-1 block">Ready for review</span>
                              )}
                         </div>
                         <div className="bg-bg-surface border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
                              <p className="text-caption text-text-muted uppercase font-bold tracking-wider">Overdue</p>
                              <p className="text-headline font-bold text-text-primary">{stats.overdue}</p>
                              {stats.overdue > 0 && (
                                   <span className="text-xs text-red-600 mt-1 block">Needs attention</span>
                              )}
                         </div>
                         <div className="bg-bg-surface border-l-4 border-green-500 p-4 rounded-r-xl shadow-sm">
                              <p className="text-caption text-text-muted uppercase font-bold tracking-wider">Completed</p>
                              <p className="text-headline font-bold text-text-primary">{stats.completed}</p>
                              <span className="text-xs text-green-600 mt-1 block">
                                   {Math.round((stats.completed / stats.totalTasks) * 100) || 0}% complete
                              </span>
                         </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-4 mb-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Search */}
                              <div className="relative flex-1">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                                   <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search tasks, projects, or developers..."
                                        className="w-full pl-10 pr-4 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none transition-all text-ui"
                                   />
                              </div>

                              {/* Project Filter */}
                              {/* <select
                                   value={selectedProject}
                                   onChange={(e) => setSelectedProject(e.target.value)}
                                   className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none min-w-[150px]"
                              >
                                   <option value="">All Projects</option>
                                   {projects.map(project => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                   ))}
                              </select> */}

                              {/* Developer Filter */}
                              {/* <select
                                   value={selectedAssignee}
                                   onChange={(e) => setSelectedAssignee(e.target.value)}
                                   className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none min-w-[150px]"
                              >
                                   <option value="">All Developers</option>
                                   {developers.map(dev => (
                                        <option key={dev.id} value={dev.id}>{dev.name}</option>
                                   ))}
                              </select> */}

                              {/* Status Filter */}
                              <select
                                   value={filters.status}
                                   onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                   className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none min-w-[150px]"
                              >
                                   <option value="all">All Status</option>
                                   <option value="REVIEW">In Review ({stats.inReview})</option>
                                   <option value="IN_PROGRESS">In Progress ({stats.inProgress})</option>
                                   <option value="NOT_STARTED">Not Started ({stats.notStarted})</option>
                                   <option value="BLOCKED">Blocked ({stats.blocked})</option>
                                   <option value="COMPLETED">Completed ({stats.completed})</option>
                              </select>

                              {/* Sort By */}
                              <select
                                   value={sortBy}
                                   onChange={(e) => setSortBy(e.target.value)}
                                   className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none min-w-[150px]"
                              >
                                   <option value="deadline">Sort by Deadline</option>
                                   <option value="priority">Sort by Priority</option>
                                   <option value="status">Sort by Status</option>
                                   <option value="createdAt">Sort by Created</option>
                              </select>

                              {/* View Toggle */}
                              <div className="flex items-center bg-bg-subtle p-1 rounded-lg border border-border-subtle">
                                   <button
                                        onClick={() => setView('grid')}
                                        className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-bg-surface shadow-sm text-accent' : 'text-text-muted hover:text-text-body'
                                             }`}
                                   >
                                        <LayoutGrid size={18} />
                                   </button>
                                   <button
                                        onClick={() => setView('list')}
                                        className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-bg-surface shadow-sm text-accent' : 'text-text-muted hover:text-text-body'
                                             }`}
                                   >
                                        <List size={18} />
                                   </button>
                              </div>
                         </div>

                         {/* Active Filters */}
                         {(filters.status !== 'all' || selectedProject || selectedAssignee || searchInput) && (
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-default">
                                   <span className="text-xs text-text-muted">Active filters:</span>
                                   {filters.status !== 'all' && (
                                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                                             Status: {filters.status}
                                        </span>
                                   )}
                                   {selectedProject && (
                                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                                             Project: {projects.find(p => p.id === selectedProject)?.name}
                                        </span>
                                   )}
                                   {selectedAssignee && (
                                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                                             Developer: {developers.find(d => d.id === selectedAssignee)?.name}
                                        </span>
                                   )}
                                   {searchInput && (
                                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                                             Search: {searchInput}
                                        </span>
                                   )}
                                   <button
                                        onClick={() => {
                                             setSearchInput('');
                                             setSelectedProject('');
                                             setSelectedAssignee('');
                                             setFilters({ status: 'all', projectId: '', assigneeId: '', search: '' });
                                        }}
                                        className="text-xs text-accent hover:text-accent-hover ml-2"
                                   >
                                        Clear all
                                   </button>
                              </div>
                         )}
                    </div>

                    {/* Tasks Grid/List */}
                    {tasks.length === 0 ? (
                         <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-default overflow-x-auto  w-[90%] mx-auto">
                              <div className="max-w-md mx-auto overflow-x-auto  w-[90%] overflow-x-scroll ">
                                   <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                        <CheckCircle2 size={40} className="text-text-disabled" />
                                   </div>
                                   <h3 className="font-bold text-text-primary text-lg mb-2">No tasks found</h3>
                                   <p className="text-text-muted text-sm mb-6">
                                        {filters.status !== 'all' || selectedProject || selectedAssignee || searchInput
                                             ? 'Try adjusting your filters to see more tasks'
                                             : 'Your team doesn\'t have any tasks yet. Create tasks by breaking down milestones.'}
                                   </p>
                                   {(filters.status !== 'all' || selectedProject || selectedAssignee || searchInput) && (
                                        <button
                                             onClick={() => {
                                                  setSearchInput('');
                                                  setSelectedProject('');
                                                  setSelectedAssignee('');
                                                  setFilters({ status: 'all', projectId: '', assigneeId: '', search: '' });
                                             }}
                                             className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all"
                                        >
                                             Clear Filters
                                        </button>
                                   )}
                              </div>
                         </div>
                    ) : view === 'grid' ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {tasks.map((task) => (
                                   <div key={task.id} className="relative group">
                                        <TaskCard role="team-lead" task={task} />

                                        {/* Team Lead Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-all pointer-events-none" />

                                        {/* Assignment Badge */}
                                        <div className="absolute top-4 right-4 flex -space-x-2 z-10">
                                             {task.assignee ? (
                                                  <div className="group/assignee relative">
                                                       <div
                                                            className="w-8 h-8 rounded-full bg-accent-secondary border-2 border-bg-surface flex items-center justify-center text-xs text-white font-bold cursor-help shadow-lg"
                                                            style={{
                                                                 backgroundImage: task.assignee.avatar ? `url(${task.assignee.avatar})` : 'none',
                                                                 backgroundSize: 'cover'
                                                            }}
                                                       >
                                                            {!task.assignee.avatar && task.assignee.name?.charAt(0)}
                                                       </div>
                                                       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/assignee:block bg-text-primary text-text-inverse text-[10px] py-1 px-2 rounded whitespace-nowrap z-20">
                                                            {task.assignee.name}
                                                            <br />
                                                            <span className="text-[8px] opacity-80">{task.assignee.jobTitle || 'Developer'}</span>
                                                       </div>
                                                  </div>
                                             ) : (
                                                  <button
                                                       onClick={(e) => {
                                                            e.preventDefault();
                                                            // Open assign modal
                                                       }}
                                                       className="w-8 h-8 rounded-full border-2 border-dashed border-text-disabled bg-bg-surface flex items-center justify-center text-text-disabled hover:border-accent hover:text-accent transition-colors"
                                                       title="Assign developer"
                                                  >
                                                       <Users size={14} />
                                                  </button>
                                             )}
                                        </div>

                                        {/* Quick Action Buttons - Show on hover */}
                                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                             {task.status === 'REVIEW' && (
                                                  <>
                                                       <button
                                                            onClick={() => handleApproveTask(task.id)}
                                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                                                            title="Approve Task"
                                                       >
                                                            <CheckCircle2 size={16} />
                                                       </button>
                                                       <button
                                                            onClick={() => handleRejectTask(task.id)}
                                                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                                                            title="Request Changes"
                                                       >
                                                            <Clock size={16} />
                                                       </button>
                                                  </>
                                             )}
                                             <button
                                                  onClick={() => handleReportIssue(task.id)}
                                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                                                  title="Report Issue to PM"
                                             >
                                                  <AlertCircle size={16} />
                                             </button>
                                        </div>

                                        {/* Status Indicators */}
                                        {task.isOverdue && (
                                             <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center gap-1 shadow-lg">
                                                  <Clock size={10} />
                                                  Overdue
                                             </div>
                                        )}
                                        {task.status === 'REVIEW' && (
                                             <div className="absolute top-4 left-4 px-2 py-1 bg-yellow-500 text-white text-[8px] font-bold rounded-full flex items-center gap-1 shadow-lg">
                                                  <Clock size={10} />
                                                  Review
                                             </div>
                                        )}
                                   </div>
                              ))}
                         </div>
                    ) : (
                         <div className="bg-bg-surface rounded-xl border border-border-default w-full overflow-hidden">
                              <div className="overflow-x-auto chat-scroll">                                        <table className="w-full min-w-[1000px] border-collapse">
                                   <thead className="bg-bg-subtle border-b border-border-default">
                                        <tr>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Task</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Project</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Assignee</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Status</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Priority</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Deadline</th>
                                             <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {tasks.map(task => (
                                             <tr
                                                  key={task.id}
                                                  onClick={() => router.push(`/team-lead/tasks/${task.id}`)}
                                                  className="border-b border-border-default hover:bg-bg-subtle/50 cursor-pointer transition-colors"
                                             >
                                                  <td className="p-4">
                                                       <div>
                                                            <p className="font-medium text-text-primary">{task.title}</p>
                                                            {task.description && (
                                                                 <p className="text-xs text-text-muted line-clamp-1">{task.description}</p>
                                                            )}
                                                       </div>
                                                  </td>
                                                  <td className="p-4 text-text-muted">{task.project?.name}</td>
                                                  <td className="p-4">
                                                       <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-accent-secondary flex items-center justify-center text-[10px] text-white font-bold">
                                                                 {task.assignee?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <span className="text-sm">{task.assignee?.name || 'Unassigned'}</span>
                                                       </div>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white
                        ${task.status === 'COMPLETED' ? 'bg-green-500' : ''}
                        ${task.status === 'IN_PROGRESS' ? 'bg-accent' : ''}
                        ${task.status === 'REVIEW' ? 'bg-yellow-500' : ''}
                        ${task.status === 'BLOCKED' ? 'bg-red-500' : ''}
                        ${task.status === 'NOT_STARTED' ? 'bg-slate-500' : ''}
                      `}>
                                                            {task.status.replace('_', ' ')}
                                                       </span>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold
                        ${task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' : ''}
                        ${task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' : ''}
                        ${task.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                        ${task.priority === 'LOW' ? 'bg-green-500/10 text-green-500' : ''}
                      `}>
                                                            {task.priority}
                                                       </span>
                                                  </td>
                                                  <td className="p-4">
                                                       <span className={`text-sm ${task.isOverdue ? 'text-red-500' : 'text-text-muted'}`}>
                                                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                                       </span>
                                                  </td>
                                                  <td className="p-4">
                                                       <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                            {task.status === 'REVIEW' && (
                                                                 <>
                                                                      <button
                                                                           onClick={() => handleApproveTask(task.id)}
                                                                           className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors"
                                                                           title="Approve"
                                                                      >
                                                                           <CheckCircle2 size={14} />
                                                                      </button>
                                                                      <button
                                                                           onClick={() => handleRejectTask(task.id)}
                                                                           className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white transition-colors"
                                                                           title="Request Changes"
                                                                      >
                                                                           <Clock size={14} />
                                                                      </button>
                                                                 </>
                                                            )}
                                                            <button
                                                                 onClick={() => handleReportIssue(task.id)}
                                                                 className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                                                                 title="Report Issue"
                                                            >
                                                                 <AlertCircle size={14} />
                                                            </button>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                              </div>
                         </div>
                    )}
               </div>

               {/* Milestone Modal */}
               {showMilestoneModal && (
                    <BreakMilestoneModal
                         onClose={() => setShowMilestoneModal(false)}
                         onSuccess={() => {
                              refetch();
                              setShowMilestoneModal(false);
                         }}
                         projects={projects}
                         developers={developers}
                    />
               )}
          </>
     );
};

export default TeamLeadTasksPage;