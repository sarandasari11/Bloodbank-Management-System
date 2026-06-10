import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../components/NotificationProvider';
import { useData } from '../components/DataContext';

function RequestManagement() {
  const { showToast, confirm } = useNotification();
  const { 
    requests, fetchRequests, loadingRequests,
    hospitals, fetchHospitals, loadingHospitals,
    fetchStats, fetchInventory
  } = useData();

  // Form state
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set default hospital when hospitals load
  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospitalId(hospitals[0]._id);
    }
  }, [hospitals, selectedHospitalId]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedHospitalId) {
      showToast('Please register and select a hospital first.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/requests', {
        hospitalId: selectedHospitalId,
        bloodGroup,
        unitsRequired: parseInt(unitsRequired),
        requestDate: new Date(requestDate)
      });
      showToast('Blood request submitted successfully!', 'success');
      setUnitsRequired(1);
      
      // Refresh cache
      fetchRequests();
      fetchStats();
    } catch (err) {
      showToast('Error creating blood request: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(`/api/requests/${id}`, {
        status: newStatus
      });
      showToast(res.data.message || `Request status set to ${newStatus}.`, 'success');
      
      // Refresh cache
      fetchRequests();
      fetchStats();
      fetchInventory();
    } catch (err) {
      showToast('Transaction Error: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleDeleteRequest = (id) => {
    confirm(
      'Are you sure you want to permanently delete this request record? Any approved units will be returned to inventory.',
      async () => {
        try {
          await axios.delete(`/api/requests/${id}`);
          showToast('Request record deleted successfully.', 'success');
          
          // Refresh cache
          fetchRequests();
          fetchStats();
          fetchInventory();
        } catch (err) {
          showToast('Error deleting request: ' + err.message, 'error');
        }
      },
      'Delete Blood Request'
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-approved';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge badge-pending';
  };

  if ((loadingRequests && requests.length === 0) || (loadingHospitals && hospitals.length === 0)) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading blood requests queue...</p></div>;
  }

  return (
    <div className="container">
      <div>
        <h1 className="page-title">Blood Request Management</h1>
        <p className="page-subtitle">Process hospital blood unit requirements and coordinate approvals</p>
      </div>

      <div className="split-layout">
        <div className="card">
          <h2 className="form-title">Request Queue</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Hospital</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                      No blood requests registered in the system.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <code style={{ background: '#f1f3f5', padding: '4px 6px', borderRadius: '4px' }}>
                          REQ-{r._id.slice(-6).toUpperCase()}
                        </code>
                      </td>
                      <td>
                        <strong>{r.hospitalId?.hospitalName || 'Deleted Hospital'}</strong>
                        {r.hospitalId && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {r.hospitalId._id.slice(-6).toUpperCase()}</div>}
                      </td>
                      <td>
                        <span className="badge badge-stock-normal" style={{ background: '#ffe3e6', color: 'var(--primary-color)' }}>
                          {r.bloodGroup}
                        </span>
                      </td>
                      <td><strong>{r.unitsRequired}</strong> units</td>
                      <td>{formatDate(r.requestDate)}</td>
                      <td>
                        <span className={getStatusBadgeClass(r.status)}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-actions">
                          {r.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(r._id, 'Approved')} 
                                className="btn btn-success"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(r._id, 'Rejected')} 
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDeleteRequest(r._id)} 
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h2 className="form-title">Submit Blood Request</h2>
          <form onSubmit={handleCreateRequest} style={{ width: '100%', padding: 0, boxShadow: 'none' }}>
            <div className="form-group">
              <label>Select Hospital</label>
              {hospitals.length === 0 ? (
                <p style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>
                  No hospitals registered. Please add a hospital first in the "Hospitals" tab.
                </p>
              ) : (
                <select value={selectedHospitalId} onChange={(e) => setSelectedHospitalId(e.target.value)}>
                  {hospitals.map(h => (
                    <option key={h._id} value={h._id}>
                      {h.hospitalName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Blood Group Requested</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label>Units Required</label>
              <input 
                type="number" 
                min="1" 
                value={unitsRequired} 
                onChange={(e) => setUnitsRequired(parseInt(e.target.value) || 1)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Request Date</label>
              <input 
                type="date" 
                value={requestDate} 
                onChange={(e) => setRequestDate(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '10px' }} 
              disabled={submitting || hospitals.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestManagement;
