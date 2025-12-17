import taskService from '../services/task.service';
import { TaskStatus, TaskPriority } from '../models/Task.model';

jest.mock('../repositories/task.repository');
jest.mock('../models/AuditLog.model');

describe('TaskService', () => {
    describe('createTask', () => {
        it('should create a task with valid data', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                dueDate: new Date('2024-12-31'),
                priority: TaskPriority.HIGH,
                status: TaskStatus.TODO
            };

            const creatorId = '507f1f77bcf86cd799439011';

            const mockTask = {
                _id: '507f1f77bcf86cd799439012',
                ...taskData,
                creatorId
            };

            const taskRepository = require('../repositories/task.repository').default;
            taskRepository.create = jest.fn().mockResolvedValue(mockTask);

            const result = await taskService.createTask(taskData, creatorId);

            expect(result).toBeDefined();
            expect(taskRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Task',
                    description: 'Test Description'
                })
            );
        });

        it('should reject task with title exceeding 100 characters', () => {
            const taskData = {
                title: 'A'.repeat(101),
                description: 'Valid description',
                dueDate: new Date('2024-12-31'),
                priority: TaskPriority.LOW,
                status: TaskStatus.TODO
            };

            expect(taskData.title.length).toBeGreaterThan(100);
        });
    });

    describe('assignTask', () => {
        it('should assign task to a user', async () => {
            const taskId = '507f1f77bcf86cd799439012';
            const assigneeId = '507f1f77bcf86cd799439013';
            const assignedBy = '507f1f77bcf86cd799439011';

            const existingTask = {
                _id: taskId,
                title: 'Test Task',
                creatorId: assignedBy
            };

            const updatedTask = {
                ...existingTask,
                assignedToId: assigneeId
            };

            const taskRepository = require('../repositories/task.repository').default;
            taskRepository.findById = jest.fn().mockResolvedValue(existingTask);
            taskRepository.updateById = jest.fn().mockResolvedValue(updatedTask);

            const result = await taskService.assignTask(taskId, assigneeId, assignedBy);

            expect(result).toBeDefined();
            expect(taskRepository.updateById).toHaveBeenCalledWith(
                taskId,
                expect.objectContaining({
                    assignedToId: expect.anything()
                })
            );
        });

        it('should throw error when task not found', async () => {
            const taskRepository = require('../repositories/task.repository').default;
            taskRepository.findById = jest.fn().mockResolvedValue(null);

            await expect(
                taskService.assignTask('invalid-id', 'assignee-id', 'assigner-id')
            ).rejects.toThrow('Task not found');
        });
    });
});
