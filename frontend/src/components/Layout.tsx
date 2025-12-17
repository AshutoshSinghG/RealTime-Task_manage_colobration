import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Home, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                                TaskManager
                            </Link>
                            <div className="flex gap-4">
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <Home size={20} />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <User size={20} />
                                    Profile
                                </Link>
                            </div>
                        </div>

                        {user && (
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-700">{user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};
