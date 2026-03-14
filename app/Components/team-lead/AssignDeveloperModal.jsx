// Components/team-lead/AssignDeveloperModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Search, User, CheckCircle, Clock } from 'lucide-react';

export default function AssignDeveloperModal({ isOpen, onClose, onAssign, task }) {
     const [developers, setDevelopers] = useState([]);
     const [loading, setLoading] = useState(false);
     const [search, setSearch] = useState('');
     const [selectedDeveloper, setSelectedDeveloper] = useState(null);

     useEffect(() => {
          if (isOpen) {
               fetchDevelopers();
          }
     }, [isOpen]);

     const fetchDevelopers = async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/team-lead/developers');
               if (response.ok) {
                    const data = await response.json();
                    setDevelopers(data.developers);
               }
          } catch (error) {
               console.error('Failed to fetch developers:', error);
          } finally {
               setLoading(false);
          }
     };

     if (!isOpen) return null;

     const filteredDevelopers = developers.filter(dev =>
          dev.name?.toLowerCase().includes(search.toLowerCase()) ||
          dev.email?.toLowerCase().includes(search.toLowerCase()) ||
          dev.jobTitle?.toLowerCase().includes(search.toLowerCase())
     );

     const handleAssign = () => {
          if (selectedDeveloper) {
               onAssign(selectedDeveloper.id);
          }
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto chat-scroll ">
                    <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
                         <div>
                              <h2 className="text-xl font-bold text-text-primary">Assign Developer</h2>
                              {task && <p className="text-sm text-text-muted mt-1">Task: {task.title}</p>}
                         </div>
                         <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
                              <X size={20} />
                         </button>
                    </div>

                    <div className="p-6">
                         {/* Search */}
                         <div className="relative mb-6">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                              <input
                                   type="text"
                                   value={search}
                                   onChange={(e) => setSearch(e.target.value)}
                                   placeholder="Search developers by name, email, or role..."
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent/20"
                              />
                         </div>

                         {/* Developers List */}
                         {loading ? (
                              <div className="text-center py-8">
                                   <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto"></div>
                                   <p className="text-sm text-text-muted mt-4">Loading developers...</p>
                              </div>
                         ) : filteredDevelopers.length > 0 ? (
                              <div className="space-y-3 max-h-[400px] overflow-y-auto chat-scroll ">
                                   {filteredDevelopers.map(dev => (
                                        <div
                                             key={dev.id}
                                             onClick={() => setSelectedDeveloper(dev)}
                                             className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDeveloper?.id === dev.id
                                                  ? 'border-accent bg-accent/5'
                                                  : 'border-border-default hover:border-accent/30 hover:bg-bg-subtle/50'
                                                  }`}
                                        >
                                             <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-4">
                                                       <div className="h-10 w-10 rounded-full bg-accent-secondary flex items-center justify-center text-text-inverse font-bold">
                                                            {dev.name?.charAt(0) || 'D'}
                                                       </div>
                                                       <div>
                                                            <div className="flex items-center gap-2">
                                                                 <p className="font-bold text-text-primary">{dev.name}</p>
                                                                 {dev.isAvailable ? (
                                                                      <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full font-medium">
                                                                           Available
                                                                      </span>
                                                                 ) : (
                                                                      <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full font-medium">
                                                                           Busy
                                                                      </span>
                                                                 )}
                                                            </div>
                                                            <p className="text-xs text-text-muted">{dev.jobTitle || 'Developer'}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-[10px]">
                                                                 <span className="flex items-center gap-1">
                                                                      <Clock size={10} />
                                                                      {dev.activeTasks || 0} active tasks
                                                                 </span>
                                                                 {dev.skills && dev.skills.length > 0 && (
                                                                      <span>{dev.skills.slice(0, 2).join(', ')}</span>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  </div>
                                                  {selectedDeveloper?.id === dev.id && (
                                                       <CheckCircle size={20} className="text-accent" />
                                                  )}
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div className="text-center py-8">
                                   <User size={32} className="text-text-muted mx-auto mb-3" />
                                   <p className="text-text-muted">No developers found</p>
                              </div>
                         )}

                         {/* Action Buttons */}
                         <div className="flex gap-3 pt-6 mt-4 border-t border-border-default">
                              <button
                                   onClick={onClose}
                                   className="flex-1 px-6 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors"
                              >
                                   Cancel
                              </button>
                              <button
                                   onClick={handleAssign}
                                   disabled={!selectedDeveloper}
                                   className="flex-1 bg-accent text-text-inverse rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3"
                              >
                                   Assign Developer
                              </button>
                         </div>
                    </div>
               </div>
          </div>
     );
}