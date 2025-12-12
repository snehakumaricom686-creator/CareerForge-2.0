import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiZap } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(formData.email, formData.password);
        if (result.success) navigate('/dashboard');
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="glow-orb purple orb-1"></div>
                <div className="glow-orb blue orb-2"></div>
                <div className="glow-orb pink orb-3"></div>
                <div className="grid-overlay"></div>
            </div>

            <div className="auth-container">
                <div className="auth-left">
                    <Link to="/" className="auth-logo">
                        <div className="logo-icon animate-pulse-glow">
                            <span>⚡</span>
                        </div>
                        <span className="logo-text">CareerForge</span>
                    </Link>

                    <div className="auth-content">
                        <h1 className="auth-title">
                            Welcome <span className="text-gradient">Back</span>
                        </h1>
                        <p className="auth-description">
                            Sign in to continue building your professional resume and land your dream job.
                        </p>

                        <div className="auth-features">
                            <div className="auth-feature">
                                <span className="feature-dot"></span>
                                <span>50,000+ resumes created</span>
                            </div>
                            <div className="auth-feature">
                                <span className="feature-dot"></span>
                                <span>95% interview success rate</span>
                            </div>
                            <div className="auth-feature">
                                <span className="feature-dot"></span>
                                <span>AI-powered suggestions</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-card glass-card">
                        <div className="form-header">
                            <h2 className="form-title">Sign In</h2>
                            <p className="form-subtitle">Enter your credentials to continue</p>
                        </div>

                        <button className="btn-oauth">
                            <FcGoogle size={22} />
                            Continue with Google
                        </button>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <div className="input-wrapper">
                                    <FiMail className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="form-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-actions">
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot password?
                                </Link>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                                {loading ? (
                                    <span className="spinner-btn"></span>
                                ) : (
                                    <>Sign In <FiArrowRight /></>
                                )}
                            </button>
                        </form>

                        <p className="auth-footer">
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">Create one</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
