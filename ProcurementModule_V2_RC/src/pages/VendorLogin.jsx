import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { load, save } from '../lib/store.js';

export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const state = load();
    
    // Debug: Log the vendors array to check its contents
    console.log('Vendors in store:', state.vendors);
    
    // Check if vendors exist and have email property
    if (!state.vendors || !Array.isArray(state.vendors)) {
      setError('Vendor data not properly initialized. Please contact support.');
      return;
    }
    
    const vendor = state.vendors.find(v => v.email && v.email.toLowerCase() === email.toLowerCase());
    
    if (vendor) {
      console.log('Found vendor:', vendor);
      navigate(`/vendor/dashboard/${vendor.id}`);
    } else {
      // Check if the email exists but the vendor object is missing email field
      const vendorByEmail = state.vendors.find(v => 
        (v.email && v.email.toLowerCase() === email.toLowerCase()) ||
        (v.name && v.name.toLowerCase().includes(email.split('@')[0].toLowerCase()))
      );
      
      if (vendorByEmail) {
        // If we found a vendor by name but email is missing, update the vendor object
        if (!vendorByEmail.email) {
          // Update the vendor with the email
          vendorByEmail.email = email;
          save(state);
          console.log('Updated vendor with email:', vendorByEmail);
          navigate(`/vendor/dashboard/${vendorByEmail.id}`);
          return;
        }
      }
      
      setError('No vendor found with this email. Please check your email or contact support.');
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
        <h2>Vendor Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
              placeholder="Enter your email"
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" className="btn" style={{ width: '100%' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
