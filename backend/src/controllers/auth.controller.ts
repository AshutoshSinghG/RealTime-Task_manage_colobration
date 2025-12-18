import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import authService from '../services/auth.service';

export class AuthController {
    async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, email, password } = req.body;

            const user = await authService.registerUser(name, email, password);
            const token = authService.generateJWT(user._id.toString(), user.email);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                message: 'Registration successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;

            const { user, token } = await authService.loginUser(email, password);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(_req: AuthRequest, res: Response): Promise<void> {
        res.clearCookie('token');
        res.json({ message: 'Logout successful' });
    }

    async getCurrentUser(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const user = await authService.getUserById(req.user.userId);

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            _next(error);
        }
    }
}

export default new AuthController();
