import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, resetError } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader, Mail } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            navigate('/dashboard');
        } else if (isAuthenticated && user?.role !== 'ADMIN') {
            // If non-admin tries to login here and succeeds (if backend allows), we might want to warn
            // But our backend login allows any password user.
            // Frontend check:
            alert('Access Denied: You are not an Admin.');
            // dispatch(logout()) ??
        }
    }, [isAuthenticated, navigate, user]);

    const handleAdminLogin = (e) => {
        e.preventDefault();
        dispatch(resetError());
        dispatch(loginAdmin({ email, password }));
    };

    return (
        <div className="login-page" style={{ background: '#111827' }}>
            {/* Darker background for Admin to distinguish */}
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title" style={{ color: '#1f2937' }}>Admin Portal</h2>
                    <p className="login-subtitle">Secure Access for Organizers</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAdminLogin}>
                    <div className="input-group">
                        <label htmlFor="email" className="input-label">Email Address</label>
                        <div className="icon-input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                required
                                className="input-field input-with-icon"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" className="input-label">Password</label>
                        <div className="icon-input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                required
                                className="input-field input-with-icon"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', backgroundColor: '#111827' }}
                    >
                        {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Login <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <a href="/login" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>Not an Admin? Go to Public Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
