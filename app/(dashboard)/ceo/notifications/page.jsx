'use client';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Users,
  Target,
  MessageSquare,
  Download,
  Filter,
  X,
  CheckCheck,
  Calendar,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Inbox,
  Star,
  Flag,
  Zap,
  Eye,
  EyeOff,
  Archive,
  Trash2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { useCEONotifications } from '../../../../hooks/useCEONotifications';
import { NOTIFICATION_TYPES, NOTIFICATION_ICONS, getNotificationPriority, getNotificationActionLabel } from '../../../../lib/notifications/notificationTypes';
import Spinner from '../../../Components/common/Spinner';     

export default function CEONotificationsPage() {
  const {
    notifications,
    allNotifications,
    unreadCount,
    loading,
    error,
    filters,
    setFilters,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    getStats,
    refetch
  } = useCEONotifications();

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'unread', 'archived'
  const [selectedType, setSelectedType] = useState('all');

  const stats = getStats();

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.TASK_ASSIGNED:
        return <Briefcase className="text-accent" size={20} />;
      case NOTIFICATION_TYPES.TASK_COMPLETED:
        return <CheckCircle2 className="text-green-500" size={20} />;
      case NOTIFICATION_TYPES.TASK_REVIEW:
        return <Eye className="text-yellow-500" size={20} />;
      case NOTIFICATION_TYPES.MILESTONE_REACHED:
        return <Target className="text-purple-500" size={20} />;
      case NOTIFICATION_TYPES.PROJECT_UPDATE:
        return <RefreshCw className="text-blue-500" size={20} />;
      case NOTIFICATION_TYPES.FEEDBACK_RECEIVED:
        return <MessageSquare className="text-accent-secondary" size={20} />;
      case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
        return <Clock className="text-orange-500" size={20} />;
      case NOTIFICATION_TYPES.SYSTEM_ALERT:
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Bell className="text-text-muted" size={20} />;
    }
  };

  const getPriorityColor = (type) => {
    const priority = getNotificationPriority(type);
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (loading && notifications.length === 0) {
    return <Spinner title="Notifications..." />;
  }

  return (
    <div className="min-h-screen bg-bg-page p-page-x py-page-y">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-2xl relative">
                <Bell className="text-accent" size={28} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-bg-page">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-black text-text-primary tracking-tight">Notifications Center</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-10 bg-accent rounded-full"></div>
                  <p className="text-text-muted font-medium">
                    Stay updated with critical business events
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Stats Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-3 bg-bg-surface border border-border-default rounded-xl hover:border-accent hover:shadow-md transition-all"
            >
              <Target size={20} className="text-text-body" />
            </button>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 bg-bg-surface border rounded-xl transition-all ${showFilters
                  ? 'border-accent text-accent shadow-lg shadow-accent/20'
                  : 'border-border-default text-text-body hover:border-accent hover:shadow-md'
                }`}
            >
              <Filter size={20} />
            </button>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-3 bg-accent text-text-inverse rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
              >
                <CheckCheck size={18} />
                Mark All Read
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={refetch}
              className="p-3 bg-bg-surface border border-border-default rounded-xl hover:border-accent hover:shadow-md transition-all group"
            >
              <RefreshCw size={20} className="text-text-body group-hover:text-accent group-hover:rotate-180 transition-all duration-500" />
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-6"
            >
              <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-4 bg-bg-subtle rounded-xl">
                    <p className="text-xs text-text-muted mb-1">Total Notifications</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                  </div>
                  <div className="p-4 bg-bg-subtle rounded-xl">
                    <p className="text-xs text-text-muted mb-1">Unread</p>
                    <p className="text-2xl font-bold text-red-500">{stats.unread}</p>
                  </div>
                  <div className="p-4 bg-bg-subtle rounded-xl">
                    <p className="text-xs text-text-muted mb-1">Read</p>
                    <p className="text-2xl font-bold text-green-500">{stats.read}</p>
                  </div>
                  <div className="p-4 bg-bg-subtle rounded-xl">
                    <p className="text-xs text-text-muted mb-1">By Type</p>
                    <div className="flex gap-2 mt-2">
                      {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => (
                        <span key={type} className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                          {NOTIFICATION_ICONS[type]} {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-6"
            >
              <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-lg">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-bg-subtle rounded-lg">
                    <Filter size={16} className="text-accent" />
                    <span className="text-sm font-medium text-text-primary">Filters:</span>
                  </div>

                  {/* Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setFilters(prev => ({ ...prev, type: e.target.value }));
                    }}
                    className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none min-w-[160px]"
                  >
                    <option value="all">All Types</option>
                    <option value={NOTIFICATION_TYPES.SYSTEM_ALERT}>System Alerts</option>
                    <option value={NOTIFICATION_TYPES.DEADLINE_APPROACHING}>Deadlines</option>
                    <option value={NOTIFICATION_TYPES.TASK_REVIEW}>Task Reviews</option>
                    <option value={NOTIFICATION_TYPES.MILESTONE_REACHED}>Milestones</option>
                    <option value={NOTIFICATION_TYPES.FEEDBACK_RECEIVED}>Feedback</option>
                  </select>

                  {/* Read Status Filter */}
                  <select
                    value={filters.readStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, readStatus: e.target.value }))}
                    className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                  </select>

                  {/* Date Range Filter */}
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex bg-bg-subtle p-1 rounded-lg border border-border-default">
                    <button
                      onClick={() => setViewMode('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'all'
                          ? 'bg-bg-surface text-accent shadow-sm'
                          : 'text-text-muted hover:text-text-primary'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setViewMode('unread')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'unread'
                          ? 'bg-bg-surface text-accent shadow-sm'
                          : 'text-text-muted hover:text-text-primary'
                        }`}
                    >
                      Unread
                    </button>
                  </div>

                  {/* Clear Filters */}
                  {(filters.type !== 'all' || filters.readStatus !== 'all' || filters.dateRange !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedType('all');
                        setFilters({ type: 'all', readStatus: 'all', dateRange: 'all' });
                      }}
                      className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
                    >
                      <X size={16} />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Summary Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Priority Summary */}
          <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Flag size={16} className="text-accent" />
              Priority Breakdown
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    High Priority
                  </span>
                  <span className="font-bold">
                    {allNotifications.filter(n => getNotificationPriority(n.type) === 'high').length}
                  </span>
                </div>
                <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(allNotifications.filter(n => getNotificationPriority(n.type) === 'high').length / allNotifications.length) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Medium Priority
                  </span>
                  <span className="font-bold">
                    {allNotifications.filter(n => getNotificationPriority(n.type) === 'medium').length}
                  </span>
                </div>
                <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${(allNotifications.filter(n => getNotificationPriority(n.type) === 'medium').length / allNotifications.length) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Low Priority
                  </span>
                  <span className="font-bold">
                    {allNotifications.filter(n => getNotificationPriority(n.type) === 'low').length}
                  </span>
                </div>
                <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(allNotifications.filter(n => getNotificationPriority(n.type) === 'low').length / allNotifications.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="w-full flex items-center gap-3 p-3 hover:bg-bg-subtle rounded-xl transition-colors disabled:opacity-50"
              >
                <div className="p-2 bg-accent/10 rounded-lg">
                  <CheckCheck size={16} className="text-accent" />
                </div>
                <span className="text-sm font-medium">Mark All as Read</span>
              </button>
              <button
                onClick={() => setFilters({ type: 'all', readStatus: 'unread', dateRange: 'all' })}
                className="w-full flex items-center gap-3 p-3 hover:bg-bg-subtle rounded-xl transition-colors"
              >
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Eye size={16} className="text-yellow-500" />
                </div>
                <span className="text-sm font-medium">View Unread Only</span>
              </button>
              <button
                onClick={() => setFilters({ type: NOTIFICATION_TYPES.SYSTEM_ALERT, readStatus: 'all', dateRange: 'all' })}
                className="w-full flex items-center gap-3 p-3 hover:bg-bg-subtle rounded-xl transition-colors"
              >
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <span className="text-sm font-medium">View Alerts Only</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Settings size={16} className="text-accent" />
              Notification Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Email Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Push Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Sound Alerts</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Content - Notifications List */}
        <div className="lg:col-span-3">
          {notifications.length === 0 ? (
            <div className="bg-bg-surface border-2 border-dashed border-border-default rounded-2xl p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-6">
                  <Inbox size={48} className="text-text-disabled" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">All Caught Up! 🎉</h3>
                <p className="text-text-muted mb-8">
                  {filters.type !== 'all' || filters.readStatus !== 'all' || filters.dateRange !== 'all'
                    ? 'No notifications match your current filters.'
                    : 'You have no notifications at the moment. New notifications will appear here when important events occur.'}
                </p>
                {(filters.type !== 'all' || filters.readStatus !== 'all' || filters.dateRange !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedType('all');
                      setFilters({ type: 'all', readStatus: 'all', dateRange: 'all' });
                    }}
                    className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                <div key={date}>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
                    {new Date(date).toDateString() === new Date().toDateString()
                      ? 'Today'
                      : new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString()
                        ? 'Yesterday'
                        : format(new Date(date), 'MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-3">
                    {dateNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onClick={handleNotificationClick}
                        getNotificationIcon={getNotificationIcon}
                        getPriorityColor={getPriorityColor}
                        getNotificationActionLabel={getNotificationActionLabel}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Card Component
function NotificationCard({
  notification,
  onMarkRead,
  onClick,
  getNotificationIcon,
  getPriorityColor,
  getNotificationActionLabel
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    onClick(notification);
  };

  const handleMarkRead = (e) => {
    e.stopPropagation();
    onMarkRead(notification.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative bg-bg-surface border rounded-2xl transition-all cursor-pointer ${notification.isRead
          ? 'border-border-default hover:border-accent/30'
          : 'border-accent/30 bg-accent/5 hover:border-accent'
        }`}
      onClick={handleClick}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-accent rounded-r-full" />
      )}

      <div className="p-6">
        <div className="flex gap-4">
          {/* Icon */}
          <div className={`relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${notification.isRead ? 'bg-bg-subtle' : 'bg-accent/10'
            }`}>
            {getNotificationIcon(notification.type)}
            {!notification.isRead && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className={`text-ui font-bold mb-1 ${notification.isRead ? 'text-text-primary' : 'text-text-primary'
                  }`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-text-muted line-clamp-2">
                  {notification.message}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getPriorityColor(notification.type)}`}>
                    {getNotificationPriority(notification.type).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-text-muted font-medium flex items-center gap-1">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  {notification.metadata?.projectName && (
                    <span className="text-[10px] text-accent font-medium flex items-center gap-1">
                      <Briefcase size={10} />
                      {notification.metadata.projectName}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                {notification.link && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="mt-3 text-xs text-accent hover:text-accent-hover font-bold flex items-center gap-1"
                  >
                    {getNotificationActionLabel(notification.type)}
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <button
                    onClick={handleMarkRead}
                    className="p-2 hover:bg-bg-surface rounded-lg text-text-muted hover:text-accent transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-2 hover:bg-bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && notification.metadata && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {Object.entries(notification.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-text-muted capitalize">{key}: </span>
                          <span className="text-text-primary font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2"
          >
            {!notification.isRead && (
              <button
                onClick={handleMarkRead}
                className="p-2 bg-accent text-white rounded-lg shadow-lg hover:bg-accent-hover transition-colors"
                title="Mark as read"
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button
              className="p-2 bg-bg-surface text-text-muted rounded-lg shadow-lg hover:text-red-500 transition-colors"
              title="Archive"
            >
              <Archive size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}