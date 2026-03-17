
// Stat Card Component
export const StatCard = ({ title, value, icon, color }) => {
     const colorClasses = {
          blue: 'bg-blue-50 text-blue-600',
          yellow: 'bg-yellow-50 text-yellow-600',
          green: 'bg-green-50 text-green-600',
          red: 'bg-red-50 text-red-600'
     };

     return (
          <div className="bg-bg-surface border border-border-default rounded-xl p-5">
               <div className="flex items-center justify-between">
                    <div>
                         <p className="text-xs text-text-muted mb-1">{title}</p>
                         <p className="text-2xl font-bold text-text-primary">{value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${color} ${colorClasses[color]}`}>
                         {icon}
                    </div>
               </div>
          </div>
     );
};