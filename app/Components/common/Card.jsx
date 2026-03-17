
// Components/common/Card.jsx
export default function Card({ children, className = '' }) {
     return (
          <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-white/10 p-4 ${className}`}>
               {children}
          </div>
     );
}