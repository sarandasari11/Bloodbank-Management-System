import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <NavLink to="/" className="nav-brand">
        🩸 BloodBank <span>Management System</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Overview
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
          Inventory
        </NavLink>
        <NavLink to="/donors" className={({ isActive }) => isActive ? 'active' : ''}>
          Donors
        </NavLink>
        <NavLink to="/donations" className={({ isActive }) => isActive ? 'active' : ''}>
          Donations
        </NavLink>
        <NavLink to="/hospitals" className={({ isActive }) => isActive ? 'active' : ''}>
          Hospitals
        </NavLink>
        <NavLink to="/requests" className={({ isActive }) => isActive ? 'active' : ''}>
          Requests
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
