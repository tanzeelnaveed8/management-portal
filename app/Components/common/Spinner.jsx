import React from 'react';

/**
 * Enhanced Spinner for Enterprise Project Management
 * Features: Dual-track animation, dynamic text pulsing, and glassmorphism backdrop
 */
const Spinner = ({ title }) => {
     return (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-page/80 backdrop-blur-md transition-all duration-500">
               <div className="relative flex items-center justify-center">
                    {/* Outer Ring - Decorative and slow */}
                    <div className="absolute w-20 h-20 border-2 border-accent-muted rounded-full animate-[ping_2s_linear_infinite]"></div>

                    {/* Middle Ring - The "Track" */}
                    <div className="w-16 h-16 border-[3px] border-accent/10 rounded-full"></div>

                    {/* Inner Spinner - The "Active" element */}
                    <div className="absolute w-16 h-16 border-[3px] border-transparent border-t-accent border-r-accent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.2)]"></div>

                    {/* Center Point - Visual anchor */}
                    <div className="absolute w-1.5 h-1.5 bg-accent-secondary rounded-full"></div>
               </div>

               {/* Loading Text with subtle rhythm */}
               <div className="mt-8 text-center px-6">
                    <h2 className="text-ui font-black uppercase tracking-[0.3em] text-accent animate-pulse">
                         Synchronizing
                    </h2>
                    <p className="mt-2 text-headline font-bold text-text-primary capitalize">
                         {title}
                    </p>
                    <div className="mt-4 flex gap-1.5 justify-center">
                         <span className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-bounce [animation-delay:-0.3s]"></span>
                         <span className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-bounce [animation-delay:-0.15s]"></span>
                         <span className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-bounce"></span>
                    </div>
               </div>
          </div>
     );
};

export default Spinner;