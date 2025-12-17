import { useState, useEffect } from 'react';
import { Calendar, User as UserIcon, Trash2, Edit2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Task, TaskStatus, TaskPriority, UpdateTaskData } from '../types/task.types';
import { User } from '../types/user.types';
import { userApi } from '../services/user.api';

interface TaskCardProps {
    task: Task;
    currentUser: User;
    onUpdate: (taskId: string, data: UpdateTaskData) => Promise<{ task: Task }>;
    onDelete: (taskId: string) => Promise<void>;
}

const priorityColors = {
    [TaskPriority.LOW]: 'badge-info',
    [TaskPriority.MEDIUM]: 'badge-success',
    [TaskPriority.HIGH]: 'badge-warning',
    [TaskPriority.URGENT]: 'badge-danger'
};

const statusColors = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [TaskStatus.REVIEW]: 'bg-yellow-100 text-yellow-800',
    [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800'
};

export const TaskCard = ({ task, currentUser, onUpdate, onDelete }: TaskCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdateTaskData>({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedToId: typeof task.assignedToId === 'object' ? (task.assignedToId as any)._id : task.assignedToId
    });

    // Fetch all users for assignment dropdown
    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAllUsers,
        staleTime: Infinity
    });

    const users = usersData?.users || [];

    const creator = typeof task.creatorId === 'object' ? task.creatorId : null;
    const assignee = task.assignedToId && typeof task.assignedToId === 'object'
        ? task.assignedToId
        : null;

    // Check if current user is the task creator
    const isCreator = typeof task.creatorId === 'object'
        ? (task.creatorId as any)._id === currentUser.id
        : task.creatorId === currentUser.id;

    useEffect(() => {
        if (isEditing) {
            setEditData({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                assignedToId: typeof task.assignedToId === 'object' ? (task.assignedToId as any)._id : task.assignedToId
            });
        }
    }, [isEditing, task]);

    const handleStatusChange = async (newStatus: TaskStatus) => {
        await onUpdate(task._id, { status: newStatus });
    };

    const handlePriorityChange = async (newPriority: TaskPriority) => {
        await onUpdate(task._id, { priority: newPriority });
    };

    const handleSaveEdit = async () => {
        await onUpdate(task._id, editData);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await onDelete(task._id);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = () => {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        return dueDate < now && task.status !== TaskStatus.COMPLETED;
    };

    return (
        <div className={`card hover:shadow-md transition-shadow ${isOverdue() ? 'border-2 border-red-500 bg-red-50' : ''}`}>
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="input-field"
                            placeholder="Task title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="input-field"
                            rows={3}
                            placeholder="Description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={editData.dueDate?.split('T')[0] || ''}
                                onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={editData.priority}
                                onChange={(e) => setEditData({ ...editData, priority: e.target.value as TaskPriority })}
                                className="input-field"
                            >
                                {Object.values(TaskPriority).map((priority) => (
                                    <option key={priority} value={priority}>
                                        {priority}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={editData.status}
                                onChange={(e) => setEditData({ ...editData, status: e.target.value as TaskStatus })}
                                className="input-field"
                            >
                                {Object.values(TaskStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                            <select
                                value={editData.assignedToId || ''}
                                onChange={(e) => setEditData({ ...editData, assignedToId: e.target.value || undefined })}
                                className="input-field"
                            >
                                <option value="">Unassigned</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="btn-primary">
                            Save
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(true)} className="icon-button">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            {isCreator && (
                                <button
                                    onClick={handleDelete}
                                    className="icon-button hover:text-red-600"
                                    title="Only task creator can delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">{task.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]} border-none cursor-pointer`}
                        >
                            {Object.values(TaskStatus).map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <select
                            value={task.priority}
                            onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                            className={`badge ${priorityColors[task.priority]} cursor-pointer`}
                        >
                            {Object.values(TaskPriority).map((priority) => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            ))}
                        </select>

                        {isOverdue() && (
                            <span className="badge badge-danger font-bold">
                                OVERDUE
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className={`w-4 h-4 ${isOverdue() ? 'text-red-600' : ''}`} />
                            <span className={isOverdue() ? 'text-red-600 font-bold' : ''}>
                                {formatDate(task.dueDate)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {creator && (
                                <div className="flex items-center gap-1" title="Created by">
                                    <UserIcon className="w-4 h-4" />
                                    <span>{creator.name}</span>
                                </div>
                            )}

                            {assignee && (
                                <div className="flex items-center gap-1" title="Assigned to">
                                    <UserIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-600">{assignee.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
