import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET all doctors
router.get('/', async (req, res) => {
    try {
        console.log('🩺 Fetching all doctors...');
        const doctors = await query('SELECT * FROM doctors ORDER BY created_at DESC');
        
        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('❌ Error fetching doctors:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch doctors'
        });
    }
});

// GET available doctors
router.get('/available', async (req, res) => {
    try {
        console.log('🩺 Fetching available doctors...');
        const doctors = await query('SELECT * FROM doctors WHERE available = TRUE ORDER BY created_at DESC');
        
        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('❌ Error fetching available doctors:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch available doctors'
        });
    }
});

// GET doctors by specialization
router.get('/specialization/:specialization', async (req, res) => {
    try {
        const specialization = req.params.specialization;
        console.log(`🩺 Fetching doctors with specialization: ${specialization}`);
        
        const doctors = await query(
            'SELECT * FROM doctors WHERE specialization = ? AND available = TRUE ORDER BY created_at DESC',
            [specialization]
        );
        
        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('❌ Error fetching doctors by specialization:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch doctors by specialization'
        });
    }
});

// GET single doctor by ID
router.get('/:id', async (req, res) => {
    try {
        const doctorId = req.params.id;
        console.log(`🩺 Fetching doctor with ID: ${doctorId}`);
        
        const doctors = await query('SELECT * FROM doctors WHERE doctor_id = ?', [doctorId]);
        
        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }
        
        res.json({
            success: true,
            data: doctors[0]
        });
    } catch (error) {
        console.error('❌ Error fetching doctor:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch doctor'
        });
    }
});

export default router;