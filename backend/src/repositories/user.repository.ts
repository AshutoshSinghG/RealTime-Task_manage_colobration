import { User, IUser } from '../models/User.model';
import { Types } from 'mongoose';

export class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email }).select('+password');
    }

    async findById(id: string | Types.ObjectId): Promise<IUser | null> {
        return User.findById(id);
    }

    async create(userData: { name: string; email: string; password: string }): Promise<IUser> {
        const user = new User(userData);
        return user.save();
    }

    async findAll(limit: number = 100): Promise<IUser[]> {
        return User.find().limit(limit).select('name email') as any;
    }

    async updateById(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }

    async deleteById(id: string | Types.ObjectId): Promise<IUser | null> {
        return User.findByIdAndDelete(id);
    }
}

export default new UserRepository();
