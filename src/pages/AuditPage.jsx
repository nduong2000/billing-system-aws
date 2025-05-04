import React, { useState } from 'react';
import api, { auditClaim } from '../services/api';

// Define available Ollama instances and models
const ollamaInstances = [
  { name: 'Mac mini M4', url: 'http://10.63.1.29:11434' },  // Add more instances if needed
];

const availableModels = [
  'mistral:7b',
  'gemma3:12b',
  'phi4:14b',
  'deepseek-r1:8b',
  // Add more models as available on your instances
];

// Set to false to disable debug information
const SHOW_DEBUG_INFO = false;

function AuditPage() {
  const [claimId, setClaimId] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // State for debug information

  // Add state for selections
  const [selectedOllamaUrl, setSelectedOllamaUrl] = useState(ollamaInstances[0].url); // Default to first instance
  const [selectedModel, setSelectedModel] = useState(availableModels[0]); // Default to first model

  const handleAudit = async () => {
    if (!claimId) {
      setError('Please enter a Claim ID.');
      return;
    }
    if (!selectedOllamaUrl) {
        setError('Please select an Ollama instance.');
        return;
    }
    if (!selectedModel) {
        setError('Please select an Ollama model.');
        return;
    }

    setLoading(true);
    setError(null);
    setAuditResult(null);
    setDebugInfo(null); // Clear debug info

    try {
      // Log the data being sent
      console.log(`[AuditPage] Sending audit request for Claim ID: ${claimId}`);
      console.log(`[AuditPage] Target Ollama URL: ${selectedOllamaUrl}`);
      console.log(`[AuditPage] Target Ollama Model: ${selectedModel}`);

      // Request payload
      const payload = {
        claim_id: claimId,
        targetOllamaUrl: selectedOllamaUrl,
        targetOllamaModel: selectedModel
      };

      // Use the specific auditClaim function
      const data = await auditClaim(claimId, payload);
      
      if (SHOW_DEBUG_INFO) {
        console.log('[AuditPage] Audit API response data:', data);

        // Collect debug info
        const debugData = {
          responseDataKeys: Object.keys(data || {}),
          hasAnalysis: !!data?.analysis,
          hasAuditResult: !!data?.audit_result,
          analysisType: typeof data?.analysis,
          auditResultType: typeof data?.audit_result,
          analysisLength: data?.analysis?.length || 0,
          auditResultLength: data?.audit_result?.length || 0,
          responseDataSample: JSON.stringify(data).substring(0, 500) + '...'
        };
        setDebugInfo(debugData);
      }

      // Extract the audit text directly - looking for either analysis (old format) or audit_result (new format)
      const analysisText = data?.analysis?.trim() || data?.audit_result?.trim();
      
      if (SHOW_DEBUG_INFO) {
        console.log('[AuditPage] Analysis/audit text extracted:', analysisText ? 'YES' : 'NO');
        console.log('[AuditPage] Analysis/audit type:', typeof analysisText);
        console.log('[AuditPage] Analysis/audit length:', analysisText?.length || 0);
        console.log('[AuditPage] Analysis/audit sample:', analysisText?.substring(0, 100));
      }

      if (analysisText) {
          if (SHOW_DEBUG_INFO) {
            console.log('[AuditPage] Setting audit result with analysis text');
          }
          setAuditResult(analysisText);
      } else {
          if (SHOW_DEBUG_INFO) {
            console.log('[AuditPage] No analysis text, setting fallback message');
          }
          setAuditResult("Audit completed, but no analysis text was returned.");
      }

    } catch (err) {
      console.error("[AuditPage] Error performing audit:", err);
      
      if (SHOW_DEBUG_INFO) {
        console.error("[AuditPage] Error response:", err.response);
        console.error("[AuditPage] Error request:", err.request);
        console.error("[AuditPage] Error message:", err.message);
        console.error("[AuditPage] Error config:", err.config);
      }
      
      const message = err.response?.data?.message || 'Failed to perform audit. Check Claim ID, selections, and backend/Ollama status.';
      setError(message);
      setAuditResult(null);
      
      if (SHOW_DEBUG_INFO) {
        // Collect error debug info
        setDebugInfo({
          error: true,
          errorType: err.name,
          errorMessage: err.message,
          responseStatus: err.response?.status,
          responseData: err.response?.data,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Claim Audit (Ollama)</h1>
      <p>Enter a Claim ID and select the Ollama instance/model to use for the audit.</p>

      <div className="row g-3 align-items-end">
        {/* Claim ID Input */}
        <div className="col-md-3">
          <label htmlFor="claimIdInput" className="form-label">Claim ID:</label>
          <input
            type="number"
            className="form-control"
            id="claimIdInput"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            placeholder="Enter Claim ID"
            disabled={loading}
            min="0"
          />
        </div>

        {/* Ollama Instance Select */}
        <div className="col-md-3">
            <label htmlFor="ollamaInstanceSelect" className="form-label">Ollama Instance:</label>
            <select
                id="ollamaInstanceSelect"
                className="form-select"
                value={selectedOllamaUrl}
                onChange={(e) => setSelectedOllamaUrl(e.target.value)}
                disabled={loading}
            >
                {ollamaInstances.map(instance => (
                    <option key={instance.url} value={instance.url}>
                        {instance.name}
                    </option>
                ))}
            </select>
        </div>

        {/* Ollama Model Select */}
        <div className="col-md-3">
            <label htmlFor="ollamaModelSelect" className="form-label">Model:</label>
            <select
                id="ollamaModelSelect"
                className="form-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
            >
                {availableModels.map(modelName => (
                    <option key={modelName} value={modelName}>
                        {modelName}
                    </option>
                ))}
            </select>
        </div>

        {/* Audit Button */}
        <div className="col-md-3">
            <button
                className="btn btn-primary w-100"
                onClick={handleAudit}
                disabled={loading || !claimId || !selectedOllamaUrl || !selectedModel}
            >
                {loading ? 'Auditing...' : 'Run Audit'}
            </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {auditResult && (
        <div className="mt-4">
          <h2>Audit Result:</h2>
          <pre className="bg-light p-3 border rounded" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {auditResult}
          </pre>
        </div>
      )}
      
      {/* Debug Information Section - Only shown when SHOW_DEBUG_INFO is true */}
      {SHOW_DEBUG_INFO && debugInfo && (
        <div className="mt-4 border-top pt-3">
          <h3>Debug Information:</h3>
          <div className="alert alert-secondary">
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditPage; 