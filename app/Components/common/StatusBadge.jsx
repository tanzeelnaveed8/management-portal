

// Status Badge Component
import React from 'react';

export const StatusBadge = ({ status }) => {
     const statusConfig = {
          'Not Started': { color: 'bg-slate-100 text-slate-700', icon: '○' },
          'In Progress': { color: 'bg-blue-100 text-blue-700', icon: '●' },
          'Review': { color: 'bg-yellow-100 text-yellow-700', icon: '▲' },
          'Completed': { color: 'bg-green-100 text-green-700', icon: '✓' },
          'Blocked': { color: 'bg-red-100 text-red-700', icon: '⚠' }
     };

     const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', icon: '○' };

     return (
          <span className={`text-[10px] px-2 py-1 rounded-full font-bold inline-flex items-center gap-1 ${config.color}`}>
               <span>{config.icon}</span>
               {status}
          </span>
     );
};