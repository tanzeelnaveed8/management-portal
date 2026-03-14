
// Components/team-lead/DeveloperFiltersModal.jsx
'use client';
import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';

export default function DeveloperFiltersModal({ isOpen, onClose, currentFilters, onApply }) {
     const [filters, setFilters] = useState(currentFilters);

     if (!isOpen) return null;

     const handleApply = () => {
          onApply(filters);
          onClose();
     };

     const handleClear = () => {
          const cleared = {
               search: '',
               department: '',
               status: '',
               workload: ''
          };
          setFilters(cleared);
          onApply(cleared);
          onClose();
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
               <div className="bg-bg-surface rounded-3xl max-w-md w-full h-[90vh] overflow-y-auto chat-scroll  chat-scroll ">
                    <div className="border-b border-border-default p-6 flex justify-between items-center">
                         <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                              <Filter size={20} />
                              Filter Developers
                         </h2>
                         <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
                              <X size={20} />
                         </button>
                    </div>

                    <div className="p-6 space-y-6">
                         {/* Department Filter */}
                         <div>
                              <label className="block text-sm font-bold text-text-primary mb-3">Department</label>
                              <div className="space-y-2">
                                   {['ALL', 'Engineering', 'Product', 'Design', 'QA', 'DevOps'].map(dept => (
                                        <label key={dept} className="flex items-center gap-3 p-2 hover:bg-bg-subtle rounded-lg cursor-pointer">
                                             <input
                                                  type="radio"
                                                  name="department"
                                                  value={dept}
                                                  checked={filters.department === dept || (dept === 'ALL' && !filters.department)}
                                                  onChange={() => setFilters({ ...filters, department: dept === 'ALL' ? '' : dept })}
                                                  className="w-4 h-4 text-accent"
                                             />
                                             <span className="text-sm text-text-body">{dept}</span>
                                        </label>
                                   ))}
                              </div>
                         </div>

                         {/* Status Filter */}
                         <div>
                              <label className="block text-sm font-bold text-text-primary mb-3">Status</label>
                              <div className="space-y-2">
                                   {[
                                        { value: '', label: 'All' },
                                        { value: 'ACTIVE', label: 'Active' },
                                        { value: 'INACTIVE', label: 'Inactive' }
                                   ].map(option => (
                                        <label key={option.label} className="flex items-center gap-3 p-2 hover:bg-bg-subtle rounded-lg cursor-pointer">
                                             <input
                                                  type="radio"
                                                  name="status"
                                                  value={option.value}
                                                  checked={filters.status === option.value}
                                                  onChange={() => setFilters({ ...filters, status: option.value })}
                                                  className="w-4 h-4 text-accent"
                                             />
                                             <span className="text-sm text-text-body">{option.label}</span>
                                        </label>
                                   ))}
                              </div>
                         </div>

                         {/* Workload Filter */}
                         <div>
                              <label className="block text-sm font-bold text-text-primary mb-3">Workload</label>
                              <div className="space-y-2">
                                   {[
                                        { value: '', label: 'All' },
                                        { value: 'LOW', label: 'Low (0-30%)' },
                                        { value: 'MEDIUM', label: 'Medium (31-70%)' },
                                        { value: 'HIGH', label: 'High (71-100%)' }
                                   ].map(option => (
                                        <label key={option.label} className="flex items-center gap-3 p-2 hover:bg-bg-subtle rounded-lg cursor-pointer">
                                             <input
                                                  type="radio"
                                                  name="workload"
                                                  value={option.value}
                                                  checked={filters.workload === option.value}
                                                  onChange={() => setFilters({ ...filters, workload: option.value })}
                                                  className="w-4 h-4 text-accent"
                                             />
                                             <span className="text-sm text-text-body">{option.label}</span>
                                        </label>
                                   ))}
                              </div>
                         </div>
                    </div>

                    <div className="border-t border-border-default p-6 flex gap-3">
                         <button
                              onClick={handleClear}
                              className="flex-1 px-6 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors"
                         >
                              Clear All
                         </button>
                         <button
                              onClick={handleApply}
                              className="flex-1 bg-accent text-text-inverse rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors py-3"
                         >
                              Apply Filters
                         </button>
                    </div>
               </div>
          </div>
     );
}