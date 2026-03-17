import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { Package, Pill, CheckCircle, Trash2 } from 'lucide-react';

const MedicalStoreDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/medical/prescriptions');
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispense = async (id) => {
    try {
      await api.put(`/medical/dispense/${id}`);
      fetchPrescriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Delete this dispensed prescription record?')) return;
    try {
      await api.delete(`/medical/prescription/${id}`);
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'High Risk': return <span className="badge badge-danger">High Risk</span>;
      case 'Medium Risk': return <span className="badge badge-warning">Medium Risk</span>;
      default: return <span className="badge badge-success">Safe Risk</span>;
    }
  };

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'SaveToMedical');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'Dispensed' || p.status === 'Cleared');

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>Medical Store Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Dispense medications and manage inventory.</p>
        </div>
        <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
          <Package size={28} color="var(--warning)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Inventory Widget */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} /> Inventory
          </h3>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No inventory management active.
          </div>
        </div>

        {/* Dispense Prescriptions */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={20} /> Dispense Prescriptions
          </h3>

          <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Pending Dispense ({pendingPrescriptions.length})
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {pendingPrescriptions.map((px) => (
              <div key={px._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#fff' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', flex: 1 }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {px.medicine_name} <span style={{ marginLeft: '0.5rem' }}>{getRiskBadge(px.risk_level)}</span>
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Patient: <span style={{ fontWeight: '500', color: 'var(--text-dark)' }}>{px.farmer_id?.name}</span> ({px.animal_id?.type})
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Prescriber: {px.vet_id?.name}
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: '#fee2e2', borderRadius: '4px', border: '1px solid #fecaca', fontSize: '0.75rem', color: '#991b1b', marginTop: '0.75rem' }}>
                      <span style={{ fontWeight: '600' }}>⚠ Warn: {px.withdrawal_period}-day withdrawal required</span>
                    </div>
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Dosage: {px.dosage}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Date: {new Date(px.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ marginLeft: '2rem' }}>
                  <button onClick={() => handleDispense(px._id)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} /> Dispense
                  </button>
                </div>
              </div>
            ))}
            {pendingPrescriptions.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No pending prescriptions.</p>}
          </div>

          <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Recently Dispensed
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dispensedPrescriptions.map((px) => (
              <div key={px._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <h5 style={{ fontWeight: '600', fontSize: '0.95rem' }}>{px.medicine_name} - {px.dosage}</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Given to {px.farmer_id?.name} for {px.animal_id?.type}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-success">Dispensed</span>
                  <button
                    onClick={() => handleDeletePrescription(px._id)}
                    title="Delete dispensed record"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {dispensedPrescriptions.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default MedicalStoreDashboard;
