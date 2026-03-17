
// // app/(dashboard)/ceo/managers/page.jsx
// 'use client';
// import React, { useState, useEffect } from 'react';
// import {
//   Users,
//   TrendingUp,
//   AlertCircle,
//   MoreVertical,
//   Mail,
//   Phone,
//   Briefcase,
//   Activity,
//   CheckCircle2,
//   Search,
//   Filter,
//   X,
//   RefreshCw,
//   Award,
//   AlertTriangle,
//   DollarSign,
//   UserPlus,
//   Star,
//   Clock,
//   ArrowUpRight,
//   ArrowDownRight
// } from 'lucide-react';
// import { useCEOManagers } from '../../../../hooks/useCEOManagers';
// import { useRouter } from 'next/navigation';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// } from 'chart.js';
// import { Doughnut, Bar } from 'react-chartjs-2';

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// );

// export default function CEOManagersPage() {
//   const router = useRouter();
//   const {
//     managers,
//     stats,
//     loading,
//     error,
//     filters,
//     setFilters,
//     getManagerDetails,
//     contactManager,
//     refetch
//   } = useCEOManagers();

//   const [searchInput, setSearchInput] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedManager, setSelectedManager] = useState(null);
//   const [showManagerModal, setShowManagerModal] = useState(false);
//   const [managerDetails, setManagerDetails] = useState(null);

//   // Debounce search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setFilters(prev => ({ ...prev, search: searchInput }));
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchInput, setFilters]);

//   const loadManagerDetails = async (manager) => {
//     setSelectedManager(manager);
//     const details = await getManagerDetails(manager.id);
//     setManagerDetails(details);
//     setShowManagerModal(true);
//   };

//   const handleContactManager = async (manager) => {
//     // In a real app, this would open a modal or email client
//     const success = await contactManager(manager.id, 'Meeting request');
//     if (success) {
//       alert('Message sent to manager');
//     }
//   };

//   const getPerformanceColor = (score) => {
//     if (score >= 90) return 'text-green-600 bg-green-500/10 border-green-500/20';
//     if (score >= 75) return 'text-accent bg-accent/10 border-accent/20';
//     if (score >= 60) return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
//     return 'text-red-600 bg-red-500/10 border-red-500/20';
//   };

//   const getHealthScoreColor = (score) => {
//     if (score >= 90) return 'text-green-600';
//     if (score >= 75) return 'text-accent';
//     if (score >= 60) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   // Chart data for portfolio distribution
//   const portfolioChartData = {
//     labels: ['Excellent (90%+)', 'Good (75-89%)', 'At Risk (60-74%)', 'Critical (<60%)'],
//     datasets: [
//       {
//         data: [
//           managers.filter(m => m.metrics?.healthScore >= 90).length,
//           managers.filter(m => m.metrics?.healthScore >= 75 && m.metrics?.healthScore < 90).length,
//           managers.filter(m => m.metrics?.healthScore >= 60 && m.metrics?.healthScore < 75).length,
//           managers.filter(m => m.metrics?.healthScore < 60).length
//         ],
//         backgroundColor: ['#22c55e', '#2563eb', '#eab308', '#ef4444'],
//         borderWidth: 0
//       }
//     ]
//   };

//   if (loading && managers.length === 0) {
//     return (
//       <div className="min-h-screen bg-bg-page flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-text-muted">Loading management hierarchy...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-bg-page p-page-x py-page-y">
//       {/* Page Header */}
//       <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
//         <div>
//           <h1 className="text-headline-lg font-bold text-text-primary tracking-tight">Management Hierarchy</h1>
//           <p className="text-text-muted mt-1 font-medium">Monitoring operational leadership and portfolio delivery.</p>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
//             <input
//               type="text"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               placeholder="Search managers..."
//               className="pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-xl focus:ring-2 focus:ring-accent outline-none w-64 text-ui"
//             />
//             {searchInput && (
//               <button
//                 onClick={() => setSearchInput('')}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
//               >
//                 <X size={16} />
//               </button>
//             )}
//           </div>

//           {/* Filter Button */}
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={`p-2.5 bg-bg-surface border rounded-xl transition-colors ${showFilters ? 'border-accent text-accent' : 'border-border-default text-text-body hover:border-accent'
//               }`}
//           >
//             <Filter size={20} />
//           </button>

//           {/* Refresh Button */}
//           <button
//             onClick={refetch}
//             className="p-2.5 bg-bg-surface border border-border-default rounded-xl hover:bg-bg-subtle transition-colors"
//           >
//             <RefreshCw size={20} />
//           </button>

//           <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-text-inverse px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">
//             <UserPlus size={18} /> Add New Manager
//           </button>
//         </div>
//       </header>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <AlertCircle size={20} className="text-red-500" />
//             <p className="text-red-500 text-sm">{error}</p>
//           </div>
//           <button
//             onClick={refetch}
//             className="text-red-500 hover:text-red-600 text-xs font-bold"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {/* Filters Panel */}
//       {showFilters && (
//         <div className="mb-6 p-4 bg-bg-surface border border-border-default rounded-xl animate-in slide-in-from-top-2">
//           <div className="flex flex-wrap items-center gap-4">
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
//               className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
//             >
//               <option value="all">All Status</option>
//               <option value="ACTIVE">Active</option>
//               <option value="INACTIVE">Inactive</option>
//               <option value="PENDING">Pending</option>
//             </select>

//             <select
//               value={filters.sortBy}
//               onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
//               className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
//             >
//               <option value="performance">Sort by Performance</option>
//               <option value="projects">Sort by Projects</option>
//               <option value="budget">Sort by Budget</option>
//               <option value="team">Sort by Team Size</option>
//             </select>

//             <select
//               value={filters.sortOrder}
//               onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
//               className="px-3 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
//             >
//               <option value="desc">Highest First</option>
//               <option value="asc">Lowest First</option>
//             </select>

