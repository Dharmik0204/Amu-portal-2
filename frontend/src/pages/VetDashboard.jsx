import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { FileText, Stethoscope, Trash2 } from 'lucide-react';

const VetDashboard = () => {
  const [queries, setQueries] = useState([]);
  const [medicalStores, setMedicalStores] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  
  const [prescriptionForm, setPrescriptionForm] = useState({
    medical_store_id: '',
    medicine_name: '',
    dosage: '',
    withdrawal_period: '',
    risk_level: 'Safe Risk',
    lab_mrl: ''
  });

  useEffect(() => {
    fetchQueries();
    fetchMedicalStores();
  }, []);

  const fetchQueries = async () => {
    try {
      const { data } = await api.get('/vet/queries');
      setQueries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMedicalStores = async () => {
    try {
      const { data } = await api.get('/vet/medical-stores');
      setMedicalStores(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectQuery = (query) => {
    setSelectedQuery(query);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!selectedQuery) return;

    try {
      await api.post('/vet/prescription', {
        query_id: selectedQuery._id,
        ...prescriptionForm
      });
      setSelectedQuery(null);
      setPrescriptionForm({ medical_store_id: '', medicine_name: '', dosage: '', withdrawal_period: '', risk_level: 'Safe Risk', lab_mrl: '' });
      fetchQueries();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to send prescription');
    }
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Delete this dispensed query and its prescription?')) return;
    try {
      await api.delete(`/vet/query/${id}`);
      setSelectedQuery(null);
      fetchQueries();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>Veterinarian Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review farmer queries and prescribe medications.</p>
        </div>
        <Stethoscope size={32} color="var(--primary-color)" style={{ opacity: 0.2 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Queries List */}
        <div className="card" style={{ height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>Farmer Queries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {queries.map((q) => (
              <div 
                key={q._id} 
                onClick={() => handleSelectQuery(q)}
                style={{ 
                  border: `2px solid ${selectedQuery?._id === q._id ? 'var(--primary-color)' : 'var(--border-color)'}`, 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  cursor: 'pointer',
                  backgroundColor: q.status === 'Pending' ? '#fff' : '#f8fafc',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600' }}>{q.farmer_id?.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-default" style={{ backgroundColor: q.status === 'Pending' ? '#fcf0e3' : (q.prescription_status === 'Dispensed' ? '#e6f4ef' : '#e2e8f0'), color: q.status === 'Pending' ? 'var(--warning)' : (q.prescription_status === 'Dispensed' ? 'var(--success)' : 'var(--text-muted)') }}>
                      {q.status === 'Pending' ? 'Pending' : (q.prescription_status === 'Dispensed' ? 'Dispensed' : 'Responded')}
                    </span>
                    {q.prescription_status === 'Dispensed' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteQuery(q._id); }}
                        title="Delete dispensed query"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Stethoscope size={12} /> {q.animal_id?.type}</span>
                  {q.food_type && q.food_type !== 'None' && <span className="badge badge-warning" style={{ color: '#92400e', backgroundColor: '#fef3c7' }}>Food: {q.food_type}</span>}
                  {q.text_message && <span className="badge badge-default" style={{ color: 'var(--primary-color)', backgroundColor: '#e6f4ef' }}>Text</span>}
                  {q.audio_url && <span className="badge badge-default" style={{ color: 'var(--text-dark)', backgroundColor: '#e2e8f0' }}>Audio</span>}
                </div>
                
                {q.text_message && <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>"{q.text_message}"</p>}
                {q.audio_url && (
                  <audio controls src={q.audio_url} style={{ height: '36px', width: '100%', marginTop: '0.5rem' }} />
                )}
              </div>
            ))}
            {queries.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No queries right now.</p>}
          </div>
        </div>

        {/* Prescription Panel */}
        <div className="card" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} /> Create Prescription
          </h3>
          
          {!selectedQuery ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontWeight: '500' }}>Select a patient message</p>
              <p style={{ fontSize: '0.875rem' }}>Choose a farmer from the list on the left.</p>
            </div>
          ) : (
            selectedQuery.status === 'Responded' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: selectedQuery.prescription_status === 'Dispensed' ? 'var(--success)' : 'var(--text-muted)', textAlign: 'center' }}>
                {selectedQuery.prescription_status === 'Dispensed' ? (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Medicine Dispensed!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The medical store has dispensed this prescription to the farmer.</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <h3 style={{ fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Prescription Sent</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Waiting for the medical store to dispense the medicine.</p>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitPrescription} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Prescribing for:</p>
                  <p style={{ fontWeight: '600' }}>{selectedQuery.farmer_id?.name} - {selectedQuery.animal_id?.identifier} ({selectedQuery.animal_id?.type})</p>
                  {selectedQuery.food_type && selectedQuery.food_type !== 'None' && (
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#92400e', fontWeight: '500' }}>Food Product: {selectedQuery.food_type}</p>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Select Medical Store *</label>
                  <select className="input-field" value={prescriptionForm.medical_store_id} onChange={(e) => setPrescriptionForm({...prescriptionForm, medical_store_id: e.target.value})} required>
                    <option value="">Choose a medical store...</option>
                    {medicalStores.map(store => <option key={store._id} value={store._id}>{store.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Medicine Name *</label>
                  <input type="text" className="input-field" placeholder="e.g., Amoxicillin" value={prescriptionForm.medicine_name} onChange={(e) => setPrescriptionForm({...prescriptionForm, medicine_name: e.target.value})} required />
                </div>

                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Dosage *</label>
                    <input type="text" className="input-field" placeholder="e.g., 2 tabs daily" value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Withdrawal Period *</label>
                    <input type="text" className="input-field" placeholder="e.g., 5 days" value={prescriptionForm.withdrawal_period} onChange={(e) => setPrescriptionForm({...prescriptionForm, withdrawal_period: e.target.value})} required />
                  </div>
                </div>

                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Lab MRL (Optional)</label>
                    <input type="text" className="input-field" placeholder="e.g., 150.5" value={prescriptionForm.lab_mrl} onChange={(e) => setPrescriptionForm({...prescriptionForm, lab_mrl: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Risk Level *</label>
                    <select className="input-field" value={prescriptionForm.risk_level} onChange={(e) => setPrescriptionForm({...prescriptionForm, risk_level: e.target.value})} required>
                      <option value="Safe Risk">Safe Risk</option>
                      <option value="Medium Risk">Medium Risk</option>
                      <option value="High Risk">High Risk</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 'auto', padding: '1rem' }}>
                  Send Prescription to Medical Store
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VetDashboard;
