import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { FiSave, FiEye, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ResumeBuilder.css';

const templates = [
    { id: 'modern', name: 'Modern', color: '#6366f1', description: 'Clean & professional' },
    { id: 'classic', name: 'Classic', color: '#1e293b', description: 'Traditional style' },
    { id: 'minimal', name: 'Minimal', color: '#64748b', description: 'Simple & elegant' },
    { id: 'professional', name: 'Professional', color: '#0ea5e9', description: 'Corporate ready' },
    { id: 'creative', name: 'Creative', color: '#ec4899', description: 'Stand out' },
    { id: 'executive', name: 'Executive', color: '#0f172a', description: 'Senior roles' },
    { id: 'bold', name: 'Bold', color: '#ef4444', description: 'Make an impact' },
    { id: 'elegant', name: 'Elegant', color: '#8b5cf6', description: 'Sophisticated' },
    { id: 'tech', name: 'Tech', color: '#10b981', description: 'IT & Software' },
    { id: 'academic', name: 'Academic', color: '#f59e0b', description: 'For researchers' },
];

const initialResumeData = {
    title: 'My Resume',
    template: 'modern',
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        portfolio: '',
        github: '',
        summary: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
};

const ResumeBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resumeData, setResumeData] = useState(initialResumeData);
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('personal');

    useEffect(() => {
        if (id) {
            fetchResume();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchResume = async () => {
        try {
            const response = await resumeAPI.getOne(id);
            setResumeData(response.data.data);
        } catch (_error) {
            toast.error('Failed to load resume');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalInfoChange = (field, value) => {
        setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const handleArrayAdd = (section, newItem) => {
        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], newItem]
        }));
    };

    const handleArrayUpdate = (section, index, field, value) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleArrayDelete = (section, index) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!resumeData.title.trim()) {
            toast.error('Please enter a resume title');
            return;
        }

        setSaving(true);
        try {
            if (id) {
                await resumeAPI.update(id, resumeData);
                toast.success('Resume updated successfully');
            } else {
                const response = await resumeAPI.create(resumeData);
                toast.success('Resume created successfully');
                navigate(`/resume/${response.data.data._id}`);
            }
        } catch (_error) {
            toast.error('Failed to save resume');
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? '' : section);
    };

    if (loading) {
        return (
            <div className="builder-loading">
                <div className="spinner"></div>
                <p>Loading resume...</p>
            </div>
        );
    }

    return (
        <div className="resume-builder">
            <div className="builder-header glass">
                <div className="builder-title-section">
                    <input
                        type="text"
                        value={resumeData.title}
                        onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
                        className="builder-title-input"
                        placeholder="Resume Title"
                    />
                </div>
                <div className="builder-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(id ? `/resume/${id}/preview` : '/dashboard')}
                    >
                        <FiEye /> Preview
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : <><FiSave /> Save</>}
                    </button>
                </div>
            </div>

            <div className="builder-content">
                <div className="builder-sidebar">
                    {/* Template Selection */}
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Choose Template</h3>
                        <div className="template-grid">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    className={`template-btn ${resumeData.template === template.id ? 'active' : ''}`}
                                    onClick={() => setResumeData(prev => ({ ...prev, template: template.id }))}
                                    style={{ '--template-color': template.color }}
                                >
                                    <div className="template-preview-mini">
                                        <div className="tpm-header" style={{ background: template.color }}></div>
                                        <div className="tpm-body">
                                            <div className="tpm-line"></div>
                                            <div className="tpm-line short"></div>
                                        </div>
                                    </div>
                                    <span className="template-name">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Navigation */}
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Sections</h3>
                        <nav className="section-nav">
                            {['personal', 'education', 'experience', 'skills', 'projects', 'certifications', 'languages'].map((section) => (
                                <button
                                    key={section}
                                    className={`section-nav-btn ${activeSection === section ? 'active' : ''}`}
                                    onClick={() => toggleSection(section)}
                                >
                                    {section.charAt(0).toUpperCase() + section.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="builder-main">
                    {/* Personal Information */}
                    <Section
                        title="Personal Information"
                        isOpen={activeSection === 'personal'}
                        onToggle={() => toggleSection('personal')}
                    >
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={resumeData.personalInfo.fullName}
                                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={resumeData.personalInfo.email}
                                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={resumeData.personalInfo.phone}
                                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={resumeData.personalInfo.address}
                                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">LinkedIn</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={resumeData.personalInfo.linkedIn}
                                    onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)}
                                    placeholder="https://linkedin.com/in/johndoe"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Portfolio</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={resumeData.personalInfo.portfolio}
                                    onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)}
                                    placeholder="https://johndoe.com"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">GitHub</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={resumeData.personalInfo.github}
                                    onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                                    placeholder="https://github.com/johndoe"
                                />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Professional Summary</label>
                            <textarea
                                className="form-input form-textarea"
                                value={resumeData.personalInfo.summary}
                                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                                placeholder="A brief summary of your professional background and goals..."
                                rows={4}
                            />
                        </div>
                    </Section>

                    {/* Education */}
                    <Section
                        title="Education"
                        isOpen={activeSection === 'education'}
                        onToggle={() => toggleSection('education')}
                    >
                        {resumeData.education.map((edu, index) => (
                            <div key={index} className="entry-card">
                                <div className="entry-header">
                                    <span className="entry-number">{index + 1}</span>
                                    <button
                                        className="entry-delete"
                                        onClick={() => handleArrayDelete('education', index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Institution</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.institution}
                                            onChange={(e) => handleArrayUpdate('education', index, 'institution', e.target.value)}
                                            placeholder="University Name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Degree</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.degree}
                                            onChange={(e) => handleArrayUpdate('education', index, 'degree', e.target.value)}
                                            placeholder="Bachelor's, Master's, etc."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Field of Study</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.field}
                                            onChange={(e) => handleArrayUpdate('education', index, 'field', e.target.value)}
                                            placeholder="Computer Science"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Grade/GPA</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.grade}
                                            onChange={(e) => handleArrayUpdate('education', index, 'grade', e.target.value)}
                                            placeholder="3.8/4.0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={edu.startDate?.slice(0, 7) || ''}
                                            onChange={(e) => handleArrayUpdate('education', index, 'startDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={edu.endDate?.slice(0, 7) || ''}
                                            onChange={(e) => handleArrayUpdate('education', index, 'endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            className="add-entry-btn"
                            onClick={() => handleArrayAdd('education', {
                                institution: '',
                                degree: '',
                                field: '',
                                grade: '',
                                startDate: '',
                                endDate: '',
                                description: ''
                            })}
                        >
                            <FiPlus /> Add Education
                        </button>
                    </Section>

                    {/* Experience */}
                    <Section
                        title="Work Experience"
                        isOpen={activeSection === 'experience'}
                        onToggle={() => toggleSection('experience')}
                    >
                        {resumeData.experience.map((exp, index) => (
                            <div key={index} className="entry-card">
                                <div className="entry-header">
                                    <span className="entry-number">{index + 1}</span>
                                    <button
                                        className="entry-delete"
                                        onClick={() => handleArrayDelete('experience', index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Company</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={exp.company}
                                            onChange={(e) => handleArrayUpdate('experience', index, 'company', e.target.value)}
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Position</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={exp.position}
                                            onChange={(e) => handleArrayUpdate('experience', index, 'position', e.target.value)}
                                            placeholder="Job Title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={exp.location}
                                            onChange={(e) => handleArrayUpdate('experience', index, 'location', e.target.value)}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <input
                                                type="checkbox"
                                                checked={exp.current}
                                                onChange={(e) => handleArrayUpdate('experience', index, 'current', e.target.checked)}
                                            />
                                            {' '}Currently Working Here
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={exp.startDate?.slice(0, 7) || ''}
                                            onChange={(e) => handleArrayUpdate('experience', index, 'startDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={exp.endDate?.slice(0, 7) || ''}
                                            onChange={(e) => handleArrayUpdate('experience', index, 'endDate', e.target.value)}
                                            disabled={exp.current}
                                        />
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        value={exp.description}
                                        onChange={(e) => handleArrayUpdate('experience', index, 'description', e.target.value)}
                                        placeholder="Describe your responsibilities and achievements..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            className="add-entry-btn"
                            onClick={() => handleArrayAdd('experience', {
                                company: '',
                                position: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                current: false,
                                description: '',
                                achievements: []
                            })}
                        >
                            <FiPlus /> Add Experience
                        </button>
                    </Section>

                    {/* Skills */}
                    <Section
                        title="Skills"
                        isOpen={activeSection === 'skills'}
                        onToggle={() => toggleSection('skills')}
                    >
                        <div className="skills-list">
                            {resumeData.skills.map((skill, index) => (
                                <div key={index} className="skill-item">
                                    <input
                                        type="text"
                                        className="form-input skill-name"
                                        value={skill.name}
                                        onChange={(e) => handleArrayUpdate('skills', index, 'name', e.target.value)}
                                        placeholder="Skill name"
                                    />
                                    <select
                                        className="form-input skill-level"
                                        value={skill.level}
                                        onChange={(e) => handleArrayUpdate('skills', index, 'level', e.target.value)}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                    <button
                                        className="skill-delete"
                                        onClick={() => handleArrayDelete('skills', index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="add-entry-btn"
                            onClick={() => handleArrayAdd('skills', { name: '', level: 'Intermediate' })}
                        >
                            <FiPlus /> Add Skill
                        </button>
                    </Section>

                    {/* Projects */}
                    <Section
                        title="Projects"
                        isOpen={activeSection === 'projects'}
                        onToggle={() => toggleSection('projects')}
                    >
                        {resumeData.projects.map((project, index) => (
                            <div key={index} className="entry-card">
                                <div className="entry-header">
                                    <span className="entry-number">{index + 1}</span>
                                    <button
                                        className="entry-delete"
                                        onClick={() => handleArrayDelete('projects', index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Project Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={project.name}
                                            onChange={(e) => handleArrayUpdate('projects', index, 'name', e.target.value)}
                                            placeholder="Project Title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Technologies</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={project.technologies?.join(', ') || ''}
                                            onChange={(e) => handleArrayUpdate('projects', index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                                            placeholder="React, Node.js, MongoDB"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Live Link</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={project.link}
                                            onChange={(e) => handleArrayUpdate('projects', index, 'link', e.target.value)}
                                            placeholder="https://project-demo.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">GitHub</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={project.github}
                                            onChange={(e) => handleArrayUpdate('projects', index, 'github', e.target.value)}
                                            placeholder="https://github.com/user/project"
                                        />
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        value={project.description}
                                        onChange={(e) => handleArrayUpdate('projects', index, 'description', e.target.value)}
                                        placeholder="Describe what the project does..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            className="add-entry-btn"
                            onClick={() => handleArrayAdd('projects', {
                                name: '',
                                description: '',
                                technologies: [],
                                link: '',
                                github: ''
                            })}
                        >
                            <FiPlus /> Add Project
                        </button>
                    </Section>

                    {/* Certifications */}
                    <Section
                        title="Certifications"
                        isOpen={activeSection === 'certifications'}
                        onToggle={() => toggleSection('certifications')}
                    >
                        {resumeData.certifications.map((cert, index) => (
                            <div key={index} className="entry-card">
                                <div className="entry-header">
                                    <span className="entry-number">{index + 1}</span>
                                    <button
                                        className="entry-delete"
                                        onClick={() => handleArrayDelete('certifications', index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Certification Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={cert.name}
                                            onChange={(e) => handleArrayUpdate('certifications', index, 'name', e.target.value)}
                                            placeholder="AWS Solutions Architect"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Issuing Organization</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={cert.issuer}
                                            onChange={(e) => handleArrayUpdate('certifications', index, 'issuer', e.target.value)}
                                            placeholder="Amazon Web Services"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Issue Date</label>
                                        <input
                                            type="month"
                                            className="form-input"
                                            value={cert.date?.slice(0, 7) || ''}
                                            onChange={(e) => handleArrayUpdate('certifications', index, 'date', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Credential Link</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={cert.link}
                                            onChange={(e) => handleArrayUpdate('certifications', index, 'link', e.target.value)}
                                            placeholder="https://credential.net/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            className="add-entry-btn"
                            onClick={() => handleArrayAdd('certifications', {
                                name: '',
                                issuer: '',
                                date: '',
                                link: '',
                                credentialId: ''
                            })}
                        >
                            <FiPlus /> Add Certification
                        </button>
                    </Section>

                    {/* Languages */}
                    <Section
                        title="Languages"
                        isOpen={activeSection === 'languages'}
                        onToggle={() => toggleSection('languages')}
                    >
                        <div className="skills-list">
                            {resumeData.languages.map((lang, index) => (
                                <div key={index} className="skill-item">
                                    <input
                                        type="text"
                                        className="form-input skill-name"
                                        value={lang.name}
                                        onChange={(e) => handleArrayUpdate('languages', index, 'name', e.target.value)}
                                        placeholder="Language"
                                    />
                                    <select
                                        className="form-input skill-level"
                                        value={lang.proficiency}
                                        onChange={(e) => handleArrayUpdate('languages', index, 'proficiency', e.target.value)}
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Conversational">Conversational</option>
                                        <option value="Fluent">Fluent</option>
                                        <option value="Native">Native</option>
                                    </select>
                                    <button
                                        className="skill-delete"
                                        onClick={() => handleArrayDelete('languages', index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="add-entry-btn"
                            onClick={() => handleArrayAdd('languages', { name: '', proficiency: 'Conversational' })}
                        >
                            <FiPlus /> Add Language
                        </button>
                    </Section>
                </div>
            </div>
        </div>
    );
};

// Section Component
const Section = ({ title, isOpen, onToggle, children }) => (
    <div className={`builder-section ${isOpen ? 'open' : ''}`}>
        <button className="section-header" onClick={onToggle}>
            <h3>{title}</h3>
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {isOpen && <div className="section-content">{children}</div>}
    </div>
);

export default ResumeBuilder;