//             {(filters.status !== 'all' || searchInput) && (
//               <button
//                 onClick={() => {
//                   setSearchInput('');
//                   setFilters({ status: 'all', search: '', sortBy: 'performance', sortOrder: 'desc' });
//                 }}
//                 className="text-sm text-accent hover:text-accent-hover ml-auto"
//               >
//                 Clear all filters
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* High-Level Management Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <StatsSummary
//           label="Total Managers"
//           value={stats.totalManagers}
//           icon={<Users className="text-accent" size={24} />}
//           trend={`${stats.activeManagers} active`}
//         />
//         <StatsSummary
//           label="Avg. Portfolio Health"
//           value={`${stats.avgPortfolioHealth}%`}
//           icon={<Activity className="text-accent-secondary" size={24} />}
//           trend={`${stats.managersAtRisk} at risk`}
//           trendColor={stats.managersAtRisk > 0 ? 'text-red-500' : 'text-green-500'}
//         />
//         <StatsSummary
//           label="Resource Efficiency"
//           value={`${stats.resourceEfficiency}%`}
//           icon={<TrendingUp className="text-green-500" size={24} />}
//           trend="On-time delivery"
//         />
//         <StatsSummary
//           label="Portfolio Value"
//           value={`$${(stats.totalPortfolioValue / 1000000).toFixed(1)}M`}
//           icon={<DollarSign className="text-purple-500" size={24} />}
//           trend={`${stats.topPerformers} top performers`}
//         />
//       </div>

//       {/* Portfolio Distribution Chart */}
//       {managers.length > 0 && (
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
//           <div className="lg:col-span-1 bg-bg-surface border border-border-default rounded-2xl p-6">
//             <h3 className="text-sm font-bold text-text-primary mb-4">Manager Performance Distribution</h3>
//             <div className="h-48">
//               <Doughnut
//                 data={portfolioChartData}
//                 options={{
//                   cutout: '65%',
//                   plugins: {
//                     legend: {
//                       display: false
//                     }
//                   }
//                 }}
//               />
//             </div>
//             <div className="mt-4 space-y-2">
//               <div className="flex items-center justify-between text-xs">
//                 <span className="flex items-center gap-2">
//                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                   Excellent
//                 </span>
//                 <span className="font-bold">{portfolioChartData.datasets[0].data[0]}</span>
//               </div>
//               <div className="flex items-center justify-between text-xs">
//                 <span className="flex items-center gap-2">
//                   <span className="w-2 h-2 bg-accent rounded-full"></span>
//                   Good
//                 </span>
//                 <span className="font-bold">{portfolioChartData.datasets[0].data[1]}</span>
//               </div>
//               <div className="flex items-center justify-between text-xs">
//                 <span className="flex items-center gap-2">
//                   <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
//                   At Risk
//                 </span>
//                 <span className="font-bold">{portfolioChartData.datasets[0].data[2]}</span>
//               </div>
//               <div className="flex items-center justify-between text-xs">
//                 <span className="flex items-center gap-2">
//                   <span className="w-2 h-2 bg-red-500 rounded-full"></span>
//                   Critical
//                 </span>
//                 <span className="font-bold">{portfolioChartData.datasets[0].data[3]}</span>
//               </div>
//             </div>
//           </div>

//           {/* Quick Stats Cards */}
//           <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="bg-gradient-to-br from-accent to-accent-active rounded-2xl p-6 text-white">
//               <p className="text-xs opacity-80 mb-1">Top Performer</p>
//               <p className="text-lg font-bold">
//                 {managers.sort((a, b) => b.metrics.healthScore - a.metrics.healthScore)[0]?.name}
//               </p>
//               <p className="text-2xl font-black mt-2">
//                 {managers.sort((a, b) => b.metrics.healthScore - a.metrics.healthScore)[0]?.metrics.healthScore}%
//               </p>
//             </div>
//             <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
//               <p className="text-xs text-text-muted mb-1">Needs Attention</p>
//               <p className="text-lg font-bold text-text-primary">
//                 {managers.filter(m => m.metrics.healthScore < 60).length} Managers
//               </p>
//               <p className="text-xs text-red-500 mt-2">Critical performance</p>
//             </div>
//             <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
//               <p className="text-xs text-text-muted mb-1">Total Projects</p>
//               <p className="text-lg font-bold text-text-primary">
//                 {managers.reduce((sum, m) => sum + m.metrics.activeProjects, 0)} Active
//               </p>
//               <p className="text-xs text-text-muted mt-2">
//                 {managers.reduce((sum, m) => sum + m.metrics.totalProjects, 0)} Total
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Managers Grid */}
//       {managers.length === 0 ? (
//         <div className="text-center py-16 bg-bg-surface rounded-2xl border border-dashed border-border-default">
//           <div className="max-w-md mx-auto">
//             <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
//               <Users size={40} className="text-text-disabled" />
//             </div>
//             <h3 className="font-bold text-text-primary text-lg mb-2">No managers found</h3>
//             <p className="text-text-muted text-sm mb-6">
//               {filters.status !== 'all' || searchInput
//                 ? 'Try adjusting your filters to see more results'
//                 : 'No project managers have been added yet.'}
//             </p>
//             {(filters.status !== 'all' || searchInput) && (
//               <button
//                 onClick={() => {
//                   setSearchInput('');
//                   setFilters({ status: 'all', search: '', sortBy: 'performance', sortOrder: 'desc' });
//                 }}
//                 className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all"
//               >
//                 Clear Filters
//               </button>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//           {managers.map((manager) => (
//             <ManagerPerformanceCard
//               key={manager.id}
//               manager={manager}
//               onViewDetails={() => loadManagerDetails(manager)}
//               onContact={() => handleContactManager(manager)}
//               getPerformanceColor={getPerformanceColor}
//               getHealthScoreColor={getHealthScoreColor}
//             />
//           ))}
//         </div>
//       )}

