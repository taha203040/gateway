import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI =
            process.env.MONGO_URI ||
            'mongodb://admin:1234@mongodb-checkout:27017/checkout?authSource=admin';

        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;