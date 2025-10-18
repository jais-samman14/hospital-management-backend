import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET all patients
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all patients...');
        const patients = await query('SELECT * FROM patients ORDER BY created_at DESC');
        
        res.json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('❌ Error fetching patients:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch patients'
        });
    }
});

// GET single patient by ID
router.get('/:id', async (req, res) => {
    try {
        const patientId = req.params.id;
        console.log(`📋 Fetching patient with ID: ${patientId}`);
        
        const patients = await query('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
        
        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        
        res.json({
            success: true,
            data: patients[0]
        });
    } catch (error) {
        console.error('❌ Error fetching patient:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch patient'
        });
    }
});

// POST create new patient
router.post('/', async (req, res) => {
    try {

        console.log('➕ Creating new patient...');
        console.log('Request headers:', req.headers);
        console.log('Request body RAW:', req.body);
        console.log('Request body TYPE:', typeof req.body);
        
        const { first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, emergency_contact } = req.body;


        console.log('Extracted values:', {
            first_name, 
            last_name, 
            email, 
            has_first_name: !!first_name,
            has_last_name: !!last_name, 
            has_email: !!email
        });

        // Validation
        if (!first_name || !last_name || !email) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                error: 'First name, last name, and email are required',
                received_data: req.body
            });
        }

        // Convert undefined values to null for database
        const queryParams = [
            first_name, 
            last_name, 
            email, 
            phone || null,           
            date_of_birth || null,   
            gender || null,          
            blood_group || null,    
            address || null,      
            emergency_contact || null 
        ];

        console.log('Query parameters:', queryParams);

        const result = await query(
            `INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, emergency_contact) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            queryParams
        );

        console.log('Patient created successfully with ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Patient created successfully',
            patient_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating patient:', error.message);
        console.error('Error code:', error.code);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to create patient: ' + error.message
        });
    }
});

// PUT update patient
router.put('/:id', async (req, res) => {
    try {
        const patientId = req.params.id;
        console.log(`✏️ Updating patient with ID: ${patientId}`);
        
        const { first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, emergency_contact } = req.body;
        
        const result = await query(
            `UPDATE patients SET 
             first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, 
             gender = ?, blood_group = ?, address = ?, emergency_contact = ?
             WHERE patient_id = ?`,
            [first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, emergency_contact, patientId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        
        console.log('Patient updated successfully');
        
        res.json({
            success: true,
            message: 'Patient updated successfully'
        });
    } catch (error) {
        console.error('Error updating patient:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update patient'
        });
    }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
    try {
        const patientId = req.params.id;
        console.log(`🗑️ Deleting patient with ID: ${patientId}`);
        
        const result = await query('DELETE FROM patients WHERE patient_id = ?', [patientId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        
        console.log('Patient deleted successfully');
        
        res.json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting patient:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to delete patient'
        });
    }
});

export default router;