import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../components/NotificationProvider';
import { useData } from '../components/DataContext';

function InventoryManagement() {
  const { showToast } = useNotification();
  const { inventory, fetchInventory, loadingInventory } = useData();
  
  // Form state
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [unitsAvailable, setUnitsAvailable] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory(); // Background refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put('/api/inventory/manual', {
        bloodGroup,
        unitsAvailable
      });
      showToast(`Inventory updated: ${bloodGroup} is set to ${unitsAvailable} units.`, 'success');
      fetchInventory(); // Refresh local cache
    } catch (err) {
      showToast('Error updating inventory: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInventory && inventory.length === 0) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading inventory database...</p></div>;
  }

  return (
    <div className="container">
      <div>
        <h1 className="page-title">Blood Inventory Management</h1>
        <p className="page-subtitle">View and configure current stock levels across all blood groups</p>
      </div>

      <div className="split-layout">
        <div className="card">
          <h2 className="form-title">Live Inventory Levels</h2>
          <div className="inventory-grid">
            {inventory.map((item) => {
              const isLow = item.unitsAvailable < 6;
              return (
                <div key={item._id} className="inventory-card">
                  <div className="blood-drop">
                    {item.bloodGroup}
                  </div>
                  <div className="inventory-info">
                    <div className="inventory-count">{item.unitsAvailable}</div>
                    <div className="inventory-unit">units available</div>
                    <div style={{ marginTop: '8px' }}>
                      {isLow ? (
                        <span className="badge badge-stock-low">⚠️ Low Stock</span>
                      ) : (
                        <span className="badge badge-stock-normal">✅ Adequate</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h2 className="form-title">Manual Stock Override</h2>
          <form onSubmit={handleManualUpdate} style={{ width: '100%', padding: 0, boxShadow: 'none' }}>
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
              <label>Units Available</label>
              <input 
                type="number" 
                min="0" 
                value={unitsAvailable} 
                onChange={(e) => setUnitsAvailable(parseInt(e.target.value) || 0)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={submitting}>
              {submitting ? 'Updating...' : 'Set Stock Level'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InventoryManagement;
