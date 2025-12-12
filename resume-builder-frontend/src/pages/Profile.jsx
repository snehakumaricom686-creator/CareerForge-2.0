import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { FiUser, FiMail, FiLock, FiCamera, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await userAPI.updateProfile(profileData);
            updateUser(response.data.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await userAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await userAPI.uploadProfilePicture(formData);
            updateUser({ profilePicture: response.data.data.profilePicture });
            toast.success('Profile picture updated');
        } catch (_error) {
            toast.error('Failed to upload profile picture');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            await userAPI.deleteAccount();
            toast.success('Account deleted');
            logout();
        } catch (_error) {
            toast.error('Failed to delete account');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-sidebar">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} />
                            ) : (
                                <FiUser size={40} />
                            )}
                            <label className="avatar-upload">
                                <FiCamera />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureUpload}
                                />
                            </label>
                        </div>
                        <h2 className="profile-name">{user?.name}</h2>
                        <p className="profile-email">{user?.email}</p>
                        {user?.authProvider && user.authProvider !== 'local' && (
                            <span className="auth-badge">{user.authProvider}</span>
                        )}
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FiUser /> Profile
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                            disabled={user?.authProvider !== 'local'}
                        >
                            <FiLock /> Password
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'danger' ? 'active' : ''}`}
                            onClick={() => setActiveTab('danger')}
                        >
                            <FiTrash2 /> Delete Account
                        </button>
                    </nav>
                </div>

                <div className="profile-content">
                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <h2>Profile Settings</h2>
                            <p className="section-description">Update your personal information</p>

                            <form onSubmit={handleProfileUpdate} className="profile-form">
                                <div className="form-group">
                                    <label className="form-label">
                                        <FiUser /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FiMail /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="profile-section">
                            <h2>Change Password</h2>
                            <p className="section-description">Update your password regularly for security</p>

                            {user?.authProvider !== 'local' ? (
                                <div className="info-box">
                                    <p>Password change is not available for accounts using {user.authProvider} login.</p>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="profile-form">
                                    <div className="form-group">
                                        <label className="form-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="profile-section danger-zone">
                            <h2>Danger Zone</h2>
                            <p className="section-description">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>

                            <div className="danger-box">
                                <div className="danger-info">
                                    <h3>Delete Account</h3>
                                    <p>This will permanently delete your account and all your resumes.</p>
                                </div>
                                <button className="btn btn-danger" onClick={handleDeleteAccount}>
                                    <FiTrash2 /> Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
