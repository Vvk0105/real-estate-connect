import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LogOut } from 'lucide-react';
import AdminEvents from '../components/AdminEvents';
import ExhibitorDashboard from '../components/ExhibitorDashboard';
import VisitorDashboard from '../components/VisitorDashboard';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const renderContent = () => {
        switch (user?.role) {
            case 'ADMIN':
                return <AdminEvents />;
            case 'EXHIBITOR':
                return <ExhibitorDashboard />;
            case 'VISITOR':
                return <VisitorDashboard />;
            default:
                return <p className="text-center text-gray-500 mt-10">Unknown Role. Please contact support.</p>;
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="nav-content">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 className="nav-title">Exhibition Manager &mdash; {user?.role} Portal</h1>
                    </div>
                    <div className="nav-user">
                        {user?.role !== 'ADMIN' && (
                            <a href="/select-role" className="text-sm text-indigo-600 hover:text-indigo-800 mr-4 font-medium" style={{ textDecoration: 'none' }}>
                                Switch Role
                            </a>
                        )}
                        <span style={{ color: 'var(--text-color)', marginRight: '1rem' }}>
                            {user?.phone_number || user?.email}
                        </span>
                        <button
                            onClick={() => dispatch(logout())}
                            className="btn"
                            style={{ backgroundColor: 'var(--error)', color: 'white' }}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
