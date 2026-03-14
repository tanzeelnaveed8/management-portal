

// Components/ceo/NotificationsPanel.jsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { X, AlertCircle, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function NotificationsPanel({ alerts, onClose }) {
     const [filter, setFilter] = useState('all');

     const getIcon = (type) => {
          switch (type) {
               case 'delay': return <AlertCircle size={16} className="text-red-500" />;
               case 'budget': return <DollarSign size={16} className="text-orange-500" />;
               case 'progress': return <Clock size={16} className="text-yellow-500" />;
               default: return <AlertCircle size={16} className="text-accent" />;
          }
     };

     const filteredAlerts = filter === 'all'
          ? alerts
          : alerts.filter(a => a.severity === filter);

     return (
          <div className="absolute right-0 mt-2 w-96 bg-bg-surface border border-border-default rounded-xl shadow-xl z-50 max-h-[32rem] overflow-hidden">
               <div className="sticky top-0 bg-bg-surface border-b border-border-default p-4">
                    <div className="flex justify-between items-center mb-3">
                         <h3 className="font-bold text-text-primary">Notifications</h3>
                         <button onClick={onClose} className="p-1 hover:bg-bg-subtle rounded">
                              <X size={16} />
                         </button>
                    </div>

                    <div className="flex gap-2">
                         {['all', 'high', 'medium', 'low'].map((level) => (
                              <button
                                   key={level}
                                   onClick={() => setFilter(level)}
                                   className={`px-3 py-1 text-xs rounded-full capitalize ${filter === level
                                        ? 'bg-accent text-text-inverse'
                                        : 'bg-bg-subtle text-text-muted hover:bg-border-default'
                                        }`}
                              >
                                   {level}
                              </button>
                         ))}
                    </div>
               </div>

               <div className="overflow-y-auto chat-scroll  max-h-96 p-2">
                    {filteredAlerts.length === 0 ? (
                         <div className="p-8 text-center text-text-muted">
                              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                              <p className="text-sm">No notifications</p>
                         </div>
                    ) : (
                         filteredAlerts.map((alert, i) => (
                              <div
                                   key={i}
                                   className={`p-3 mb-2 rounded-lg border-l-4 ${alert.severity === 'high' ? 'border-l-red-500 bg-red-500/5' :
                                        alert.severity === 'medium' ? 'border-l-orange-500 bg-orange-500/5' :
                                             'border-l-yellow-500 bg-yellow-500/5'
                                        }`}
                              >
                                   <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-bg-surface rounded">
                                             {getIcon(alert.type)}
                                        </div>
                                        <div className="flex-1">
                                             <p className="text-sm font-bold text-text-primary">{alert.title}</p>
                                             <p className="text-xs text-text-muted mt-1">{alert.message}</p>
                                             {alert.actionable && (
                                                  <Link
                                                       href={alert.actionLink || '#'}
                                                       className="inline-block mt-2 text-xs font-medium text-accent hover:underline"
                                                  >
                                                       {alert.actionLabel || 'Take Action'} →
                                                  </Link>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         ))
                    )}
               </div>

               <div className="sticky bottom-0 bg-bg-surface border-t border-border-default p-3 text-center">
                    <Link
                         href="/ceo/notifications"
                         className="text-sm text-accent hover:underline"
                         onClick={onClose}
                    >
                         View all notifications
                    </Link>
               </div>
          </div>
     );
}