import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User, Store } from 'lucide-react';
import api from '../api/axios';
import { logout } from '../store/authSlice';

const RoleSelection = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleRoleSelect = async (role) => {
        try {
            // Call API to update role
            const response = await api.post('auth/update-role/', { role });
            // Update local state -> We need to reload window or dispatch action.
            // Simplified: Update localStorage and reload to refresh Redux from formatting
            // Or better: dispatch a new action `setUser`.
            // Let's just reload for MVP robustness or navigate if we trust the flow.
            // If I just navigate, redux state is stale (still VISITOR). 
            // So Dashboard might redirect back to /select-role if logic matches!
            // Infinite loop risk.

            // Fix: Update localStorage then force reload or navigate with state update.
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Force reload to pick up new user state in Redux (init happens on load)
            window.location.href = '/dashboard';

        } catch (error) {
            console.error('Failed to update role', error);
            alert('Failed to set role. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-2xl w-full p-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, {user?.phone_number || user?.email}!</h1>
                    <p className="text-gray-600">Please select how you would like to continue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visitor Card */}
                    <button
                        onClick={() => handleRoleSelect('VISITOR')}
                        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500 flex flex-col items-center text-center group"
                    >
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                            <User className="h-10 w-10 text-indigo-600 group-hover:text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Continue as Visitor</h2>
                        <p className="text-gray-500 text-sm">
                            Browse exhibitions, register for upcoming events, and access your event tickets.
                        </p>
                    </button>

                    {/* Exhibitor Card */}
                    <button
                        onClick={() => handleRoleSelect('EXHIBITOR')}
                        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500 flex flex-col items-center text-center group"
                    >
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                            <Store className="h-10 w-10 text-purple-600 group-hover:text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Continue as Exhibitor</h2>
                        <p className="text-gray-500 text-sm">
                            Apply for booths, manage your brand presence, and showcase your properties.
                        </p>
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => dispatch(logout())}
                        className="text-gray-400 hover:text-gray-600 flex items-center justify-center mx-auto"
                    >
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
