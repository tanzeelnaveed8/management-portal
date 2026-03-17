

// Components/project-manager/ProjectFiltersModal.jsx
'use client';
import React, { useState } from 'react';
import { X, Filter, Calendar, Flag, User, AlertCircle } from 'lucide-react';

export default function ProjectFiltersModal({ isOpen, onClose, currentFilters, onApply }) {
     const [filters, setFilters] = useState({
          status: currentFilters.status || 'ALL',
          priority: '',
          teamLead: '',
          dateRange: 'ALL',
          dateFrom: '',
          dateTo: '',
          riskLevel: '',
          hasTeamLead: '',
          progressMin: '',
          progressMax: ''
     });

     const [teamLeads, setTeamLeads] = useState([]);
     const [loading, setLoading] = useState(false);

     // Fetch team leads when modal opens
     React.useEffect(() => {
          if (isOpen) {
               fetchTeamLeads();
          }
     }, [isOpen]);

     const fetchTeamLeads = async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/project-manager/team-leads');
               if (response.ok) {
                    const data = await response.json();
                    setTeamLeads(data.teamLeads || []);
               }
          } catch (error) {
               console.error('Failed to fetch team leads:', error);
          } finally {
               setLoading(false);
          }
     };

     if (!isOpen) return null;

     const handleApply = () => {
          onApply(filters);
          onClose();
     };

     const handleClear = () => {
          setFilters({
               status: 'ALL',
               priority: '',
               teamLead: '',
               dateRange: 'ALL',
               dateFrom: '',
               dateTo: '',
               riskLevel: '',
               hasTeamLead: '',
               progressMin: '',
               progressMax: ''
          });
     };

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFilters(prev => ({ ...prev, [name]: value }));
     };

     const getActiveFilterCount = () => {
          let count = 0;
          if (filters.status !== 'ALL') count++;
          if (filters.priority) count++;
          if (filters.teamLead) count++;
          if (filters.dateRange !== 'ALL') count++;
          if (filters.riskLevel) count++;
          if (filters.hasTeamLead) count++;
          if (filters.progressMin) count++;
          if (filters.progressMax) count++;
          return count;
     };

     return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border-default overflow-hidden max-h-[90vh] overflow-y-auto chat-scroll ">
                    {/* Header */}
                    <div className="p-6 border-b border-border-default flex justify-between items-center bg-bg-subtle sticky top-0 z-10">
                         <div className="flex items-center gap-3">
                              <Filter size={20} className="text-accent" />
                              <h2 className="text-xl font-bold text-text-primary">Filter Projects</h2>
                              {getActiveFilterCount() > 0 && (
                                   <span className="px-2 py-1 bg-accent text-text-inverse text-xs rounded-full">
                                        {getActiveFilterCount()} active
                                   </span>
                              )}
                         </div>
                         <button
                              onClick={onClose}
                              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-surface transition-colors"
                         >
                              <X size={20} />
                         </button>
                    </div>

                    <div className="p-6 space-y-8">
                         {/* Status Filter */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-text-primary flex items-center gap-2">
                                   <div className="w-1 h-4 bg-accent rounded-full"></div>
                                   Project Status
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                   {[
                                        { value: 'ALL', label: 'All', color: 'bg-gray-500' },
                                        { value: 'ACTIVE', label: 'Active', color: 'bg-blue-500' },
                                        { value: 'IN_DEVELOPMENT', label: 'In Development', color: 'bg-accent' },
                                        { value: 'CLIENT_REVIEW', label: 'Client Review', color: 'bg-yellow-500' },
                                        { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
                                        { value: 'ON_HOLD', label: 'On Hold', color: 'bg-orange-500' },
                                        { value: 'ARCHIVED', label: 'Archived', color: 'bg-gray-500' },
                                        { value: 'UPCOMING', label: 'Upcoming', color: 'bg-purple-500' }
                                   ].map(option => (
                                        <button
                                             key={option.value}
                                             type="button"
                                             onClick={() => setFilters({ ...filters, status: option.value })}
                                             className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${filters.status === option.value
                                                  ? `${option.color} text-white border-transparent`
                                                  : 'bg-bg-subtle text-text-body border-border-default hover:border-accent'
                                                  }`}
                                        >
                                             {option.label}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Priority Filter */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-text-primary flex items-center gap-2">
                                   <Flag size={16} className="text-accent" />
                                   Priority Level
                              </label>
                              <div className="flex flex-wrap gap-2">
                                   {[
                                        { value: '', label: 'Any' },
                                        { value: 'LOW', label: 'Low', color: 'text-green-500' },
                                        { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-500' },
                                        { value: 'HIGH', label: 'High', color: 'text-orange-500' },
                                        { value: 'CRITICAL', label: 'Critical', color: 'text-red-500' }
                                   ].map(option => (
                                        <button
                                             key={option.value || 'any'}
                                             type="button"
                                             onClick={() => setFilters({ ...filters, priority: option.value })}
                                             className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${filters.priority === option.value
                                                  ? 'bg-accent text-white border-accent'
                                                  : 'bg-bg-subtle text-text-body border-border-default hover:border-accent'
                                                  }`}
                                        >
                                             {option.label}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Team Lead Filter */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-text-primary flex items-center gap-2">
                                   <User size={16} className="text-accent" />
                                   Team Lead
                              </label>

                              {/* Team Lead Assignment Status */}
                              <div className="flex gap-2 mb-3">
                                   <button
                                        type="button"
                                        onClick={() => setFilters({ ...filters, hasTeamLead: 'assigned' })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${filters.hasTeamLead === 'assigned'
                                             ? 'bg-green-500 text-white border-green-500'
                                             : 'bg-bg-subtle text-text-body border-border-default hover:border-green-500'
                                             }`}
                                   >
                                        Has Team Lead
                                   </button>
                                   <button
                                        type="button"
                                        onClick={() => setFilters({ ...filters, hasTeamLead: 'unassigned' })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${filters.hasTeamLead === 'unassigned'
                                             ? 'bg-red-500 text-white border-red-500'
                                             : 'bg-bg-subtle text-text-body border-border-default hover:border-red-500'
                                             }`}
                                   >
                                        No Team Lead
                                   </button>
                                   <button
                                        type="button"
                                        onClick={() => setFilters({ ...filters, hasTeamLead: '' })}
                                        className="px-3 py-2 bg-bg-subtle text-text-body border border-border-default rounded-lg text-xs font-medium hover:bg-bg-surface"
                                   >
                                        Clear
                                   </button>
                              </div>

                              {/* Specific Team Lead Selection */}
                              <select
                                   name="teamLead"
                                   value={filters.teamLead}
                                   onChange={handleChange}
                                   className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent outline-none"
                                   disabled={loading}
                              >
                                   <option value="">Select specific team lead</option>
                                   {teamLeads.map(tl => (
                                        <option key={tl.id} value={tl.id}>
                                             {tl.name} {!tl.isAvailable ? '(Busy)' : ''}
                                        </option>
                                   ))}
                              </select>
                              {loading && <p className="text-xs text-text-muted">Loading team leads...</p>}
                         </div>

                         {/* Date Range Filter */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-text-primary flex items-center gap-2">
                                   <Calendar size={16} className="text-accent" />
                                   Date Range
                              </label>
                              <div className="flex flex-wrap gap-2 mb-3">
                                   {[
                                        { value: 'ALL', label: 'All Time' },
                                        { value: 'THIS_WEEK', label: 'This Week' },
                                        { value: 'THIS_MONTH', label: 'This Month' },
                                        { value: 'OVERDUE', label: 'Overdue' },
                                        { value: 'UPCOMING', label: 'Upcoming (30 days)' },
                                        { value: 'CUSTOM', label: 'Custom Range' }
                                   ].map(option => (
                                        <button
                                             key={option.value}
                                             type="button"
                                             onClick={() => setFilters({ ...filters, dateRange: option.value })}
                                             className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filters.dateRange === option.value
                                                  ? 'bg-accent text-white border-accent'
                                                  : 'bg-bg-subtle text-text-body border-border-default hover:border-accent'
                                                  }`}
                                        >
                                             {option.label}
                                        </button>
                                   ))}
                              </div>

                              {filters.dateRange === 'CUSTOM' && (
                                   <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div>
                                             <label className="block text-xs text-text-muted mb-1">From</label>
                                             <input
                                                  type="date"
                                                  name="dateFrom"
                                                  value={filters.dateFrom}
                                                  onChange={handleChange}
                                                  className="w-full p-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                             />
                                        </div>
                                        <div>
                                             <label className="block text-xs text-text-muted mb-1">To</label>
                                             <input
                                                  type="date"
                                                  name="dateTo"
                                                  value={filters.dateTo}
                                                  onChange={handleChange}
                                                  min={filters.dateFrom}
                                                  className="w-full p-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                             />
                                        </div>
                                   </div>
                              )}
                         </div>

                         {/* Risk Level Filter */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-text-primary flex items-center gap-2">
                                   <AlertCircle size={16} className="text-accent" />
                                   Risk Level
                              </label>
                              <div className="flex flex-wrap gap-2">
                                   {[
                                        { value: '', label: 'Any' },
                                        { value: 'LOW', label: 'Low', color: 'text-green-500' },
                                        { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-500' },
                                        { value: 'HIGH', label: 'High', color: 'text-red-500' }
                                   ].map(option => (
                                        <button
                                             key={option.value || 'any'}
                                             type="button"
                                             onClick={() => setFilters({ ...filters, riskLevel: option.value })}
                                             className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${filters.riskLevel === option.value
                                                  ? 'bg-accent text-white border-accent'
                                                  : 'bg-bg-subtle text-text-body border-border-default hover:border-accent'
                                                  }`}
                                        >
                                             {option.label}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Progress Range Filter */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-text-primary flex items-center gap-2">
                                   <div className="w-4 h-4 rounded-full border-2 border-accent"></div>
                                   Progress Range (%)
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                   <div>
                                        <label className="block text-xs text-text-muted mb-1">Min %</label>
                                        <input
                                             type="number"
                                             name="progressMin"
                                             value={filters.progressMin}
                                             onChange={handleChange}
                                             min="0"
                                             max="100"
                                             placeholder="0"
                                             className="w-full p-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                        />
                                   </div>
                                   <div>
                                        <label className="block text-xs text-text-muted mb-1">Max %</label>
                                        <input
                                             type="number"
                                             name="progressMax"
                                             value={filters.progressMax}
                                             onChange={handleChange}
                                             min={filters.progressMin || "0"}
                                             max="100"
                                             placeholder="100"
                                             className="w-full p-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                                        />
                                   </div>
                              </div>
                         </div>

                         {/* Active Filters Summary */}
                         {getActiveFilterCount() > 0 && (
                              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                                   <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-text-primary uppercase">
                                             Active Filters ({getActiveFilterCount()})
                                        </span>
                                        <button
                                             type="button"
                                             onClick={handleClear}
                                             className="text-xs text-accent hover:underline"
                                        >
                                             Clear all
                                        </button>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                        {filters.status !== 'ALL' && (
                                             <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
                                                  Status: {filters.status.replace('_', ' ')}
                                             </span>
                                        )}
                                        {filters.priority && (
                                             <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
                                                  Priority: {filters.priority}
                                             </span>
                                        )}
                                        {filters.teamLead && (
                                             <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
                                                  Team Lead selected
                                             </span>
                                        )}
                                        {filters.hasTeamLead && (
                                             <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
                                                  {filters.hasTeamLead === 'assigned' ? 'Has Team Lead' : 'No Team Lead'}
                                             </span>
                                        )}
                                        {filters.dateRange !== 'ALL' && (
                                             <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
                                                  Date: {filters.dateRange.replace('_', ' ')}
                                             </span>
                                        )}
                                        {filters.riskLevel && (
                                             <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
                                                  Risk: {filters.riskLevel}
                                             </span>
                                        )}
                                   </div>
                              </div>
                         )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border-default bg-bg-subtle flex justify-end gap-3">
                         <button
                              type="button"
                              onClick={handleClear}
                              className="px-6 py-2.5 rounded-lg font-medium text-text-body hover:bg-border-default transition-colors"
                         >
                              Clear All
                         </button>
                         <button
                              type="button"
                              onClick={handleApply}
                              className="px-6 py-2.5 rounded-lg font-medium bg-accent text-text-inverse hover:bg-accent-hover transition-colors flex items-center gap-2"
                         >
                              <Filter size={16} />
                              Apply Filters
                         </button>
                    </div>
               </div>
          </div>
     );
}