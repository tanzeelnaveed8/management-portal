

// Components/ceo/SearchResults.jsx
'use client';
import React from 'react';
import Link from 'next/link';
import { FileText, User, X } from 'lucide-react';

export default function SearchResults({ results, onClose }) {
     if (!results || (!results.projects?.length && !results.users?.length)) {
          return (
               <div className="absolute top-full left-0 right-0 mt-2 bg-bg-surface border border-border-default rounded-xl shadow-xl z-50 p-6 text-center">
                    <p className="text-text-muted">No results found</p>
               </div>
          );
     }

     return (
          <div className="absolute top-full left-0 right-0 mt-2 bg-bg-surface border border-border-default rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto chat-scroll ">
               <div className="sticky top-0 bg-bg-surface border-b border-border-default p-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-text-muted uppercase">Search Results</span>
                    <button onClick={onClose} className="p-1 hover:bg-bg-subtle rounded">
                         <X size={14} />
                    </button>
               </div>

               {results.projects?.length > 0 && (
                    <div className="p-2">
                         <h4 className="text-xs font-bold text-accent px-2 py-1">Projects</h4>
                         {results.projects.map((item) => (
                              <Link
                                   key={item.id}
                                   href={item.link}
                                   onClick={onClose}
                                   className="flex items-start gap-3 p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                              >
                                   <div className="p-1.5 bg-accent/10 rounded">
                                        <FileText size={14} className="text-accent" />
                                   </div>
                                   <div>
                                        <p className="text-sm font-medium text-text-primary">{item.title}</p>
                                        <p className="text-xs text-text-muted">{item.subtitle}</p>
                                   </div>
                              </Link>
                         ))}
                    </div>
               )}

               {results.users?.length > 0 && (
                    <div className="p-2 border-t border-border-default">
                         <h4 className="text-xs font-bold text-accent px-2 py-1">Team Members</h4>
                         {results.users.map((item) => (
                              <Link
                                   key={item.id}
                                   href={item.link}
                                   onClick={onClose}
                                   className="flex items-start gap-3 p-2 hover:bg-bg-subtle rounded-lg transition-colors"
                              >
                                   <div className="w-6 h-6 rounded-full bg-accent-secondary flex items-center justify-center text-text-inverse text-xs font-bold">
                                        {item.avatar ? (
                                             <img src={item.avatar} alt={item.title} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                             item.title.charAt(0)
                                        )}
                                   </div>
                                   <div>
                                        <p className="text-sm font-medium text-text-primary">{item.title}</p>
                                        <p className="text-xs text-text-muted">{item.subtitle}</p>
                                   </div>
                              </Link>
                         ))}
                    </div>
               )}
          </div>
     );
}