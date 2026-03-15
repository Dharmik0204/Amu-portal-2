import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { Plus, Mic, Send, Play } from 'lucide-react';

const FarmerDashboard = () => {
  const [animals, setAnimals] = useState([]);
  const [vets, setVets] = useState([]);
  const [queries, setQueries] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  
  const [newAnimal, setNewAnimal] = useState({ type: '', age: '', identifier: '' });
  const [queryForm, setQueryForm] = useState({ vet_id: '', animal_id: '', text_message: '', food_type: 'None' });
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [animalsRes, vetsRes, queriesRes, prescriptionsRes] = await Promise.all([
        api.get('/farmer/animals'),
        api.get('/farmer/vets'),
        api.get('/farmer/queries'),
        api.get('/farmer/prescriptions')
      ]);
      setAnimals(animalsRes.data);
      setVets(vetsRes.data);
      setQueries(queriesRes.data);
      setPrescriptions(prescriptionsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/farmer/animal', newAnimal);
      setNewAnimal({ type: '', age: '', identifier: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!queryForm.vet_id || !queryForm.animal_id) return alert('Select Vet and Animal');

    const formData = new FormData();
    formData.append('vet_id', queryForm.vet_id);
    formData.append('animal_id', queryForm.animal_id);
    formData.append('text_message', queryForm.text_message);
    formData.append('food_type', queryForm.food_type);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.webm');
    }

    try {
      await api.post('/farmer/query', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setQueryForm({ vet_id: '', animal_id: '', text_message: '', food_type: 'None' });
      setAudioBlob(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'High Risk': return <span className="badge badge-danger">High Risk</span>;
      case 'Medium Risk': return <span className="badge badge-warning">Medium Risk</span>;
      default: return <span className="badge badge-success">Safe Risk</span>;
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>Welcome!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your farm and consult with veterinarians.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Farm Animals */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>My Farm Animals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
              {animals.map((animal) => (
                <div key={animal._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>{animal.identifier}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{animal.age} old {animal.type}</p>
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {animal.identifier.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddAnimal} style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="input-field" placeholder="Type (Cow, etc.)" style={{ margin: 0 }} value={newAnimal.type} onChange={(e) => setNewAnimal({...newAnimal, type: e.target.value})} required />
              <input type="text" className="input-field" placeholder="Age" style={{ margin: 0, width: '80px' }} value={newAnimal.age} onChange={(e) => setNewAnimal({...newAnimal, age: e.target.value})} required />
              <input type="text" className="input-field" placeholder="Name" style={{ margin: 0 }} value={newAnimal.identifier} onChange={(e) => setNewAnimal({...newAnimal, identifier: e.target.value})} required />
              <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }}><Plus size={18} /></button>
            </form>
          </div>

          {/* Consult Vet */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>Consult Vet</h3>
            <form onSubmit={handleSubmitQuery}>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Select Vet *</label>
                <select className="input-field" value={queryForm.vet_id} onChange={(e) => setQueryForm({...queryForm, vet_id: e.target.value})} required>
                  <option value="">Choose a vet...</option>
                  {vets.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Select Animal *</label>
                <select className="input-field" value={queryForm.animal_id} onChange={(e) => setQueryForm({...queryForm, animal_id: e.target.value})} required>
                  <option value="">Choose an animal...</option>
                  {animals.map(a => <option key={a._id} value={a._id}>{a.identifier} ({a.type})</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Food Produced *</label>
                <select className="input-field" value={queryForm.food_type} onChange={(e) => setQueryForm({...queryForm, food_type: e.target.value})} required>
                  <option value="None">None</option>
                  <option value="Milk">Milk</option>
                  <option value="Meat">Meat</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Text Message (Optional)</label>
                <textarea className="input-field" rows="3" placeholder="Describe the issue..." value={queryForm.text_message} onChange={(e) => setQueryForm({...queryForm, text_message: e.target.value})}></textarea>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Voice Message (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  {!isRecording ? (
                    <button type="button" onClick={startRecording} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <Mic size={18} /> Start Recording
                    </button>
                  ) : (
                    <button type="button" onClick={stopRecording} className="btn-primary" style={{ backgroundColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      Stop Recording
                    </button>
                  )}
                  {audioBlob && <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Audio recorded!</div>}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Prescriptions */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>My Prescriptions</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {prescriptions.map((px) => (
                <div key={px._id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                        {px.medicine_name} <span style={{ marginLeft: '0.5rem' }}>{getRiskBadge(px.risk_level)}</span>
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        For {px.animal_id?.identifier} ({px.animal_id?.type}) • {px.dosage}
                      </p>
                    </div>
                    <span className="badge badge-default" style={{ color: px.status === 'SaveToMedical' ? 'var(--primary-color)' : 'var(--success)' }}>
                      {px.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.875rem', color: '#92400e' }}>
                    <span style={{ fontWeight: '600' }}>⚠ Withdrawal: {px.withdrawal_period}</span>
                  </div>
                </div>
              ))}
              {prescriptions.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No prescriptions yet.</p>}
            </div>
          </div>

          {/* Past Queries */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>My Queries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
              {queries.map((q) => (
                <div key={q._id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-success">{q.animal_id?.identifier}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To: {q.vet_id?.name}</span>
                    </div>
                    <span className="badge badge-default">{q.status}</span>
                  </div>
                  {q.text_message && <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>"{q.text_message}"</p>}
                  {q.audio_url && (
                    <audio controls src={q.audio_url} style={{ height: '36px', width: '100%' }} />
                  )}
                </div>
              ))}
              {queries.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No queries sent.</p>}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;
