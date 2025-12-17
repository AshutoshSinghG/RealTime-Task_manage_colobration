import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Clock, User, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useSocket } from '../hooks/useSocket';
import { TaskCard } from '../components/TaskCard';
import { TaskFiltersComponent } from '../components/TaskFilters';
import { TaskCardSkeleton } from '../components/SkeletonLoader';
import { TaskFilters, TaskPriority, TaskStatus, Task } from '../types/task.types';
import { userApi } from '../services/user.api';

const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    description: z.string().optional(),
    dueDate: z.string().min(1, 'Due date is required'),
    priority: z.nativeEnum(TaskPriority),
    status: z.nativeEnum(TaskStatus),
    assignedToId: z.string().optional()
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

type ViewMode = 'all' | 'assigned' | 'created' | 'overdue';

export const Dashboard = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<TaskFilters>({});
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');

    const { tasks, isLoading, createTask, updateTask, deleteTask, isCreating } = useTasks(filters);

    // Fetch all users for assignment dropdown
    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAllUsers,
        staleTime: Infinity
    });

    const users = usersData?.users || [];

    useSocket();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreateTaskFormData>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.TODO,
            dueDate: new Date().toISOString().split('T')[0]
        }
    });

    // Filter and sort tasks based on view mode
    const filteredTasks = useMemo(() => {
        if (!user) return [];

        let filtered: Task[] = [...tasks];

        // Apply view mode filter
        switch (viewMode) {
            case 'assigned':
                filtered = filtered.filter(task => {
                    const assignedId = typeof task.assignedToId === 'object'
                        ? task.assignedToId._id
                        : task.assignedToId;
                    return assignedId === user.id;
                });
                break;
            case 'created':
                filtered = filtered.filter(task => {
                    const creatorId = typeof task.creatorId === 'object'
                        ? task.creatorId._id
                        : task.creatorId;
                    return creatorId === user.id;
                });
                break;
            case 'overdue':
                const now = new Date();
                filtered = filtered.filter(task => {
                    const dueDate = new Date(task.dueDate);
                    return dueDate < now && task.status !== TaskStatus.COMPLETED;
                });
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'priority':
                    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                    return priorityOrder[a.priority as keyof typeof priorityOrder] -
                        priorityOrder[b.priority as keyof typeof priorityOrder];
                case 'status':
                    const statusOrder = { 'To Do': 0, 'In Progress': 1, 'Review': 2, 'Completed': 3 };
                    return statusOrder[a.status as keyof typeof statusOrder] -
                        statusOrder[b.status as keyof typeof statusOrder];
                default:
                    return 0;
            }
        });

        return filtered;
    }, [tasks, viewMode, sortBy, user]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!user) return { assigned: 0, created: 0, overdue: 0 };

        const now = new Date();
        const assigned = tasks.filter(task => {
            const assignedId = typeof task.assignedToId === 'object'
                ? task.assignedToId._id
                : task.assignedToId;
            return assignedId === user.id;
        }).length;

        const created = tasks.filter(task => {
            const creatorId = typeof task.creatorId === 'object'
                ? task.creatorId._id
                : task.creatorId;
            return creatorId === user.id;
        }).length;

        const overdue = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate < now && task.status !== TaskStatus.COMPLETED;
        }).length;

        return { assigned, created, overdue };
    }, [tasks, user]);

    const onSubmit = async (data: CreateTaskFormData) => {
        await createTask(data);
        reset();
        setShowCreateForm(false);
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Dashboard</h1>
                <p className="text-gray-600">
                    Manage your tasks and collaborate with your team in real-time
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div
                    className={`card cursor-pointer transition-all ${viewMode === 'assigned' ? 'ring-2 ring-primary-500' : 'hover:shadow-lg'}`}
                    onClick={() => setViewMode('assigned')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Assigned to Me</p>
                            <p className="text-3xl font-bold text-primary-600">{stats.assigned}</p>
                        </div>
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <User className="text-primary-600" size={24} />
                        </div>
                    </div>
                </div>

                <div
                    className={`card cursor-pointer transition-all ${viewMode === 'created' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                    onClick={() => setViewMode('created')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Created by Me</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.created}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Star className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div
                    className={`card cursor-pointer transition-all ${viewMode === 'overdue' ? 'ring-2 ring-red-500' : 'hover:shadow-lg'}`}
                    onClick={() => setViewMode('overdue')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Overdue Tasks</p>
                            <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Clock className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setViewMode('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Tasks
                </button>
                <button
                    onClick={() => setViewMode('assigned')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'assigned'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Assigned to Me ({stats.assigned})
                </button>
                <button
                    onClick={() => setViewMode('created')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'created'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-200'
                        }`}
                >
                    Created by Me ({stats.created})
                </button>
                <button
                    onClick={() => setViewMode('overdue')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'overdue'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Overdue ({stats.overdue})
                </button>
            </div>

            {/* Filtering and Sorting */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <TaskFiltersComponent filters={filters} onFilterChange={setFilters} />

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="input-field py-2"
                    >
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="status">Status</option>
                    </select>
                </div>
            </div>

            {/* Create Task Button/Form */}
            <div className="mb-6">
                {!showCreateForm ? (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create New Task
                    </button>
                ) : (
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    {...register('title')}
                                    className="input-field"
                                    placeholder="Enter task title"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    {...register('description')}
                                    className="input-field"
                                    rows={3}
                                    placeholder="Enter task description"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        {...register('dueDate')}
                                        className="input-field"
                                    />
                                    {errors.dueDate && (
                                        <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select {...register('priority')} className="input-field">
                                        {Object.values(TaskPriority).map((priority) => (
                                            <option key={priority} value={priority}>
                                                {priority}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select {...register('status')} className="input-field">
                                        {Object.values(TaskStatus).map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assign To (Optional)
                                    </label>
                                    <select {...register('assignedToId')} className="input-field">
                                        <option value="">Unassigned</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="btn-primary"
                                >
                                    {isCreating ? 'Creating...' : 'Create Task'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        reset();
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Tasks List */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {viewMode === 'all' && `All Tasks (${filteredTasks.length})`}
                    {viewMode === 'assigned' && `Tasks Assigned to Me (${filteredTasks.length})`}
                    {viewMode === 'created' && `Tasks Created by Me (${filteredTasks.length})`}
                    {viewMode === 'overdue' && `Overdue Tasks (${filteredTasks.length})`}
                </h2>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <TaskCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-500 text-lg">No tasks found</p>
                        <p className="text-gray-400 mt-2">
                            {viewMode === 'all' && 'Create your first task to get started'}
                            {viewMode === 'assigned' && 'No tasks assigned to you yet'}
                            {viewMode === 'created' && 'You haven\'t created any tasks yet'}
                            {viewMode === 'overdue' && 'No overdue tasks!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                currentUser={user}
                                onUpdate={updateTask}
                                onDelete={deleteTask}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
