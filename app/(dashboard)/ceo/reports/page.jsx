'use client';
import React, { useState, useEffect } from 'react';
import {
     Download, Filter, Clock, AlertTriangle,
     BarChart3, Calendar, ArrowUpRight, ArrowDownRight,
     Users, Briefcase, ChevronRight, MoreHorizontal,
     TrendingUp, Activity, Target, DollarSign,
     PieChart, LineChart, RefreshCw, X,
     Maximize2, Minimize2, FileText, Mail,
     CheckCircle2, AlertCircle, Zap, Award
} from 'lucide-react';
import { useCEOReports } from '../../../../hooks/useCEOReports';
import {
     Chart as ChartJS,
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     BarElement,
     ArcElement,
     Title,
     Tooltip,
     Legend,
     Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from "../../../Components/common/Spinner";

ChartJS.register(
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     BarElement,
     ArcElement,
     Title,
     Tooltip,
     Legend,
     Filler
);

export default function CEOReportsPage() {
     const {
          metrics,
          projectStats,
          revenue,
          velocity,
          managerPerformance,
          statusDistribution,
          risks,
          activities,
          loading,
          error,
          dateRange,
          setDateRange,
          exportReport,
          refetch
     } = useCEOReports();

     const [showDatePicker, setShowDatePicker] = useState(false);
     const [viewMode, setViewMode] = useState('weekly');
     const [fullscreenChart, setFullscreenChart] = useState(null);
     const [selectedManager, setSelectedManager] = useState(null);

     // Chart configurations
     const velocityChartData = {
          labels: velocity.map(v => v.week),
          datasets: [
               {
                    label: 'Tasks Completed',
                    data: velocity.map(v => v.completed),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y',
               },
               {
                    label: 'Estimated Hours',
                    data: velocity.map(v => v.estimated),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
               }
          ]
     };

     const statusChartData = {
          labels: ['Completed', 'In Development', 'Client Review', 'Upcoming', 'Archived'],
          datasets: [
               {
                    data: [
                         statusDistribution.completed,
                         statusDistribution.inDevelopment,
                         statusDistribution.clientReview,
                         statusDistribution.upcoming,
                         statusDistribution.archived
                    ],
                    backgroundColor: [
                         '#10b981',
                         '#2563eb',
                         '#f59e0b',
                         '#6b7280',
                         '#94a3b8'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
               }
          ]
     };

     const revenueChartData = {
          labels: revenue.byProject.slice(0, 5).map(p => p.name),
          datasets: [
               {
                    label: 'Budget ($k)',
                    data: revenue.byProject.slice(0, 5).map(p => p.value / 1000),
                    backgroundColor: '#2563eb80',
                    borderRadius: 8,
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
                    cornerRadius: 8
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

     const velocityOptions = {
          ...chartOptions,
          scales: {
               y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
               },
               y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#94a3b8' }
               }
          }
     };

     if (loading) {
          return
          <Spinner title="CEO Reports..." />;
     }

     if (error) {
          return (
               <div className="min-h-screen bg-bg-page flex items-center justify-center">
                    <div className="text-center max-w-md">
                         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                         <h2 className="text-xl font-bold text-text-primary mb-2">Error Loading Reports</h2>
                         <p className="text-text-muted mb-6">{error}</p>
                         <button
                              onClick={refetch}
                              className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                         >
                              Try Again
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x py-page-y animate-in fade-in duration-700">
               {/* Background Decorations */}
               <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-40 left-20 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl"></div>
               </div>

               {/* 1. EXECUTIVE HEADER */}
               <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col 2xl:flex-row 2xl:items-end justify-between gap-6 mb-12 border-b border-border-subtle pb-8 relative z-10"
               >
                    <div>
                         <nav className="flex items-center gap-2 text-caption font-bold text-accent mb-2 uppercase tracking-widest">
                              <Briefcase size={24} />
                              <span className="text-3xl">Executive Suite</span>
                              <ChevronRight size={12} className="text-text-disabled" />
                              <span className="text-text-muted">Quarterly Analytics</span>
                         </nav>
                        
                    </div>
<div className="flex flex-col lg:flex-row items-start xl:items-center gap-4">
     <div>

                         <h1 className="text-xl mt-4 font-black text-text-primary tracking-tight leading-none">
                              Strategic <span className="text-accent">Overview.</span>
                         </h1>
                         <p className="text-text-muted mt-3 font-medium max-w-md">
                              Real-time operational health and managerial performance metrics.
                         </p>
     </div>
                    <div className=" w-full flex flex-wrap items-center justify-end gap-3">
                         {/* Date Range Selector */}
                         <div className="relative">
                              <button
                                   onClick={() => setShowDatePicker(!showDatePicker)}
                                   className="flex items-center gap-3 bg-bg-card border border-accent/20 px-4 py-3 rounded-2xl shadow-inner hover:border-accent transition-all"
                              >
                                   <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                        <Calendar size={18} />
                                   </div>
                                   <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-black uppercase text-text-disabled leading-none">Reporting Period</span>
                                        <span className="text-ui font-bold text-text-primary">
                                             {dateRange.range === 'week' ? 'Last 7 Days' :
                                                  dateRange.range === 'month' ? 'Last 30 Days' :
                                                       dateRange.range === 'quarter' ? 'Last 90 Days' :
                                                            dateRange.range === 'year' ? 'This Year' : 'Custom Range'}
                                        </span>
                                   </div>
                              </button>

                              <AnimatePresence>
                                   {showDatePicker && (
                                        <motion.div
                                             initial={{ opacity: 0, y: 10 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             exit={{ opacity: 0, y: 10 }}
                                             className="absolute right-0 mt-2 w-72 bg-bg-surface border border-border-default rounded-2xl shadow-xl z-50 p-4"
                                        >
                                             <div className="space-y-3">
                                                  <button
                                                       onClick={() => {
                                                            setDateRange({ range: 'week', from: null, to: null });
                                                            setShowDatePicker(false);
                                                       }}
                                                       className="w-full text-left px-3 py-2 hover:bg-bg-subtle rounded-lg transition-colors"
                                                  >
                                                       Last 7 Days
                                                  </button>
                                                  <button
                                                       onClick={() => {
                                                            setDateRange({ range: 'month', from: null, to: null });
                                                            setShowDatePicker(false);
                                                       }}
                                                       className="w-full text-left px-3 py-2 hover:bg-bg-subtle rounded-lg transition-colors"
                                                  >
                                                       Last 30 Days
                                                  </button>
                                                  <button
                                                       onClick={() => {
                                                            setDateRange({ range: 'quarter', from: null, to: null });
                                                            setShowDatePicker(false);
                                                       }}
                                                       className="w-full text-left px-3 py-2 hover:bg-bg-subtle rounded-lg transition-colors"
                                                  >
                                                       Last 90 Days
                                                  </button>
                                                  <button
                                                       onClick={() => {
                                                            setDateRange({ range: 'year', from: null, to: null });
                                                            setShowDatePicker(false);
                                                       }}
                                                       className="w-full text-left px-3 py-2 hover:bg-bg-subtle rounded-lg transition-colors"
                                                  >
                                                       This Year
                                                  </button>
                                             </div>
                                        </motion.div>
                                   )}
                              </AnimatePresence>
                         </div>

                         {/* Filter Button */}
                         <button className="h-12 w-12 flex items-center justify-center bg-bg-surface border border-border-strong rounded-2xl text-text-body hover:bg-bg-subtle hover:border-accent transition-all active:scale-95">
                              <Filter size={20} />
                         </button>

                         {/* Refresh Button */}
                         <button
                              onClick={refetch}
                              className="h-12 w-12 flex items-center justify-center bg-bg-surface border border-border-strong rounded-2xl text-text-body hover:bg-bg-subtle hover:border-accent transition-all active:scale-95"
                         >
                              <RefreshCw size={20} className="hover:rotate-180 transition-transform duration-500" />
                         </button>

                         {/* Export Button */}
                         <button
                              onClick={() => exportReport('pdf')}
                              className="h-12 flex items-center gap-3 bg-accent text-text-inverse px-6 rounded-2xl text-ui font-black shadow-xl shadow-accent/20 hover:bg-accent-hover hover:-translate-y-0.5 transition-all active:scale-95"
                         >
                              <Download size={18} /> <span>EXPORT ASSETS</span>
                         </button>
                    </div>
</div>
               </motion.header>

               {/* 2. CORE METRICS */}
               <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
               >
                    <MetricCard
                         label="Portfolio Health"
                         value={`${metrics.portfolioHealth}%`}
                         trend={metrics.portfolioHealthTrend}
                         description={`${projectStats.active} active, ${projectStats.completed} completed`}
                         icon={<Activity />}
                         isPositive={metrics.portfolioHealth >= 70}
                         color="accent"
                    />
                    <MetricCard
                         label="Resource Load"
                         value={`${metrics.resourceLoad}%`}
                         trend={metrics.resourceLoadTrend}
                         description={`${projectStats.total} total projects`}
                         icon={<Users />}
                         isPositive={metrics.resourceLoad <= 85}
                         color="accent-secondary"
                    />
                    <MetricCard
                         label="Operational Risk"
                         value={metrics.operationalRisk}
                         trend={metrics.operationalRiskTrend}
                         description={`${risks.length} active risks`}
                         icon={<AlertTriangle />}
                         isPositive={metrics.operationalRisk === 'Low'}
                         color={metrics.operationalRisk === 'Low' ? 'green' : 'orange'}
                    />
                    <MetricCard
                         label="Cycle Efficiency"
                         value={metrics.cycleEfficiency}
                         trend={metrics.cycleEfficiencyTrend}
                         description="Avg. task completion time"
                         icon={<Clock />}
                         isPositive={parseFloat(metrics.cycleEfficiency) < 14}
                         color="purple"
                    />
               </motion.section>

               <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* 3. VELOCITY CHART & PERFORMANCE - Main Canvas */}
                    <div className="xl:col-span-8 space-y-8">

                         {/* Portfolio Velocity Chart */}
                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="bg-bg-surface border border-border-default rounded-[2rem] p-8 shadow-sm relative overflow-hidden group"
                         >
                              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                              <div className="flex justify-between items-start mb-10 relative z-10">
                                   <div>
                                        <h3 className="text-headline font-black text-text-primary tracking-tight flex items-center gap-2">
                                             <TrendingUp size={24} className="text-accent" />
                                             Portfolio Velocity
                                        </h3>
                                        <p className="text-caption text-text-muted font-bold uppercase tracking-wider">
                                             Output vs. Resource Allocation
                                        </p>
                                   </div>
                                   <div className="flex bg-bg-subtle p-1 rounded-xl border border-border-subtle">
                                        <button
                                             onClick={() => setViewMode('weekly')}
                                             className={`px-4 py-1.5 text-[11px] font-black rounded-lg transition-all ${viewMode === 'weekly'
                                                       ? 'bg-bg-surface shadow-sm text-accent'
                                                       : 'text-text-disabled hover:text-text-muted'
                                                  }`}
                                        >
                                             WEEKLY
                                        </button>
                                        <button
                                             onClick={() => setViewMode('monthly')}
                                             className={`px-4 py-1.5 text-[11px] font-black rounded-lg transition-all ${viewMode === 'monthly'
                                                       ? 'bg-bg-surface shadow-sm text-accent'
                                                       : 'text-text-disabled hover:text-text-muted'
                                                  }`}
                                        >
                                             MONTHLY
                                        </button>
                                   </div>
                              </div>

                              <div className="h-80 relative">
                                   <Line data={velocityChartData} options={velocityOptions} />
                              </div>

                              <div className="mt-6 flex items-center justify-center gap-8">
                                   <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-accent rounded-full"></span>
                                        <span className="text-xs text-text-muted">Tasks Completed</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-accent-secondary rounded-full"></span>
                                        <span className="text-xs text-text-muted">Estimated Hours</span>
                                   </div>
                              </div>
                         </motion.div>

                         {/* Efficiency Table */}
                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                              className="bg-bg-surface border border-border-default rounded-[2rem] overflow-hidden shadow-sm"
                         >
                              <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center">
                                   <h3 className="font-black text-text-primary tracking-tight flex items-center gap-2">
                                        <Award size={20} className="text-accent" />
                                        Managerial Accountability
                                   </h3>
                                   <button className="p-2 hover:bg-bg-subtle rounded-xl transition-colors text-text-muted">
                                        <MoreHorizontal size={20} />
                                   </button>
                              </div>
                              <div className="overflow-x-auto">
                                   <table className="w-full text-left border-collapse">
                                        <thead>
                                             <tr className="bg-bg-subtle/50">
                                                  <th className="pl-8 pr-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Lead Name</th>
                                                  <th className="px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Projects</th>
                                                  <th className="px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Task Throughput</th>
                                                  <th className="px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Efficiency</th>
                                                  <th className="pl-4 pr-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Status</th>
                                             </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-subtle">
                                             {managerPerformance.map((row, i) => (
                                                  <ManagerRow
                                                       key={i}
                                                       row={row}
                                                       onClick={() => setSelectedManager(row)}
                                                  />
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         </motion.div>
                    </div>

                    {/* 4. RISK & LOGS - Sidebar */}
                    <div className="xl:col-span-4 space-y-8">

                         {/* Status Distribution */}
                         <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="bg-bg-surface border border-border-default rounded-[2rem] p-8 shadow-sm"
                         >
                              <h3 className="font-black text-text-primary mb-6 flex items-center gap-2">
                                   <PieChart size={20} className="text-accent" />
                                   Status Mix
                              </h3>
                              <div className="h-48 mb-6">
                                   <Doughnut
                                        data={statusChartData}
                                        options={{
                                             cutout: '70%',
                                             plugins: {
                                                  legend: { display: false }
                                             }
                                        }}
                                   />
                              </div>
                              <div className="space-y-3">
                                   <StatusProgress
                                        label="Completed"
                                        count={statusDistribution.completed}
                                        total={projectStats.total}
                                        color="#10b981"
                                   />
                                   <StatusProgress
                                        label="In Development"
                                        count={statusDistribution.inDevelopment}
                                        total={projectStats.total}
                                        color="#2563eb"
                                   />
                                   <StatusProgress
                                        label="Client Review"
                                        count={statusDistribution.clientReview}
                                        total={projectStats.total}
                                        color="#f59e0b"
                                   />
                                   <StatusProgress
                                        label="Upcoming"
                                        count={statusDistribution.upcoming}
                                        total={projectStats.total}
                                        color="#6b7280"
                                   />
                              </div>
                         </motion.div>

                         {/* Priority Risks */}
                         <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                              className="bg-bg-card border border-border-default rounded-[2rem] p-8 shadow-sm"
                         >
                              <h3 className="text-headline font-black text-text-primary mb-8 flex items-center gap-3">
                                   <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                        <AlertTriangle size={18} />
                                   </div>
                                   Priority Risks
                                   {risks.length > 0 && (
                                        <span className="ml-auto text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
                                             {risks.length} active
                                        </span>
                                   )}
                              </h3>
                              <div className="space-y-4">
                                   {risks.map((risk, i) => (
                                        <RiskItem key={i} risk={risk} />
                                   ))}
                                   {risks.length === 0 && (
                                        <div className="p-6 text-center text-text-muted border border-dashed border-border-default rounded-2xl">
                                             <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
                                             <p>No active risks detected</p>
                                        </div>
                                   )}
                              </div>
                         </motion.div>

                         {/* Activity Feed */}
                         <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className="bg-bg-surface border border-border-default rounded-[2rem] p-8 shadow-sm"
                         >
                              <div className="flex justify-between items-center mb-8">
                                   <h3 className="font-black text-text-primary tracking-tight flex items-center gap-2">
                                        <Activity size={20} className="text-accent" />
                                        Activity Feed
                                   </h3>
                                   <button className="text-[10px] font-black text-accent uppercase hover:underline">See All</button>
                              </div>
                              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-border-subtle">
                                   {activities.map((activity, i) => (
                                        <ActivityItem key={i} activity={activity} />
                                   ))}
                                   {activities.length === 0 && (
                                        <p className="text-center text-text-muted py-4">No recent activities</p>
                                   )}
                              </div>
                         </motion.div>

                         {/* Revenue Snapshot */}
                         <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                              className="bg-gradient-to-br from-accent to-accent-active rounded-[2rem] p-8 text-white"
                         >
                              <div className="flex items-center justify-between mb-4">
                                   <h3 className="font-black text-lg flex items-center gap-2">
                                        <DollarSign size={20} />
                                        Revenue Snapshot
                                   </h3>
                                   <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                        +{revenue.growth.toFixed(1)}% growth
                                   </span>
                              </div>
                              <p className="text-4xl font-black mb-2">${(revenue.total / 1000000).toFixed(1)}M</p>
                              <p className="text-sm opacity-80 mb-4">Total portfolio value</p>
                              <div className="h-32">
                                   <Bar
                                        data={revenueChartData}
                                        options={{
                                             ...chartOptions,
                                             plugins: {
                                                  ...chartOptions.plugins,
                                                  legend: { display: false }
                                             },
                                             scales: {
                                                  y: {
                                                       grid: { color: 'rgba(255,255,255,0.1)' },
                                                       ticks: { color: 'rgba(255,255,255,0.8)' }
                                                  },
                                                  x: {
                                                       ticks: { color: 'rgba(255,255,255,0.8)' }
                                                  }
                                             }
                                        }}
                                   />
                              </div>
                         </motion.div>
                    </div>
               </div>
          </div>
     );
}

// --- SUB-COMPONENTS ---

function MetricCard({ label, value, trend, description, icon, isPositive, color }) {
     const getColorClasses = () => {
          switch (color) {
               case 'accent': return 'from-accent/20 to-accent/5 border-accent/20';
               case 'accent-secondary': return 'from-accent-secondary/20 to-accent-secondary/5 border-accent-secondary/20';
               case 'green': return 'from-green-500/20 to-green-500/5 border-green-500/20';
               case 'orange': return 'from-orange-500/20 to-orange-500/5 border-orange-500/20';
               case 'purple': return 'from-purple-500/20 to-purple-500/5 border-purple-500/20';
               default: return 'from-accent/20 to-accent/5 border-accent/20';
          }
     };

     return (
          <motion.div
               whileHover={{ y: -2 }}
               className={`bg-gradient-to-br ${getColorClasses()} bg-bg-surface border border-border-default p-5 xl:p-7 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-transparent hover:border-b-accent`}
          >
               <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-bg-surface rounded-2xl text-text-muted group-hover:text-accent group-hover:bg-accent/5 transition-colors">
                         {React.cloneElement(icon, { size: 24 })}
                    </div>
                    <div className={`flex items-center gap-1 text-caption font-black ${isPositive ? 'text-accent-secondary' : 'text-orange-500'}`}>
                         {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                         {trend}
                    </div>
               </div>
               <p className="text-[10px] font-black text-text-disabled uppercase tracking-[0.2em] mb-1">{label}</p>
               <h2 className="text-headline-lg font-black text-text-primary leading-none mb-3 tracking-tighter">{value}</h2>
               <p className="text-caption text-text-muted font-medium">{description}</p>
          </motion.div>
     );
}

function StatusProgress({ label, count, total, color }) {
     const percentage = total > 0 ? (count / total) * 100 : 0;
     return (
          <div className="group cursor-default">
               <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold text-text-body">{label}</span>
                    <span className="text-[11px] font-black text-text-primary">{count}</span>
               </div>
               <div className="h-2 bg-bg-subtle rounded-full overflow-hidden border border-border-subtle">
                    <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110"
                         style={{ backgroundColor: color }}
                    />
               </div>
          </div>
     );
}

function ManagerRow({ row, onClick }) {
     const getStatusColor = (status) => {
          switch (status) {
               case 'Optimal': return 'bg-green-500/10 text-green-600 border-green-500/20';
               case 'Watch': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
               case 'Critical': return 'bg-red-500/10 text-red-600 border-red-500/20';
               default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
          }
     };

     return (
          <motion.tr
               whileHover={{ backgroundColor: 'rgba(37, 99, 235, 0.02)' }}
               onClick={onClick}
               className="hover:bg-bg-subtle/30 transition-colors group cursor-pointer"
          >
               <td className="pl-8 pr-4 py-5">
                    <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-black text-accent text-xs">
                              {row.name.split(' ').map(n => n[0]).join('')}
                         </div>
                         <div>
                              <p className="text-ui font-bold text-text-primary group-hover:text-accent transition-colors">
                                   {row.name}
                              </p>
                              <p className="text-[10px] text-text-muted font-medium">{row.role}</p>
                         </div>
                    </div>
               </td>
               <td className="px-4 py-5 text-center font-bold text-text-body">{row.projects}</td>
               <td className="px-4 py-5 font-mono text-xs font-bold text-text-muted">{row.tasks}</td>
               <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                         <div className="flex-1 h-1.5 bg-border-subtle rounded-full overflow-hidden min-w-[60px]">
                              <div
                                   className={`h-full rounded-full ${row.efficiency > 80 ? 'bg-green-500' : row.efficiency > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                   style={{ width: `${row.efficiency}%` }}
                              />
                         </div>
                         <span className="text-xs font-black text-text-primary">{row.efficiency}%</span>
                    </div>
               </td>
               <td className="pl-4 pr-8 py-5 text-right">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(row.status)}`}>
                         {row.status}
                    </span>
               </td>
          </motion.tr>
     );
}

function RiskItem({ risk }) {
     const severityColors = {
          CRITICAL: 'bg-red-500 text-white border-red-500/20',
          HIGH: 'bg-orange-500 text-white border-orange-500/20',
          MEDIUM: 'bg-yellow-500 text-white border-yellow-500/20',
          LOW: 'bg-green-500 text-white border-green-500/20'
     };

     return (
          <motion.div
               whileHover={{ x: 4 }}
               className="p-5 rounded-2xl bg-bg-surface border border-border-subtle hover:border-orange-500/30 transition-all shadow-sm"
          >
               <div className="flex justify-between items-start mb-2">
                    <h4 className="text-ui font-black text-text-primary tracking-tight leading-tight">{risk.title}</h4>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${severityColors[risk.severity]}`}>
                         {risk.severity}
                    </span>
               </div>
               <p className="text-[11px] text-text-muted mb-2">
                    Project: <span className="text-text-body font-bold underline decoration-orange-500/20">{risk.project}</span>
               </p>
               <div className="text-[10px] text-orange-700 bg-orange-50 p-2 rounded-lg font-bold flex items-center gap-2">
                    <AlertTriangle size={12} /> {risk.reason}
               </div>
          </motion.div>
     );
}

function ActivityItem({ activity }) {
     const getIcon = (type) => {
          switch (type) {
               case 'revenue': return <ArrowUpRight size={12} className="text-green-500" />;
               case 'project': return <Briefcase size={12} className="text-accent" />;
               default: return <Activity size={12} className="text-accent" />;
          }
     };

     return (
          <div className="pl-9 relative">
               <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-bg-surface border border-border-default flex items-center justify-center text-accent shadow-sm">
                    {getIcon(activity.icon)}
               </div>
               <h4 className="text-ui font-bold text-text-primary leading-none mb-1">{activity.title}</h4>
               <p className="text-[11px] text-text-muted font-medium mb-1">{activity.meta}</p>
               <p className="text-[9px] text-text-disabled font-black uppercase">{activity.time}</p>
          </div>
     );
}