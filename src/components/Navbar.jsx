import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiUser, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-logo">
                    <div className="logo-icon-nav">
                        <span>⚡</span>
                    </div>
                    <span className="logo-text-nav">CareerForge</span>
                </Link>

                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                    </Link>
                    <Link to="/resume/new" className="nav-link create-btn" onClick={() => setMobileMenuOpen(false)}>
                        <FiPlus /> New Resume
                    </Link>
                </div>

                <div className="navbar-actions">
                    <div className="user-menu">
                        <div className="user-avatar">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} />
                            ) : (
                                <FiUser />
                            )}
                        </div>
                        <div className="user-dropdown">
                            <div className="user-info">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-email">{user?.email}</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link to="/profile" className="dropdown-item">
                                <FiSettings /> Settings
                            </Link>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    </div>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
