import jwt, { Secret } from 'jsonwebtoken';
import userRepository from '../repositories/user.repository';
import { IUser } from '../models/User.model';

export interface TokenPayload {
    userId: string;
    email: string;
}

export class AuthService {
    private readonly jwtSecret: Secret;
    private readonly jwtExpiresIn: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    }

    async registerUser(name: string, email: string, password: string): Promise<IUser> {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const user = await userRepository.create({ name, email, password });
        return user;
    }

    async loginUser(email: string, password: string): Promise<{ user: IUser; token: string }> {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateJWT(user._id.toString(), user.email);

        const userWithoutPassword = await userRepository.findById(user._id);
        if (!userWithoutPassword) {
            throw new Error('User not found');
        }

        return { user: userWithoutPassword, token };
    }

    generateJWT(userId: string, email: string): string {
        const payload: TokenPayload = { userId, email };
        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn as any });
    }

    verifyJWT(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.jwtSecret) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    async getUserById(userId: string): Promise<IUser> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

export default new AuthService();
