import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  
  // Cache States
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    totalHospitals: 0,
    pendingRequests: 0,
    lowStockAlertsCount: 0,
    lowStockAlerts: []
  });
  const [inventory, setInventory] = useState([]);
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests] = useState([]);

  // Loading flags for initial load
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Background refresh triggers
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchDonors = async () => {
    try {
      const res = await axios.get('/api/donors');
      setDonors(res.data);
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoadingDonors(false);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await axios.get('/api/donations');
      setDonations(res.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await axios.get('/api/hospitals');
      setHospitals(res.data);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchInventory();
    fetchDonors();
    fetchDonations();
    fetchHospitals();
    fetchRequests();
  };

  // Run initial background fetches on mount
  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataContext.Provider value={{
      stats, fetchStats, loadingStats,
      inventory, fetchInventory, loadingInventory,
      donors, fetchDonors, loadingDonors,
      donations, fetchDonations, loadingDonations,
      hospitals, fetchHospitals, loadingHospitals,
      requests, fetchRequests, loadingRequests,
      refreshAll
    }}>
      {children}
    </DataContext.Provider>
  );
}
