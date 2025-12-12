import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiShare2, FiEye, FiUpload, FiFile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await resumeAPI.getAll();
            setResumes(response.data.data);
        } catch (_error) {
            toast.error('Failed to fetch resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await resumeAPI.delete(id);
            setResumes(resumes.filter(r => r._id !== id));
            toast.success('Resume deleted successfully');
        } catch (_error) {
            toast.error('Failed to delete resume');
        }
    };

    const handleDownloadPDF = async (id, title) => {
        try {
            const response = await resumeAPI.downloadPDF(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('PDF downloaded successfully');
        } catch (_error) {
            toast.error('Failed to download PDF');
        }
    };

    const handleDownloadDOCX = async (id, title) => {
        try {
            const response = await resumeAPI.downloadDOCX(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9]/g, '_')}_resume.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('DOCX downloaded successfully');
        } catch (_error) {
            toast.error('Failed to download DOCX');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your resumes...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">My Resumes</h1>
                        <p className="dashboard-subtitle">
                            Manage and customize your professional resumes
                        </p>
                    </div>
                    <div className="dashboard-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <FiUpload /> Upload Resume
                        </button>
                        <Link to="/resume/new" className="btn btn-primary">
                            <FiPlus /> Create New
                        </Link>
                    </div>
                </div>

                {resumes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h2>No resumes yet</h2>
                        <p>Create your first professional resume in minutes</p>
                        <Link to="/resume/new" className="btn btn-primary btn-lg">
                            <FiPlus /> Create Resume
                        </Link>
                    </div>
                ) : (
                    <div className="resumes-grid">
                        {resumes.map((resume) => (
                            <div key={resume._id} className="resume-card">
                                <div className="resume-card-preview">
                                    <div className="preview-placeholder">
                                        <FiFile size={48} />
                                    </div>
                                    {resume.originalFile?.url && (
                                        <span className="uploaded-badge">Uploaded</span>
                                    )}
                                </div>
                                <div className="resume-card-body">
                                    <h3 className="resume-title">{resume.title}</h3>
                                    {resume.personalInfo?.fullName && (
                                        <p className="resume-name">{resume.personalInfo.fullName}</p>
                                    )}
                                    <p className="resume-date">
                                        Updated {formatDate(resume.updatedAt)}
                                    </p>
                                    <div className="resume-template">
                                        Template: <span>{resume.template}</span>
                                    </div>
                                </div>
                                <div className="resume-card-actions">
                                    <button
                                        className="action-btn"
                                        onClick={() => navigate(`/resume/${resume._id}`)}
                                        title="Edit"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => navigate(`/resume/${resume._id}/preview`)}
                                        title="Preview"
                                    >
                                        <FiEye />
                                    </button>
                                    <div className="dropdown">
                                        <button className="action-btn" title="Download">
                                            <FiDownload />
                                        </button>
                                        <div className="dropdown-menu">
                                            <button onClick={() => handleDownloadPDF(resume._id, resume.title)}>
                                                Download PDF
                                            </button>
                                            <button onClick={() => handleDownloadDOCX(resume._id, resume.title)}>
                                                Download DOCX
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        className="action-btn"
                                        onClick={() => navigate(`/resume/${resume._id}/preview?share=true`)}
                                        title="Share"
                                    >
                                        <FiShare2 />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(resume._id, resume.title)}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchResumes();
                    }}
                />
            )}
        </div>
    );
};

// Upload Modal Component
const UploadModal = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('title', title || file.name);

            await resumeAPI.upload(formData);
            toast.success('Resume uploaded successfully');
            onSuccess();
        } catch (_error) {
            toast.error('Failed to upload resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Upload Resume</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Resume Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My Professional Resume"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Upload File (PDF or DOCX)</label>
                        <div className="file-upload">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setFile(e.target.files[0])}
                                id="file-input"
                            />
                            <label htmlFor="file-input" className="file-upload-label">
                                <FiUpload />
                                <span>{file ? file.name : 'Choose file or drag & drop'}</span>
                            </label>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
