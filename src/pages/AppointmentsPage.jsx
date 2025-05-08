import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, deleteAppointment, getPatients, getProviders } from '../services/api';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch appointments, patients, and providers in parallel
      const [appointmentsData, patientsData, providersData] = await Promise.all([
        getAppointments(),
        getPatients(),
        getProviders()
      ]);
      
      // Create lookup maps for patients and providers
      const patientMap = {};
      patientsData.forEach(patient => {
        patientMap[patient.patient_id] = `${patient.first_name} ${patient.last_name}`;
      });
      
      const providerMap = {};
      providersData.forEach(provider => {
        providerMap[provider.provider_id] = provider.provider_name || 
          `${provider.first_name} ${provider.last_name}`;
      });
      
      setAppointments(appointmentsData);
      setPatients(patientMap);
      setProviders(providerMap);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setLoading(true);
        setError(null);
        await deleteAppointment(appointmentId);
        alert('Appointment deleted successfully!');
        fetchData(); // Refresh all data
      } catch (err) {
        console.error("Failed to delete appointment:", err);
        const message = err.response?.data?.message || 'Failed to delete appointment.';
        setError(message);
        setLoading(false);
      }
    }
  };

  // Helper function to get patient name from ID
  const getPatientName = (patientId) => {
    if (patients[patientId]) {
      return patients[patientId];
    }
    
    // If we have a patient_name field in the appointment data directly
    const appointment = appointments.find(a => a.patient_id === patientId);
    if (appointment && appointment.patient_name) {
      return appointment.patient_name;
    }
    
    return `Patient #${patientId}`;
  };
  
  // Helper function to get provider name from ID
  const getProviderName = (providerId) => {
    if (providers[providerId]) {
      return providers[providerId];
    }
    
    // If we have a provider_name field in the appointment data directly
    const appointment = appointments.find(a => a.provider_id === providerId);
    if (appointment && appointment.provider_name) {
      return appointment.provider_name;
    }
    
    return `Provider #${providerId}`;
  };

  return (
    <div>
      <h2>Appointments</h2>

      <div style={{ marginBottom: '1rem' }}>
        <Link to="/appointments/new">
          <button>Add New Appointment</button>
        </Link>
      </div>

      {loading && <p className="loading-message">Loading appointments...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Provider</th>
              <th>Reason for Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <tr key={appt.appointment_id}>
                  <td>{new Date(appt.appointment_date).toLocaleString()}</td>
                  <td>
                    <Link to={`/patients/${appt.patient_id}`}>
                      {getPatientName(appt.patient_id)}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/providers/${appt.provider_id}`}>
                      {getProviderName(appt.provider_id)}
                    </Link>
                  </td>
                  <td>{appt.reason_for_visit || 'N/A'}</td>
                  <td>
                    <Link to={`/appointments/${appt.appointment_id}/edit`}>Edit</Link> |
                    <button 
                      className="danger" 
                      onClick={() => handleDelete(appt.appointment_id)} 
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AppointmentsPage; 