import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Assuming api service for create/update/get

function ClaimFormPage() {
  const { id } = useParams(); // 'id' will be undefined for /new
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const initialFormData = {
    patient_id: '',
    provider_id: '',
    claim_date: new Date().toISOString().split('T')[0],
    status: 'Submitted',
    items: [{ service_id: '', charge_amount: '' }],
    insurance_paid: 0, // Initialize payment fields
    patient_paid: 0
  };

  const [formData, setFormData] = useState(initialFormData);
  const [patients, setPatients] = useState([]); // For patient dropdown
  const [providers, setProviders] = useState([]); // For provider dropdown
  const [services, setServices] = useState([]); // For service dropdown in items
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component
    setLoading(true);
    setError(null);

    const fetchDropdownData = async () => {
      try {
        const [patientsRes, providersRes, servicesRes] = await Promise.all([
          api.get('/patients'),
          api.get('/providers'),
          api.get('/services')
        ]);
        if (isMounted) {
          setPatients(patientsRes.data || []);
          setProviders(providersRes.data || []);
          setServices(servicesRes.data || []);
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
            items: claimData.items && claimData.items.length > 0 ? claimData.items.map(item => ({ ...item, charge_amount: item.charge_amount || '' })) : [{ service_id: '', charge_amount: '' }],
            insurance_paid: claimData.insurance_paid || 0,
            patient_paid: claimData.patient_paid || 0
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
        if (isMounted) setLoading(false); // No claim data to fetch in create mode
      }
    });

    // Cleanup function
    return () => { isMounted = false };

  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = formData.items.map((item, i) => 
      i === index ? { ...item, [name]: value } : item
    );
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { service_id: '', charge_amount: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
        ...formData,
        items: formData.items.map(item => ({ 
            service_id: item.service_id,
            charge_amount: parseFloat(item.charge_amount) || 0 
        })).filter(item => item.service_id && item.charge_amount > 0)
    };

    if (!payload.patient_id || !payload.provider_id || !payload.claim_date || !payload.status) {
        setError('Please fill in all required claim header fields.');
        setLoading(false);
        return;
    }
    if (!payload.items.length) {
        setError('At least one valid service item (with service and charge > 0) is required.');
        setLoading(false);
        return;
    }

    // Remove payment fields if creating (they are usually set by payment actions)
    if (!isEditMode) {
        delete payload.insurance_paid;
        delete payload.patient_paid;
    }

    try {
      if (isEditMode) {
        // Update requires PUT and might only update specific fields like status
        // Sending the full payload might be incorrect depending on backend PUT logic
        // For now, assume we only update status or similar non-item fields
        await api.put(`/claims/${id}`, { status: formData.status }); // Example: only update status
        alert('Claim status updated successfully!'); // Adjust message based on actual update logic
        navigate(`/claims/${id}`);
      } else {
        const response = await api.post('/claims', payload);
        alert('Claim created successfully!');
        navigate(`/claims/${response.data.claim_id}`);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} claim:`, err);
      const message = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} claim.`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>{isEditMode ? `Edit Claim ${id}` : 'Create New Claim'}</h1>
      {error && <p className="alert alert-danger">Error: {error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          {/* Patient Selector */}
          <div className="col-md-6">
            <label htmlFor="patient_id" className="form-label">Patient:</label>
            <select id="patient_id" name="patient_id" className="form-select" value={formData.patient_id} onChange={handleChange} required disabled={loading || isEditMode}>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.last_name}, {p.first_name} (ID: {p.patient_id})</option>)}
            </select>
          </div>
          {/* Provider Selector */}
          <div className="col-md-6">
            <label htmlFor="provider_id" className="form-label">Provider:</label>
            <select id="provider_id" name="provider_id" className="form-select" value={formData.provider_id} onChange={handleChange} required disabled={loading || isEditMode}>
              <option value="">Select Provider</option>
              {providers.map(p => <option key={p.provider_id} value={p.provider_id}>{p.provider_name} (ID: {p.provider_id})</option>)}
            </select>
          </div>
        </div>

        <div className="row mb-3">
           {/* Claim Date */}
          <div className="col-md-6">
            <label htmlFor="claim_date" className="form-label">Claim Date:</label>
            <input type="date" id="claim_date" name="claim_date" className="form-control" value={formData.claim_date} onChange={handleChange} required disabled={loading || isEditMode} />
          </div>
          {/* Status Selector */}
          <div className="col-md-6">
            <label htmlFor="status" className="form-label">Status:</label>
            <select id="status" name="status" className="form-select" value={formData.status} onChange={handleChange} required disabled={loading}>
              <option value="Submitted">Submitted</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
              <option value="Denied">Denied</option>
              <option value="Partial">Partial</option>
              {/* Add other valid statuses */}
            </select>
          </div>
        </div>

        <hr />
        <h3>Claim Items</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="row g-2 mb-2 align-items-center claim-item-row">
            <div className="col-md-6">
              <label htmlFor={`service_id_${index}`} className="form-label visually-hidden">Service:</label>
              <select
                id={`service_id_${index}`}
                name="service_id"
                className="form-select"
                value={item.service_id || ''}
                onChange={(e) => handleItemChange(index, e)}
                required
                disabled={loading || isEditMode}
              >
                <option value="">Select Service</option>
                {services.map(s => <option key={s.service_id} value={s.service_id}>{s.cpt_code} - {s.description}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor={`charge_amount_${index}`} className="form-label visually-hidden">Charge Amount:</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id={`charge_amount_${index}`}
                  name="charge_amount"
                  className="form-control"
                  value={item.charge_amount || ''}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Charge Amount"
                  required
                  disabled={loading || isEditMode}
                />
              </div>
            </div>
            <div className="col-md-2">
              {!isEditMode && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)} disabled={formData.items.length <= 1 || loading}>Remove</button>
              )}
            </div>
          </div>
        ))}
        {!isEditMode && (
          <button type="button" className="btn btn-sm btn-secondary mt-2" onClick={addItem} disabled={loading}>Add Item</button>
        )}
        
        <hr />

        <div className="mt-4">
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>{loading ? 'Saving...' : (isEditMode ? 'Update Status' : 'Create Claim')}</button>
            <Link to="/claims" className="btn btn-secondary">Cancel</Link>
        </div>

      </form>
    </div>
  );
}

export default ClaimFormPage; 