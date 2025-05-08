import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, deleteAppointment } from '../services/api';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setLoading(true);
        setError(null);
        await deleteAppointment(appointmentId);
        alert('Appointment deleted successfully!');
        fetchAppointments(); // Refresh list
      } catch (err) {
        console.error("Failed to delete appointment:", err);
        const message = err.response?.data?.message || 'Failed to delete appointment.';
        setError(message);
        setLoading(false);
      }
    }
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
                  {/* Format timestamp to readable date and time */}
                  <td>{new Date(appt.appointment_date).toLocaleString()}</td>
                  {/* Use patient_name if available, otherwise fall back to IDs */}
                  <td>
                    <Link to={`/patients/${appt.patient_id}`}>
                      {appt.patient_name || `Patient #${appt.patient_id}`}
                    </Link>
                  </td>
                  {/* Use provider_name if available, otherwise fall back to IDs */}
                  <td>
                    <Link to={`/providers/${appt.provider_id}`}>
                      {appt.provider_name || `Provider #${appt.provider_id}`}
                    </Link>
                  </td>
                  <td>{appt.reason_for_visit || 'N/A'}</td>
                  <td>
                    <Link to={`/appointments/${appt.appointment_id}/edit`}>Edit</Link> |
                    <button className="danger" onClick={() => handleDelete(appt.appointment_id)} disabled={loading}>
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