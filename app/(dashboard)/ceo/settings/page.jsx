// app/(dashboard)/ceo/settings/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  Shield,
  Briefcase,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Edit,
  Copy,
  Send,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Award,
  Calendar,
  Phone,
  X,
  Save,
  AlertTriangle,
  Info,
  Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);


const CEOSettingsPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    ceo: 0,
    projectManagers: 0,
    teamLeads: 0,
    developers: 0
  });

  // Load team members on component mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Fetch team members from API
  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ceo/team');
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      setTeamMembers(data.members || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error loading team members:', error);
      // Show error toast here
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on search and filters
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = searchQuery === '' ||
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role badge styling
  const getRoleBadgeStyle = (role) => {
    const styles = {
      'CEO': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'PROJECT_MANAGER': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'TEAM_LEAD': 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20',
      'DEVELOPER': 'bg-green-500/10 text-green-500 border-green-500/20'
    };
    return styles[role] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Active' },
      'PENDING': { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Pending' },
      'INACTIVE': { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'Inactive' },
      'SUSPENDED': { icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Suspended' }
    };

    const badge = badges[status] || badges['PENDING'];
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badge.bg} ${badge.color} border ${badge.border}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-bg-page p-page-x py-page-y">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Team Settings</h1>
          <p className="text-text-muted mt-1">Manage team members, roles, and access permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTeamMembers}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-text-inverse rounded-lg font-medium hover:bg-accent-hover transition-all"
          >
            <UserPlus size={18} />
            Invite Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <StatCard icon={<Users />} label="Total" value={stats.total} color="accent" />
        <StatCard icon={<UserCheck />} label="Active" value={stats.active} color="green" />
        <StatCard icon={<Clock />} label="Pending" value={stats.pending} color="yellow" />
        <StatCard icon={<UserX />} label="Suspended" value={stats.suspended} color="red" />
        <StatCard icon={<Award />} label="CEO" value={stats.ceo} color="purple" />
        <StatCard icon={<Briefcase />} label="PMs" value={stats.projectManagers} color="blue" />
        <StatCard icon={<Users />} label="Leads" value={stats.teamLeads} color="teal" />
        <StatCard icon={<Users />} label="Devs" value={stats.developers} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 min-w-[140px]"
          >
            <option value="all">All Roles</option>
            <option value="CEO">CEO</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="DEVELOPER">Developer</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-subtle border-b border-border-default">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Last Active</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-muted">
                    No team members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-bg-subtle/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-accent font-bold text-lg">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            member.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{member.name}</p>
                          <p className="text-xs text-text-muted">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full border ${getRoleBadgeStyle(member.role)}`}>
                        {member.role?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                    <td className="px-6 py-4 text-sm text-text-body">{member.department || '-'}</td>
                    <td className="px-6 py-4 text-sm text-text-body">
                      {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-bg-surface rounded-lg transition-colors">
                        <MoreVertical size={16} className="text-text-muted" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={loadTeamMembers}
      />

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={loadTeamMembers}
        />
      )}
    </div>
  );
};

// Simplified Stat Card
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    accent: 'bg-accent/10 text-accent',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
    blue: 'bg-blue-500/10 text-blue-500',
    teal: 'bg-accent-secondary/10 text-accent-secondary'
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-4 hover:border-accent/30 transition-all">
      <div className={`p-2 ${colorClasses[color]} rounded-lg w-fit mb-2`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
};

// Simplified Invite Modal
const InviteMemberModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'DEVELOPER',
    department: '',
    jobTitle: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.role) return 'Role is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/ceo/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team member');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '', email: '', role: 'DEVELOPER', department: '',
          jobTitle: '', phone: '', password: '', confirmPassword: ''
        });
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password, confirmPassword: password });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto chat-scroll ">
        <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">Invite Team Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">Team member added successfully!</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                placeholder="john@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                required
              >
                <option value="CEO">CEO</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="DEVELOPER">Developer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="Senior Developer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="border-t border-border-default pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-primary">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  Generate
                </button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border-default rounded-lg text-sm font-medium text-text-muted hover:bg-bg-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-accent text-text-inverse rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simplified Member Details Modal
const MemberDetailsModal = ({ member, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(member);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const showSuccessAlert = (title, message) => {
    MySwal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
      background: '#1e293b',
      color: '#fff',
      iconColor: '#10b981',
      customClass: {
        popup: 'rounded-xl shadow-xl border border-green-500/20'
      }
    });
  };

  const showErrorAlert = (title, message) => {
    MySwal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#b91c1c',
      background: '#1e293b',
      color: '#fff',
      iconColor: '#ef4444',
      customClass: {
        confirmButton: 'rounded-lg px-6 py-2 text-sm font-medium',
        popup: 'rounded-xl shadow-xl border border-red-500/20'
      }
    });
  };

  const showConfirmDialog = async (title, text, icon, confirmButtonColor, confirmText) => {
    const result = await MySwal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      background: '#1e293b',
      color: '#fff',
      iconColor: icon === 'warning' ? '#f59e0b' : icon === 'error' ? '#ef4444' : '#10b981',
      customClass: {
        confirmButton: 'rounded-lg px-6 py-2 text-sm font-medium',
        cancelButton: 'rounded-lg px-6 py-2 text-sm font-medium',
        popup: 'rounded-xl shadow-xl border border-border-default'
      }
    });
    return result.isConfirmed;
  };


  const handleUpdate = async () => {
    // Validate form
    if (!formData.name?.trim()) {
      showErrorAlert('Validation Error', 'Name is required');
      return;
    }
    if (!formData.email?.trim()) {
      showErrorAlert('Validation Error', 'Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showErrorAlert('Validation Error', 'Invalid email format');
      return;
    }

    // Show loading state
    const loadingAlert = MySwal.fire({
      title: 'Updating...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
      background: '#1e293b',
      color: '#fff'
    });

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        department: formData.department,
        jobTitle: formData.jobTitle,
        phone: formData.phone
      };

      const response = await fetch(`/api/ceo/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member');
      }

      await MySwal.close();
      showSuccessAlert('Success!', 'Member profile updated successfully');

      setIsEditing(false);
      onUpdate();
    } catch (err) {
      await MySwal.close();
      setError(err.message);
      showErrorAlert('Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const action = newStatus === 'ACTIVE' ? 'activate' : 'suspend';
    const isConfirmed = await showConfirmDialog(
      `${action === 'suspend' ? 'Suspend' : 'Activate'} Member?`,
      `Are you sure you want to ${action} ${member.name}?`,
      'warning',
      action === 'suspend' ? '#b91c1c' : '#10b981',
      `Yes, ${action}`
    );

    if (!isConfirmed) return;

    // Show loading
    MySwal.fire({
      title: 'Processing...',
      text: `Please wait while we ${action} the member`,
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
      background: '#1e293b',
      color: '#fff'
    });

    try {
      const response = await fetch(`/api/ceo/team/${member.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} member`);
      }

      await MySwal.close();
      showSuccessAlert(
        action === 'suspend' ? 'Member Suspended' : 'Member Activated',
        `${member.name} has been ${action === 'suspend' ? 'suspended' : 'activated'} successfully`
      );

      onUpdate();
    } catch (err) {
      await MySwal.close();
      console.error('Error updating status:', err);
      showErrorAlert(
        action === 'suspend' ? 'Suspension Failed' : 'Activation Failed',
        err.message
      );
    }
  };

  const handleResetPassword = async () => {
    const isConfirmed = await showConfirmDialog(
      'Reset Password?',
      `A new password will be generated for ${member.name}. They will receive an email with instructions.`,
      'question',
      '#2563eb',
      'Yes, reset password'
    );

    if (!isConfirmed) return;

    // Show loading
    MySwal.fire({
      title: 'Resetting Password...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
      background: '#1e293b',
      color: '#fff'
    });

    try {
      const response = await fetch(`/api/ceo/team/${member.id}/reset-password`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      await MySwal.close();

      // Show success with temporary password in development
      if (data.newPassword) {
        await MySwal.fire({
          icon: 'success',
          title: 'Password Reset Successfully',
          html: `
            <div class="text-left">
              <p class="mb-3">New password generated for ${member.name}:</p>
              <div class="bg-gray-800 p-3 rounded-lg font-mono text-sm mb-3">
                ${data.newPassword}
              </div>
              <p class="text-xs text-gray-400">Make sure to save this password. It won't be shown again.</p>
            </div>
          `,
          confirmButtonColor: '#2563eb',
          background: '#1e293b',
          color: '#fff',
          customClass: {
            confirmButton: 'rounded-lg px-6 py-2 text-sm font-medium'
          }
        });
      } else {
        showSuccessAlert(
          'Password Reset',
          `Password reset email sent to ${member.email}`
        );
      }
    } catch (err) {
      await MySwal.close();
      console.error('Error resetting password:', err);
      showErrorAlert('Password Reset Failed', err.message);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await showConfirmDialog(
      'Delete Member?',
      `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
      'error',
      '#b91c1c',
      'Yes, delete permanently'
    );

    if (!isConfirmed) return;

    // Show loading
    MySwal.fire({
      title: 'Deleting...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
      background: '#1e293b',
      color: '#fff'
    });

    try {
      const response = await fetch(`/api/ceo/team/${member.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete member');
      }

      await MySwal.close();
      showSuccessAlert(
        'Member Deleted',
        `${member.name} has been removed from the team`
      );

      onClose(); // Close the modal
      onUpdate(); // Refresh the list
    } catch (err) {
      await MySwal.close();
      console.error('Error deleting member:', err);
      showErrorAlert('Delete Failed', err.message);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto chat-scroll ">
        <div className="sticky top-0 bg-bg-surface border-b border-border-default p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center text-accent font-bold text-xl">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.name?.charAt(0) || '?'
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{member.name}</h2>
              <p className="text-sm text-text-muted">{member.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-subtle border border-border-default rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-subtle border border-border-default rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-subtle border border-border-default rounded-lg"
                  >
                    <option value="CEO">CEO</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="TEAM_LEAD">Team Lead</option>
                    <option value="DEVELOPER">Developer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-subtle border border-border-default rounded-lg"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-subtle border border-border-default rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle || ''}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-subtle border border-border-default rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-subtle border border-border-default rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-border-default rounded-lg text-sm font-medium text-text-muted hover:bg-bg-subtle"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent text-text-inverse rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Full Name" value={member.name} />
                <InfoField label="Email" value={member.email} />
                <InfoField label="Role" value={member.role?.replace('_', ' ')} />
                <InfoField label="Status" value={member.status} />
                <InfoField label="Department" value={member.department || '-'} />
                <InfoField label="Job Title" value={member.jobTitle || '-'} />
                <InfoField label="Phone" value={member.phone || '-'} />
                <InfoField label="Member Since" value={new Date(member.createdAt).toLocaleDateString()} />
              </div>

              {/* Actions */}
              <div className="border-t border-border-default pt-4">
                <h3 className="text-sm font-bold text-text-primary mb-3">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-border-default rounded-lg text-sm text-text-body hover:bg-bg-subtle"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>

                  <button
                    onClick={handleResetPassword}
                    className="flex items-center gap-2 px-3 py-2 border border-border-default rounded-lg text-sm text-text-body hover:bg-bg-subtle"
                  >
                    <RefreshCw size={16} />
                    Reset Password
                  </button>

                  {member.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleStatusChange('SUSPENDED')}
                      className="flex items-center gap-2 px-3 py-2 border border-red-500/20 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20"
                    >
                      <UserX size={16} />
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('ACTIVE')}
                      className="flex items-center gap-2 px-3 py-2 border border-green-500/20 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20"
                    >
                      <UserCheck size={16} />
                      Activate
                    </button>
                  )}

                  <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-3 py-2 border border-red-500/20 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              {member.lastLoginAt && (
                <div className="border-t border-border-default pt-4">
                  <h3 className="text-sm font-bold text-text-primary mb-2">Recent Activity</h3>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Clock size={14} />
                    Last login: {new Date(member.lastLoginAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Info Field Component
const InfoField = ({ label, value }) => (
  <div>
    <p className="text-xs text-text-muted mb-1">{label}</p>
    <p className="text-sm font-medium text-text-primary">{value}</p>
  </div>
);

export default CEOSettingsPage;