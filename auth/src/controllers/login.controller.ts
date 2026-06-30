import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../modules/moduls'; // Adjust path as needed
import { env } from '../config/env'; // Adjust path as needed

const JWT_SECRET = env.JWTSECRET;
const JWT_EXPIRATION = env.JWTEXPIRE;

const router = Router();

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        //@ts-ignore
        const token = jwt.sign(
            { userId: user._id, email: user.email , iss:"auth-service"},
         //   JWT_SECRET,
            "A3b7cD9eF1gH2iJ4kL6mN8oP0qR5sT7uV9wX2yZ4",
            { expiresIn: JWT_EXPIRATION }
        );

        // Return success response with token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default router;
