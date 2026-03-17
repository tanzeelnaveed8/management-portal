
// app/(dashboard)/project-manager/clients/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import {
     UserPlus,
     Mail,
     Phone,
     Briefcase,
     Clock,
     ExternalLink,
     PlusCircle,
     FileUp,
     MessageSquare,
     Search,
     Filter,
     X,
     Download,
     Eye,
     Star,
     CheckCircle2,
     AlertCircle,
     DollarSign,
     Users,
     Building2
} from 'lucide-react';
import { useProjectManagerClients } from '../../../../hooks/useProjectManagerClients';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Spinner from '../../../Components/common/Spinner';

export default function ClientDirectory() {
     const router = useRouter();
     const {
          clients,
          stats,
          loading,
          error,
          filters,
          setFilters,
          createClient,
          getClientDetails,
          getClientDocuments,
          getClientFeedback
     } = useProjectManagerClients();

     const [showCreateModal, setShowCreateModal] = useState(false);
     const [searchInput, setSearchInput] = useState('');
     const [selectedClient, setSelectedClient] = useState(null);
     const [showClientModal, setShowClientModal] = useState(false);
     const [clientDetails, setClientDetails] = useState(null);
     const [clientDocuments, setClientDocuments] = useState([]);
     const [clientFeedback, setClientFeedback] = useState({ feedbacks: [], stats: {} });
     const [activeTab, setActiveTab] = useState('overview');
     const [formData, setFormData] = useState({
          name: '',
          email: '',
          company: '',
          phone: '',
          projectName: '',
          projectDescription: '',
          deadline: '',
          budget: ''
     });
     const [formErrors, setFormErrors] = useState({});

     // Debounce search
     useEffect(() => {
          const timer = setTimeout(() => {
               setFilters(prev => ({ ...prev, search: searchInput }));
          }, 300);
          return () => clearTimeout(timer);
     }, [searchInput, setFilters]);

     // Load client details when selected
     useEffect(() => {
          if (selectedClient) {
               loadClientDetails(selectedClient.email);
          }
     }, [selectedClient]);

     const loadClientDetails = async (email) => {
          const details = await getClientDetails(email);
          setClientDetails(details);

          const docs = await getClientDocuments(email);
          setClientDocuments(docs);

          const feedback = await getClientFeedback(email);
          setClientFeedback(feedback);
     };

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
          if (formErrors[name]) {
               setFormErrors(prev => ({ ...prev, [name]: null }));
          }
     };

     const validateForm = () => {
          const errors = {};

          if (!formData.name.trim()) {
               errors.name = 'Client name is required';
          }

          if (!formData.email.trim()) {
               errors.email = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
               errors.email = 'Invalid email format';
          }

          if (!formData.projectName.trim()) {
               errors.projectName = 'Project name is required';
          }

          return errors;
     };

     const handleCreateClient = async (e) => {
          e.preventDefault();

          const errors = validateForm();
          if (Object.keys(errors).length > 0) {
               setFormErrors(errors);
               return;
          }

          const result = await createClient({
               ...formData,
               budget: formData.budget ? parseFloat(formData.budget) : undefined
          });

          if (result.success) {
               setShowCreateModal(false);
               setFormData({
                    name: '',
                    email: '',
                    company: '',
                    phone: '',
                    projectName: '',
                    projectDescription: '',
                    deadline: '',
                    budget: ''
               });
          }
     };

     const handleViewClient = async (client) => {
          setSelectedClient(client);
          setShowClientModal(true);
     };

     const handleUploadRequirements = async (client) => {
          const { value: file } = await Swal.fire({
               title: 'Upload Requirements',
               html: `
        <input type="file" id="file-input" class="swal2-file" accept=".pdf,.doc,.docx,.txt,.jpg,.png">
        <select id="doc-type" class="swal2-select mt-3">
          <option value="CLIENT_REQUIREMENT">Client Requirements</option>
          <option value="CONTRACT">Contract</option>
          <option value="PROJECT_DOC">Project Documentation</option>
        </select>
        <textarea id="doc-desc" class="swal2-textarea mt-3" placeholder="Description (optional)"></textarea>
      `,
               showCancelButton: true,
               confirmButtonText: 'Upload',
               confirmButtonColor: '#2563eb',
               preConfirm: () => {
                    const file = document.getElementById('file-input').files[0];
                    if (!file) {
                         Swal.showValidationMessage('Please select a file');
                         return false;
                    }
                    return {
                         file,
                         type: document.getElementById('doc-type').value,
                         description: document.getElementById('doc-desc').value
                    };
               }
          });

          if (file) {
               // Here you would implement the actual file upload
               Swal.fire({
                    title: 'Coming Soon',
                    text: 'File upload functionality will be implemented in the next phase',
                    icon: 'info',
                    confirmButtonColor: '#2563eb'
               });
          }
     };

     const getStatusColor = (status) => {
          switch (status) {
               case 'ACTIVE': return 'bg-green-500/10 text-green-600 border-green-500/20';
               case 'UPCOMING': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
               case 'REVIEW': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
               case 'INACTIVE': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
               default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
          }
     };

     if (loading.clients && clients.length === 0) {
          return <Spinner title="Client Directory..." />;
     }

     return (
          <div className="min-h-screen bg-bg-page p-page-x py-page-y">
               {/* Header Section */}
               <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div>
                         <h1 className="text-headline-lg font-bold text-text-primary tracking-tight">
                              Client Relationships
                         </h1>
                         <p className="text-text-muted mt-1">
                              Manage client communications, requirements, and project approvals.
                         </p>
                    </div>

                    <button
                         onClick={() => setShowCreateModal(true)}
                         className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-text-inverse px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent/20"
                    >
                         <UserPlus size={20} />
                         Add New Client
                    </button>
               </header>

               {/* Error Message */}
               {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                              <AlertCircle size={20} className="text-red-500" />
                              <p className="text-red-500 text-sm">{error}</p>
                         </div>
                         <button
                              onClick={() => window.location.reload()}
                              className="text-red-500 hover:text-red-600 text-xs font-bold"
                         >
                              Retry
                         </button>
                    </div>
               )}

               {/* Stats Overview */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                         label="Total Clients"
                         value={stats.totalClients}
                         icon={<Users size={20} />}
                         color="var(--accent-primary)"
                    />
                    <StatsCard
                         label="Active Projects"
                         value={stats.activeProjects}
                         icon={<Briefcase size={20} />}
                         color="var(--accent-secondary)"
                    />
                    <StatsCard
                         label="Pending Feedback"
                         value={stats.pendingFeedback}
                         icon={<MessageSquare size={20} />}
                         color="#f59e0b"
                    />
                    <StatsCard
                         label="Total Portfolio"
                         value={`$${(stats.totalPortfolio / 1000).toFixed(1)}k`}
                         icon={<DollarSign size={20} />}
                         color="var(--accent-primary)"
                    />
               </div>

               {/* Search & Filter Bar */}
               <div className="bg-bg-surface border border-border-default rounded-xl p-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                         <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                              <input
                                   type="text"
                                   value={searchInput}
                                   onChange={(e) => setSearchInput(e.target.value)}
                                   placeholder="Search clients by name, company, or email..."
                                   className="w-full pl-10 pr-4 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent outline-none transition-all"
                              />
                              {searchInput && (
                                   <button
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary"
                                   >
                                        <X size={16} />
                                   </button>
                              )}
                         </div>
                         <select
                              value={filters.status}
                              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                              className="px-4 py-2 bg-bg-subtle border border-border-default rounded-lg focus:ring-2 focus:ring-accent outline-none min-w-[150px]"
                         >
                              <option value="all">All Status</option>
                              <option value="ACTIVE">Active</option>
                              <option value="UPCOMING">Upcoming</option>
                              <option value="REVIEW">In Review</option>
                              <option value="INACTIVE">Inactive</option>
                         </select>
                    </div>

                    {/* Active Filters */}
                    {(filters.status !== 'all' || searchInput) && (
                         <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-default">
                              <span className="text-xs text-text-muted">Active filters:</span>
                              {filters.status !== 'all' && (
                                   <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                                        Status: {filters.status}
                                   </span>
                              )}
                              {searchInput && (
                                   <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                                        Search: {searchInput}
                                   </span>
                              )}
                              <button
                                   onClick={() => {
                                        setSearchInput('');
                                        setFilters({ status: 'all', search: '' });
                                   }}
                                   className="text-xs text-accent hover:text-accent-hover ml-auto"
                              >
                                   Clear all
                              </button>
                         </div>
                    )}
               </div>

               {/* Client Grid */}
               {clients.length === 0 ? (
                    <div className="text-center py-16 bg-bg-surface rounded-2xl border border-dashed border-border-default">
                         <div className="max-w-md mx-auto">
                              <div className="p-4 bg-bg-subtle rounded-full w-fit mx-auto mb-4">
                                   <Users size={40} className="text-text-disabled" />
                              </div>
                              <h3 className="font-bold text-text-primary text-lg mb-2">No clients found</h3>
                              <p className="text-text-muted text-sm mb-6">
                                   {filters.status !== 'all' || searchInput
                                        ? 'Try adjusting your filters to see more results'
                                        : 'Start by adding your first client to get started.'}
                              </p>
                              {(filters.status !== 'all' || searchInput) ? (
                                   <button
                                        onClick={() => {
                                             setSearchInput('');
                                             setFilters({ status: 'all', search: '' });
                                        }}
                                        className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all"
                                   >
                                        Clear Filters
                                   </button>
                              ) : (
                                   <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all"
                                   >
                                        Add Your First Client
                                   </button>
                              )}
                         </div>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                         {clients.map((client) => (
                              <ClientCard
                                   key={client.email}
                                   client={client}
                                   onViewDetails={() => handleViewClient(client)}
                                   onUploadRequirements={() => handleUploadRequirements(client)}
                                   getStatusColor={getStatusColor}
                              />
                         ))}
                    </div>
               )}

               {/* Create Client Modal */}
               {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                         <div className="bg-bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border-default overflow-hidden animate-in fade-in zoom-in duration-200">
                              <div className="p-6 border-b border-border-default flex justify-between items-center bg-bg-subtle">
                                   <h2 className="text-headline font-bold text-text-primary">Add New Client</h2>
                                   <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary">
                                        <X size={20} />
                                   </button>
                              </div>

                              <form onSubmit={handleCreateClient} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto chat-scroll ">
                                   {/* Client Information */}
                                   <div>
                                        <h3 className="text-ui font-bold text-text-primary mb-4 flex items-center gap-2">
                                             <Building2 size={18} className="text-accent" />
                                             Client Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Client Name <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                       type="text"
                                                       name="name"
                                                       value={formData.name}
                                                       onChange={handleInputChange}
                                                       className={`w-full p-3 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none ${formErrors.name ? 'border-red-500' : 'border-border-default'
                                                            }`}
                                                       placeholder="e.g. John Smith"
                                                  />
                                                  {formErrors.name && (
                                                       <p className="text-xs text-red-500">{formErrors.name}</p>
                                                  )}
                                             </div>
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Email <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                       type="email"
                                                       name="email"
                                                       value={formData.email}
                                                       onChange={handleInputChange}
                                                       className={`w-full p-3 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none ${formErrors.email ? 'border-red-500' : 'border-border-default'
                                                            }`}
                                                       placeholder="client@company.com"
                                                  />
                                                  {formErrors.email && (
                                                       <p className="text-xs text-red-500">{formErrors.email}</p>
                                                  )}
                                             </div>
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Company
                                                  </label>
                                                  <input
                                                       type="text"
                                                       name="company"
                                                       value={formData.company}
                                                       onChange={handleInputChange}
                                                       className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                                       placeholder="e.g. Acme Inc."
                                                  />
                                             </div>
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Phone
                                                  </label>
                                                  <input
                                                       type="tel"
                                                       name="phone"
                                                       value={formData.phone}
                                                       onChange={handleInputChange}
                                                       className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                                       placeholder="+1 (555) 000-0000"
                                                  />
                                             </div>
                                        </div>
                                   </div>

                                   {/* Initial Project */}
                                   <div className="border-t border-border-subtle pt-6">
                                        <h3 className="text-ui font-bold text-text-primary mb-4 flex items-center gap-2">
                                             <Briefcase size={18} className="text-accent" />
                                             Initial Project
                                        </h3>
                                        <div className="space-y-4">
                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Project Name <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                       type="text"
                                                       name="projectName"
                                                       value={formData.projectName}
                                                       onChange={handleInputChange}
                                                       className={`w-full p-3 bg-bg-subtle border rounded-lg focus:ring-1 focus:ring-accent outline-none ${formErrors.projectName ? 'border-red-500' : 'border-border-default'
                                                            }`}
                                                       placeholder="e.g. Website Redesign"
                                                  />
                                                  {formErrors.projectName && (
                                                       <p className="text-xs text-red-500">{formErrors.projectName}</p>
                                                  )}
                                             </div>

                                             <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                       Project Description
                                                  </label>
                                                  <textarea
                                                       name="projectDescription"
                                                       value={formData.projectDescription}
                                                       onChange={handleInputChange}
                                                       rows="3"
                                                       className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                                       placeholder="Describe the project scope and objectives..."
                                                  />
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                       <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                            Target Deadline
                                                       </label>
                                                       <input
                                                            type="date"
                                                            name="deadline"
                                                            value={formData.deadline}
                                                            onChange={handleInputChange}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                                       />
                                                  </div>
                                                  <div className="space-y-2">
                                                       <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                                            Budget ($)
                                                       </label>
                                                       <input
                                                            type="number"
                                                            name="budget"
                                                            value={formData.budget}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                            step="1000"
                                                            className="w-full p-3 bg-bg-subtle border border-border-default rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                                            placeholder="e.g. 50000"
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </form>

                              <div className="p-6 bg-bg-subtle border-t border-border-default flex justify-end gap-3">
                                   <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2 rounded-lg font-medium text-text-body hover:bg-border-default"
                                   >
                                        Cancel
                                   </button>
                                   <button
                                        onClick={handleCreateClient}
                                        disabled={loading.createClient}
                                        className="px-6 py-2 rounded-lg font-medium bg-accent text-text-inverse hover:bg-accent-hover shadow-lg disabled:opacity-50 flex items-center gap-2"
                                   >
                                        {loading.createClient ? (
                                             <>
                                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                  Creating...
                                             </>
                                        ) : (
                                             'Create Client & Project'
                                        )}
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               {/* Client Details Modal */}
               {showClientModal && clientDetails && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                         <div className="bg-bg-surface w-full max-w-4xl rounded-2xl shadow-2xl border border-border-default overflow-hidden max-h-[90vh] flex flex-col">
                              <div className="p-6 border-b border-border-default flex justify-between items-center bg-bg-subtle">
                                   <div>
                                        <h2 className="text-headline font-bold text-text-primary">{clientDetails.name}</h2>
                                        <p className="text-sm text-text-muted">{clientDetails.company}</p>
                                   </div>
                                   <button onClick={() => setShowClientModal(false)} className="text-text-muted hover:text-text-primary">
                                        <X size={20} />
                                   </button>
                              </div>

                              {/* Tabs */}
                              <div className="flex border-b border-border-default px-6 bg-bg-surface">
                                   <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'overview'
                                             ? 'text-accent'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        Overview
                                        {activeTab === 'overview' && (
                                             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                        )}
                                   </button>
                                   <button
                                        onClick={() => setActiveTab('projects')}
                                        className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'projects'
                                             ? 'text-accent'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        Projects ({clientDetails.projects.length})
                                        {activeTab === 'projects' && (
                                             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                        )}
                                   </button>
                                   <button
                                        onClick={() => setActiveTab('documents')}
                                        className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'documents'
                                             ? 'text-accent'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        Documents ({clientDocuments.length})
                                        {activeTab === 'documents' && (
                                             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                        )}
                                   </button>
                                   <button
                                        onClick={() => setActiveTab('feedback')}
                                        className={`px-4 py-3 text-sm font-bold transition-colors relative ${activeTab === 'feedback'
                                             ? 'text-accent'
                                             : 'text-text-muted hover:text-text-primary'
                                             }`}
                                   >
                                        Feedback ({clientFeedback.feedbacks.length})
                                        {activeTab === 'feedback' && (
                                             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                        )}
                                   </button>
                              </div>

                              {/* Tab Content */}
                              <div className="flex-1 overflow-y-auto chat-scroll  p-6">
                                   {activeTab === 'overview' && (
                                        <div className="space-y-6">
                                             {/* Contact Info */}
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div className="p-4 bg-bg-subtle rounded-xl">
                                                       <p className="text-xs text-text-muted mb-1">Email</p>
                                                       <p className="text-sm font-medium flex items-center gap-2">
                                                            <Mail size={14} className="text-accent" />
                                                            {clientDetails.email}
                                                       </p>
                                                  </div>
                                                  <div className="p-4 bg-bg-subtle rounded-xl">
                                                       <p className="text-xs text-text-muted mb-1">Phone</p>
                                                       <p className="text-sm font-medium flex items-center gap-2">
                                                            <Phone size={14} className="text-accent" />
                                                            {clientDetails.phone}
                                                       </p>
                                                  </div>
                                             </div>

                                             {/* Financial Summary */}
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div className="p-4 bg-gradient-to-br from-accent to-accent-active rounded-xl text-white">
                                                       <p className="text-xs opacity-80 mb-1">Total Budget</p>
                                                       <p className="text-2xl font-bold">${(clientDetails.totalBudget / 1000).toFixed(1)}k</p>
                                                  </div>
                                                  <div className="p-4 bg-bg-surface border border-border-default rounded-xl">
                                                       <p className="text-xs text-text-muted mb-1">Total Cost</p>
                                                       <p className="text-2xl font-bold text-text-primary">${(clientDetails.totalCost / 1000).toFixed(1)}k</p>
                                                  </div>
                                             </div>

                                             {/* Quick Stats */}
                                             <div className="grid grid-cols-3 gap-4">
                                                  <div className="text-center">
                                                       <p className="text-2xl font-bold text-accent">{clientDetails.activeProjects}</p>
                                                       <p className="text-xs text-text-muted">Active Projects</p>
                                                  </div>
                                                  <div className="text-center">
                                                       <p className="text-2xl font-bold text-accent-secondary">{clientDocuments.length}</p>
                                                       <p className="text-xs text-text-muted">Documents</p>
                                                  </div>
                                                  <div className="text-center">
                                                       <p className="text-2xl font-bold text-yellow-500">{clientFeedback.stats?.total || 0}</p>
                                                       <p className="text-xs text-text-muted">Feedback Items</p>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {activeTab === 'projects' && (
                                        <div className="space-y-4">
                                             {clientDetails.projects.map(project => (
                                                  <div
                                                       key={project.id}
                                                       onClick={() => router.push(`/project-manager/projects/${project.id}`)}
                                                       className="p-4 bg-bg-subtle border border-border-default rounded-xl hover:border-accent transition-all cursor-pointer"
                                                  >
                                                       <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-text-primary">{project.name}</h4>
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${project.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' :
                                                                 project.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-600' :
                                                                      project.status === 'DELAYED' ? 'bg-red-500/10 text-red-600' :
                                                                           'bg-gray-500/10 text-gray-600'
                                                                 }`}>
                                                                 {project.status}
                                                            </span>
                                                       </div>
                                                       <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                                                            <div>
                                                                 <p className="text-text-muted">Progress</p>
                                                                 <p className="font-bold">{project.progress}%</p>
                                                            </div>
                                                            <div>
                                                                 <p className="text-text-muted">Budget</p>
                                                                 <p className="font-bold">${(project.budget / 1000).toFixed(1)}k</p>
                                                            </div>
                                                            <div>
                                                                 <p className="text-text-muted">Team Lead</p>
                                                                 <p className="font-bold">{project.teamLead?.name || 'Unassigned'}</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   )}

                                   {activeTab === 'documents' && (
                                        <div className="space-y-3">
                                             {clientDocuments.length > 0 ? (
                                                  clientDocuments.map(doc => (
                                                       <div
                                                            key={doc.id}
                                                            className="flex items-center justify-between p-4 bg-bg-subtle border border-border-default rounded-xl hover:border-accent transition-all"
                                                       >
                                                            <div className="flex items-center gap-3">
                                                                 <FileUp size={20} className="text-accent" />
                                                                 <div>
                                                                      <p className="font-medium text-text-primary">{doc.name}</p>
                                                                      <p className="text-xs text-text-muted">
                                                                           {new Date(doc.uploadedAt).toLocaleDateString()} •
                                                                           {(doc.fileSize / 1024 / 1024).toFixed(2)} MB •
                                                                           {doc.project.name}
                                                                      </p>
                                                                 </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                 <a
                                                                      href={doc.url}
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                      className="p-2 hover:bg-bg-surface rounded-lg"
                                                                 >
                                                                      <Eye size={16} className="text-text-muted" />
                                                                 </a>
                                                                 <a
                                                                      href={doc.url}
                                                                      download
                                                                      className="p-2 hover:bg-bg-surface rounded-lg"
                                                                 >
                                                                      <Download size={16} className="text-text-muted" />
                                                                 </a>
                                                            </div>
                                                       </div>
                                                  ))
                                             ) : (
                                                  <p className="text-center py-8 text-text-muted">No documents uploaded yet</p>
                                             )}
                                        </div>
                                   )}

                                   {activeTab === 'feedback' && (
                                        <div className="space-y-4">
                                             {/* Feedback Stats */}
                                             <div className="grid grid-cols-4 gap-4 mb-6">
                                                  <div className="p-3 bg-bg-subtle rounded-lg text-center">
                                                       <p className="text-lg font-bold text-accent">{clientFeedback.stats?.total || 0}</p>
                                                       <p className="text-xs text-text-muted">Total</p>
                                                  </div>
                                                  <div className="p-3 bg-bg-subtle rounded-lg text-center">
                                                       <p className="text-lg font-bold text-green-600">{clientFeedback.stats?.approved || 0}</p>
                                                       <p className="text-xs text-text-muted">Approved</p>
                                                  </div>
                                                  <div className="p-3 bg-bg-subtle rounded-lg text-center">
                                                       <p className="text-lg font-bold text-yellow-600">{clientFeedback.stats?.pending || 0}</p>
                                                       <p className="text-xs text-text-muted">Pending</p>
                                                  </div>
                                                  <div className="p-3 bg-bg-subtle rounded-lg text-center">
                                                       <p className="text-lg font-bold text-orange-600">{clientFeedback.stats?.revisions || 0}</p>
                                                       <p className="text-xs text-text-muted">Revisions</p>
                                                  </div>
                                             </div>

                                             {/* Feedback List */}
                                             {clientFeedback.feedbacks.length > 0 ? (
                                                  clientFeedback.feedbacks.map(feedback => (
                                                       <div
                                                            key={feedback.id}
                                                            className="p-4 bg-bg-subtle border border-border-default rounded-xl"
                                                       >
                                                            <div className="flex justify-between items-start mb-2">
                                                                 <div>
                                                                      <p className="font-medium text-text-primary">{feedback.project.name}</p>
                                                                      <p className="text-xs text-text-muted">
                                                                           {new Date(feedback.createdAt).toLocaleDateString()} •
                                                                           Stage: {feedback.stage}
                                                                      </p>
                                                                 </div>
                                                                 <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${feedback.isApproved ? 'bg-green-500/10 text-green-600' :
                                                                      feedback.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                                                                           'bg-yellow-500/10 text-yellow-600'
                                                                      }`}>
                                                                      {feedback.status}
                                                                 </span>
                                                            </div>
                                                            <p className="text-sm text-text-body mt-2">"{feedback.content}"</p>
                                                            {feedback.rating && (
                                                                 <div className="flex items-center gap-1 mt-2">
                                                                      {[...Array(5)].map((_, i) => (
                                                                           <Star
                                                                                key={i}
                                                                                size={12}
                                                                                className={i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                                           />
                                                                      ))}
                                                                 </div>
                                                            )}
                                                       </div>
                                                  ))
                                             ) : (
                                                  <p className="text-center py-8 text-text-muted">No feedback recorded yet</p>
                                             )}
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}

// Stats Card Component
function StatsCard({ label, value, icon, color }) {
     return (
          <div className="bg-bg-surface border border-border-default p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-bg-subtle rounded-lg" style={{ color }}>
                         {icon}
                    </div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
               </div>
               <p className="text-3xl font-black" style={{ color }}>{value}</p>
          </div>
     );
}

// Client Card Component
function ClientCard({ client, onViewDetails, onUploadRequirements, getStatusColor }) {
     return (
          <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden hover:border-accent hover:shadow-xl transition-all group">
               {/* Card Top: Identity */}
               <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                         <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                              {client.company?.charAt(0) || client.name.charAt(0)}
                         </div>
                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(client.status)}`}>
                              {client.status}
                         </span>
                    </div>

                    <h3 className="text-subheading font-bold text-text-primary group-hover:text-accent transition-colors">
                         {client.name}
                    </h3>
                    <p className="text-ui text-text-muted font-medium mb-4 flex items-center gap-1">
                         <Building2 size={14} />
                         {client.company}
                    </p>

                    <div className="space-y-2 border-t border-border-subtle pt-4">
                         <div className="flex items-center gap-3 text-ui text-text-body">
                              <Mail size={16} className="text-text-disabled" />
                              <span className="truncate text-sm">{client.email}</span>
                         </div>
                         <div className="flex items-center gap-3 text-ui text-text-body">
                              <Phone size={16} className="text-text-disabled" />
                              <span className="text-sm">{client.phone}</span>
                         </div>
                    </div>
               </div>

               {/* Card Middle: Project Metrics */}
               <div className="px-6 py-4 bg-bg-subtle/50 border-y border-border-subtle">
                    <div className="flex justify-between items-center mb-2">
                         <div className="flex items-center gap-2">
                              <Briefcase size={16} className="text-accent" />
                              <span className="text-ui font-bold text-text-primary">
                                   {client.activeProjects} / {client.totalProjects} Projects
                              </span>
                         </div>
                         <span className="text-ui font-black text-accent">{client.totalProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-border-default rounded-full overflow-hidden">
                         <div
                              className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-700"
                              style={{ width: `${client.totalProgress}%` }}
                         />
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-[11px] text-text-muted">
                         <MessageSquare size={14} />
                         <span>
                              Last feedback: <strong className="text-text-body">{client.lastFeedback}</strong>
                         </span>
                         {client.feedbackCount > 0 && (
                              <span className="ml-auto text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                   {client.feedbackCount} total
                              </span>
                         )}
                    </div>
               </div>

               {/* Card Bottom: PM Actions */}
               <div className="p-4 grid grid-cols-2 gap-2">
                    <button
                         onClick={onUploadRequirements}
                         className="flex items-center justify-center gap-2 text-ui font-bold py-2 border border-border-strong rounded-lg hover:bg-bg-subtle text-text-body transition-colors"
                    >
                         <FileUp size={16} />
                         Reqs
                         {client.documentCount > 0 && (
                              <span className="ml-1 text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                                   {client.documentCount}
                              </span>
                         )}
                    </button>
                    <button
                         onClick={onViewDetails}
                         className="flex items-center justify-center gap-2 text-ui font-bold py-2 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all"
                    >
                         Details
                         <ExternalLink size={16} />
                    </button>
               </div>
          </div>
     );
}