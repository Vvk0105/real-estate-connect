import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp, verifyOtp, loginWithGoogle, resetError } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, Loader } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, otpSent, isAuthenticated, user } = useSelector((state) => state.auth);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            dispatch(resetError());
            dispatch(loginWithGoogle(tokenResponse.access_token));
        },
        onError: () => console.log('Login Failed'),
    });

    useEffect(() => {
        if (isAuthenticated) {
            // Admin Redirect
            if (user?.role === 'ADMIN') {
                navigate('/dashboard');
            } else {
                // Public Redirect
                // If Visitor (default), allow them to choose role or dashboard.
                // We redirect to /select-role to give them the choice initially.
                if (user?.role === 'VISITOR') {
                    navigate('/select-role');
                } else {
                    navigate('/dashboard');
                }
            }
        }
    }, [isAuthenticated, navigate, user]);

    const handleSendOtp = (e) => {
        e.preventDefault();
        dispatch(resetError());
        dispatch(sendOtp(phoneNumber));
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        dispatch(resetError());
        dispatch(verifyOtp({ phoneNumber, otp }));
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">
                        {otpSent ? 'Verify OTP' : 'Sign In'}
                    </h2>
                    <p className="login-subtitle">
                        {otpSent
                            ? `Enter the code sent to ${phoneNumber}`
                            : 'Access your Real Estate Exhibition account'}
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {!otpSent ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="input-group">
                            <label htmlFor="phone" className="input-label">Phone Number</label>
                            <div className="icon-input-wrapper">
                                <Phone className="input-icon" />
                                <input
                                    type="text"
                                    id="phone"
                                    required
                                    className="input-field input-with-icon"
                                    placeholder="+91 9999999999"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Send OTP <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </button>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '100%', borderTop: '1px solid #e5e7eb' }}></div>
                                </div>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ backgroundColor: 'white', padding: '0 0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>Or continue with</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => googleLogin()}
                                style={{
                                    marginTop: '1rem',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                <svg style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <a href="/admin/login" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>Are you an Organizer? Login here</a>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="input-group">
                            <label htmlFor="otp" className="input-label">OTP Code</label>
                            <div className="icon-input-wrapper">
                                <Lock className="input-icon" />
                                <input
                                    type="text"
                                    id="otp"
                                    required
                                    className="input-field input-with-icon"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%', backgroundColor: 'var(--success)' }}
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Verify & Login'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                Change Phone Number
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
