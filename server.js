import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

import { apiLimiter, createLimiter } from './middleware/rateLimiter.js';

import patientRoutes from './routes/patients.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware

app.use(cors({
  origin: "*", // Sabhi domains allow karega
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use('/api/', apiLimiter);

// Simple request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const isConnected = await testConnection();
        res.json({ 
            success: true,
            message: '🏥 Hospital Management API is running!', 
            timestamp: new Date().toISOString(),
            database: isConnected ? 'Connected ' : 'Disconnected ',
            status: 'Healthy'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Health check failed'
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Hospital Management System API',
        version: '1.0.0',
        endpoints: {
            patients: '/api/patients',
            doctors: '/api/doctors',
            appointments: '/api/appointments',
            health: '/api/health'
        }
    });
});

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 handler
app.use(/.*/, (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Database connection check aur server start
const startServer = async () => {
    try {
        console.log('🔄 Initializing application...');
        
        // Database connection test
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Database connection failed - but continuing for Railway');
            // Don't throw error - Railway needs the server to start
        } else {
            console.log('✅ Database connection verified');
        }
        
        // Server start 
        app.listen(PORT, '0.0.0.0', () => {  // Add '0.0.0.0' for Railway
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`🔗 Local: http://localhost:${PORT}`);
            console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`⏰ Started at: ${new Date().toISOString()}`);
            console.log('\n📋 Available endpoints:');
            console.log(`   GET  /api/health         - Health check`);
            console.log(`   GET  /api/patients       - Get all patients`);
            console.log(`   POST /api/patients       - Create new patient`);
            console.log(`   GET  /api/doctors        - Get all doctors`);
            console.log(`   GET  /api/appointments   - Get all appointments`);
            console.log(`   POST /api/appointments   - Create new appointment\n`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error('\n🔧 Railway deployment note: Server must start even if DB fails');
        // Don't exit process - Railway needs the server running
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT} (without database)`);
        });
    }
};

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

// Server start karein
startServer();