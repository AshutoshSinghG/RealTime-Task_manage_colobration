import { Router } from 'express';
import taskController from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest, validateQuery } from '../middlewares/validation.middleware';
import { createTaskSchema, updateTaskSchema, assignTaskSchema, taskFilterSchema } from '../dtos/task.dto';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(taskFilterSchema), taskController.getTasks.bind(taskController));
router.post('/', validateRequest(createTaskSchema), taskController.createTask.bind(taskController));
router.put('/:id', validateRequest(updateTaskSchema), taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));
router.post('/:id/assign', validateRequest(assignTaskSchema), taskController.assignTask.bind(taskController));

export default router;
