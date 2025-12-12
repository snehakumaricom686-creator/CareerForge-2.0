import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import './SharedResume.css';

const SharedResume = () => {
    const { token } = useParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSharedResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchSharedResume = async () => {
        try {
            const response = await resumeAPI.getShared(token);
            setResume(response.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Resume not found or link expired');
        } finally {
            setLoading(false);
        }
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
            <div className="shared-loading">
                <div className="spinner"></div>
                <p>Loading resume...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shared-error">
                <div className="error-content">
                    <span className="error-icon">😔</span>
                    <h1>Oops!</h1>
                    <p>{error}</p>
                    <a href="/" className="btn btn-primary">Go to Homepage</a>
                </div>
            </div>
        );
    }

    if (!resume) return null;

    return (
        <div className="shared-resume-page">
            <div className="shared-header">
                <div className="shared-brand">
                    <span className="logo-icon">📄</span>
                    <span className="logo-text">ResumeBuilder</span>
                </div>
                <a href="/" className="btn btn-primary">Create Your Resume</a>
            </div>

            <div className="shared-container">
                <div className={`resume-document template-${resume.template}`}>
                    {/* Header */}
                    <header className="resume-header">
                        <h1 className="resume-name">{resume.personalInfo?.fullName || 'Resume'}</h1>
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

            <div className="shared-footer">
                <p>Resume created with <a href="/">ResumeBuilder</a></p>
            </div>
        </div>
    );
};

export default SharedResume;
