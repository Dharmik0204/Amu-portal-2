import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { Users, FileText, AlertTriangle, Home, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [allData, setAllData] = useState({ users: [], animals: [], queries: [], prescriptions: [] });
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [mobileSaving, setMobileSaving] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAllData();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      console.log('Fetching stats...');
      const { data } = await api.get('/admin/stats');
      console.log('Stats received complete:', data);
      setStats(data);
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError('Failed to fetch dashboard statistics: ' + (err.response?.data?.error || err.message));
    }
  };

  const fetchAllData = async () => {
    try {
      setError(null);
      setLoadingData(true);
      console.log('Fetching all system data...');
      const { data } = await api.get('/admin/all-data');
      console.log('All data received complete:', data);
      setAllData({
        users: data?.users || [],
        animals: data?.animals || [],
        queries: data?.queries || [],
        prescriptions: data?.prescriptions || []
      });
      setLoadingData(false);
    } catch (err) {
      console.error('All data fetch error:', err);
      setError('Failed to fetch system records: ' + (err.response?.data?.error || err.message));
      setLoadingData(false);
    }
  };



  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setEditMobile(item.mobile || '');
    setShowModal(true);
  };

  const handleUpdateMobile = async () => {
    if (!selectedItem) return;
    setMobileSaving(true);
    try {
      const { data } = await api.patch(`/admin/users/${selectedItem._id}`, { mobile: editMobile });
      // Update allData in place so the table refreshes too
      setAllData(prev => ({
        ...prev,
        users: prev.users.map(u => u._id === selectedItem._id ? { ...u, mobile: editMobile } : u)
      }));
      setSelectedItem(prev => ({ ...prev, mobile: editMobile }));
      alert('Mobile number updated successfully!');
    } catch (err) {
      alert('Failed to update mobile: ' + (err.response?.data?.error || err.message));
    } finally {
      setMobileSaving(false);
    }
  };

  const RISK_COLORS = {
    'Safe Risk': '#10b981',
    'Safe': '#10b981',
    'Medium Risk': '#f59e0b',
    'High Risk': '#ef4444'
  };

  const ROLE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  // Dynamic data from stats object
  const pipelineData = stats?.pipelineData || [];
  const dailyPrescriptions = stats?.dailyPrescriptions || [];

  if (error && !stats) {
    return (
      <Layout>
        <div style={{ padding: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontWeight: '500' }}>
            {error}
          </div>
          <button onClick={() => { setError(null); fetchStats(); fetchAllData(); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', cursor: 'pointer' }}>Retry</button>
        </div>
      </Layout>
    );
  }

  if (!stats) return <Layout><div style={{ padding: '2rem' }}>Loading system statistics...</div></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>Admin Analytics Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>System-wide monitoring of Antimicrobial Use (AMU) and user activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setAllData({ users: [], animals: [], queries: [], prescriptions: [] }); setError(null); fetchStats(); fetchAllData(); }} className="btn-outline" style={{ padding: '0.6rem 1.2rem' }}>Force Refresh</button>

          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <Shield size={28} color="#8b5cf6" style={{ opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
        </div>
      )}

      {/* Top Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><Users size={24} /></div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Users</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.summary.totalUsers}</h2>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', color: 'var(--success)' }}><FileText size={24} /></div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Prescriptions</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.summary.totalPrescriptions}</h2>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '8px', color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>High Risk Alerts</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.summary.highRiskAlerts}</h2>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#f5f3ff', borderRadius: '8px', color: '#8b5cf6' }}><Home size={24} /></div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>Active Farms</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.summary.activeFarms}</h2>
          </div>
        </div>

      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gridTemplateRows: 'auto auto', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* MRL Risk Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>MRL Risk Distribution</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stats.riskDistribution.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%" key={`pie-risk-${stats.riskDistribution.length}`}>
                <PieChart>
                  <Pie data={stats.riskDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" stroke="none">
                    {stats.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || RISK_COLORS['Safe']} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No risk data to display</p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: RISK_COLORS['High Risk'] }} /> High Risk</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: RISK_COLORS['Medium Risk'] }} /> Medium Risk</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: RISK_COLORS['Safe'] }} /> Safe</span>
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>Prescription Pipeline Status</h3>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pipelineData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%" key={`bar-pipe-${pipelineData.length}`}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No pipeline activity recorded</p>
            )}
          </div>
        </div>

        {/* Users by Role */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>Users by Role</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stats.usersByRole.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%" key={`pie-roles-${stats.usersByRole.length}`}>
                <PieChart>
                  <Pie data={stats.usersByRole} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                    {stats.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No user data available</p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', fontWeight: '500' }}>
            {stats.usersByRole.map((role, idx) => (
              <span key={role.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ROLE_COLORS[idx] }} /> {role.name}
              </span>
            ))}
          </div>
        </div>

        {/* Daily Prescriptions */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>Daily Prescriptions Issued</h3>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dailyPrescriptions.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%" key={`line-daily-${dailyPrescriptions.length}`}>
                <LineChart data={dailyPrescriptions}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No prescriptions issued in the last 7 days</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Data Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['users', 'animals', 'queries', 'prescriptions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 0',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: activeTab === tab ? '#3b82f6' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                System {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={() => { setAllData({ users: [], animals: [], queries: [], prescriptions: [] }); fetchAllData(); }} 
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: '1px solid #3b82f6', borderRadius: '4px', cursor: 'pointer' }}
          >
            Refresh Data
          </button>
        </div>

        {loadingData && (
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Refreshing {activeTab}...</p>
          </div>
        )}

        <div style={{ padding: '0 1.5rem 1rem' }}>
          <input 
            type="text" 
            placeholder={
              activeTab === 'users' ? "Search Users by Name" :
              activeTab === 'animals' ? "Search Animals by Identifier or Farmer Name" :
              activeTab === 'queries' ? "Search Queries by Farmer Name" :
              "Filter Prescriptions by Farmer Mobile or Name"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '1rem' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeTab === 'users' && (
                  <>
                    <th style={{ padding: '0.75rem' }}>Name</th>
                    <th style={{ padding: '0.75rem' }}>Email</th>
                    <th style={{ padding: '0.75rem' }}>Mobile</th>
                    <th style={{ padding: '0.75rem' }}>Role</th>
                    <th style={{ padding: '0.75rem' }}>Joined</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </>
                )}
                {activeTab === 'animals' && (
                  <>
                    <th style={{ padding: '0.75rem' }}>Identifier</th>
                    <th style={{ padding: '0.75rem' }}>Type</th>
                    <th style={{ padding: '0.75rem' }}>Age</th>
                    <th style={{ padding: '0.75rem' }}>Farmer</th>
                    <th style={{ padding: '0.75rem' }}>Mobile</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </>
                )}
                {activeTab === 'queries' && (
                  <>
                    <th style={{ padding: '0.75rem' }}>Farmer</th>
                    <th style={{ padding: '0.75rem' }}>Mobile</th>
                    <th style={{ padding: '0.75rem' }}>Animal</th>
                    <th style={{ padding: '0.75rem' }}>Message Snippet</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </>
                )}
                {activeTab === 'prescriptions' && (
                  <>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Farmer</th>
                    <th style={{ padding: '0.75rem' }}>Mobile</th>
                    <th style={{ padding: '0.75rem' }}>Animal</th>
                    <th style={{ padding: '0.75rem' }}>Medicine</th>
                    <th style={{ padding: '0.75rem' }}>Food</th>
                    <th style={{ padding: '0.75rem' }}>MRL Admin</th>
                    <th style={{ padding: '0.75rem' }}>Lab MRL</th>
                    <th style={{ padding: '0.75rem' }}>Withdrawal</th>
                    <th style={{ padding: '0.75rem' }}>Countdown</th>
                    <th style={{ padding: '0.75rem' }}>Risk</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'users' && allData.users?.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                  <td style={{ padding: '0.75rem' }}>{item.name}</td>
                  <td style={{ padding: '0.75rem' }}>{item.email}</td>
                  <td style={{ padding: '0.75rem' }}>{item.mobile || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.role}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleViewDetails(item)} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #3b82f6', color: '#3b82f6', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>View</button>
                  </td>
                </tr>
              ))}
              {activeTab === 'animals' && allData.animals?.filter(a => (a.identifier || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.farmer_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                  <td style={{ padding: '0.75rem' }}>{item.identifier}</td>
                  <td style={{ padding: '0.75rem' }}>{item.type}</td>
                  <td style={{ padding: '0.75rem' }}>{item.age}</td>
                  <td style={{ padding: '0.75rem' }}>{item.farmer_id?.name || 'Unknown'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.farmer_id?.mobile || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleViewDetails(item)} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #3b82f6', color: '#3b82f6', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>View</button>
                  </td>
                </tr>
              ))}
              {activeTab === 'queries' && allData.queries?.filter(q => (q.farmer_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                  <td style={{ padding: '0.75rem' }}>{item.farmer_id?.name || 'Unknown'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.farmer_id?.mobile || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.animal_id?.identifier}</td>
                  <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text_message || 'Voice Message'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', backgroundColor: item.status === 'Pending' ? '#fef3c7' : '#dcfce7', color: item.status === 'Pending' ? '#92400e' : '#166534' }}>{item.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleViewDetails(item)} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #3b82f6', color: '#3b82f6', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>View</button>
                  </td>
                </tr>
              ))}
              {activeTab === 'prescriptions' && allData.prescriptions?.filter(p => 
                (p.farmer_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                (p.farmer_id?.mobile || '').includes(searchQuery)
              ).map((item, index) => {
                // Countdown logic
                const createdAt = new Date(item.createdAt);
                const days = parseInt(item.withdrawal_period) || 0;
                const expiryDate = new Date(createdAt);
                expiryDate.setDate(expiryDate.getDate() + days);
                const today = new Date();
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpired = diffDays <= 0;

                return (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{item._id.slice(-3)}</td>
                  <td style={{ padding: '0.75rem' }}>{item.farmer_id?.name}</td>
                  <td style={{ padding: '0.75rem' }}>{item.farmer_id?.mobile || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.animal_id?.identifier || 'Animal'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.medicine_name}</td>
                  <td style={{ padding: '0.75rem' }}>{item.food_type !== 'None' ? item.food_type : 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.mrl_admin || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.lab_mrl || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.withdrawal_period}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      backgroundColor: isExpired ? '#dcfce7' : '#fef3c7', 
                      color: isExpired ? '#166534' : '#92400e',
                      border: isExpired ? '1px solid #86efac' : '1px solid #fcd34d'
                    }}>
                      {isExpired ? 'Safe' : `${diffDays} days left`}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                     <span style={{ 
                       padding: '2px 10px', 
                       borderRadius: '12px', 
                       fontSize: '0.7rem', 
                       fontWeight: 'bold',
                       backgroundColor: (item.risk_level === 'High' || item.risk_level === 'High Risk') ? '#ef4444' : (item.risk_level === 'Medium Risk' ? '#f59e0b' : '#10b981'), 
                       color: 'white' 
                     }}>{item.risk_level?.split(' ')[0]}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '2px 10px', 
                      borderRadius: '8px', 
                      fontSize: '0.7rem', 
                      fontWeight: 'bold',
                      backgroundColor: item.status === 'Cleared' ? '#22c55e' : (item.status === 'Pending' ? '#f59e0b' : '#3b82f6'), 
                      color: 'white' 
                    }}>{item.status === 'SaveToMedical' ? 'Pending' : item.status}</span>
                  </td>
                </tr>
                );
              })}
              {allData[activeTab]?.length === 0 && !loadingData && (
                <tr>
                  <td colSpan="12" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No {activeTab} found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Helpline Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1e293b' }}>Emergency Helpline Requests</h3>
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No emergency requests.
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              {activeTab === 'users' ? 'User Details' : activeTab === 'animals' ? 'Animal Details' : activeTab === 'queries' ? 'Query Details' : 'Prescription Details'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {activeTab === 'users' && (
                <>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</label><p>{selectedItem.name}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</label><p>{selectedItem.email}</p></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Mobile Number</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="tel"
                        value={editMobile}
                        onChange={(e) => setEditMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                      />
                      <button
                        onClick={handleUpdateMobile}
                        disabled={mobileSaving}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', opacity: mobileSaving ? 0.7 : 1 }}
                      >
                        {mobileSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role</label><p>{selectedItem.role}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joined On</label><p>{new Date(selectedItem.createdAt).toLocaleString()}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User ID</label><p style={{ fontSize: '0.7rem' }}>{selectedItem._id}</p></div>
                </>
              )}
              {activeTab === 'animals' && (
                <>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identifier</label><p>{selectedItem.identifier}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type</label><p>{selectedItem.type}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age</label><p>{selectedItem.age}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer</label><p>{selectedItem.farmer_id?.name || 'Unknown'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer Mobile</label><p>{selectedItem.farmer_id?.mobile || 'N/A'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered At</label><p>{new Date(selectedItem.createdAt).toLocaleString()}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Animal ID</label><p style={{ fontSize: '0.7rem' }}>{selectedItem._id}</p></div>
                </>
              )}
              {activeTab === 'queries' && (
                <>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health Concern / message</label>
                    <p style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '0.5rem' }}>{selectedItem.text_message || 'Voice Message Only'}</p>
                  </div>
                  {selectedItem.audio_url && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voice Message</label>
                      <audio controls src={`${import.meta.env.VITE_API_URL}${selectedItem.audio_url}`} style={{ width: '100%', marginTop: '0.5rem' }} />
                    </div>
                  )}
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer</label><p>{selectedItem.farmer_id?.name}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer Mobile</label><p>{selectedItem.farmer_id?.mobile || 'N/A'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Animal</label><p>{selectedItem.animal_id?.identifier} ({selectedItem.animal_id?.type})</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vet Assigned</label><p>{selectedItem.vet_id?.name || 'Pending'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</label><p>{selectedItem.status}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created At</label><p>{new Date(selectedItem.createdAt).toLocaleString()}</p></div>
                </>
              )}
              {activeTab === 'prescriptions' && (
                <>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Medicine Name</label><p>{selectedItem.medicine_name}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dosage</label><p>{selectedItem.dosage}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Withdrawal Period</label><p>{selectedItem.withdrawal_period}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Food Product</label><p>{selectedItem.food_type !== 'None' ? selectedItem.food_type : 'N/A'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lab MRL</label><p>{selectedItem.lab_mrl || 'N/A'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin MRL</label><p>{selectedItem.mrl_admin || 'N/A'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Level</label>
                    <p style={{ color: RISK_COLORS[selectedItem.risk_level] }}>{selectedItem.risk_level}</p>
                  </div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer</label><p>{selectedItem.farmer_id?.name}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer Mobile</label><p>{selectedItem.farmer_id?.mobile || 'N/A'}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Animal</label><p>{selectedItem.animal_id?.identifier} ({selectedItem.animal_id?.type})</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vet</label><p>{selectedItem.vet_id?.name}</p></div>
                   <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</label><p>{selectedItem.status}</p></div>
                  <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issued At</label><p>{new Date(selectedItem.createdAt).toLocaleString()}</p></div>
                </>
              )}
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Close Details</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AdminDashboard;
