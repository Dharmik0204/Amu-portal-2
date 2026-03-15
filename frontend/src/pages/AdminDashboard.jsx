import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { Users, FileText, AlertTriangle, Home, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const RISK_COLORS = {
    'Safe': '#10b981', // green
    'Medium Risk': '#f59e0b', // orange
    'High Risk': '#ef4444' // red
  };

  const ROLE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  // Dummy pipeline mock data matching the screenshot
  const pipelineData = [
    { name: 'Pending', count: 0 },
    { name: 'Sent to Medical', count: 2 },
    { name: 'Dispensed', count: 5 },
    { name: 'Cleared', count: 0 },
  ];

  // Dummy daily prescriptions mock data
  const dailyPrescriptions = [
    { day: 'Mon', count: 2 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 5 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 },
  ];

  if (!stats) return <Layout><div style={{ padding: '2rem' }}>Loading stats...</div></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>Admin Analytics Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>System-wide monitoring of Antimicrobial Use (AMU) and user activity.</p>
        </div>
        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <Shield size={28} color="#8b5cf6" style={{ opacity: 0.3 }} />
        </div>
      </div>

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gridTemplateRows: 'auto auto', gap: '1.5rem' }}>
        
        {/* MRL Risk Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>MRL Risk Distribution</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.riskDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" stroke="none">
                  {stats.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by Role */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>Users by Role</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.usersByRole} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                  {stats.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPrescriptions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;
