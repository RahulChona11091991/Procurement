import React from 'react';
import { Link } from 'react-router-dom';
import './SiteMap.css';

const SiteMap = () => {
  const routes = [
    // Main Application Pages
    {
      category: 'Main Application',
      links: [
        { path: '/', name: 'Dashboard' },
      ]
    },
    
    // Vendor Management
    {
      category: 'Vendor Management',
      links: [
        { path: '/vendors', name: 'Vendor List' },
        { path: '/vendors/new', name: 'Add New Vendor' },
        { path: '/vendors/:id/edit', name: 'Edit Vendor' },
        { path: '/vendors/:id', name: 'Vendor Details' }
      ]
    },
    
    // RFP Management
    {
      category: 'RFP Management',
      links: [
        { path: '/rfps', name: 'RFP List' },
        { path: '/rfps/new', name: 'Create New RFP' },
        { path: '/rfps/:id/edit', name: 'Edit RFP' },
        { path: '/rfps/:id', name: 'RFP Details' }
      ]
    },
    
    // Vendor Portal
    {
      category: 'Vendor Portal',
      links: [
        { path: '/vendor/login', name: 'Vendor Login' },
        { path: '/vendor/dashboard/:vendorId', name: 'Vendor Dashboard' },
        { path: '/vendor/rfp/:rfpId/:vendorId', name: 'Bid Submission' },
        { path: '/vendor/bid/:rfpId/:token', name: 'Bid Invitation' },
        { path: '/vendor/bid/:rfpId/:token/review', name: 'Tender Review' },
        { path: '/vendor/bid/:rfpId/:token/submit', name: 'Bid Submit' }
      ]
    }
  ];

  return (
    <div className="sitemap-container">
      <h1>Application Site Map</h1>
      <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
      
      {routes.map((section, index) => (
        <div key={index} className="sitemap-section">
          <h2>{section.category}</h2>
          <ul>
            {section.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link to={link.path}>
                  {link.name} <span className="path">({link.path})</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="sitemap-legend">
        <p><strong>Note:</strong> Routes with parameters (like :id, :token) will need actual values to work.</p>
      </div>
    </div>
  );
};

export default SiteMap;
