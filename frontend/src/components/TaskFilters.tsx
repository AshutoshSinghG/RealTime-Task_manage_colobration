import { TaskStatus, TaskPriority, TaskFilters } from '../types/task.types';

interface TaskFiltersProps {
    filters: TaskFilters;
    onFilterChange: (filters: TaskFilters) => void;
}

export const TaskFiltersComponent = ({ filters, onFilterChange }: TaskFiltersProps) => {
    const handleStatusChange = (status: TaskStatus | '') => {
        onFilterChange({
            ...filters,
            status: status || undefined
        });
    };

    const handlePriorityChange = (priority: TaskPriority | '') => {
        onFilterChange({
            ...filters,
            priority: priority || undefined
        });
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    return (
        <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleStatusChange(e.target.value as TaskStatus | '')}
                        className="input-field"
                    >
                        <option value="">All Statuses</option>
                        {Object.values(TaskStatus).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                    </label>
                    <select
                        value={filters.priority || ''}
                        onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | '')}
                        className="input-field"
                    >
                        <option value="">All Priorities</option>
                        {Object.values(TaskPriority).map((priority) => (
                            <option key={priority} value={priority}>
                                {priority}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={clearFilters}
                        className="btn-secondary w-full"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};
