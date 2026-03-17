

// Components/project-manager/ReportFilterModal.jsx
'use client';
import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';

export default function FilterModal({ isOpen, onClose, currentFilters, onApply }) {
     const [filters, setFilters] = useState(currentFilters);

     if (!isOpen) return null;

     const handleApply = () => {
          onApply(filters);
          onClose();
     };

     const handleClear = () => {
          const cleared = {
               status: 'ALL',
               riskLevel: 'ALL',
               dateRange: '30days',
               search: ''
          };
          setFilters(cleared);
          onApply(cleared);
          onClose();
     };

     return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-bg-surface rounded-2xl max-w-md w-full">
                    <div className="p-6 border-b border-border-default flex justify-between items-center">
                         <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                              <Filter size={20} />
                              Filter Reports
                         </h2>
                         <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
                              <X size={20} />
                         </button>
                    </div>

                    <div className="p-6 space-y-6">
                         {/* Status Filter */}
                         <div className="space-y-2">
                              <label className="block text-sm font-bold text-text-primary">Project Status</label>
                              <select
                                   value={filters.status}
                                   onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent outline-none"
                              >
                                   <option value="ALL">All Statuses</option>
                                   <option value="ACTIVE">Active</option>
                                   <option value="IN_DEVELOPMENT">In Development</option>
                                   <option value="CLIENT_REVIEW">Client Review</option>
                                   <option value="COMPLETED">Completed</option>
                                   <option value="ON_HOLD">On Hold</option>
                              </select>
                         </div>

                         {/* Risk Level Filter */}
                         <div className="space-y-2">
                              <label className="block text-sm font-bold text-text-primary">Risk Level</label>
                              <select
                                   value={filters.riskLevel}
                                   onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent outline-none"
                              >
                                   <option value="ALL">All Risks</option>
                                   <option value="LOW">Low Risk</option>
                                   <option value="MEDIUM">Medium Risk</option>
                                   <option value="HIGH">High Risk</option>
                              </select>
                         </div>

                         {/* Date Range Filter */}
                         <div className="space-y-2">
                              <label className="block text-sm font-bold text-text-primary">Date Range</label>
                              <select
                                   value={filters.dateRange}
                                   onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent outline-none"
                              >
                                   <option value="7days">Last 7 Days</option>
                                   <option value="30days">Last 30 Days</option>
                                   <option value="90days">Last 90 Days</option>
                                   <option value="year">Last Year</option>
                              </select>
                         </div>
                    </div>

                    <div className="p-6 border-t border-border-default flex gap-3">
                         <button
                              onClick={handleClear}
                              className="flex-1 px-6 py-3 border border-border-default rounded-lg text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors"
                         >
                              Clear All
                         </button>
                         <button
                              onClick={handleApply}
                              className="flex-1 bg-accent text-text-inverse rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors py-3"
                         >
                              Apply Filters
                         </button>
                    </div>
               </div>
          </div>
     );
}