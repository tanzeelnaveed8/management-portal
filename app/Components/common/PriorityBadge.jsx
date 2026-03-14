
//app/Components/common/PriorityBadge.jsx
import React from 'react';

export const PriorityBadge = ({ priority }) => {
     const priorityConfig = {
          'URGENT': { color: 'bg-red-100 text-red-700', label: 'Urgent' },
          'HIGH': { color: 'bg-orange-100 text-orange-700', label: 'High' },
          'MEDIUM': { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
          'LOW': { color: 'bg-green-100 text-green-700', label: 'Low' }
     };

     const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-700', label: priority };

     return (
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${config.color}`}>
               {config.label}
          </span>
     );
};