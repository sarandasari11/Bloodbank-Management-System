import React, { useState } from 'react';
import './HospitalDashboard.css';

function HospitalDashboard() {
  const [formData, setFormData] = useState({
    hospitalName: '',
    bloodGroup: '',
    unitsRequested: '1'
  });

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestEntry = {
      id: history.length + 1,
      hospitalName: formData.hospitalName,
      bloodGroup: formData.bloodGroup,
      unitsRequested: formData.unitsRequested,
      date: new Date().toLocaleString(),
      status: 'Pending' // ✅ Added status
    };
    setHistory([requestEntry, ...history]);
    setFormData({ hospitalName: '', bloodGroup: '', unitsRequested: '1' });
    setMessage('✅ Request submitted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="hospital-dashboard">
      <h2>🏥 Hospital Dashboard</h2>

      {/* Request Blood Form */}
      <section className="request-section">
        <h3>Request Blood</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            placeholder="Hospital Name"
            onChange={handleChange}
            required
          />
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select Blood Group</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          <select
            name="unitsRequested"
            value={formData.unitsRequested}
            onChange={handleChange}
            required
          >
            {[1, 2, 3, 4, 5].map((unit) => (
              <option key={unit} value={unit}>{unit} Unit{unit > 1 ? 's' : ''}</option>
            ))}
          </select>
          <button type="submit">Submit Request</button>
          {message && <p className="success-message">{message}</p>}
        </form>
      </section>

      {/* Request History */}
      <section className="history-section">
        <h3>Request History</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Hospital</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Date</th>
              <th>Status</th> {/* ✅ New Column */}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan="6">No request history yet.</td></tr>
            ) : (
              history.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.hospitalName}</td>
                  <td>{entry.bloodGroup}</td>
                  <td>{entry.unitsRequested}</td>
                  <td>{entry.date}</td>
                  <td>{entry.status}</td> {/* ✅ Status Value */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Blood Bank Charges Info */}
      <section className="charges-section">
        <h3>Blood Bank Charges</h3>
        <ul>
          <li><strong>A+/A-:</strong> ₹1200/unit</li>
          <li><strong>B+/B-:</strong> ₹1150/unit</li>
          <li><strong>O+/O-:</strong> ₹1000/unit</li>
          <li><strong>AB+/AB-:</strong> ₹1300/unit</li>
        </ul>
      </section>
    </div>
  );
}

export default HospitalDashboard;
