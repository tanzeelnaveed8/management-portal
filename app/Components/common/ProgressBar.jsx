

// components/common/ProgressBar.js
export default function ProgressBar({ value, max = 100, showLabel = true }) {
     const percentage = Math.min((value / max) * 100, 100);

     return (
          <div className="w-full">
               {showLabel && (
                    <div className="flex justify-between text-sm mb-1">
                         <span>Progress</span>
                         <span>{percentage}%</span>
                    </div>
               )}
               <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                         className="bg-accent rounded-full h-2 transition-all duration-300"
                         style={{ width: `${percentage}%` }}
                    />
               </div>
          </div>
     );
}