//       {/* Manager Details Modal */}
//       {showManagerModal && managerDetails && (
//         <ManagerDetailsModal
//           manager={managerDetails}
//           onClose={() => {
//             setShowManagerModal(false);
//             setSelectedManager(null);
//             setManagerDetails(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// function StatsSummary({ label, value, icon, trend, trendColor = 'text-text-muted' }) {
//   return (
//     <div className="p-6 bg-bg-card border border-border-default rounded-3xl flex items-center gap-5 hover:border-accent/30 transition-all">
//       <div className="p-4 bg-bg-surface rounded-2xl shadow-sm border border-border-subtle">
//         {icon}
//       </div>
//       <div>
//         <p className="text-caption font-black text-text-muted uppercase tracking-widest">{label}</p>
//         <p className="text-headline-lg font-black text-text-primary leading-none mt-1">{value}</p>
//         {trend && <p className={`text-xs font-medium mt-1 ${trendColor}`}>{trend}</p>}
//       </div>
//     </div>
//   );
// }

// function ManagerPerformanceCard({ manager, onViewDetails, onContact, getPerformanceColor, getHealthScoreColor }) {
//   const isPerformanceIssue = manager.metrics?.onTimeRate < 70 || manager.metrics?.healthScore < 60;

//   return (
//     <div className="bg-bg-surface border border-border-default rounded-3xl overflow-hidden hover:border-accent/30 hover:shadow-xl transition-all group">
//       <div className="p-6">
//         {/* Profile Header */}
//         <div className="flex justify-between items-start mb-8">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-text-inverse text-headline font-black border-2 border-white/20 group-hover:scale-105 transition-transform shadow-lg">
//               {manager.avatar ? (
//                 <img src={manager.avatar} alt={manager.name} className="w-full h-full rounded-2xl object-cover" />
//               ) : (
//                 manager.name.split(' ').map(n => n[0]).join('')
//               )}
//             </div>
//             <div>
//               <h3 className="text-headline font-bold text-text-primary group-hover:text-accent transition-colors">
//                 {manager.name}
//               </h3>
//               <p className="text-ui text-text-muted">{manager.jobTitle} • {manager.department}</p>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${manager.status === 'ACTIVE'
//                     ? 'bg-green-500/10 text-green-600'
//                     : 'bg-gray-500/10 text-gray-600'
//                   }`}>
//                   {manager.status}
//                 </span>
//                 {manager.metrics?.healthScore >= 90 && (
//                   <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full font-bold flex items-center gap-1">
//                     <Star size={10} /> Top Performer
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//           <button className="p-2 text-text-disabled hover:text-text-primary transition-colors">
//             <MoreVertical size={20} />
//           </button>
//         </div>

//         {/* Portfolio Quick Metrics */}
//         <div className="grid grid-cols-3 gap-4 mb-8">
//           <div className="p-4 bg-bg-subtle rounded-2xl border border-border-subtle">
//             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Active</p>
//             <p className="text-subheading font-bold text-text-primary">{manager.metrics?.activeProjects || 0} Projects</p>
//             <p className="text-[10px] text-text-muted mt-1">{manager.metrics?.totalProjects || 0} total</p>
//           </div>
//           <div className="p-4 bg-bg-subtle rounded-2xl border border-border-subtle">
//             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Portfolio</p>
//             <p className="text-subheading font-bold text-text-primary">
//               ${((manager.metrics?.totalBudget || 0) / 1000).toFixed(0)}k
//             </p>
//             <p className="text-[10px] text-text-muted mt-1">${((manager.metrics?.totalCost || 0) / 1000).toFixed(0)}k spent</p>
//           </div>
//           <div className="p-4 bg-bg-subtle rounded-2xl border border-border-subtle">
//             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Delivery</p>
//             <p className={`text-subheading font-bold ${isPerformanceIssue ? 'text-red-500' : 'text-accent-secondary'}`}>
//               {manager.metrics?.onTimeRate || 0}%
//             </p>
//             <p className="text-[10px] text-text-muted mt-1">on-time rate</p>
//           </div>
//         </div>

//         {/* Health Score & Progress */}
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-caption font-bold text-text-muted uppercase">Portfolio Health</span>
//             <span className={`text-xl font-black ${getHealthScoreColor(manager.metrics?.healthScore)}`}>
//               {manager.metrics?.healthScore || 0}%
//             </span>
//           </div>
//           <div className="w-full h-2 bg-border-subtle rounded-full overflow-hidden">
//             <div
//               className={`h-full transition-all duration-1000 ${manager.metrics?.healthScore >= 90 ? 'bg-green-500' :
//                   manager.metrics?.healthScore >= 75 ? 'bg-accent' :
//                     manager.metrics?.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
//                 }`}
//               style={{ width: `${manager.metrics?.healthScore || 0}%` }}
//             />
//           </div>
//         </div>

//         {/* Performance Metrics */}
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-accent/10 rounded-lg">
//               <Briefcase size={14} className="text-accent" />
//             </div>
//             <div>
//               <p className="text-[10px] text-text-muted">Team Size</p>
//               <p className="text-sm font-bold text-text-primary">{manager.metrics?.teamSize || 0}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-green-500/10 rounded-lg">
//               <CheckCircle2 size={14} className="text-green-500" />
//             </div>
//             <div>
//               <p className="text-[10px] text-text-muted">Approval Rate</p>
//               <p className="text-sm font-bold text-text-primary">{manager.metrics?.approvalRate || 0}%</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-yellow-500/10 rounded-lg">
//               <Clock size={14} className="text-yellow-500" />
//             </div>
//             <div>
//               <p className="text-[10px] text-text-muted">Avg Progress</p>
//               <p className="text-sm font-bold text-text-primary">{manager.metrics?.avgProgress || 0}%</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-orange-500/10 rounded-lg">
//               <AlertTriangle size={14} className="text-orange-500" />
//             </div>
//             <div>
//               <p className="text-[10px] text-text-muted">At Risk</p>
//               <p className="text-sm font-bold text-orange-500">{manager.metrics?.highRiskProjects || 0}</p>
//             </div>
//           </div>
//         </div>

