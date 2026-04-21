import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// User interface
interface User {
    id: string;
    email: string;
    password: string;
    name?: string;
}

// In-memory user store (replace with database in production)
const users: User[] = [];

// Load private key
const PRIVATE_KEY_PATH = path.join(__dirname, 'private.pem');
let PRIVATE_KEY: string;

try {
    PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
} catch (error) {
    console.error('Error loading private key:', error);
    process.exit(1);
}


// Signup endpoint
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser: User = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            name
        };

        users.push(newUser);

        // Generate JWT
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            PRIVATE_KEY,
            { expiresIn: '24h', algorithm: 'RS256' }
        );

        // Return user data (excluding password) and token
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            PRIVATE_KEY,
            { expiresIn: '24h', algorithm: 'RS256' }
        );

        // Return user data (excluding password) and token
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;