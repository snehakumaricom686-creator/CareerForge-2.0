import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import adminAPI from '../services/adminAPI';
import { FiUsers, FiFileText, FiTrendingUp, FiTrash2, FiShield, FiSearch, FiX, FiCheck, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const Admin = () => {
    useAuth(); // Verify authentication context is available
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [secretKey, setSecretKey] = useState('');
    const [_isAdmin, setIsAdmin] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

    useEffect(() => {
        checkAdminAndLoadData();
    }, []);

    const checkAdminAndLoadData = async () => {
        try {
            const statsRes = await adminAPI.getStats();
            setStats(statsRes.data);
            setIsAdmin(true);

            const usersRes = await adminAPI.getUsers();
            setUsers(usersRes.data.users);
        } catch (error) {
            if (error.response?.status === 403) {
                setIsAdmin(false);
                setShowSetupModal(true);
            } else {
                toast.error('Failed to load admin data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMakeAdmin = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.makeAdmin(secretKey);
            toast.success('You are now an admin!');
            setShowSetupModal(false);
            setIsAdmin(true);
            checkAdminAndLoadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid secret key');
        }
    };

    const handleSearch = async () => {
        try {
            const res = await adminAPI.getUsers(1, 20, searchTerm);
            setUsers(res.data.users);
        } catch (_error) {
            toast.error('Search failed');
        }
    };

    const handleToggleAdmin = async (userId, currentStatus) => {
        try {
            await adminAPI.updateUser(userId, { isAdmin: !currentStatus });
            toast.success(`User ${currentStatus ? 'removed from' : 'made'} admin`);
            setUsers(users.map(u =>
                u._id === userId ? { ...u, isAdmin: !currentStatus } : u
            ));
        } catch (_error) {
            toast.error('Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.user) return;

        try {
            await adminAPI.deleteUser(deleteModal.user._id);
            toast.success('User deleted successfully');
            setUsers(users.filter(u => u._id !== deleteModal.user._id));
            setDeleteModal({ show: false, user: null });

            // Refresh stats
            const statsRes = await adminAPI.getStats();
            setStats(statsRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Loading admin panel...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-header">
                        <div>
                            <h1 className="admin-title">Admin Dashboard</h1>
                            <p className="admin-subtitle">Manage users and view statistics</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon users">
                                    <FiUsers />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.totalUsers}</span>
                                    <span className="stat-label">Total Users</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon resumes">
                                    <FiFileText />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.totalResumes}</span>
                                    <span className="stat-label">Total Resumes</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon new-week">
                                    <FiTrendingUp />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.newUsersThisWeek}</span>
                                    <span className="stat-label">New This Week</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon new-today">
                                    <FiUser />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.newUsersToday}</span>
                                    <span className="stat-label">New Today</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Section */}
                    <div className="users-section">
                        <div className="section-header">
                            <h2>All Users</h2>
                            <div className="search-box">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button className="search-btn" onClick={handleSearch}>
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="users-table">
                            <div className="table-header">
                                <span>User</span>
                                <span>Email</span>
                                <span>Joined</span>
                                <span>Last Login</span>
                                <span>Role</span>
                                <span>Actions</span>
                            </div>
                            {users.map((u) => (
                                <div key={u._id} className="table-row">
                                    <span className="user-cell">
                                        <div className="user-avatar-small">
                                            {u.profilePicture ? (
                                                <img src={u.profilePicture} alt={u.name} />
                                            ) : (
                                                <FiUser />
                                            )}
                                        </div>
                                        {u.name}
                                    </span>
                                    <span className="email-cell">{u.email}</span>
                                    <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                                    <span>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</span>
                                    <span>
                                        <span className={`role-badge ${u.isAdmin ? 'admin' : 'user'}`}>
                                            {u.isAdmin ? 'Admin' : 'User'}
                                        </span>
                                    </span>
                                    <span className="actions-cell">
                                        <button
                                            className={`action-btn ${u.isAdmin ? 'remove-admin' : 'make-admin'}`}
                                            onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                                            title={u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                        >
                                            <FiShield />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => setDeleteModal({ show: true, user: u })}
                                            title="Delete User"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Setup Modal */}
            {showSetupModal && (
                <div className="modal-overlay">
                    <div className="modal setup-modal">
                        <div className="modal-header">
                            <h2>🔐 Admin Setup</h2>
                        </div>
                        <div className="modal-body">
                            <p>Enter the secret key to become an admin:</p>
                            <form onSubmit={handleMakeAdmin}>
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Enter secret key"
                                        value={secretKey}
                                        onChange={(e) => setSecretKey(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Verify
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay">
                    <div className="modal delete-modal">
                        <div className="modal-header">
                            <h2>⚠️ Delete User</h2>
                            <button className="modal-close" onClick={() => setDeleteModal({ show: false, user: null })}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{deleteModal.user?.name}</strong>?</p>
                            <p className="warning-text">This will also delete all their resumes. This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, user: null })}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={handleDeleteUser}>
                                    <FiTrash2 /> Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Admin;
