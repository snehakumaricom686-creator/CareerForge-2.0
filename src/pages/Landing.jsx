import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiZap, FiLayers, FiShare2, FiDownload, FiStar, FiCheck } from 'react-icons/fi';
import './Landing.css';

const Landing = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <FiZap />,
            title: 'Lightning Fast',
            description: 'Build professional resumes in under 10 minutes.',
            gradient: 'from-amber-500 to-orange-600'
        },
        {
            icon: <FiLayers />,
            title: '10+ Templates',
            description: 'Stunning 3D templates for every profession.',
            gradient: 'from-purple-500 to-pink-600'
        },
        {
            icon: <FiDownload />,
            title: 'Export Anywhere',
            description: 'Download as PDF or DOCX instantly.',
            gradient: 'from-cyan-500 to-blue-600'
        },
        {
            icon: <FiShare2 />,
            title: 'One-Click Share',
            description: 'Share to LinkedIn, Twitter & more.',
            gradient: 'from-emerald-500 to-teal-600'
        }
    ];

    return (
        <div className="landing">
            {/* Animated Background */}
            <div className="bg-effects">
                <div className="glow-orb purple orb-1"></div>
                <div className="glow-orb blue orb-2"></div>
                <div className="glow-orb pink orb-3"></div>
                <div className="glow-orb cyan orb-4"></div>
                <div className="grid-overlay"></div>
            </div>

            {/* Navbar */}
            <nav className="landing-nav glass">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon animate-pulse-glow">
                            <span>⚡</span>
                        </div>
                        <span className="logo-text">CareerForge</span>
                    </Link>
                    <div className="nav-actions">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary">
                                Dashboard <FiArrowRight />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost">Login</Link>
                                <Link to="/register" className="btn btn-primary">
                                    Get Started <FiArrowRight />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        {/* <div className="hero-badge animate-float">
                            <FiStar className="badge-icon" />
                            <span>AI-Powered Resume Builder</span>
                        </div> */}

                        <h1 className="hero-title">
                            <span className="title-line">Build Resumes</span>
                            <span className="title-line">
                                <span className="text-gradient">That Get You</span>
                            </span>
                            <span className="title-line text-gradient neon-text">Hired</span>
                        </h1>

                        <p className="hero-description">
                            Create stunning, ATS-optimized resume.
                            Stand out from the crowd and land your dream job.
                        </p>

                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg hero-cta">
                                <span>Start Building Free</span>
                                <FiArrowRight />
                                <div className="btn-glow"></div>
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                View Templates
                            </Link>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-value text-gradient">50K+</span>
                                <span className="stat-label">Resumes Created</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value text-gradient">95%</span>
                                <span className="stat-label">Success Rate</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value text-gradient">4.9★</span>
                                <span className="stat-label">User Rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="resume-preview-3d">
                            <div className="resume-card-main">
                                <div className="resume-header-preview">
                                    <div className="avatar-3d"></div>
                                    <div className="header-content">
                                        <div className="line-placeholder w-60"></div>
                                        <div className="line-placeholder w-40"></div>
                                    </div>
                                </div>
                                <div className="resume-body-preview">
                                    <div className="section-preview">
                                        <div className="section-title-preview"></div>
                                        <div className="line-placeholder"></div>
                                        <div className="line-placeholder w-80"></div>
                                    </div>
                                    <div className="section-preview">
                                        <div className="section-title-preview"></div>
                                        <div className="line-placeholder"></div>
                                        <div className="line-placeholder w-60"></div>
                                    </div>
                                </div>
                                <div className="card-glow"></div>
                            </div>

                            <div className="floating-element element-1">
                                <FiCheck /> ATS Friendly
                            </div>
                            <div className="floating-element element-2">
                                📄 PDF Ready
                            </div>
                            <div className="floating-element element-3">
                                ✨ AI Powered
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="features-container">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2 className="section-title">Everything You Need</h2>
                        <p className="section-subtitle">Powerful tools to create the perfect resume</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card card-3d"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`feature-icon-wrapper bg-gradient-${index}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-glow"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Templates Preview */}
            <section className="templates-section">
                <div className="templates-container">
                    <div className="section-header">
                        <span className="section-badge">Templates</span>
                        <h2 className="section-title">Beautiful Designs</h2>
                        <p className="section-subtitle">Choose from 10+ professional templates</p>
                    </div>

                    <div className="templates-showcase">
                        {['Modern', 'Executive', 'Creative', 'Minimal', 'Bold'].map((template, index) => (
                            <div
                                key={index}
                                className="template-preview-card"
                                style={{ '--delay': `${index * 0.1}s` }}
                            >
                                <div className="template-mockup">
                                    <div className="mockup-header" style={{ background: `hsl(${index * 60}, 70%, 50%)` }}></div>
                                    <div className="mockup-body">
                                        <div className="mockup-line"></div>
                                        <div className="mockup-line short"></div>
                                        <div className="mockup-line"></div>
                                    </div>
                                </div>
                                <span className="template-name">{template}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <div className="cta-card glass-card">
                        <div className="cta-glow"></div>
                        <h2 className="cta-title">Ready to Build Your Future?</h2>
                        <p className="cta-description">
                            Join thousands of professionals who landed their dream jobs.
                        </p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Get Started Free <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer glass">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="logo-icon small">⚡</div>
                        <span className="footer-logo-text">CareerForge</span>
                    </div>
                    <p className="footer-text">
                        © 2024 CareerForge. Forging careers, one resume at a time.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
