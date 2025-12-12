import './Loading.css';

const Loading = () => {
    return (
        <div className="loading-container">
            <div className="loading-bg">
                <div className="glow-orb purple orb-1"></div>
                <div className="glow-orb blue orb-2"></div>
            </div>
            <div className="loading-content">
                <div className="loading-logo">
                    <div className="logo-icon-loading animate-pulse-glow">
                        <span>⚡</span>
                    </div>
                    <span className="logo-text-loading">CareerForge</span>
                </div>
                <div className="loading-bar">
                    <div className="loading-bar-fill"></div>
                </div>
                <p className="loading-text">Loading your experience...</p>
            </div>
        </div>
    );
};

export default Loading;
