import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from '../components/NotificationProvider';

function DonationManagement() {
  const { showToast } = useNotification();
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [unitsDonated, setUnitsDonated] = useState(1);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [donationsRes, donorsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/donations'),
        axios.get('http://localhost:5000/api/donors')
      ]);
      setDonations(donationsRes.data);
      setDonors(donorsRes.data);
      if (donorsRes.data.length > 0 && !selectedDonorId) {
        setSelectedDonorId(donorsRes.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching donations data:', err);
      setLoading(false);
    }
  }, [selectedDonorId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    if (!selectedDonorId) {
      showToast('Please register and select a donor first.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/donations', {
        donorId: selectedDonorId,
        unitsDonated: parseInt(unitsDonated),
        donationDate: new Date(donationDate)
      });
      showToast(res.data.message || 'Donation recorded and inventory updated!', 'success');
      setUnitsDonated(1);
      fetchData();
    } catch (err) {
      showToast('Error recording donation: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  const getSelectedDonorGroup = () => {
    const d = donors.find(d => d._id === selectedDonorId);
    return d ? d.bloodGroup : '';
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading donations logs...</p></div>;
  }

  return (
    <div className="container">
      <div>
        <h1 className="page-title">Donation Management</h1>
        <p className="page-subtitle">Track blood donation receipts and update inventory stock</p>
      </div>

      <div className="split-layout">
        <div className="card">
          <h2 className="form-title">Donation History Log</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Units Donated</th>
                  <th>Donation Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                      No donations logged yet. Use the form on the right to add one.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <code style={{ background: '#f1f3f5', padding: '4px 6px', borderRadius: '4px' }}>
                          DON-{d._id.slice(-6).toUpperCase()}
                        </code>
                      </td>
                      <td>
                        <strong>{d.donorId?.name || 'Deleted Donor'}</strong>
                        {d.donorId && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {d.donorId._id.slice(-6).toUpperCase()}</div>}
                      </td>
                      <td>
                        <span className="badge badge-stock-normal" style={{ background: '#ffe3e6', color: 'var(--primary-color)' }}>
                          {d.bloodGroup}
                        </span>
                      </td>
                      <td><strong>{d.unitsDonated}</strong> units</td>
                      <td>{formatDate(d.donationDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h2 className="form-title">Record New Donation</h2>
          <form onSubmit={handleRecordDonation} style={{ width: '100%', padding: 0, boxShadow: 'none' }}>
            <div className="form-group">
              <label>Select Donor</label>
              {donors.length === 0 ? (
                <p style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>
                  No registered donors found. Please register a donor first under the "Donors" tab.
                </p>
              ) : (
                <>
                  <select value={selectedDonorId} onChange={(e) => setSelectedDonorId(e.target.value)}>
                    {donors.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.bloodGroup})
                      </option>
                    ))}
                  </select>
                  <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    Blood Group: <strong>{getSelectedDonorGroup()}</strong>
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Units Donated (Pints/Units)</label>
              <input 
                type="number" 
                min="1" 
                value={unitsDonated} 
                onChange={(e) => setUnitsDonated(parseInt(e.target.value) || 1)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Donation Date</label>
              <input 
                type="date" 
                value={donationDate} 
                onChange={(e) => setDonationDate(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '10px' }} 
              disabled={submitting || donors.length === 0}
            >
              {submitting ? 'Recording...' : 'Record Donation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DonationManagement;
