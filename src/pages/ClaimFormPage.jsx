import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function ClaimFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const initialFormData = {
    patient_id: '',
    provider_id: '',
    claim_date: new Date().toISOString().split('T')[0],
    status: 'Submitted',
    total_charge: '',
    insurance_paid: '0.00',
    patient_paid: '0.00'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchDropdownData = async () => {
      try {
        const [patientsRes, providersRes] = await Promise.all([
          api.get('/patients'),
          api.get('/providers')
        ]);
        if (isMounted) {
          setPatients(patientsRes.data || []);
          setProviders(providersRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        if (isMounted) setError('Failed to load necessary data for the form.');
      }
    };

    const fetchClaimData = async () => {
      try {
        const response = await api.get(`/claims/${id}`);
        if (isMounted) {
          const claimData = response.data;
          setFormData({
            patient_id: claimData.patient_id || '',
            provider_id: claimData.provider_id || '',
            claim_date: claimData.claim_date ? new Date(claimData.claim_date).toISOString().split('T')[0] : '',
            status: claimData.status || 'Submitted',
            total_charge: claimData.total_charge || '',
            insurance_paid: claimData.insurance_paid || '0.00',
            patient_paid: claimData.patient_paid || '0.00'
          });
        }
      } catch (err) {
        console.error("Error fetching claim details for edit:", err);
        if (isMounted) setError('Failed to fetch claim details for editing.');
      }
    };

    fetchDropdownData().then(() => {
      if (isEditMode) {
        fetchClaimData().finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        if (isMounted) setLoading(false);
      }
    });

    return () => { isMounted = false };
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.patient_id || !formData.provider_id || !formData.claim_date || !formData.status) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Format numbers correctly
    const payload = {
      ...formData,
      patient_id: parseInt(formData.patient_id, 10),
      provider_id: parseInt(formData.provider_id, 10),
      total_charge: parseFloat(formData.total_charge) || 0,
      insurance_paid: parseFloat(formData.insurance_paid) || 0,
      patient_paid: parseFloat(formData.patient_paid) || 0
    };

    try {
      if (isEditMode) {
        await api.put(`/claims/${id}`, payload);
        alert('Claim updated successfully!');
      } else {
        const response = await api.post('/claims', payload);
        alert('Claim created successfully!');
        navigate(`/claims/${response.data.claim_id}`);
      }
      navigate('/claims');
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} claim:`, err);
      const message = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} claim.`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Get patient name for dropdown display
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.patient_id === parseInt(patientId, 10));
    return patient ? `${patient.last_name}, ${patient.first_name}` : 'Unknown';
  };

  // Get provider name for dropdown display
  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.provider_id === parseInt(providerId, 10));
    return provider ? provider.provider_name || `${provider.last_name}, ${provider.first_name}` : 'Unknown';
  };

  if (loading && !formData.patient_id) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>{isEditMode ? `Edit Claim ${id}` : 'Create New Claim'}</h1>
      {error && <p className="alert alert-danger">Error: {error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          {/* Patient Selector */}
          <div className="col-md-6">
            <label htmlFor="patient_id" className="form-label">Patient:</label>
            <select 
              id="patient_id" 
              name="patient_id" 
              className="form-select" 
              value={formData.patient_id} 
              onChange={handleChange} 
              required 
              disabled={loading || isEditMode}
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.last_name}, {p.first_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Provider Selector */}
          <div className="col-md-6">
            <label htmlFor="provider_id" className="form-label">Provider:</label>
            <select 
              id="provider_id" 
              name="provider_id" 
              className="form-select" 
              value={formData.provider_id} 
              onChange={handleChange} 
              required 
              disabled={loading || isEditMode}
            >
              <option value="">Select Provider</option>
              {providers.map(p => (
                <option key={p.provider_id} value={p.provider_id}>
                  {p.provider_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          {/* Claim Date */}
          <div className="col-md-6">
            <label htmlFor="claim_date" className="form-label">Claim Date:</label>
            <input 
              type="date" 
              id="claim_date" 
              name="claim_date" 
              className="form-control" 
              value={formData.claim_date} 
              onChange={handleChange} 
              required 
              disabled={loading || isEditMode} 
            />
          </div>
          
          {/* Status Selector */}
          <div className="col-md-6">
            <label htmlFor="status" className="form-label">Status:</label>
            <select 
              id="status" 
              name="status" 
              className="form-select" 
              value={formData.status} 
              onChange={handleChange} 
              required 
              disabled={loading}
            >
              <option value="Submitted">Submitted</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
              <option value="Denied">Denied</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          {/* Total Charge */}
          <div className="col-md-4">
            <label htmlFor="total_charge" className="form-label">Total Charge:</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="total_charge"
                name="total_charge"
                className="form-control"
                value={formData.total_charge}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Insurance Paid */}
          <div className="col-md-4">
            <label htmlFor="insurance_paid" className="form-label">Insurance Paid:</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="insurance_paid"
                name="insurance_paid"
                className="form-control"
                value={formData.insurance_paid}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Patient Paid */}
          <div className="col-md-4">
            <label htmlFor="patient_paid" className="form-label">Patient Paid:</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="patient_paid"
                name="patient_paid"
                className="form-control"
                value={formData.patient_paid}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Claim' : 'Create Claim')}
          </button>
          <Link to="/claims" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default ClaimFormPage; 