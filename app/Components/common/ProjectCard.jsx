
//app/Components/common/ProjectCard.jsx
'use client';
import React from 'react';
import Link from 'next/link';
import { Calendar, AlertCircle, ChevronRight } from 'lucide-react';

const ProjectCard = ({ project, role }) => {
     const getRiskColor = (risk) => {
          switch (risk) {
               case 'LOW': return 'text-green-500 bg-green-500/10';
               case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
               case 'HIGH': return 'text-red-500 bg-red-500/10';
               default: return 'text-text-muted bg-bg-subtle';
          }
     };

     const getProgressColor = (progress) => {
          if (progress < 30) return 'bg-red-500';
          if (progress < 70) return 'bg-yellow-500';
          return 'bg-green-500';
     };

     const formatDate = (dateString) => {
          if (!dateString) return 'No deadline';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
     };

     const daysUntilDeadline = (deadline) => {
          if (!deadline) return null;
          const today = new Date();
          const deadlineDate = new Date(deadline);
          const diffTime = deadlineDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
     };

     return (
          <Link href={`/${role}/projects/${project.id}`}>
               <div className="group bg-bg-surface border border-border-default rounded-2xl p-6 hover:shadow-xl hover:border-accent/30 transition-all cursor-pointer">
                    <div className="space-y-4">
                         {/* Header with Risk Badge */}
                         <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                   <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors">
                                        {project.name}
                                   </h3>
                                   <p className="text-xs text-text-muted">{project.clientCompany}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getRiskColor(project.riskLevel)}`}>
                                   {project.riskLevel}
                              </span>
                         </div>

                         {/* Progress Bar */}
                         <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                   <span className="text-text-muted">Progress</span>
                                   <span className="font-bold text-text-primary ">
                                        {project.progress}%
                                   </span>
                              </div>
                              <div className="h-2 bg-bg-subtle rounded-full overflow-hidden border border-accent/80">
                                   <div
                                        className={`h-full ${getProgressColor(project.progress)} transition-all duration-500`}
                                        style={{ width: `${project.progress}%` }}
                                   />
                              </div>
                         </div>

                         {/* Task Stats */}
                         <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                    <span className="text-text-muted">Tasks:</span>
                                   <span className="font-bold text-text-primary">
                                             {project.taskStats ? (
                                                  <>
                                                       {project.taskStats.completed} / {project.taskStats.total}
                                                  </>
                                             ) : (
                                                  /* Fix: No curly braces needed here for the logic, just for the text concatenation */
                                                  project.completedTaskCount + " / " + project.taskCount
                                             )}
                                   </span>
                              </div>
                              {project.isDelayed && (
                                   <span className="flex items-center gap-1 text-red-500 text-xs">
                                        <AlertCircle size={12} />
                                        Delayed
                                   </span>
                              )}
                         </div>

                         {/* Footer with Deadline */}
                         <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                              <div className="flex items-center gap-2 text-xs text-text-muted">
                                   <Calendar size={14} />
                                   <span>{formatDate(project.deadline)}</span>
                                   {project.deadline && daysUntilDeadline(project.deadline) <= 7 && !project.isDelayed && (
                                        <span className="text-yellow-500 text-[10px] font-bold">
                                             ({daysUntilDeadline(project.deadline)} days left)
                                        </span>
                                   )}
                              </div>
                              <ChevronRight size={16} className="text-text-disabled group-hover:text-accent group-hover:translate-x-1 transition-all" />
                         </div>
                    </div>
               </div>
          </Link>
     );
};

export default ProjectCard;