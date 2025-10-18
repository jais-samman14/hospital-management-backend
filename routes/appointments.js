import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET all appointments with details
router.get('/', async (req, res) => {
    try {
        console.log('📅 Fetching all appointments...');
        const appointments = await query(`
            SELECT a.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name,
                   d.specialization
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN doctors d ON a.doctor_id = d.doctor_id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `);

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('❌ Error fetching appointments:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch appointments'
        });
    }
});

// GET appointments by patient ID
router.get('/patient/:patientId', async (req, res) => {
    try {
        const patientId = req.params.patientId;
        console.log(`📅 Fetching appointments for patient ID: ${patientId}`);
        
        const appointments = await query(`
            SELECT a.*, 
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name,
                   d.specialization
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `, [patientId]);

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('❌ Error fetching patient appointments:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch patient appointments'
        });
    }
});

// GET appointments by doctor ID
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        console.log(`📅 Fetching appointments for doctor ID: ${doctorId}`);
        
        const appointments = await query(`
            SELECT a.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `, [doctorId]);

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('❌ Error fetching doctor appointments:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch doctor appointments'
        });
    }
});

// POST create new appointment
router.post('/', async (req, res) => {
    try {
        console.log('➕ Creating new appointment...');
        const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;

        // Validation
        if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({
                success: false,
                error: 'Patient ID, Doctor ID, Date, and Time are required'
            });
        }

        const result = await query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, reason || null]  // reason might be undefined
        );

        console.log(' Appointment created successfully with ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment_id: result.insertId
        });
    } catch (error) {
        console.error('❌ Error creating appointment:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create appointment: ' + error.message
        });
    }
});

// PUT update appointment status
router.put('/:id/status', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status } = req.body;
        
        console.log(`✏️ Updating appointment status for ID: ${appointmentId} to: ${status}`);
        
        const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const result = await query(
            'UPDATE appointments SET status = ? WHERE appointment_id = ?',
            [status, appointmentId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        console.log(' Appointment status updated successfully');
        
        res.json({
            success: true,
            message: 'Appointment status updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating appointment status:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update appointment status'
        });
    }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        console.log(`🗑️ Deleting appointment with ID: ${appointmentId}`);
        
        const result = await query('DELETE FROM appointments WHERE appointment_id = ?', [appointmentId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        console.log(' Appointment deleted successfully');
        
        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        console.error(' Error deleting appointment:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to delete appointment'
        });
    }
});

export default router;