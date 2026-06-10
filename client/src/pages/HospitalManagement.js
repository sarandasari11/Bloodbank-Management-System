import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../components/NotificationProvider';

function HospitalManagement() {
  const { showToast, confirm } = useNotification();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [hospitalName, setHospitalName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHospitals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/hospitals');
      setHospitals(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/hospitals', {
        hospitalName,
        contactPerson,
        phone,
        address
      });
      showToast('Hospital registered successfully!', 'success');
      setHospitalName('');
      setContactPerson('');
      setPhone('');
      setAddress('');
      fetchHospitals();
    } catch (err) {
      showToast('Error registering hospital: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHospital = (id, name) => {
    confirm(
      `Are you sure you want to permanently delete hospital "${name}"?`,
      async () => {
        try {
          await axios.delete(`http://localhost:5000/api/hospitals/${id}`);
          showToast(`Hospital "${name}" record deleted successfully.`, 'success');
          fetchHospitals();
        } catch (err) {
          showToast('Error deleting hospital: ' + err.message, 'error');
        }
      },
      'Delete Hospital Record'
    );
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading hospitals directory...</p></div>;
  }

  return (
    <div className="container">
      <div>
        <h1 className="page-title">Hospital Management</h1>
        <p className="page-subtitle">Configure partner medical institutions and request portals</p>
      </div>

      <div className="split-layout">
        <div className="card">
          <h2 className="form-title">Hospital Directory</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>Contact Person</th>
                  <th>Phone Number</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                      No hospitals registered yet. Use the form on the right to register one.
                    </td>
                  </tr>
                ) : (
                  hospitals.map((hospital) => (
                    <tr key={hospital._id}>
                      <td>
                        <strong>{hospital.hospitalName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {hospital._id.slice(-6).toUpperCase()}</div>
                      </td>
                      <td>{hospital.contactPerson}</td>
                      <td>📞 {hospital.phone}</td>
                      <td>📍 {hospital.address}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteHospital(hospital._id, hospital.hospitalName)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h2 className="form-title">Register Hospital</h2>
          <form onSubmit={handleAddHospital} style={{ width: '100%', padding: 0, boxShadow: 'none' }}>
            <div className="form-group">
              <label>Hospital Name</label>
              <input 
                type="text" 
                value={hospitalName} 
                onChange={(e) => setHospitalName(e.target.value)} 
                required 
                placeholder="e.g. City General Hospital"
              />
            </div>

            <div className="form-group">
              <label>Contact Person (Doctor/Nurse/Admin)</label>
              <input 
                type="text" 
                value={contactPerson} 
                onChange={(e) => setContactPerson(e.target.value)} 
                required 
                placeholder="e.g. Dr. Sarah Connor"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                placeholder="e.g. 555-0144"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                placeholder="e.g. 100 Medical Center Dr"
                rows="2"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Hospital'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HospitalManagement;
