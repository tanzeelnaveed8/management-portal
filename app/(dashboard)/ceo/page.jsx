"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
     LayoutDashboard,
     TrendingUp,
     TrendingDown,
     Users,
     Briefcase,
     AlertCircle,
     CheckCircle2,
     Clock,
     ArrowUpRight,
     ArrowDownRight,
     MoreVertical,
     Search,
     Bell,
     Calendar,
     LogOut,
     X,
     RefreshCw,
     PieChart,
     Target,
     UserCheck,
     DollarSign,
     Flag,
     Shield,
     Zap,
     BarChart3,
     Activity,
     Award,
     Rocket,
     Sparkles,
     Globe,
     Layers,
     ChevronRight,
     Eye,
     EyeOff,
     Download,
     Filter,
     Grid,
     List,
     Maximize2,
     Minimize2,
     Settings,
     HelpCircle
} from 'lucide-react';
import {
     Chart as ChartJS,
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     BarElement,
     ArcElement,
     RadialLinearScale,
     Title,
     Tooltip,
     Legend,
     Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useCEODashboard } from '../../../hooks/useCEODashboard';
import Spinner from '../../Components/common/Spinner';
import SearchResults from '../../Components/ceo/SearchResults';
import NotificationsPanel from '../../Components/ceo/NotificationsPanel';


ChartJS.register(
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     BarElement,
     ArcElement,
     RadialLinearScale,
     Title,
     Tooltip,
     Legend,
     Filler
);


