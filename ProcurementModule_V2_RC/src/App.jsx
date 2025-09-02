import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Vendors from './pages/Vendors.jsx'
import VendorDetails from './pages/VendorDetails.jsx'
import VendorAdd from './pages/VendorAdd.jsx'
import VendorEdit from './pages/VendorEdit.jsx'
import RFPList from './pages/RFPList.jsx'
import RFPCreate from './pages/RFPCreate.jsx'
import RFPEdit from './pages/RFPEdit.jsx'
import RFPDetail from './pages/RFPDetail.jsx'
import BidInvite from './pages/BidInvite.jsx'
import TenderReview from './pages/TenderReview.jsx'
import BidSubmit from './pages/BidSubmit.jsx'
import VendorLogin from './pages/VendorLogin.jsx'
import VendorDashboard from './pages/VendorDashboard.jsx'
import BidSubmission from './pages/BidSubmission.jsx'
import SiteMap from './pages/SiteMap.jsx'
// Contract Management Imports
import ProcurementContracts from './pages/contracts/ProcurementContracts.jsx';
import VendorContracts from './pages/contracts/VendorContracts.jsx';
import VendorContractsView from './pages/contracts/VendorContractsView.jsx';
import DocumentViewer from './pages/contracts/DocumentViewer.jsx';
import DocumentUploader from './pages/contracts/DocumentUploader.jsx';
import VendorProfile from './pages/vendor/VendorProfile.jsx';

export default function App(){
  return (<div>
    <div className="appbar">
      <div><b>Rohit Procurement</b></div>
      <nav style={{display:'flex', gap:12, alignItems: 'center'}}>
        <Link to="/vendors" className="btn">Procurement Contract View</Link>
        <div style={{marginLeft: 'auto', display: 'flex', gap: '12px'}}>
          <Link to="/vendor/contracts/v1" className="btn" style={{background: '#e0f2fe', color: '#0369a1'}}>
            Vendor Contract View
          </Link>
          <Link to="/sitemap" className="btn">Site Map</Link>
        </div>
      </nav>
    </div>
    <div className="shell">
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/vendors" element={<Vendors/>} />
        <Route path="/vendors/new" element={<VendorAdd/>} />
        <Route path="/vendors/:id/edit" element={<VendorEdit/>} />
        <Route path="/vendors/:id" element={<VendorDetails/>} />
        <Route path="/rfps" element={<RFPList/>} />
        <Route path="/rfps/new" element={<RFPCreate/>} />
        <Route path="/rfps/:id/edit" element={<RFPEdit/>} />
        <Route path="/rfps/:id" element={<RFPDetail/>} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/dashboard/:vendorId" element={<VendorDashboard />} />
        <Route path="/vendor/rfp/:rfpId/:vendorId" element={<BidSubmission />} />
        <Route path="/vendor/bid/:rfpId/:token" element={<BidInvite/>} />
        <Route path="/vendor/bid/:rfpId/:token/review" element={<TenderReview/>} />
        <Route path="/vendor/bid/:rfpId/:token/submit" element={<BidSubmit/>} />
        <Route path="/sitemap" element={<SiteMap/>} />
        
        {/* Contract Management Routes */}
        <Route path="/procurement/contracts" element={<ProcurementContracts />} />
        <Route path="/procurement/contracts/:vendorId" element={<VendorContractsView />} />
        <Route path="/procurement/contracts/:vendorId/:documentType" element={<DocumentViewer />} />
        <Route path="/procurement/contracts/:vendorId/:documentType/update" element={<DocumentUploader />} />
        
        {/* Vendor Contract Routes */}
        <Route path="/vendor/contracts/:vendorId" element={<VendorContracts />} />
        <Route path="/vendor/contracts/:vendorId/profile" element={<VendorProfile />} />
        <Route path="/vendor/contracts/:vendorId/:documentType" element={<DocumentViewer isVendor={true} />} />
      </Routes>
    </div>
  </div>)
}
