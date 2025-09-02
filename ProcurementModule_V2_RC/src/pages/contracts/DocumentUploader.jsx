import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const DocumentUploader = () => {
  const { vendorId, documentType } = useParams();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  
  // Document type options
  const documentTypes = [
    { id: 'msa', name: 'Master Service Agreement (MSA)' },
    { id: 'wa', name: 'Work Authorization (WA)' },
    { id: 'wcb', name: 'Workers Compensation Board (WCB)' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'eo', name: 'Errors & Omissions (E&O)' }
  ];
  
  // Initialize with one empty file entry
  const [files, setFiles] = useState([
    { 
      file: null, 
      type: documentType || 'msa',
      metadata: {
        effectiveDate: '',
        expiryDate: '',
        project: '',
        classCode: '',
        items: '',
        vendor: '',
        referenceNumber: ''
      },
      id: `file-${Date.now()}`
    }
  ]);

  // Common fields for all document types
  const commonFields = [
    { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: false },
    { name: 'project', label: 'Project', type: 'text', required: true },
    { name: 'classCode', label: 'Class Code', type: 'text', required: true },
    { name: 'items', label: 'Items', type: 'text', required: false },
    { name: 'vendor', label: 'Vendor', type: 'text', required: true }
  ];

  // Document type specific fields
  const documentSpecificFields = {
    msa: [
      { name: 'referenceNumber', label: 'Reference Number', type: 'text', required: true }
    ],
    wa: [
      { name: 'referenceNumber', label: 'WA Number', type: 'text', required: true, readOnly: true, value: `WA-${Date.now().toString().slice(-6)}` }
    ],
    wcb: [
      { name: 'wcbNumber', label: 'WCB Number', type: 'text', required: true },
      { name: 'wcbExpiry', label: 'WCB Expiry Date', type: 'date', required: true }
    ],
    insurance: [
      { name: 'policyNumber', label: 'Policy Number', type: 'text', required: true },
      { name: 'coverageAmount', label: 'Coverage Amount', type: 'number', required: true },
      { name: 'insuranceType', label: 'Insurance Type', type: 'select', required: true, 
        options: ['General Liability', 'Professional Liability', 'Auto', 'Umbrella'] }
    ],
    eo: [
      { name: 'policyNumber', label: 'Policy Number', type: 'text', required: true },
      { name: 'coverageAmount', label: 'Coverage Amount', type: 'number', required: true },
      { name: 'coverageType', label: 'Coverage Type', type: 'select', required: true,
        options: ['Professional Services', 'Technology', 'Consulting'] }
    ]
  };

  // Handle file selection via input
  const handleFileChange = (index, selectedFiles) => {
    const newFiles = [...files];
    
    if (selectedFiles.length > 0) {
      newFiles[index] = {
        ...newFiles[index],
        file: selectedFiles[0],
        type: newFiles[index].type || 'msa' // Default type if not set
      };
      setFiles(newFiles);
    }
  };
  
  // Handle drag and drop
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const newFiles = [...files];
    const availableSlots = 5 - files.length;
    const filesToAdd = Math.min(acceptedFiles.length, availableSlots);
    
    for (let i = 0; i < filesToAdd; i++) {
      if (i >= availableSlots) break;
      
      const newFile = {
        file: acceptedFiles[i],
        type: documentType || 'msa',
        metadata: {
          effectiveDate: '',
          expiryDate: '',
          project: '',
          classCode: '',
          items: '',
          vendor: '',
          referenceNumber: ''
        },
        id: `file-${Date.now()}-${i}`
      };
      
      if (newFiles.length < 5) {
        newFiles.push(newFile);
      }
    }
    
    setFiles(newFiles);
    setIsDragging(false);
  }, [files, documentType]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 5,
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropRejected: () => {
      alert('Only PDF, Word, Excel, and image files are allowed.');
      setIsDragging(false);
    }
  });

  // Add a new file upload section
  const handleAddMore = () => {
    if (files.length < 5) {
      setFiles([
        ...files, 
        { 
          file: null, 
          type: documentType || 'msa',
          metadata: {
            effectiveDate: '',
            expiryDate: '',
            project: '',
            classCode: '',
            items: '',
            vendor: '',
            referenceNumber: ''
          },
          id: `file-${Date.now()}`
        }
      ]);
    } else {
      alert('Maximum of 5 files allowed');
    }
  };

  // Handle metadata input changes for each file
  const handleMetadataChange = (fileIndex, field, value) => {
    const newFiles = [...files];
    newFiles[fileIndex] = {
      ...newFiles[fileIndex],
      metadata: {
        ...newFiles[fileIndex].metadata,
        [field]: value
      }
    };
    setFiles(newFiles);
  };
  
  // Handle document type change
  const handleDocumentTypeChange = (fileIndex, newType) => {
    const newFiles = [...files];
    newFiles[fileIndex] = {
      ...newFiles[fileIndex],
      type: newType,
      // Reset metadata when type changes
      metadata: {
        effectiveDate: '',
        expiryDate: '',
        project: '',
        classCode: '',
        items: '',
        vendor: '',
        referenceNumber: newType === 'wa' ? `WA-${Date.now().toString().slice(-6)}` : ''
      }
    };
    setFiles(newFiles);
  };
  
  // Remove a file
  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate files
    const validFiles = files.every((fileData, index) => {
      if (!fileData.file) {
        alert(`Please select a file for document #${index + 1}`);
        return false;
      }
      
      // Validate required fields
      const requiredFields = [...commonFields, ...(documentSpecificFields[documentType] || [])]
        .filter(field => field.required);
      
      for (const field of requiredFields) {
        if (!fileData.metadata[field.name] && !field.value) {
          alert(`Please fill in the required field: ${field.label} for document #${index + 1}`);
          return false;
        }
      }
      
      return true;
    });
    
    if (!validFiles) return;
    
    try {
      // Prepare form data for each file
      const uploadPromises = files.map(fileData => {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('documentType', documentType);
        formData.append('vendorId', vendorId);
        
        // Add metadata
        Object.entries(fileData.metadata).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });
        
        // Add document-specific fields
        (documentSpecificFields[documentType] || []).forEach(field => {
          if (field.value) {
            formData.append(field.name, field.value);
          }
        });
        
        // In a real app, you would upload to your backend here
        // return api.uploadDocument(formData);
        console.log('Would upload:', Object.fromEntries(formData));
        return Promise.resolve({ success: true });
      });
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      // Navigate back to the document view
      navigate(`/procurement/contracts/${vendorId}/${documentType}`, {
        state: { refresh: true }
      });
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('An error occurred while uploading documents. Please try again.');
    }
  };

  // Render input field based on type
  const renderInputField = (field, fileIndex) => {
    const value = field.value || (files[fileIndex]?.metadata?.[field.name] || '');
    
    if (field.type === 'select') {
      return (
        <div key={`${field.name}-${fileIndex}`} className="form-group">
          <label>
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleMetadataChange(fileIndex, field.name, e.target.value)}
            className="form-control"
            required={field.required}
            disabled={field.disabled}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }
    
    return (
      <div key={`${field.name}-${fileIndex}`} className="form-group">
        <label>
          {field.label}
          {field.required && <span className="required">*</span>}
        </label>
        {field.type === 'date' ? (
          <input
            type="date"
            value={value}
            onChange={(e) => handleMetadataChange(fileIndex, field.name, e.target.value)}
            className="form-control"
            required={field.required}
            readOnly={field.readOnly}
          />
        ) : field.type === 'number' ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleMetadataChange(fileIndex, field.name, e.target.value)}
            className="form-control"
            required={field.required}
            readOnly={field.readOnly}
            min={field.min}
            step={field.step || '1'}
          />
        ) : (
          <input
            type={field.type || 'text'}
            value={value}
            onChange={(e) => handleMetadataChange(fileIndex, field.name, e.target.value)}
            className="form-control"
            required={field.required}
            readOnly={field.readOnly}
            disabled={field.disabled}
          />
        )}
      </div>
    );
  };
  
  // Render file upload area
  const renderFileUploadArea = (fileData, index) => {
    const fileType = fileData.type || 'msa';
    
    return (
      <div key={fileData.id || index} className="file-upload-section">
        <h3>Document #{index + 1}</h3>
        
        <div className="file-upload-row">
          <div className="form-group">
            <label>Document Type <span className="required">*</span></label>
            <select
              value={fileType}
              onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
              className="form-control"
              required
            >
              {documentTypes.map(docType => (
                <option key={docType.id} value={docType.id}>
                  {docType.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>File {index + 1} <span className="required">*</span></label>
            <div className="file-upload-area" onClick={(e) => e.stopPropagation()}>
              <input
                type="file"
                onChange={(e) => handleFileChange(index, e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id={`file-upload-${index}`}
              />
              <label 
                htmlFor={`file-upload-${index}`}
                className={`file-drop-zone ${!fileData.file ? 'empty' : ''}`}
              >
                {fileData.file ? (
                  <div className="file-info">
                    <div className="file-name">{fileData.file.name}</div>
                    <div className="file-size">
                      {(fileData.file.size / 1024).toFixed(2)} KB
                    </div>
                    <div className="file-type">
                      {fileData.file.type || 'Unknown type'}
                    </div>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <i className="upload-icon">📄</i>
                    <div>Click to select or drag & drop</div>
                    <div className="file-types">PDF, DOC, XLS, JPG, PNG (Max 10MB)</div>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          {files.length > 1 && (
            <button 
              type="button" 
              className="remove-btn"
              onClick={() => handleRemoveFile(index)}
              title="Remove this file"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="metadata-fields">
          {/* Common fields */}
          {commonFields.map(field => renderInputField(field, index))}
          
          {/* Document type specific fields */}
          {(documentSpecificFields[fileType] || []).map(field => 
            renderInputField({
              ...field,
              // Auto-fill WA number if it's a WA document
              value: field.name === 'referenceNumber' && fileType === 'wa' 
                ? `WA-${Date.now().toString().slice(-6)}` 
                : field.value
            }, index)
          )}
        </div>
        
        {index < files.length - 1 && <hr className="divider" />}
      </div>
    );
  };

  return (
    <div className="document-uploader">
      <h2>Upload Documents</h2>
      
      <div 
        {...getRootProps()} 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragging ? (
          <div className="drop-message">
            <div className="drop-icon">📂</div>
            <div>Drop files here</div>
          </div>
        ) : (
          <div className="drop-message">
            <div className="drop-icon">📤</div>
            <div>Drag & drop files here, or click to select files</div>
            <div className="file-types">Supports: PDF, DOC, XLS, JPG, PNG (Max 5 files, 10MB each)</div>
            {files.length > 0 && (
              <div className="file-count">{files.length} file{files.length !== 1 ? 's' : ''} selected</div>
            )}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        {files.map((fileData, index) => renderFileUploadArea(fileData, index))}
        
        <div className="form-actions">
          {files.length < 5 ? (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleAddMore}
            >
              + Add Another Document (Max 5)
            </button>
          ) : (
            <div className="max-files">Maximum of 5 files allowed</div>
          )}
          
          <div className="action-buttons">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={files.length === 0}
            >
              {files.length > 1 ? `Upload ${files.length} Documents` : 'Upload Document'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;
