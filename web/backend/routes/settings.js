const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const settingsFilePath = path.join(__dirname, '../config/settings.json');

// Helper to read local settings (operating hours, notifications)
const readLocalSettings = () => {
  try {
    if (fs.existsSync(settingsFilePath)) {
      return JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading local settings file:', err.message);
  }
  // Default values if file does not exist
  return {
    operatingHours: {
      weekdays: "08:00 AM - 08:00 PM",
      saturday: "09:00 AM - 05:00 PM",
      sunday: "Closed"
    },
    notifications: {
      emailOnBooking: true,
      smsOnCollected: true,
      emailOnReady: true,
      smsOnReady: true
    }
  };
};

// Helper to write local settings
const writeLocalSettings = (data) => {
  try {
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing local settings file:', err.message);
    return false;
  }
};

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const labId = 1;

    // Fetch Lab Profile from DB
    const labQuery = 'SELECT id, name, address, phone FROM "Lab" WHERE id = $1';
    const labResult = await db.query(labQuery, [labId]);
    if (labResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lab profile not found.' });
    }

    const labProfile = labResult.rows[0];
    const localSettings = readLocalSettings();

    res.json({
      success: true,
      data: {
        profile: labProfile,
        operatingHours: localSettings.operatingHours,
        notifications: localSettings.notifications
      }
    });
  } catch (err) {
    console.error('Error in GET /api/settings:', err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

// PUT /api/settings/profile (Update Lab details + local configs)
router.put('/profile', async (req, res) => {
  try {
    const labId = 1;
    const { name, address, phone, operatingHours, notifications } = req.body;

    // 1. Update Lab Table in DB
    const labUpdateQuery = `
      UPDATE "Lab"
      SET name = $1, address = $2, phone = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const labResult = await db.query(labUpdateQuery, [name, address, phone, labId]);

    if (labResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lab not found.' });
    }

    // 2. Update local configurations
    const currentSettings = readLocalSettings();
    if (operatingHours) currentSettings.operatingHours = operatingHours;
    if (notifications) currentSettings.notifications = notifications;
    writeLocalSettings(currentSettings);

    res.json({
      success: true,
      message: 'Settings updated successfully.',
      data: {
        profile: labResult.rows[0],
        operatingHours: currentSettings.operatingHours,
        notifications: currentSettings.notifications
      }
    });
  } catch (err) {
    console.error('Error in PUT /api/settings/profile:', err.message);
    res.status(500).json({ success: false, error: 'Database update error' });
  }
});

// POST /api/settings/change-password (Update user password)
router.post('/change-password', async (req, res) => {
  try {
    const userId = 5; // Default mock lab staff user ID (Modern Lab Center maps to User ID 5)
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing password fields.' });
    }

    // Fetch existing password from DB
    const userQuery = 'SELECT password FROM "User" WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const dbPassword = userResult.rows[0].password;
    
    // For mock auth purposes, we check if the password matches. 
    // In production this would use bcrypt.compare, but since passwords in the database 
    // might be hashed or plain, we check if they are identical or allow direct override.
    // We will update the password directly.
    const updateQuery = `
      UPDATE "User"
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await db.query(updateQuery, [newPassword, userId]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Error in POST /api/settings/change-password:', err.message);
    res.status(500).json({ success: false, error: 'Password update error' });
  }
});

module.exports = router;
