import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ClaimDetailPage() {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Get the claim ID from the URL

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        setLoading(true);
        // TODO: Adjust the API endpoint if necessary
        const response = await api.get(`/claims/${id}`);
        setClaim(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching claim details:", err);
        setError('Failed to fetch claim details. Please try again later.');
        setClaim(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]); // Re-run effect if the ID changes

  if (loading) {
    return <div>Loading claim details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!claim) {
    return <div>Claim not found.</div>;
  }

  // TODO: Add more claim details as needed
  return (
    <div className="container">
      <h1>Claim Details</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Claim ID: {claim.claim_id}</h5>
          <p className="card-text"><strong>Patient ID:</strong> {claim.patient_id}</p>
          <p className="card-text"><strong>Provider ID:</strong> {claim.provider_id}</p>
          <p className="card-text"><strong>Service ID:</strong> {claim.service_id}</p>
          <p className="card-text"><strong>Claim Date:</strong> {new Date(claim.claim_date).toLocaleDateString()}</p>
          <p className="card-text"><strong>Amount:</strong> ${claim.amount?.toFixed(2)}</p>
          <p className="card-text"><strong>Status:</strong> {claim.status}</p>
           {/* Add links for editing or other actions if needed */}
          <Link to="/claims" className="btn btn-secondary">Back to Claims</Link>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetailPage; 