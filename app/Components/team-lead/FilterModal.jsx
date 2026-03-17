// app/Components/team-lead/FilterModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, RotateCcw } from 'lucide-react';

const FilterModal = ({ isOpen, onClose, currentFilters, onApply }) => {
  const [localFilters, setLocalFilters] = useState({
    status: '',
    priority: '',
    riskLevel: '',
    dateRange: '',
    clientType: '',
    sortBy: 'newest'
  });

  // Initialize local filters when modal opens
  useEffect(() => {
    if (isOpen && currentFilters) {
      setLocalFilters({
        status: currentFilters.status || '',
        priority: currentFilters.priority || '',
        riskLevel: currentFilters.riskLevel || '',
        dateRange: currentFilters.dateRange || '',
        clientType: currentFilters.clientType || '',
        sortBy: currentFilters.sortBy || 'newest'
      });
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    // Only send non-empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, value]) => value && value !== '')
    );
    onApply(activeFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      priority: '',
      riskLevel: '',
      dateRange: '',
      clientType: '',
      sortBy: 'newest'
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
  };

  const handleClearAll = () => {
    const emptyFilters = {
      status: '',
      priority: '',
      riskLevel: '',
      dateRange: '',
      clientType: '',
      sortBy: 'newest'
    };
    setLocalFilters(emptyFilters);
  };

  // Count active filters
  const activeFilterCount = Object.values(localFilters).filter(v => v && v !== '' && v !== 'newest').length;

  const FilterSection = ({ title, children }) => (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );

  const FilterOption = ({ label, value, currentValue, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentValue === value
        ? 'bg-accent text-text-inverse shadow-md'
        : 'bg-bg-subtle text-text-body hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
      <div className="bg-bg-surface w-full max-w-md h-screen overflow-y-auto chat-scroll animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-accent" />
            <h2 className="text-xl font-bold text-text-primary">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-accent text-text-inverse text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-subtle rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-8">
          {/* Status Filter */}
          <FilterSection title="Project Status">
            <div className="flex flex-wrap gap-2">
              <FilterOption
                label="All"
                value=""
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
              <FilterOption
                label="Active"
                value="ACTIVE"
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
              <FilterOption
                label="Upcoming"
                value="UPCOMING"
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
              <FilterOption
                label="In Development"
                value="IN_DEVELOPMENT"
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
              <FilterOption
                label="Client Review"
                value="CLIENT_REVIEW"
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
              <FilterOption
                label="On Hold"
                value="ON_HOLD"
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
              <FilterOption
                label="Completed"
                value="COMPLETED"
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
              <FilterOption
                label="Archived"
                value="ARCHIVED"
                currentValue={localFilters.status}
                onClick={(val) => setLocalFilters({ ...localFilters, status: val })}
              />
            </div>
          </FilterSection>

          {/* Priority Filter */}
          <FilterSection title="Priority Level">
            <div className="flex flex-wrap gap-2">
              <FilterOption
                label="All"
                value=""
                currentValue={localFilters.priority}
                onClick={(val) => setLocalFilters({ ...localFilters, priority: val })}
              />
              <FilterOption
                label="Critical"
                value="CRITICAL"
                currentValue={localFilters.priority}
                onClick={(val) => setLocalFilters({ ...localFilters, priority: val })}
              />
              <FilterOption
                label="High"
                value="HIGH"
                currentValue={localFilters.priority}
                onClick={(val) => setLocalFilters({ ...localFilters, priority: val })}
              />
              <FilterOption
                label="Medium"
                value="MEDIUM"
                currentValue={localFilters.priority}
                onClick={(val) => setLocalFilters({ ...localFilters, priority: val })}
              />
              <FilterOption
                label="Low"
                value="LOW"
                currentValue={localFilters.priority}
                onClick={(val) => setLocalFilters({ ...localFilters, priority: val })}
              />
            </div>
          </FilterSection>

          {/* Risk Level Filter */}
          <FilterSection title="Risk Assessment">
            <div className="flex flex-wrap gap-2">
              <FilterOption
                label="All"
                value=""
                currentValue={localFilters.riskLevel}
                onClick={(val) => setLocalFilters({ ...localFilters, riskLevel: val })}
              />
              <FilterOption
                label="High Risk"
                value="HIGH"
                currentValue={localFilters.riskLevel}
                onClick={(val) => setLocalFilters({ ...localFilters, riskLevel: val })}
              />
              <FilterOption
                label="Medium Risk"
                value="MEDIUM"
                currentValue={localFilters.riskLevel}
                onClick={(val) => setLocalFilters({ ...localFilters, riskLevel: val })}
              />
              <FilterOption
                label="Low Risk"
                value="LOW"
                currentValue={localFilters.riskLevel}
                onClick={(val) => setLocalFilters({ ...localFilters, riskLevel: val })}
              />
            </div>
          </FilterSection>

          {/* Client Type Filter */}
          <FilterSection title="Client Type">
            <div className="flex flex-wrap gap-2">
              <FilterOption
                label="All"
                value=""
                currentValue={localFilters.clientType}
                onClick={(val) => setLocalFilters({ ...localFilters, clientType: val })}
              />
              <FilterOption
                label="Enterprise"
                value="ENTERPRISE"
                currentValue={localFilters.clientType}
                onClick={(val) => setLocalFilters({ ...localFilters, clientType: val })}
              />
              <FilterOption
                label="SMB"
                value="SMB"
                currentValue={localFilters.clientType}
                onClick={(val) => setLocalFilters({ ...localFilters, clientType: val })}
              />
              <FilterOption
                label="Startup"
                value="STARTUP"
                currentValue={localFilters.clientType}
                onClick={(val) => setLocalFilters({ ...localFilters, clientType: val })}
              />
              <FilterOption
                label="Individual"
                value="INDIVIDUAL"
                currentValue={localFilters.clientType}
                onClick={(val) => setLocalFilters({ ...localFilters, clientType: val })}
              />
            </div>
          </FilterSection>

          {/* Date Range Filter */}
          <FilterSection title="Date Range">
            <select
              value={localFilters.dateRange}
              onChange={(e) => setLocalFilters({ ...localFilters, dateRange: e.target.value })}
              className="w-full px-4 py-3 bg-bg-subtle border border-border-default rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent appearance-none cursor-pointer"
            >
              <option value="">All Time</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="THIS_YEAR">This Year</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="LAST_QUARTER">Last Quarter</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </FilterSection>

          {/* Sort By */}
          <FilterSection title="Sort By">
            <select
              value={localFilters.sortBy}
              onChange={(e) => setLocalFilters({ ...localFilters, sortBy: e.target.value })}
              className="w-full px-4 py-3 bg-bg-subtle border border-border-default rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="deadline_asc">Deadline (Earliest)</option>
              <option value="deadline_desc">Deadline (Latest)</option>
              <option value="priority_high">Priority (High to Low)</option>
              <option value="priority_low">Priority (Low to High)</option>
              <option value="progress_high">Progress (High to Low)</option>
              <option value="progress_low">Progress (Low to High)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </FilterSection>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <p className="text-xs font-medium text-text-muted mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {localFilters.status && localFilters.status !== '' && (
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                    Status: {localFilters.status.replace('_', ' ')}
                  </span>
                )}
                {localFilters.priority && localFilters.priority !== '' && (
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                    Priority: {localFilters.priority}
                  </span>
                )}
                {localFilters.riskLevel && localFilters.riskLevel !== '' && (
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                    Risk: {localFilters.riskLevel}
                  </span>
                )}
                {localFilters.clientType && localFilters.clientType !== '' && (
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                    Client: {localFilters.clientType}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-bg-surface border-t border-border-default p-6">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 px-4 py-3 border border-red-500/30 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex gap-3 mt-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border-default rounded-xl text-sm font-bold text-text-muted hover:bg-bg-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 bg-accent text-text-inverse rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;