//         {/* CEO Alert for Low Performance */}
//         {isPerformanceIssue && (
//           <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl mb-6">
//             <AlertCircle className="text-red-500 shrink-0" size={18} />
//             <p className="text-[11px] text-red-700 leading-tight font-medium">
//               <strong>Performance Warning:</strong> {manager.name} has a {100 - (manager.metrics?.onTimeRate || 0)}% delay rate
//               and {manager.metrics?.delayedProjects || 0} delayed projects. Review resources and provide support.
//             </p>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex gap-3 pt-6 border-t border-border-subtle">
//           <button
//             onClick={onContact}
//             className="flex-1 py-3 bg-bg-subtle text-text-body text-ui font-bold rounded-xl hover:bg-border-subtle transition-colors flex items-center justify-center gap-2"
//           >
//             <Mail size={16} /> Contact
//           </button>
//           <button
//             onClick={onViewDetails}
//             className="flex-1 py-3 bg-accent/10 text-accent text-ui font-bold rounded-xl hover:bg-accent/20 transition-colors flex items-center justify-center gap-2"
//           >
//             View Full Portfolio
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ManagerDetailsModal({ manager, onClose }) {
//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-bg-surface w-full max-w-4xl rounded-2xl shadow-2xl border border-border-default overflow-hidden max-h-[90vh] flex flex-col">
//         <div className="p-6 border-b border-border-default flex justify-between items-center bg-bg-subtle">
//           <div>
//             <h2 className="text-headline font-bold text-text-primary">{manager.name}</h2>
//             <p className="text-sm text-text-muted">{manager.jobTitle} • {manager.department}</p>
//           </div>
//           <button onClick={onClose} className="text-text-muted hover:text-text-primary">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto chat-scroll  p-6">
//           <div className="space-y-6">
//             {/* Contact Info */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="p-4 bg-bg-subtle rounded-xl">
//                 <p className="text-xs text-text-muted mb-1">Email</p>
//                 <p className="text-sm font-medium flex items-center gap-2">
//                   <Mail size={14} className="text-accent" />
//                   {manager.email}
//                 </p>
//               </div>
//               <div className="p-4 bg-bg-subtle rounded-xl">
//                 <p className="text-xs text-text-muted mb-1">Phone</p>
//                 <p className="text-sm font-medium flex items-center gap-2">
//                   <Phone size={14} className="text-accent" />
//                   {manager.phone || 'Not provided'}
//                 </p>
//               </div>
//             </div>

//             {/* Project Stats */}
//             <div className="grid grid-cols-4 gap-4">
//               <div className="p-4 bg-bg-subtle rounded-xl text-center">
//                 <p className="text-2xl font-bold text-accent">{manager.projectStats?.active || 0}</p>
//                 <p className="text-xs text-text-muted">Active Projects</p>
//               </div>
//               <div className="p-4 bg-bg-subtle rounded-xl text-center">
//                 <p className="text-2xl font-bold text-green-500">{manager.projectStats?.completed || 0}</p>
//                 <p className="text-xs text-text-muted">Completed</p>
//               </div>
//               <div className="p-4 bg-bg-subtle rounded-xl text-center">
//                 <p className="text-2xl font-bold text-yellow-500">{manager.projectStats?.delayed || 0}</p>
//                 <p className="text-xs text-text-muted">Delayed</p>
//               </div>
//               <div className="p-4 bg-bg-subtle rounded-xl text-center">
//                 <p className="text-2xl font-bold text-orange-500">{manager.projectStats?.highRisk || 0}</p>
//                 <p className="text-xs text-text-muted">High Risk</p>
//               </div>
//             </div>

//             {/* Recent Projects */}
//             <div>
//               <h3 className="text-sm font-bold text-text-primary mb-4">Recent Projects</h3>
//               <div className="space-y-3">
//                 {manager.recentProjects?.map(project => (
//                   <div
//                     key={project.id}
//                     className="p-4 bg-bg-subtle border border-border-default rounded-xl"
//                   >
//                     <div className="flex justify-between items-start mb-2">
//                       <div>
//                         <p className="font-bold text-text-primary">{project.name}</p>
//                         <p className="text-xs text-text-muted">Progress: {project.progress}%</p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${project.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
//                           project.status === 'DELAYED' ? 'bg-red-500/10 text-red-600' :
//                             'bg-blue-500/10 text-blue-600'
//                         }`}>
//                         {project.status}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-xs text-text-muted">
//                       <span>Budget: ${(project.budget / 1000).toFixed(1)}k</span>
//                       {project.deadline && (
//                         <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Upcoming Deadlines */}
//             {manager.upcomingDeadlines?.length > 0 && (
//               <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
//                 <h3 className="text-sm font-bold text-yellow-600 mb-3">Upcoming Deadlines</h3>
//                 <div className="space-y-2">
//                   {manager.upcomingDeadlines.map((item, i) => (
//                     <div key={i} className="flex justify-between items-center text-sm">
//                       <span className="text-text-primary">{item.projectName}</span>
//                       <span className="text-yellow-600 font-bold">{item.daysRemaining} days left</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="p-6 bg-bg-subtle border-t border-border-default flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 rounded-lg font-medium text-text-body hover:bg-border-default"
//           >
//             Close
//           </button>
//           <button className="px-6 py-2 rounded-lg font-medium bg-accent text-text-inverse hover:bg-accent-hover">
//             Schedule 1:1 Meeting
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/(dashboard)/ceo/managers/page.jsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Mail,
  Phone,
  Briefcase,
  Activity,
  CheckCircle2,
  Search,
  Filter,
  X,
  RefreshCw,
  Award,
  AlertTriangle,
  DollarSign,
  UserPlus,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Calendar,
  MessageSquare,
  UserCheck,
  Zap,
  Globe,
  Sparkles
} from 'lucide-react';
import { useCEOManagers } from '../../../../hooks/useCEOManagers';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../../../Components/common/Spinner';
import { toast } from 'react-hot-toast';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

