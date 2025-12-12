import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) navigate('/dashboard');
        setLoading(false);
    };

    const features = [
        'Free forever, no credit card',
        '10+ professional templates',
        'Export to PDF and DOCX',
        'One-click social sharing'
    ];

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
                            Start <span className="text-gradient">Free</span> Today
                        </h1>
                        <p className="auth-description">
                            Create stunning resumes that get you hired. Join thousands of professionals.
                        </p>

                        <div className="auth-features">
                            {features.map((feature, i) => (
                                <div key={i} className="auth-feature">
                                    <span className="feature-check"><FiCheck /></span>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-card glass-card">
                        <div className="form-header">
                            <h2 className="form-title">Create Account</h2>
                            <p className="form-subtitle">Fill in your details to get started</p>
                        </div>

                        <button className="btn-oauth">
                            <FcGoogle size={22} />
                            Continue with Google
                        </button>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

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

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="input-wrapper">
                                        <FiLock className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create password"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm</label>
                                    <div className="input-wrapper">
                                        <FiLock className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
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
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                                {loading ? (
                                    <span className="spinner-btn"></span>
                                ) : (
                                    <>Create Account <FiArrowRight /></>
                                )}
                            </button>
                        </form>

                        <p className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
