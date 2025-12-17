import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import userRepository from '../repositories/user.repository';

export class UserController {
    async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const users = await userRepository.findAll();

            res.json({
                users: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email
                }))
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
