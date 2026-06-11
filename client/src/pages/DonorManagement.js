import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../components/NotificationProvider';

function DonorManagement() {
  const { showToast, confirm } = useNotification();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Donor form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDonors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/donors');
      setDonors(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleAddDonor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/donors', {
        name,
        age: parseInt(age),
        gender,
        bloodGroup,
        phone,
        address
      });
      showToast('Donor registered successfully!', 'success');
      // Reset form & close modal
      setName('');
      setAge('');
      setGender('Male');
      setBloodGroup('A+');
      setPhone('');
      setAddress('');
      setShowAddModal(false);
      fetchDonors();
    } catch (err) {
      showToast('Error registering donor: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDonor = (id, donorName) => {
    confirm(
      `Are you sure you want to permanently delete donor "${donorName}"?`,
      async () => {
        try {
          await axios.delete(`http://localhost:5000/api/donors/${id}`);
          showToast(`Donor "${donorName}" record has been deleted.`, 'success');
          fetchDonors();
        } catch (err) {
          showToast('Error deleting donor: ' + err.message, 'error');
        }
      },
      'Delete Donor Record'
    );
  };

  // Filter donors
  const filteredDonors = donors.filter((d) => {
    const matchesName = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedBloodGroup === 'All' || d.bloodGroup === selectedBloodGroup;
    return matchesName && matchesGroup;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading donors directory...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Donor Management</h1>
          <p className="page-subtitle">Register new donors and manage the donor database</p>
        </div>
        <button 
          className="btn btn-warning" 
          onClick={() => setShowAddModal(true)}
        >
          <img src="/images/donor_icon.png" alt="Donor" style={{ width: '22px', height: '22px'}} />
          Register New Donor
        </button>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="form-title">Donor Registry</h2>
        
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="🔍 Search donor by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedBloodGroup} 
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="All">All Blood Groups</option>
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

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age/Gender</th>
                <th>Blood Group</th>
                <th>Contact Info</th>
                <th>Last Donation</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                    No donors found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor) => (
                  <tr key={donor._id}>
                    <td>
                      <strong>{donor.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {donor._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td>{donor.age} yrs / {donor.gender}</td>
                    <td>
                      <span className="badge badge-stock-normal" style={{ background: '#ffe3e6', color: 'var(--primary-color)' }}>
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td>
                      <div>📞 {donor.phone}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>📍 {donor.address}</div>
                    </td>
                    <td>{formatDate(donor.lastDonation)}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteDonor(donor._id, donor.name)} 
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

      {/* ➕ Register Donor Modal Form */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-form-card">
            <h2 className="form-title">Register New Donor</h2>
            <form onSubmit={handleAddDonor} style={{ width: '100%', padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. John Doe"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    required 
                    placeholder="e.g. 25"
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
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
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  placeholder="e.g. 555-0199"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                  placeholder="e.g. 123 Main St"
                  rows="2"
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorManagement;
