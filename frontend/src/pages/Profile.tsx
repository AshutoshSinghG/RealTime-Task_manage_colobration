import { useAuth } from '../hooks/useAuth';
import { User } from 'lucide-react';

export const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                        <User size={40} className="text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">User ID</label>
                            <p className="text-gray-900 mt-1">{user.id}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="text-gray-900 mt-1">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="text-gray-900 mt-1">{user.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
