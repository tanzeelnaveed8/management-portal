

// components/common/Button.js
export default function Button({ children, variant = 'primary', onClick, className = '' }) {
     const variants = {
          primary: 'bg-accent text-white hover:bg-accent/90',
          secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
          danger: 'bg-red-500 text-white hover:bg-red-600',
          outline: 'border border-white/10 hover:bg-white/5'
     };

     return (
          <button
               onClick={onClick}
               className={`px-4 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${className}`}
          >
               {children}
          </button>
     );
}
