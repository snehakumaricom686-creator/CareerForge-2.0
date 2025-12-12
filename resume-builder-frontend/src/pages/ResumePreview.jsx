import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { FiDownload, FiEdit2, FiShare2, FiLinkedin, FiTwitter, FiFacebook, FiCopy, FiCheck, FiArrowLeft, FiMail } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './ResumePreview.css';

const ResumePreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(searchParams.get('share') === 'true');
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchResume = async () => {
        try {
            const response = await resumeAPI.getOne(id);
            setResume(response.data.data);
        } catch (_error) {
            toast.error('Failed to load resume');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Generate instant share links (no API call needed!)
    const shareLinks = useMemo(() => {
        if (!resume) return null;

        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/resume/shared/${resume.shareToken || id}`;
        const title = encodeURIComponent(`Check out my resume - ${resume.personalInfo?.fullName || 'My Resume'}`);
        const text = encodeURIComponent(`I just created my professional resume on CareerForge! Check it out.`);

        return {
            shareUrl,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`,
            email: `mailto:?subject=${title}&body=${text}%0A%0A${encodeURIComponent(shareUrl)}`,
        };
    }, [resume, id]);

    const handleDownloadPDF = async () => {
        setDownloading('pdf');
        try {
            const response = await resumeAPI.downloadPDF(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('PDF downloaded!');
        } catch (_error) {
            toast.error('Failed to download PDF');
        } finally {
            setDownloading(null);
        }
    };

    const handleDownloadDOCX = async () => {
        setDownloading('docx');
        try {
            const response = await resumeAPI.downloadDOCX(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}_resume.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('DOCX downloaded!');
        } catch (_error) {
            toast.error('Failed to download DOCX');
        } finally {
            setDownloading(null);
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(shareLinks.shareUrl);
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="preview-loading">
                <div className="spinner"></div>
                <p>Loading preview...</p>
            </div>
        );
    }

    if (!resume) return null;

    return (
        <div className="resume-preview-page">
            <div className="preview-toolbar glass">
                <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                    <FiArrowLeft /> Back
                </button>
                <div className="toolbar-actions">
                    <button className="btn btn-secondary" onClick={() => navigate(`/resume/${id}`)}>
                        <FiEdit2 /> Edit
                    </button>
                    <div className="dropdown">
                        <button className="btn btn-secondary">
                            <FiDownload /> Download
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={handleDownloadPDF} disabled={downloading === 'pdf'}>
                                {downloading === 'pdf' ? 'Downloading...' : '📄 Download PDF'}
                            </button>
                            <button onClick={handleDownloadDOCX} disabled={downloading === 'docx'}>
                                {downloading === 'docx' ? 'Downloading...' : '📝 Download DOCX'}
                            </button>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowShareModal(true)}>
                        <FiShare2 /> Share
                    </button>
                </div>
            </div>

            <div className="preview-container">
                <div className={`resume-document template-${resume.template}`}>
                    {/* Header */}
                    <header className="resume-header">
                        <h1 className="resume-name">{resume.personalInfo?.fullName || 'Your Name'}</h1>
                        <div className="contact-info">
                            {resume.personalInfo?.email && <span>{resume.personalInfo.email}</span>}
                            {resume.personalInfo?.phone && <span>{resume.personalInfo.phone}</span>}
                            {resume.personalInfo?.address && <span>{resume.personalInfo.address}</span>}
                        </div>
                        <div className="links-info">
                            {resume.personalInfo?.linkedIn && (
                                <a href={resume.personalInfo.linkedIn} target="_blank" rel="noopener noreferrer">
                                    LinkedIn
                                </a>
                            )}
                            {resume.personalInfo?.portfolio && (
                                <a href={resume.personalInfo.portfolio} target="_blank" rel="noopener noreferrer">
                                    Portfolio
                                </a>
                            )}
                            {resume.personalInfo?.github && (
                                <a href={resume.personalInfo.github} target="_blank" rel="noopener noreferrer">
                                    GitHub
                                </a>
                            )}
                        </div>
                    </header>

                    {/* Summary */}
                    {resume.personalInfo?.summary && (
                        <section className="resume-section">
                            <h2 className="section-title">Professional Summary</h2>
                            <p className="summary-text">{resume.personalInfo.summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {resume.experience?.length > 0 && (
                        <section className="resume-section">
                            <h2 className="section-title">Work Experience</h2>
                            {resume.experience.map((exp, index) => (
                                <div key={index} className="entry">
                                    <div className="entry-main">
                                        <h3 className="entry-title">{exp.position}</h3>
                                        <span className="entry-subtitle">{exp.company}</span>
                                    </div>
                                    <div className="entry-meta">
                                        {exp.location && <span>{exp.location}</span>}
                                        <span className="entry-date">
                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
                                    </div>
                                    {exp.description && <p className="entry-description">{exp.description}</p>}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Education */}
                    {resume.education?.length > 0 && (
                        <section className="resume-section">
                            <h2 className="section-title">Education</h2>
                            {resume.education.map((edu, index) => (
                                <div key={index} className="entry">
                                    <div className="entry-main">
                                        <h3 className="entry-title">{edu.institution}</h3>
                                        <span className="entry-subtitle">
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </span>
                                    </div>
                                    <div className="entry-meta">
                                        {edu.grade && <span>Grade: {edu.grade}</span>}
                                        <span className="entry-date">
                                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Skills */}
                    {resume.skills?.length > 0 && (
                        <section className="resume-section">
                            <h2 className="section-title">Skills</h2>
                            <div className="skills-grid">
                                {resume.skills.map((skill, index) => (
                                    <div key={index} className="skill-tag">
                                        <span className="skill-name">{skill.name}</span>
                                        <span className="skill-level">{skill.level}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {resume.projects?.length > 0 && (
                        <section className="resume-section">
                            <h2 className="section-title">Projects</h2>
                            {resume.projects.map((project, index) => (
                                <div key={index} className="entry">
                                    <div className="entry-main">
                                        <h3 className="entry-title">{project.name}</h3>
                                        {project.technologies?.length > 0 && (
                                            <span className="entry-tech">{project.technologies.join(', ')}</span>
                                        )}
                                    </div>
                                    {project.description && <p className="entry-description">{project.description}</p>}
                                    <div className="project-links">
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer">Demo</a>
                                        )}
                                        {project.github && (
                                            <a href={project.github} target="_blank" rel="noopener noreferrer">Code</a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Certifications */}
                    {resume.certifications?.length > 0 && (
                        <section className="resume-section">
                            <h2 className="section-title">Certifications</h2>
                            {resume.certifications.map((cert, index) => (
                                <div key={index} className="entry compact">
                                    <h3 className="entry-title">{cert.name}</h3>
                                    {cert.issuer && <span className="entry-subtitle">{cert.issuer}</span>}
                                    {cert.date && <span className="entry-date">{formatDate(cert.date)}</span>}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Languages */}
                    {resume.languages?.length > 0 && (
                        <section className="resume-section">
                            <h2 className="section-title">Languages</h2>
                            <div className="skills-grid">
                                {resume.languages.map((lang, index) => (
                                    <div key={index} className="skill-tag">
                                        <span className="skill-name">{lang.name}</span>
                                        <span className="skill-level">{lang.proficiency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Instant Share Modal - No loading! */}
            {showShareModal && shareLinks && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Share Resume</h2>
                            <button className="modal-close" onClick={() => setShowShareModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="share-link-box">
                                <input
                                    type="text"
                                    value={shareLinks.shareUrl}
                                    readOnly
                                    className="form-input"
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <FiCheck /> : <FiCopy />}
                                </button>
                            </div>

                            <p className="share-description">Share your resume directly:</p>

                            <div className="share-platforms">
                                <a
                                    href={shareLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn linkedin"
                                >
                                    <FiLinkedin /> LinkedIn
                                </a>
                                <a
                                    href={shareLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn twitter"
                                >
                                    <FiTwitter /> Twitter
                                </a>
                                <a
                                    href={shareLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn facebook"
                                >
                                    <FiFacebook /> Facebook
                                </a>
                                <a
                                    href={shareLinks.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn whatsapp"
                                >
                                    <FaWhatsapp /> WhatsApp
                                </a>
                                <a
                                    href={shareLinks.telegram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn telegram"
                                >
                                    <FaTelegram /> Telegram
                                </a>
                                <a
                                    href={shareLinks.email}
                                    className="share-btn email"
                                >
                                    <FiMail /> Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumePreview;