export default function CEOManagersPage() {
  const router = useRouter();
  const {
    managers,
    stats,
    loading,
    error,
    filters,
    setFilters,
    getManagerDetails,
    contactManager,
    refetch
  } = useCEOManagers();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerDetails, setManagerDetails] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [hoveredManager, setHoveredManager] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setFilters]);

  const loadManagerDetails = async (manager) => {
    setSelectedManager(manager);
    const details = await getManagerDetails(manager.id);
    setManagerDetails(details);
    setShowManagerModal(true);
  };

  // const handleContactManager = async (manager) => {
  //   // In a real app, this would open a modal or email client
  //   const success = await contactManager(manager.id, 'Meeting request');
  //   if (success) {
  //     alert('Message sent to manager');
  //   }
  // };



  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-500/10 border-green-500/20';
    if (score >= 75) return 'text-accent bg-accent/10 border-accent/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-600 bg-red-500/10 border-red-500/20';
  };

  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-accent';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceGradient = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 75) return 'from-accent to-accent-active';
    if (score >= 60) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  // Sort managers for top performer
  const sortedManagers = useMemo(() => {
    return [...managers].sort((a, b) => b.metrics?.healthScore - a.metrics?.healthScore);
  }, [managers]);

  const topPerformer = sortedManagers[0];
  const needsAttention = managers.filter(m => m.metrics?.healthScore < 60).length;

  // Chart data for portfolio distribution
  const portfolioChartData = {
    labels: ['Excellent (90%+)', 'Good (75-89%)', 'At Risk (60-74%)', 'Critical (<60%)'],
    datasets: [
      {
        data: [
          managers.filter(m => m.metrics?.healthScore >= 90).length,
          managers.filter(m => m.metrics?.healthScore >= 75 && m.metrics?.healthScore < 90).length,
          managers.filter(m => m.metrics?.healthScore >= 60 && m.metrics?.healthScore < 75).length,
          managers.filter(m => m.metrics?.healthScore < 60).length
        ],
        backgroundColor: ['#22c55e', '#2563eb', '#eab308', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  // Performance trend chart data
  const trendChartData = {
    labels: managers.slice(0, 6).map(m => m.name.split(' ')[0]),
    datasets: [
      {
        label: 'Health Score',
        data: managers.slice(0, 6).map(m => m.metrics?.healthScore || 0),
        backgroundColor: managers.slice(0, 6).map(m => {
          if (m.metrics?.healthScore >= 90) return '#22c55e80';
          if (m.metrics?.healthScore >= 75) return '#2563eb80';
          if (m.metrics?.healthScore >= 60) return '#eab30880';
          return '#ef444480';
        }),
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  if (loading && managers.length === 0) {
    return <Spinner title="Management Hierarchy.." />;
  }

  return (
    <div className="min-h-screen bg-bg-page p-page-x py-page-y">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Page Header with Enhanced Design */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 relative z-10"
      >
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <Users className="text-accent" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-text-primary tracking-tight">Management Hierarchy</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-10 bg-accent rounded-full"></div>
                  <p className="text-text-muted font-medium">Monitoring operational leadership and portfolio delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div className=" w-full flex items-center gap-3">
            {/* Search Bar with Glass Effect */}
            <div className="relative group w-1/2">
              <div className="absolute inset-0 bg-accent/5 rounded-xl blur group-hover:blur-md transition-all opacity-0 group-hover:opacity-100"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search managers..."
                  className=" w-full pl-10 pr-10 py-3 bg-bg-surface border border-border-default rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none   text-ui transition-all"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Button with Active Indicator */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-3 bg-bg-surface border rounded-xl transition-all ${showFilters
                ? 'border-accent text-accent shadow-lg shadow-accent/20'
                : 'border-border-default text-text-body hover:border-accent hover:shadow-md'
                }`}
            >
              <Filter size={20} />
              {(filters.status !== 'all' || searchInput) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-bg-page"></span>
              )}
            </button>

            {/* Refresh Button with Spin Animation */}
            <button
              onClick={refetch}
              className="p-3 bg-bg-surface border border-border-default rounded-xl hover:border-accent hover:shadow-md transition-all group"
            >
              <RefreshCw size={20} className="text-text-body group-hover:text-accent group-hover:rotate-180 transition-all duration-500" />
            </button>

            {/* View Toggle */}
            <div className="flex bg-bg-surface border border-border-default rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                  ? 'bg-accent text-text-inverse shadow-md'
                  : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                <BarChart3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                  ? 'bg-accent text-text-inverse shadow-md'
                  : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                <Users size={18} />
              </button>
            </div>

            {/* Add Manager Button with Gradient */}
            {/* <button className="relative group overflow-hidden bg-accent hover:bg-accent-hover text-text-inverse px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">
              <span className="relative z-10 flex items-center gap-2">
                <UserPlus size={18} />
                Add Manager
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-active to-accent-hover opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button> */}
          </div>
        </div>

        {/* Filters Panel with Animation */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-6 bg-bg-surface border border-border-default rounded-2xl shadow-lg">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-bg-subtle rounded-lg">
                    <Filter size={16} className="text-accent" />
                    <span className="text-sm font-medium text-text-primary">Filters:</span>
                  </div>

                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                  </select>

                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none min-w-[160px]"
                  >
                    <option value="performance">Performance</option>
                    <option value="projects">Projects Count</option>
                    <option value="budget">Budget Value</option>
                    <option value="team">Team Size</option>
                  </select>

                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                    className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="desc">Highest First</option>
                    <option value="asc">Lowest First</option>
                  </select>

                  {(filters.status !== 'all' || searchInput) && (
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setFilters({ status: 'all', search: '', sortBy: 'performance', sortOrder: 'desc' });
                      }}
                      className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
                    >
                      <X size={16} />
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Error Message with Animation */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-bold"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Level Management Stats with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
      >
        <StatsSummary
          label="Total Managers"
          value={stats.totalManagers}
          icon={<Users className="text-accent" size={20} />}
          trend={`${stats.activeManagers} active`}
          gradient="from-accent/20 to-accent/5"
        />
        <StatsSummary
          label="Avg. Portfolio Health"
          value={`${stats.avgPortfolioHealth}%`}
          icon={<Activity className="text-accent-secondary" size={20} />}
          trend={`${stats.managersAtRisk} at risk`}
          trendColor={stats.managersAtRisk > 0 ? 'text-red-500' : 'text-green-500'}
          gradient="from-accent-secondary/20 to-accent-secondary/5"
        />
        <StatsSummary
          label="Resource Efficiency"
          value={`${stats.resourceEfficiency}%`}
          icon={<TrendingUp className="text-green-500" size={20} />}
          trend="On-time delivery"
          gradient="from-green-500/20 to-green-500/5"
        />
        <StatsSummary
          label="Portfolio Value"
          value={`$${(stats.totalPortfolioValue / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="text-purple-500" size={20} />}
          trend={`${stats.topPerformers} top performers`}
          gradient="from-purple-500/20 to-purple-500/5"
        />
      </motion.div>

      {/* Analytics Dashboard */}
      {managers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8"
        >
          {/* Performance Distribution Chart */}
          <div className="lg:col-span-3 bg-bg-surface border border-border-default rounded-2xl p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <PieChart size={18} className="text-accent" />
                Performance Distribution
              </h3>
              <span className="text-xs text-text-muted bg-bg-subtle px-2 py-1 rounded-full">
                {managers.length} total
              </span>
            </div>
            <div className="relative h-48">
              <Doughnut
                data={portfolioChartData}
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleColor: '#fff',
                      bodyColor: '#94a3b8',
                      padding: 12,
                      cornerRadius: 8
                    }
                  },
                  animation: {
                    animateRotate: true,
                    animateScale: true
                  }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-text-primary">{managers.length}</span>
                <span className="text-[10px] text-text-muted uppercase">Managers</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { color: 'bg-green-500', label: 'Excellent', count: portfolioChartData.datasets[0].data[0] },
                { color: 'bg-accent', label: 'Good', count: portfolioChartData.datasets[0].data[1] },
                { color: 'bg-yellow-500', label: 'At Risk', count: portfolioChartData.datasets[0].data[2] },
                { color: 'bg-red-500', label: 'Critical', count: portfolioChartData.datasets[0].data[3] }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${item.color} rounded-full`}></span>
                    <span className="text-text-muted">{item.label}</span>
                  </div>
                  <span className="font-bold text-text-primary">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="lg:col-span-5 bg-bg-surface border border-border-default rounded-2xl p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <BarChart3 size={18} className="text-accent" />
                Top Performers
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Health Score</span>
                <div className="flex gap-1">
                  <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
                  <span className="w-3 h-3 bg-accent rounded-sm"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-sm"></span>
                </div>
              </div>
            </div>
            <div className="h-48">
              <Bar
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleColor: '#fff',
                      bodyColor: '#94a3b8',
                      cornerRadius: 8
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: '#334155' },
                      ticks: { color: '#94a3b8' }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: '#94a3b8' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="lg:col-span-4 space-y-4">
            {/* Top Performer Card */}
            {topPerformer && (
              <div className="bg-gradient-to-br from-accent to-accent-active rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs opacity-80 mb-1 flex items-center gap-1">
                        <Award size={12} />
                        Top Performer
                      </p>
                      <p className="text-xl font-bold mb-1">{topPerformer.name}</p>
                      <p className="text-sm opacity-90">{topPerformer.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black">{topPerformer.metrics?.healthScore}%</p>
                      <p className="text-xs opacity-80">health score</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 xl:flex gap-4">
                    <div className="flex-1 bg-white/10 rounded-xl p-3">
                      <p className="text-xs opacity-80">Projects</p>
                      <p className="text-lg font-bold">{topPerformer.metrics?.activeProjects}</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-3">
                      <p className="text-xs opacity-80">Team Size</p>
                      <p className="text-lg font-bold">{topPerformer.metrics?.teamSize}</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-3">
                      <p className="text-xs opacity-80">On-time</p>
                      <p className="text-lg font-bold">{topPerformer.metrics?.onTimeRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Needs Attention Card */}
            <div className="bg-bg-surface border border-border-default rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-red-500" />
                    Needs Attention
                  </p>
                  <p className="text-3xl font-bold text-red-500">{needsAttention}</p>
                  <p className="text-sm text-text-muted mt-1">Managers with critical performance</p>
                </div>
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
              </div>
            </div>

            {/* Total Projects Card */}
            <div className="bg-bg-surface border border-border-default rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
                    <Briefcase size={12} className="text-accent" />
                    Active Projects
                  </p>
                  <p className="text-3xl font-bold text-text-primary">
                    {managers.reduce((sum, m) => sum + m.metrics.activeProjects, 0)}
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    Across all managers
                  </p>
                </div>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Target size={32} className="text-accent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Managers Grid/List */}
      {managers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-bg-surface rounded-3xl border-2 border-dashed border-border-default"
        >
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-6">
              <Users size={48} className="text-text-disabled" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">No managers found</h3>
            <p className="text-text-muted mb-8">
              {filters.status !== 'all' || searchInput
                ? 'Try adjusting your filters to see more results'
                : 'No project managers have been added yet.'}
            </p>
            {(filters.status !== 'all' || searchInput) && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilters({ status: 'all', search: '', sortBy: 'performance', sortOrder: 'desc' });
                }}
                className="bg-accent text-text-inverse px-8 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        >
          {managers.map((manager, index) => (
            <motion.div
              key={manager.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredManager(manager.id)}
              onHoverEnd={() => setHoveredManager(null)}
            >
              <ManagerPerformanceCard
                manager={manager}
                onViewDetails={() => loadManagerDetails(manager)}
                onContact={() => handleContactManager(manager)}
                getPerformanceColor={getPerformanceColor}
                getHealthScoreColor={getHealthScoreColor}
                getPerformanceGradient={getPerformanceGradient}
                isHovered={hoveredManager === manager.id}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-bg-surface border border-border-default rounded-2xl overflow-x-auto chat-scroll"
        >
          <table className="w-full">
            <thead className="bg-bg-subtle border-b border-border-default">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Manager</th>
                <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Status</th>
                <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Projects</th>
                <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Health</th>
                <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Performance</th>
                <th className="text-left p-4 text-xs font-bold text-text-disabled uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <ManagerTableRow
                  key={manager.id}
                  manager={manager}
                  onViewDetails={() => loadManagerDetails(manager)}
                  onContact={() => handleContactManager(manager)}
                  getHealthScoreColor={getHealthScoreColor}
                />
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Manager Details Modal */}
      <AnimatePresence>
        {showManagerModal && managerDetails && (
          <ManagerDetailsModal
            manager={managerDetails}
            onClose={() => {
              setShowManagerModal(false);
              setSelectedManager(null);
              setManagerDetails(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Stats Summary Component
function StatsSummary({ label, value, icon, trend, trendColor = 'text-text-muted', gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-6 bg-gradient-to-br ${gradient} bg-bg-card border border-border-default rounded-3xl flex items-center md:items-start gap-5 hover:shadow-xl transition-all relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <div className="p-2 bg-bg-surface rounded-2xl shadow-sm border border-border-subtle relative z-10">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-caption font-black text-text-muted uppercase tracking-widest">{label}</p>
        <p className="text-headline-lg font-black text-text-primary leading-none mt-1">{value}</p>
        {trend && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs font-medium mt-1 ${trendColor} flex items-center gap-1`}
          >
            {trendColor === 'text-red-500' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
            {trend}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced Manager Performance Card
function ManagerPerformanceCard({
  manager,
  onViewDetails,
  onContact,
  getPerformanceColor,
  getHealthScoreColor,
  getPerformanceGradient,
  isHovered
}) {
  const isPerformanceIssue = manager.metrics?.onTimeRate < 70 || manager.metrics?.healthScore < 60;



  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-bg-surface border border-border-default rounded-3xl overflow-hidden transition-all relative ${isHovered ? 'shadow-2xl border-accent/30' : 'shadow-lg hover:shadow-xl'
        }`}
    >
      {/* Background Gradient on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getPerformanceGradient(manager.metrics?.healthScore)} opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-5' : ''
        }`}></div>

      <div className="p-4 relative z-10">
        {/* Profile Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getPerformanceGradient(manager.metrics?.healthScore)} flex items-center justify-center text-text-inverse text-headline font-black border-2 border-white/20 shadow-xl overflow-hidden`}>
                {manager.avatar ? (
                  <img src={manager.avatar} alt={manager.name} className="w-full h-full object-cover" />
                ) : (
                  manager.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              {manager.metrics?.healthScore >= 90 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-bg-surface flex items-center justify-center"
                >
                  <Star size={10} className="text-white" />
                </motion.div>
              )}
            </motion.div>
            <div>
              <h3 className="text-headline font-bold text-text-primary">{manager.name}</h3>
              <p className="text-ui text-text-muted">{manager.jobTitle} • {manager.department}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${manager.status === 'ACTIVE'
                  ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                  : 'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                  }`}>
                  {manager.status}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPerformanceColor(manager.metrics?.healthScore)} border`}>
                  {manager.metrics?.healthScore >= 90 ? '🏆 Elite' :
                    manager.metrics?.healthScore >= 75 ? '📈 Pro' :
                      manager.metrics?.healthScore >= 60 ? '⚠️ Developing' : '🔴 Critical'}
                </span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 90 }}
            className="p-2 text-text-disabled hover:text-text-primary transition-colors"
          >
            <MoreVertical size={20} />
          </motion.button>
        </div>

        {/* Portfolio Quick Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gradient-to-br from-bg-subtle to-bg-surface rounded-xl border border-border-subtle"
          >
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Active</p>
            <p className="text-lg font-bold text-text-primary">{manager.metrics?.activeProjects || 0}</p>
            <p className="text-[8px] text-text-muted">of {manager.metrics?.totalProjects || 0} total</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gradient-to-br from-bg-subtle to-bg-surface rounded-xl border border-border-subtle"
          >
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Portfolio</p>
            <p className="text-lg font-bold text-text-primary">
              ${((manager.metrics?.totalBudget || 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-[8px] text-text-muted">${((manager.metrics?.totalCost || 0) / 1000).toFixed(0)}k spent</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-3 bg-gradient-to-br rounded-xl border ${isPerformanceIssue
              ? 'from-red-500/10 to-red-500/5 border-red-500/20'
              : 'from-bg-subtle to-bg-surface border-border-subtle'
              }`}
          >
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Delivery</p>
            <p className={`text-lg font-bold ${isPerformanceIssue ? 'text-red-500' : 'text-accent-secondary'}`}>
              {manager.metrics?.onTimeRate || 0}%
            </p>
            <p className="text-[8px] text-text-muted">on-time rate</p>
          </motion.div>
        </div>

        {/* Health Score with Animated Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption font-bold text-text-muted uppercase flex items-center gap-1">
              <Activity size={14} className="text-accent" />
              Portfolio Health
            </span>
            <motion.span
              key={manager.metrics?.healthScore}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-xl font-black ${getHealthScoreColor(manager.metrics?.healthScore)}`}
            >
              {manager.metrics?.healthScore || 0}%
            </motion.span>
          </div>
          <div className="w-full h-3 bg-border-subtle rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${manager.metrics?.healthScore || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${manager.metrics?.healthScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                manager.metrics?.healthScore >= 75 ? 'bg-gradient-to-r from-accent to-accent-active' :
                  manager.metrics?.healthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
            />
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricItem
            icon={<Briefcase size={14} />}
            label="Team Size"
            value={manager.metrics?.teamSize || 0}
            color="accent"
          />
          <MetricItem
            icon={<CheckCircle2 size={14} />}
            label="Approval Rate"
            value={`${manager.metrics?.approvalRate || 0}%`}
            color="green"
          />
          <MetricItem
            icon={<Clock size={14} />}
            label="Avg Progress"
            value={`${manager.metrics?.avgProgress || 0}%`}
            color="yellow"
          />
          <MetricItem
            icon={<AlertTriangle size={14} />}
            label="At Risk"
            value={manager.metrics?.highRiskProjects || 0}
            color="orange"
          />
        </div>

        {/* CEO Alert for Low Performance */}
        <AnimatePresence>
          {isPerformanceIssue && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-[11px] text-red-700 leading-tight font-medium">
                    <strong>Performance Warning:</strong> {manager.name} has a {100 - (manager.metrics?.onTimeRate || 0)}% delay rate
                    and {manager.metrics?.delayedProjects || 0} delayed projects.
                  </p>
                  <button className="mt-2 text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1">
                    Review Resources <ArrowUpRight size={10} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border-subtle">
          <motion.a
            href={`mailto:${manager.email}`} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            // onClick={onContact}
            className="flex-1 py-3 bg-bg-subtle text-text-body text-ui font-bold rounded-xl hover:bg-border-subtle transition-colors flex items-center justify-center gap-2 group border border-border-default"
          >
            <Mail  size={16} className="group-hover:scale-110 transition-transform text-accent" />
            Contact
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewDetails}
            className="flex-1 py-3 border border-accent/60 bg-accent/10 text-accent text-ui font-bold rounded-xl hover:bg-accent/20 transition-colors flex items-center justify-center gap-2 group"
          >
            <Briefcase size={16} className="group-hover:rotate-12 transition-transform" />
            Portfolio
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Metric Item Component
function MetricItem({ icon, label, value, color }) {
  const colorClasses = {
    accent: 'bg-accent/10 text-accent',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    orange: 'bg-orange-500/10 text-orange-500'
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-bg-subtle rounded-lg border border-border-subtle">
      <div className={`p-1.5 ${colorClasses[color]} rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

// Table Row for List View
function ManagerTableRow({ manager, onViewDetails, onContact, getHealthScoreColor }) {
  return (
    <tr className="border-b border-border-default hover:bg-bg-subtle/50 transition-colors cursor-pointer" onClick={onViewDetails}>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
            {manager.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-text-primary">{manager.name}</p>
            <p className="text-xs text-text-muted">{manager.jobTitle}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${manager.status === 'ACTIVE'
          ? 'bg-green-500/10 text-green-600'
          : 'bg-gray-500/10 text-gray-600'
          }`}>
          {manager.status}
        </span>
      </td>
      <td className="p-4">
        <span className="font-medium text-text-primary">{manager.metrics?.activeProjects}</span>
        <span className="text-xs text-text-muted ml-1">/ {manager.metrics?.totalProjects}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${getHealthScoreColor(manager.metrics?.healthScore)}`}>
            {manager.metrics?.healthScore}%
          </span>
          <div className="w-16 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className={`h-full ${manager.metrics?.healthScore >= 90 ? 'bg-green-500' :
                manager.metrics?.healthScore >= 75 ? 'bg-accent' :
                  manager.metrics?.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              style={{ width: `${manager.metrics?.healthScore}%` }}
            />
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${manager.metrics?.onTimeRate >= 90 ? 'bg-green-500/10 text-green-600' :
          manager.metrics?.onTimeRate >= 75 ? 'bg-accent/10 text-accent' :
            manager.metrics?.onTimeRate >= 60 ? 'bg-yellow-500/10 text-yellow-600' :
              'bg-red-500/10 text-red-600'
          }`}>
          {manager.metrics?.onTimeRate}% on-time
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onContact}
            className="p-1.5 hover:bg-bg-surface rounded-lg text-text-muted hover:text-accent transition-colors"
          >
            <Mail size={14} />
          </button>
          <button
            onClick={onViewDetails}
            className="p-1.5 hover:bg-bg-surface rounded-lg text-text-muted hover:text-accent transition-colors"
          >
            <Briefcase size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Enhanced Manager Details Modal
function ManagerDetailsModal({ manager, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-bg-surface w-full max-w-4xl rounded-3xl shadow-2xl border border-border-default overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent-secondary/10"></div>
          <div className="relative p-6 border-b border-border-default flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-text-primary">{manager.name}</h2>
              <p className="text-sm text-text-muted">{manager.jobTitle} • {manager.department}</p>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={onClose}
              className="p-2 hover:bg-bg-surface rounded-full text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto chat-scroll  p-6">
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-bg-subtle to-bg-surface rounded-xl border border-border-default">
                <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                  <Mail size={12} className="text-accent" />
                  Email
                </p>
                <p className="text-sm font-medium text-text-primary">{manager.email}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-bg-subtle to-bg-surface rounded-xl border border-border-default">
                <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                  <Phone size={12} className="text-accent" />
                  Phone
                </p>
                <p className="text-sm font-medium text-text-primary">{manager.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Project Stats with Animation */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Active', value: manager.projectStats?.active || 0, color: 'accent', icon: <Activity size={16} /> },
                { label: 'Completed', value: manager.projectStats?.completed || 0, color: 'green', icon: <CheckCircle2 size={16} /> },
                { label: 'Delayed', value: manager.projectStats?.delayed || 0, color: 'yellow', icon: <Clock size={16} /> },
                { label: 'High Risk', value: manager.projectStats?.highRisk || 0, color: 'orange', icon: <AlertTriangle size={16} /> }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-500/5 rounded-xl border border-${stat.color}-500/20 text-center`}
                >
                  <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                  <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Projects */}
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-accent" />
                Recent Projects
              </h3>
              <div className="space-y-3">
                {manager.recentProjects?.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-bg-subtle border border-border-default rounded-xl hover:border-accent/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-text-primary group-hover:text-accent transition-colors">
                          {project.name}
                        </p>
                        <p className="text-xs text-text-muted">Progress: {project.progress}%</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${project.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                        project.status === 'DELAYED' ? 'bg-red-500/10 text-red-600' :
                          'bg-accent/10 text-accent'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Budget: ${(project.budget / 1000).toFixed(1)}k</span>
                      {project.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            {manager.upcomingDeadlines?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-4"
              >
                <h3 className="text-sm font-bold text-yellow-600 mb-3 flex items-center gap-2">
                  <Clock size={16} />
                  Upcoming Deadlines
                </h3>
                <div className="space-y-2">
                  {manager.upcomingDeadlines.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-yellow-500/5 rounded-lg">
                      <span className="text-text-primary font-medium">{item.projectName}</span>
                      <span className="text-yellow-600 font-bold">{item.daysRemaining} days left</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gradient-to-b from-bg-subtle to-bg-surface border-t border-border-default flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-text-body hover:bg-border-default transition-colors"
          >
            Close
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl font-medium bg-accent text-text-inverse hover:bg-accent-hover shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            <Calendar size={16} />
            Schedule 1:1 Meeting
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

