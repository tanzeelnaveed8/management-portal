

// app/Components/team-lead/TaskAssignmentModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import {
     X,
     UserPlus,
     UserMinus,
     Check,
     Search,
     Users,
     Loader,
     AlertCircle,
     Clock,
     Briefcase
} from 'lucide-react';

const TaskAssignmentModal = ({ isOpen, onClose, task, onAssign, onUnassign }) => {
     const [developers, setDevelopers] = useState([]);
     const [loading, setLoading] = useState(false);
     const [searchTerm, setSearchTerm] = useState('');
     const [selectedDeveloper, setSelectedDeveloper] = useState(null);

     useEffect(() => {
          if (isOpen && task) {
               fetchDevelopers();
          }
     }, [isOpen, task]);

     const fetchDevelopers = async () => {
          setLoading(true);
          try {
               // ✅ Use the existing global developers endpoint
               const response = await fetch('/api/team-lead/developers');
               if (response.ok) {
                    const data = await response.json();
                    setDevelopers(data.developers || []);
               } else {
                    console.error('Failed to fetch developers');
               }
          } catch (error) {
               console.error('Error fetching developers:', error);
          } finally {
               setLoading(false);
          }
     };

     if (!isOpen || !task) return null;

     const filteredDevelopers = developers.filter(dev =>
          dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dev.email.toLowerCase().includes(searchTerm.toLowerCase())
     );

     const handleAssign = (developer) => {
          setSelectedDeveloper(developer);
     };

     const confirmAssignment = async () => {
          if (!selectedDeveloper) return;

          await onAssign(task.id, selectedDeveloper.id);
          setSelectedDeveloper(null);
          onClose();
     };

     const handleUnassign = async () => {
          await onUnassign(task.id);
          onClose();
     };

     useEffect(() => {
          if (isOpen && task) {
               console.log('Task received in modal:', task); // Debug
               fetchDevelopers();
          }
     }, [isOpen, task]);

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className=" chat-scroll bg-bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-scroll">
                    {/* Header */}
                    <div className="p-6 border-b border-border-default flex justify-between items-center">
                         <div>
                              <h3 className="text-lg font-bold text-text-primary">Assign Task to Developer</h3>
                              <p className="text-sm text-text-muted mt-1">{task.task || task.title}</p>
                         </div>
                         <button
                              onClick={onClose}
                              className="text-text-muted hover:text-text-primary transition-colors"
                         >
                              <X size={20} />
                         </button>
                    </div>

                    {/* Current Assignment Status */}
                    {task.assignee && (
                         <div className="mx-6 mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                              <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                             <UserPlus size={20} className="text-accent" />
                                        </div>
                                        <div>
                                             <p className="text-xs text-text-muted">Currently Assigned To</p>
                                             <p className="font-bold text-text-primary">{task.assignee.name}</p>
                                             <p className="text-xs text-text-muted">{task.assignee.email}</p>
                                        </div>
                                   </div>
                                   <button
                                        onClick={handleUnassign}
                                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
                                   >
                                        <UserMinus size={16} className="inline mr-2" />
                                        Unassign
                                   </button>
                              </div>
                         </div>
                    )}

                    {/* Search and List */}
                    <div className="p-6">
                         {!task.assignee && (
                              <>
                                   <div className="relative mb-4">
                                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                             type="text"
                                             placeholder="Search developers by name or email..."
                                             value={searchTerm}
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                             className="w-full pl-10 pr-4 py-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        />
                                   </div>

                                   {loading ? (
                                        <div className="text-center py-12">
                                             <Loader size={32} className="animate-spin text-accent mx-auto mb-4" />
                                             <p className="text-text-muted">Loading developers...</p>
                                        </div>
                                   ) : (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                             {filteredDevelopers.length === 0 ? (
                                                  <div className="text-center py-12 bg-bg-subtle/30 rounded-xl">
                                                       <Users size={32} className="text-text-muted mx-auto mb-3" />
                                                       <p className="text-text-muted">No developers found</p>
                                                  </div>
                                             ) : (
                                                  filteredDevelopers.map(dev => (
                                                       <div
                                                            key={dev.id}
                                                            onClick={() => handleAssign(dev)}
                                                            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${selectedDeveloper?.id === dev.id
                                                                 ? 'border-accent bg-accent/5'
                                                                 : 'border-border-default hover:border-accent/30 hover:bg-bg-subtle'
                                                                 }`}
                                                       >
                                                            <div className="flex items-center gap-3">
                                                                 <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                                                                      {dev.avatar ? (
                                                                           <img src={dev.avatar} alt={dev.name} className="w-full h-full rounded-full object-cover" />
                                                                      ) : (
                                                                           dev.name.charAt(0)
                                                                      )}
                                                                 </div>
                                                                 <div>
                                                                      <p className="font-bold text-text-primary">{dev.name}</p>
                                                                      <p className="text-xs text-text-muted">{dev.email}</p>
                                                                      <div className="flex items-center gap-3 mt-1">
                                                                           <span className="text-[10px] px-2 py-0.5 bg-bg-subtle rounded-full">
                                                                                {dev.jobTitle || 'Developer'}
                                                                           </span>
                                                                           <span className="text-[10px] text-text-muted flex items-center gap-1">
                                                                                <Clock size={10} />
                                                                                {dev.currentWorkload} active tasks
                                                                           </span>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                            {selectedDeveloper?.id === dev.id && (
                                                                 <Check size={20} className="text-accent" />
                                                            )}
                                                       </div>
                                                  ))
                                             )}
                                        </div>
                                   )}
                              </>
                         )}

                         {/* Action Buttons */}
                         <div className="flex gap-3 pt-6 border-t border-border-default mt-6">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="flex-1 px-4 py-2 border border-border-default rounded-lg hover:bg-red-700 hover:text-text-inverse duration-300 hover:cursor-pointer transition-colors"
                              >
                                   Cancel
                              </button>
                              {selectedDeveloper && (
                                   <button
                                        onClick={confirmAssignment}
                                        className="flex-1 px-4 py-2 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                                   >
                                        <UserPlus size={18} />
                                        Assign to {selectedDeveloper.name}
                                   </button>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default TaskAssignmentModal;