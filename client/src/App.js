import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardOverview from './pages/DashboardOverview';
import InventoryManagement from './pages/InventoryManagement';
import DonorManagement from './pages/DonorManagement';
import DonationManagement from './pages/DonationManagement';
import HospitalManagement from './pages/HospitalManagement';
import RequestManagement from './pages/RequestManagement';
import { NotificationProvider } from './components/NotificationProvider';
import { DataProvider } from './components/DataContext';
import './styles.css';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <DataProvider>
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/donors" element={<DonorManagement />} />
              <Route path="/donations" element={<DonationManagement />} />
              <Route path="/hospitals" element={<HospitalManagement />} />
              <Route path="/requests" element={<RequestManagement />} />
            </Routes>
          </div>
          <Footer />
        </DataProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