const App = () => {
     const [activeTab, setActiveTab] = useState('overview');
     const [showNotifications, setShowNotifications] = useState(false);
     const [showSearchResults, setShowSearchResults] = useState(false);
     const [searchQuery, setSearchQuery] = useState('');
     const [searchResults, setSearchResults] = useState({ projects: [], users: [] });
     const [searching, setSearching] = useState(false);
     const [timeRange, setTimeRange] = useState('30days');
     const [viewMode, setViewMode] = useState('grid');
     const [showQuickActions, setShowQuickActions] = useState(false);
     const [selectedMetric, setSelectedMetric] = useState(null);
     const [isFullscreen, setIsFullscreen] = useState(false);
     const searchRef = useRef(null);
     const notificationsRef = useRef(null);
     const quickActionsRef = useRef(null);

     const router = useRouter();
     const {
          stats,
          projects,
          managers,
          workload,
          alerts,
          approvalQueue,
          loading,
          error,
          searchTerm,
          setSearchTerm,
          filteredProjects,
          getStatsByTimeRange,
          refetch
     } = useCEODashboard();

     // Handle click outside for dropdowns
     useEffect(() => {
          const handleClickOutside = (event) => {
               if (searchRef.current && !searchRef.current.contains(event.target)) {
                    setShowSearchResults(false);
               }
               if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                    setShowNotifications(false);
               }
               if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
                    setShowQuickActions(false);
               }
          };
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
     }, []);

     // Search functionality
     useEffect(() => {
          const delayDebounce = setTimeout(() => {
               if (searchQuery.length >= 2) {
                    performSearch();
               } else {
                    setSearchResults({ projects: [], users: [] });
               }
          }, 500);
          return () => clearTimeout(delayDebounce);
     }, [searchQuery]);

     const performSearch = async () => {
          if (searchQuery.length < 2) return;
          setSearching(true);
          try {
               const response = await fetch(`/api/ceo/search?q=${encodeURIComponent(searchQuery)}`);
               if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.results || { projects: [], users: [] });
                    setShowSearchResults(true);
               }
          } catch (error) {
               console.error('Search error:', error);
          } finally {
               setSearching(false);
          }
     };

     const handleLogout = async () => {
          const result = await MySwal.fire({
               title: <p className="text-red-700 font-bold">Are you sure?</p>,
               text: "You will need to login again to access the Executive Dashboard.",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#b91c1c',
               cancelButtonColor: '#6b7280',
               confirmButtonText: 'Yes, logout',
               background: '#ffffff',
               customClass: {
                    popup: 'rounded-2xl border border-border-default shadow-xl',
                    confirmButton: 'rounded-xl px-4 py-2 font-medium',
                    cancelButton: 'rounded-xl px-4 py-2 font-medium'
               }
          });

          if (result.isConfirmed) {
               try {
                    const response = await fetch('/api/auth/logout', { method: 'POST' });
                    if (response.ok) {
                         router.push('/login');
                    }
               } catch (error) {
                    MySwal.fire('Error', 'Logout failed. Please try again.', 'error');
               }
          }
     };

     const handleTimeRangeChange = async (range) => {
          setTimeRange(range);
          const rangeStats = await getStatsByTimeRange(range);
          if (rangeStats) {
               console.log('Range stats:', rangeStats);
          }
     };

     const getRiskColor = (risk) => {
          switch (risk) {
               case 'High': return 'text-red-600 font-bold';
               case 'Medium': return 'text-orange-500';
               default: return 'text-text-muted';
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'IN_DEVELOPMENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
               case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
               case 'CLIENT_REVIEW': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
               case 'ON_HOLD': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
               case 'DELAYED': return 'bg-red-500/10 text-red-500 border-red-500/20';
               case 'ACTIVE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
               case 'UPCOMING': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
               default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
          }
     };

     // Chart data configurations
     const portfolioChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
               {
                    label: 'Portfolio Value',
                    data: [65, 72, 78, 85, 82, 88, 92, 95, 98, 102, 108, 115],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
               }
          ]
     };

     const projectStatusData = {
          labels: ['Active', 'In Progress', 'Completed', 'Upcoming'],
          datasets: [
               {
                    data: [
                         stats.activeProjects || 0,
                         stats.inProgressProjects || 0,
                         stats.completedProjects || 0,
                         stats.upcomingProjects || 0
                    ],
                    backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#6b7280'],
                    borderWidth: 0,
                    hoverOffset: 10
               }
          ]
     };

     const managerPerformanceData = {
          labels: managers.slice(0, 5).map(m => m.name?.split(' ')[0] || 'Manager'),
          datasets: [
               {
                    label: 'Performance Score',
                    data: managers.slice(0, 5).map(m => m.performance || 0),
                    backgroundColor: managers.slice(0, 5).map(m =>
                         m.performance >= 90 ? '#10b981' :
                              m.performance >= 75 ? '#2563eb' :
                                   m.performance >= 60 ? '#f59e0b' : '#ef4444'
                    ),
                    borderRadius: 8,
                    barPercentage: 0.6
               }
          ]
     };

     const riskRadarData = {
          labels: ['Budget Risk', 'Timeline Risk', 'Resource Risk', 'Technical Risk', 'Client Risk', 'Compliance Risk'],
          datasets: [
               {
                    label: 'Risk Levels',
                    data: [65, 80, 45, 55, 70, 35],
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: '#ef4444',
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ef4444'
               }
          ]
     };

     const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
               legend: {
                    display: false
               },
               tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
               }
          },
          scales: {
               y: {
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
               },
               x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
               }
          }
     };

     if (loading) {
          return <Spinner title="Executive Dashboard..." />;
     }

     if (error) {
          return (
               <div className="min-h-screen bg-bg-page p-page-x py-page-y flex items-center justify-center">
                    <motion.div
                         initial={{ scale: 0.9, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="text-center max-w-md"
                    >
                         <div className="p-4 bg-red-500/10 rounded-full w-fit mx-auto mb-6">
                              <AlertCircle size={48} className="text-red-500" />
                         </div>
                         <h2 className="text-2xl font-bold text-text-primary mb-2">Error Loading Dashboard</h2>
                         <p className="text-text-muted mb-8">{error}</p>
                         <button
                              onClick={refetch}
                              className="bg-accent text-text-inverse px-8 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
                         >
                              Try Again
                         </button>
                    </motion.div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-gradient-to-br from-bg-page to-bg-surface">
               {/* Background Decorations */}
               <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-secondary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
               </div>

               <main className="relative z-10 p-page-x py-page-y">
                    {/* Top Header */}
                    <motion.header
                         initial={{ opacity: 0, y: -20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                         className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8"
                    >
                         <div className="flex items-start gap-4">
                              <div className="p-3 bg-gradient-to-br from-accent to-accent-active rounded-2xl shadow-lg shadow-accent/20">
                                   <LayoutDashboard className="text-white" size={28} />
                              </div>
                              <div>
                                   <h1 className="text-4xl font-black text-text-primary tracking-tight">
                                        Executive <span className="text-accent">Dashboard</span>
                                   </h1>
                                   <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1 w-10 bg-accent rounded-full"></div>
                                        <p className="text-text-muted">
                                             Welcome back. Here's your organization's health summary.
                                        </p>
                                   </div>
                              </div>
                         </div>

                         <div className="flex items-center gap-3">
                              {/* Quick Actions Dropdown */}
                              <div className="relative" ref={quickActionsRef}>
                                   <button
                                        onClick={() => setShowQuickActions(!showQuickActions)}
                                        className="p-2.5 bg-bg-surface border border-border-default rounded-xl hover:border-accent hover:shadow-md transition-all group"
                                   >
                                        <Rocket size={20} className="text-text-body group-hover:text-accent transition-colors" />
                                   </button>

                                   <AnimatePresence>
                                        {showQuickActions && (
                                             <motion.div
                                                  initial={{ opacity: 0, y: 10 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  exit={{ opacity: 0, y: 10 }}
                                                  className="absolute right-0 mt-2 w-64 bg-bg-surface border border-border-default rounded-2xl shadow-xl z-50 overflow-hidden"
                                             >
                                                  <div className="p-3 border-b border-border-default bg-bg-subtle">
                                                       <p className="text-xs font-bold text-text-muted uppercase">Quick Actions</p>
                                                  </div>
                                                  <div className="p-2">
                                                       <button className="w-full flex items-center gap-3 p-3 hover:bg-bg-subtle rounded-xl transition-colors">
                                                            <Download size={16} className="text-accent" />
                                                            <span className="text-sm">Export Dashboard</span>
                                                       </button>
                                                       <button className="w-full flex items-center gap-3 p-3 hover:bg-bg-subtle rounded-xl transition-colors">
                                                            <Settings size={16} className="text-accent" />
                                                            <span className="text-sm">Dashboard Settings</span>
                                                       </button>
                                                       <button className="w-full flex items-center gap-3 p-3 hover:bg-bg-subtle rounded-xl transition-colors">
                                                            <HelpCircle size={16} className="text-accent" />
                                                            <span className="text-sm">Help & Documentation</span>
                                                       </button>
                                                  </div>
                                             </motion.div>
                                        )}
                                   </AnimatePresence>
                              </div>

                              {/* Time Range Selector */}
                              <select
                                   value={timeRange}
                                   onChange={(e) => handleTimeRangeChange(e.target.value)}
                                   className="px-4 py-2.5 bg-bg-surface border border-border-default rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                              >
                                   <option value="7days">Last 7 Days</option>
                                   <option value="30days">Last 30 Days</option>
                                   <option value="90days">Last 90 Days</option>
                                   <option value="year">This Year</option>
                              </select>

                              {/* Search Bar */}
                              <div className="relative" ref={searchRef}>
                                   <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors" size={18} />
                                        <input
                                             type="text"
                                             value={searchQuery}
                                             onChange={(e) => setSearchQuery(e.target.value)}
                                             onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                                             placeholder="Search projects, managers..."
                                             className="pl-10 pr-10 py-2.5 bg-bg-surface border border-border-default rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none w-64 transition-all"
                                        />
                                        {searching && (
                                             <RefreshCw size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted animate-spin" />
                                        )}
                                        {searchQuery && !searching && (
                                             <button
                                                  onClick={() => {
                                                       setSearchQuery('');
                                                       setSearchResults({ projects: [], users: [] });
                                                  }}
                                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                             >
                                                  <X size={16} />
                                             </button>
                                        )}
                                   </div>

                                   {showSearchResults && (
                                        <SearchResults
                                             results={searchResults}
                                             onClose={() => setShowSearchResults(false)}
                                        />
                                   )}
                              </div>

                              {/* Notifications */}
                              <div className="relative" ref={notificationsRef}>
                                   <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2.5 bg-bg-surface border border-border-default rounded-xl hover:border-accent hover:shadow-md transition-all relative group"
                                   >
                                        <Bell size={20} className="text-text-body group-hover:text-accent transition-colors" />
                                        {alerts.length > 0 && (
                                             <motion.span
                                                  initial={{ scale: 0 }}
                                                  animate={{ scale: 1 }}
                                                  className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-page"
                                             />
                                        )}
                                   </button>

                                   {showNotifications && (
                                        <NotificationsPanel
                                             alerts={alerts}
                                             onClose={() => setShowNotifications(false)}
                                        />
                                   )}
                              </div>

                              {/* Refresh Button */}
                              <button
                                   onClick={refetch}
                                   className="p-2.5 bg-bg-surface border border-border-default rounded-xl hover:border-accent hover:shadow-md transition-all group"
                                   title="Refresh"
                              >
                                   <RefreshCw size={20} className="text-text-body group-hover:text-accent group-hover:rotate-180 transition-all duration-500" />
                              </button>

                             
                         </div>
                    </motion.header>

                    {/* High Level Stats Grid */}
                    <motion.section
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.1 }}
                         className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                    >
                         <StatCard
                              icon={<Briefcase className="text-accent" size={24} />}
                              label="Total Projects"
                              value={stats.totalProjects}
                              subValue={`${stats.activeProjects} active`}
                              change={`${stats.inProgressProjects} in dev`}
                              trend="neutral"
                              color="accent"
                         />
                         <StatCard
                              icon={<DollarSign className="text-green-500" size={24} />}
                              label="Portfolio Value"
                              value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`}
                              subValue={`${stats.completedProjects} completed`}
                              change="+12.4%"
                              trend="up"
                              color="green"
                         />
                         <StatCard
                              icon={<Target className="text-accent-secondary" size={24} />}
                              label="Avg. Progress"
                              value={`${stats.avgProgress}%`}
                              subValue={`${stats.highRiskProjects} at risk`}
                              change={stats.highRiskProjects > 0 ? `${stats.highRiskProjects} high risk` : 'On track'}
                              trend={stats.highRiskProjects > 0 ? 'down' : 'up'}
                              color="accent-secondary"
                         />
                         <StatCard
                              icon={<UserCheck className="text-purple-500" size={24} />}
                              label="Client Approvals"
                              value={`${stats.clientApprovals?.approved || 0}/${stats.clientApprovals?.total || 0}`}
                              subValue={`${stats.clientApprovals?.rate || 0}% rate`}
                              change="+8.3%"
                              trend="up"
                              color="purple"
                         />
                    </motion.section>

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                         {/* Left Column - Charts */}
                         <div className="xl:col-span-8 space-y-8">
                              {/* Portfolio Trend Chart */}
                              <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.5, delay: 0.2 }}
                                   className="bg-gradient-to-br from-bg-surface to-bg-card border border-border-default rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
                              >
                                   <div className="flex items-center justify-between mb-6">
                                        <div>
                                             <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                                  <TrendingUp size={20} className="text-accent" />
                                                  Portfolio Growth Trend
                                             </h3>
                                             <p className="text-sm text-text-muted">Monthly performance overview</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <button className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
                                                  <Eye size={16} className="text-text-muted" />
                                             </button>
                                             <button className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
                                                  <Download size={16} className="text-text-muted" />
                                             </button>
                                        </div>
                                   </div>
                                   <div className="h-80">
                                        <Line data={portfolioChartData} options={chartOptions} />
                                   </div>
                              </motion.div>

                              {/* Project Pipeline & Manager Performance Grid */}
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                   {/* Project Status Distribution */}
                                   <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="bg-gradient-to-br from-bg-surface to-bg-card border border-border-default rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
                                   >
                                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                             <PieChart size={20} className="text-accent" />
                                             Project Status Distribution
                                        </h3>
                                        <div className="h-48 mb-4">
                                             <Doughnut
                                                  data={projectStatusData}
                                                  options={{
                                                       cutout: '70%',
                                                       plugins: {
                                                            legend: { display: false }
                                                       }
                                                  }}
                                             />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                             <StatusLegend color="bg-accent" label="Active" value={stats.activeProjects} />
                                             <StatusLegend color="bg-yellow-500" label="In Progress" value={stats.inProgressProjects} />
                                             <StatusLegend color="bg-green-500" label="Completed" value={stats.completedProjects} />
                                             <StatusLegend color="bg-gray-500" label="Upcoming" value={stats.upcomingProjects} />
                                        </div>
                                   </motion.div>

                                   {/* Manager Performance Chart */}
                                   <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="bg-gradient-to-br from-bg-surface to-bg-card border border-border-default rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
                                   >
                                        <div className="flex items-center justify-between mb-4">
                                             <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                                  <Award size={20} className="text-accent" />
                                                  Top Performers
                                             </h3>
                                             <Link href="/ceo/managers" className="text-sm text-accent hover:underline">
                                                  View All
                                             </Link>
                                        </div>
                                        <div className="h-48">
                                             <Bar data={managerPerformanceData} options={chartOptions} />
                                        </div>
                                   </motion.div>
                              </div>
                         </div>

                         {/* Right Column - Alerts & Quick Stats */}
                         <div className="xl:col-span-4 space-y-8">
                              {/* Critical Alerts */}
                              <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ duration: 0.5, delay: 0.2 }}
                                   className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-3xl text-white shadow-xl shadow-red-500/20"
                              >
                                   <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle size={20} />
                                        <span className="font-bold text-lg">Critical Alerts</span>
                                        <span className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full">
                                             {alerts.length}
                                        </span>
                                   </div>

                                   <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {alerts.length > 0 ? (
                                             alerts.slice(0, 3).map((alert, i) => (
                                                  <AlertItem key={i} alert={alert} />
                                             ))
                                        ) : (
                                             <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                                  <p className="text-sm">No critical alerts at this time</p>
                                             </div>
                                        )}
                                   </div>
                              </motion.div>

                              {/* Risk Radar Chart */}
                              <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ duration: 0.5, delay: 0.3 }}
                                   className="bg-gradient-to-br from-bg-surface to-bg-card border border-border-default rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
                              >
                                   <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                        <Shield size={20} className="text-accent" />
                                        Risk Assessment
                                   </h3>
                                   <div className="h-48">
                                        <Radar data={riskRadarData} options={chartOptions} />
                                   </div>
                              </motion.div>

                              {/* Quick Stats Grid */}
                              <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ duration: 0.5, delay: 0.4 }}
                                   className="grid grid-cols-2 gap-4"
                              >
                                   <QuickStatCard
                                        label="Projects at Risk"
                                        value={stats.highRiskProjects}
                                        icon={<AlertCircle size={18} className="text-red-500" />}
                                        bgColor="bg-red-500/10"
                                        trend={stats.highRiskProjects > 0 ? 'warning' : 'safe'}
                                   />
                                   <QuickStatCard
                                        label="Pending Approvals"
                                        value={stats.pendingApprovals || 0}
                                        icon={<Clock size={18} className="text-yellow-500" />}
                                        bgColor="bg-yellow-500/10"
                                        trend={stats.pendingApprovals > 0 ? 'pending' : 'clear'}
                                   />
                                   <QuickStatCard
                                        label="Active Managers"
                                        value={managers.length}
                                        icon={<Users size={18} className="text-accent" />}
                                        bgColor="bg-accent/10"
                                        trend="active"
                                   />
                                   <QuickStatCard
                                        label="Task Completion"
                                        value={`${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`}
                                        icon={<CheckCircle2 size={18} className="text-green-500" />}
                                        bgColor="bg-green-500/10"
                                        trend="good"
                                   />
                              </motion.div>

                              {/* Approval Queue */}
                              <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ duration: 0.5, delay: 0.5 }}
                                   className="bg-gradient-to-br from-bg-surface to-bg-card border border-border-default rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
                              >
                                   <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                        <UserCheck size={20} className="text-accent" />
                                        Approval Queue
                                   </h3>

                                   <div className="space-y-3">
                                        {approvalQueue.map((item, i) => (
                                             <ApprovalItem key={i} item={item} />
                                        ))}
                                   </div>

                                   <Link
                                        href="/ceo/approvals"
                                        className="block w-full mt-6 py-3 text-center bg-gradient-to-r from-accent to-accent-active text-white rounded-xl font-bold hover:shadow-lg hover:shadow-accent/20 transition-all"
                                   >
                                        Review Approval Queue
                                   </Link>
                              </motion.div>
                         </div>
                    </div>

                    {/* Bottom Section - Project Pipeline Table */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.6 }}
                         className="mt-8 bg-gradient-to-br from-bg-surface to-bg-card border border-border-default rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
                    >
                         <div className="p-6 border-b border-border-default flex items-center justify-between">
                              <div>
                                   <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                        <Layers size={20} className="text-accent" />
                                        High-Priority Project Pipeline
                                   </h3>
                                   <p className="text-sm text-text-muted mt-1">
                                        {filteredProjects.length} projects • {filteredProjects.filter(p => p.risk === 'High').length} at risk
                                   </p>
                              </div>
                              <div className="flex items-center gap-2">
                                   <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-accent'}`}
                                   >
                                        <Grid size={18} />
                                   </button>
                                   <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-accent'}`}
                                   >
                                        <List size={18} />
                                   </button>
                                   <Link
                                        href="/ceo/projects"
                                        className="text-sm text-accent hover:underline ml-4"
                                   >
                                        View all projects →
                                   </Link>
                              </div>
                         </div>

                         {viewMode === 'list' ? (
                              <div className="overflow-x-auto">
                                   <table className="w-full text-left border-collapse">
                                        <thead>
                                             <tr className="bg-bg-subtle/50 text-text-muted text-caption uppercase tracking-wider font-bold">
                                                  <th className="px-6 py-4">Project</th>
                                                  <th className="px-6 py-4">Owner</th>
                                                  <th className="px-6 py-4">Progress</th>
                                                  <th className="px-6 py-4">Status</th>
                                                  <th className="px-6 py-4 text-right">Risk</th>
                                             </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-default">
                                             {filteredProjects.slice(0, 5).map((proj) => (
                                                  <ProjectRow
                                                       key={proj.id}
                                                       project={proj}
                                                       getStatusColor={getStatusColor}
                                                       getRiskColor={getRiskColor}
                                                  />
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                   {filteredProjects.slice(0, 6).map((proj) => (
                                        <ProjectCard
                                             key={proj.id}
                                             project={proj}
                                             getStatusColor={getStatusColor}
                                             getRiskColor={getRiskColor}
                                        />
                                   ))}
                              </div>
                         )}
                    </motion.div>

                    {/* Strategic Insight Banner */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.7 }}
                         className="mt-8 bg-gradient-to-r from-accent to-accent-active rounded-3xl p-8 text-white relative overflow-hidden group"
                    >
                         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
                         <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                              <div className="flex items-center gap-4">
                                   <div className="p-3 bg-white/10 rounded-2xl">
                                        <Sparkles size={32} />
                                   </div>
                                   <div>
                                        <h3 className="text-xl font-bold mb-2">Strategic AI Insight</h3>
                                        <p className="text-white/90 max-w-2xl">
                                             Based on current velocity, <span className="font-bold">{managers[0]?.name || 'Sarah'}'s</span> team is outperforming by 23%.
                                             Consider reallocating resources to the {stats.highRiskProjects} high-risk projects requiring immediate attention.
                                        </p>
                                   </div>
                              </div>
                              <button className="px-6 py-3 bg-white text-accent rounded-xl font-bold hover:shadow-xl hover:shadow-white/20 transition-all group">
                                   View Recommendations
                                   <ChevronRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                              </button>
                         </div>
                    </motion.div>
               </main>

               {/* Custom Scrollbar Styles */}
               <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
          </div>
     );
};

// ========== ENHANCED COMPONENTS ==========

const StatCard = ({ icon, label, value, subValue, change, trend, color }) => {
     const getGradient = () => {
          switch (color) {
               case 'accent': return 'from-accent/20 to-accent/5 border-accent/20';
               case 'green': return 'from-green-500/20 to-green-500/5 border-green-500/20';
               case 'accent-secondary': return 'from-accent-secondary/20 to-accent-secondary/5 border-accent-secondary/20';
               case 'purple': return 'from-purple-500/20 to-purple-500/5 border-purple-500/20';
               default: return 'from-accent/20 to-accent/5 border-accent/20';
          }
     };

     const getTrendColor = () => {
          switch (trend) {
               case 'up': return 'text-green-500';
               case 'down': return 'text-red-500';
               default: return 'text-text-muted';
          }
     };

     const getTrendIcon = () => {
          switch (trend) {
               case 'up': return <ArrowUpRight size={14} />;
               case 'down': return <ArrowDownRight size={14} />;
               default: return null;
          }
     };

     return (
          <motion.div
               whileHover={{ y: -4 }}
               className={`bg-gradient-to-br ${getGradient()} bg-bg-surface border border-border-default p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group`}
          >
               <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-bg-surface rounded-xl group-hover:scale-110 transition-transform">
                         {icon}
                    </div>
                    {change && (
                         <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${getTrendColor()} bg-opacity-10`}>
                              {getTrendIcon()}
                              {change}
                         </div>
                    )}
               </div>
               <p className="text-text-muted text-sm font-medium">{label}</p>
               <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-black text-text-primary">{value}</h3>
                    <span className="text-xs text-text-muted">{subValue}</span>
               </div>
          </motion.div>
     );
};

const ProjectRow = ({ project, getStatusColor, getRiskColor }) => {
     const getRiskIcon = (risk) => {
          if (risk === 'High' || risk === 'HIGH') return <AlertCircle size={16} className="text-red-500" />;
          if (risk === 'Medium' || risk === 'MEDIUM') return <AlertCircle size={16} className="text-orange-500" />;
          return null;
     };

     return (
          <motion.tr
               whileHover={{ backgroundColor: 'rgba(37, 99, 235, 0.02)' }}
               className="hover:bg-bg-subtle/30 transition-colors group cursor-pointer"
          >
               <td className="px-6 py-4">
                    <Link href={`/ceo/projects/${project.id}`} className="block">
                         <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                              {project.name}
                         </p>
                         <p className="text-xs text-text-muted">{project.clientName || 'No client'}</p>
                    </Link>
               </td>
               <td className="px-6 py-4">
                    <Link href={`/ceo/users/${project.manager?.id}`} className="text-sm text-text-body hover:text-accent">
                         {project.manager?.name || 'Unassigned'}
                    </Link>
               </td>
               <td className="px-6 py-4">
                    <div className="w-32">
                         <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-text-primary">{project.progress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                              <motion.div
                                   initial={{ width: 0 }}
                                   animate={{ width: `${project.progress}%` }}
                                   transition={{ duration: 1 }}
                                   className={`h-full transition-all duration-1000 ${project.isDelayed ? 'bg-red-600' : 'bg-accent'}`}
                              />
                         </div>
                         <p className="text-[10px] text-text-muted mt-1">
                              {project.taskStats?.completed || 0}/{project.taskStats?.total || 0} tasks
                         </p>
                    </div>
               </td>
               <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                         {project.status?.replace('_', ' ') || 'Unknown'}
                    </span>
               </td>
               <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                         {getRiskIcon(project.risk)}
                         <span className={`text-sm font-medium ${getRiskColor(project.risk)}`}>
                              {project.risk}
                         </span>
                    </div>
               </td>
          </motion.tr>
     );
};

const ProjectCard = ({ project, getStatusColor, getRiskColor }) => {
     const getRiskIcon = (risk) => {
          if (risk === 'High' || risk === 'HIGH') return <AlertCircle size={16} className="text-red-500" />;
          if (risk === 'Medium' || risk === 'MEDIUM') return <AlertCircle size={16} className="text-orange-500" />;
          return null;
     };

     return (
          <motion.div
               whileHover={{ y: -4 }}
               className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-accent/30 hover:shadow-xl transition-all group"
          >
               <Link href={`/ceo/projects/${project.id}`} className="block">
                    <div className="flex justify-between items-start mb-3">
                         <div>
                              <h4 className="font-bold text-text-primary group-hover:text-accent transition-colors">
                                   {project.name}
                              </h4>
                              <p className="text-xs text-text-muted mt-1">{project.clientName || 'No client'}</p>
                         </div>
                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(project.status)}`}>
                              {project.status?.replace('_', ' ') || 'Unknown'}
                         </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                         <span className="text-xs text-text-muted">Manager</span>
                         <span className="text-sm font-medium text-text-primary">{project.manager?.name || 'Unassigned'}</span>
                    </div>

                    <div className="mb-3">
                         <div className="flex justify-between text-xs mb-1">
                              <span className="text-text-muted">Progress</span>
                              <span className="font-bold text-text-primary border border-accent/80">{project.progress}%</span>
                         </div>
                         <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                              <motion.div
                                   initial={{ width: 0 }}
                                   animate={{ width: `${project.progress}%` }}
                                   transition={{ duration: 1 }}
                                   className={`h-full ${project.isDelayed ? 'bg-red-600' : 'bg-accent'}`}
                              />
                         </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                         <div className="flex items-center gap-2">
                              {getRiskIcon(project.risk)}
                              <span className={`text-xs font-medium ${getRiskColor(project.risk)}`}>
                                   {project.risk} Risk
                              </span>
                         </div>
                         <span className="text-xs text-text-muted">
                              {project.taskStats?.completed || 0}/{project.taskStats?.total || 0} tasks
                         </span>
                    </div>
               </Link>
          </motion.div>
     );
};

const ManagerPerformance = ({ manager }) => {
     const getPerformanceColor = (score) => {
          if (score >= 90) return 'text-green-500';
          if (score >= 75) return 'text-accent';
          if (score >= 60) return 'text-yellow-500';
          return 'text-red-500';
     };

     return (
          <motion.div
               whileHover={{ x: 4 }}
               className="flex items-center gap-4 p-3 rounded-xl hover:bg-bg-subtle/50 transition-all"
          >
               <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                         {manager.avatar ? (
                              <img src={manager.avatar} alt={manager.name} className="w-full h-full rounded-xl object-cover" />
                         ) : (
                              manager.name?.charAt(0) || 'M'
                         )}
                    </div>
                    {manager.performance >= 90 && (
                         <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-bg-surface flex items-center justify-center">
                              <Award size={8} className="text-white" />
                         </div>
                    )}
               </div>

               <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-bold text-text-primary">{manager.name}</span>
                         <span className={`text-sm font-bold ${getPerformanceColor(manager.performance)}`}>
                              {manager.performance}%
                         </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted mb-2">
                         <span>{manager.projects || 0} projects</span>
                         <span>•</span>
                         <span>{manager.delayed || 0} delayed</span>
                    </div>

                    <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                         <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${manager.performance || 0}%` }}
                              transition={{ duration: 1 }}
                              className="h-full bg-accent rounded-full"
                         />
                    </div>
               </div>
          </motion.div>
     );
};

const AlertItem = ({ alert }) => {
     const severityColors = {
          high: 'bg-red-500',
          medium: 'bg-orange-500',
          low: 'bg-yellow-500'
     };

     return (
          <motion.div
               whileHover={{ x: 4 }}
               className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
          >
               <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${severityColors[alert.severity] || 'bg-yellow-500'} animate-pulse`} />
                    <div className="flex-1">
                         <p className="text-sm font-bold">{alert.title || 'Alert'}</p>
                         <p className="text-xs text-white/80 mt-1">{alert.message || 'No details'}</p>
                         {alert.actionable && (
                              <Link
                                   href={alert.actionLink || '#'}
                                   className="inline-block mt-2 text-xs font-bold text-white/90 hover:text-white underline"
                              >
                                   {alert.actionLabel || 'Take Action'} →
                              </Link>
                         )}
                    </div>
               </div>
          </motion.div>
     );
};

const ApprovalItem = ({ item }) => (
     <Link
          href={item.link || '#'}
          className="flex items-center justify-between p-3 rounded-xl bg-bg-subtle hover:bg-border-subtle transition-all group"
     >
          <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${item.color || 'bg-accent'} group-hover:scale-125 transition-transform`} />
               <span className="text-sm font-medium text-text-body">{item.label}</span>
          </div>
          <span className="font-bold text-text-primary">{item.count}</span>
     </Link>
);

const StatusLegend = ({ color, label, value }) => (
     <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${color}`} />
               <span className="text-text-muted">{label}</span>
          </div>
          <span className="font-bold text-text-primary">{value}</span>
     </div>
);

const QuickStatCard = ({ label, value, icon, bgColor, trend }) => {
     const getTrendColor = () => {
          switch (trend) {
               case 'warning': return 'text-red-500';
               case 'pending': return 'text-yellow-500';
               case 'good': return 'text-green-500';
               default: return 'text-text-muted';
          }
     };

     return (
          <motion.div
               whileHover={{ scale: 1.02 }}
               className="bg-bg-surface p-4 rounded-xl border border-border-default shadow-sm hover:shadow-md transition-all"
          >
               <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 ${bgColor} rounded-lg`}>
                         {icon}
                    </div>
                    <span className={`text-xs font-medium ${getTrendColor()}`}>
                         {trend === 'warning' && '⚠️'}
                         {trend === 'pending' && '⏳'}
                         {trend === 'good' && '✓'}
                    </span>
               </div>
               <p className="text-xs text-text-muted mb-1">{label}</p>
               <p className="text-xl font-bold text-text-primary">{value}</p>
          </motion.div>
     );
};

export default App;