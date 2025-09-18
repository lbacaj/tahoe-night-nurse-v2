const express = require('express');
const router = express.Router();
const { insertParent, insertCaregiver, getAllParents, getAllCaregivers } = require('./db');
const { sendAdminNotification } = require('./mailer');
const auth = require('basic-auth');
const { stringify } = require('csv-stringify/sync');

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

function validateParentData(data) {
  const errors = {};

  if (!data.full_name || data.full_name.trim().length === 0) {
    errors.full_name = 'Please add your name so we can address you properly.';
  }

  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Please add your email so we can follow up.';
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = 'Please add your phone number.';
  }

  if (!data.baby_timing || data.baby_timing.trim().length === 0) {
    errors.baby_timing = 'Please tell us your due date or baby\'s age.';
  }

  if (!data.start_timeframe) {
    errors.start_timeframe = 'Please select when you might need care.';
  }

  if (!data.consent) {
    errors.consent = 'Please confirm you understand this is an interest list.';
  }

  if (data.company) {
    errors.bot = true;
  }

  return errors;
}

function validateCaregiverData(data) {
  const errors = {};

  if (!data.full_name || data.full_name.trim().length === 0) {
    errors.full_name = 'Please add your name.';
  }

  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Please add your email so we can follow up.';
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = 'Please add your phone number.';
  }

  if (!data.availability) {
    errors.availability = 'Please select your availability.';
  }

  if (!data.consent) {
    errors.consent = 'Please confirm you understand background checks may be required.';
  }

  if (data.company) {
    errors.bot = true;
  }

  return errors;
}

router.get('/', (req, res) => {
  res.render('home', {
    title: 'Overnight Newborn Care in Lake Tahoe & Truckee | Tahoe Night Nurse',
    description: 'Trusted overnight newborn care for 0–6 months in Lake Tahoe & Truckee. Join the parent interest list or apply as a night-nurse caregiver. Private, high-touch intake—no bookings online.'
  });
});

router.get('/parents', (req, res) => {
  res.render('parents', {
    title: 'Parent Interest Form | Tahoe Night Nurse',
    description: 'Tell us about your family and timing. We\'ll keep you posted as availability opens in Lake Tahoe & Truckee.'
  });
});

router.get('/caregivers', (req, res) => {
  res.render('caregivers', {
    title: 'Caregiver Application | Tahoe Night Nurse',
    description: 'Apply to be considered for overnight newborn care opportunities in the Tahoe area.'
  });
});

router.get('/thank-you', (req, res) => {
  const type = req.query.type || 'parent';
  res.render('thank-you', {
    title: 'Thank You | Tahoe Night Nurse',
    description: 'Thank you for your interest.',
    type: type
  });
});

router.post('/api/parents', async (req, res) => {
  const errors = validateParentData(req.body);

  if (errors.bot) {
    return res.redirect('/thank-you?type=parent');
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const result = insertParent({
      full_name: req.body.full_name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone.trim(),
      baby_timing: req.body.baby_timing.trim(),
      start_timeframe: req.body.start_timeframe,
      notes: req.body.notes?.trim().substring(0, 280) || null,
      updates_opt_in: req.body.updates_opt_in === 'on' || req.body.updates_opt_in === true
    });

    await sendAdminNotification('parent', req.body);

    if (req.headers['content-type']?.includes('json')) {
      return res.json({ ok: true, duplicate: result.duplicate });
    }

    res.redirect('/thank-you?type=parent');
  } catch (error) {
    console.error('Error saving parent:', error);
    res.status(500).json({ ok: false, error: 'We couldn\'t submit right now. Please try again in a moment.' });
  }
});

router.post('/api/caregivers', async (req, res) => {
  const errors = validateCaregiverData(req.body);

  if (errors.bot) {
    return res.redirect('/thank-you?type=caregiver');
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const certs = Array.isArray(req.body.certs) ? req.body.certs.join(', ') : '';

    const result = insertCaregiver({
      full_name: req.body.full_name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone.trim(),
      certs: certs || null,
      years_experience: parseInt(req.body.years_experience) || null,
      availability: req.body.availability,
      notes: req.body.notes?.trim().substring(0, 280) || null,
      updates_opt_in: req.body.updates_opt_in === 'on' || req.body.updates_opt_in === true
    });

    await sendAdminNotification('caregiver', req.body);

    if (req.headers['content-type']?.includes('json')) {
      return res.json({ ok: true, duplicate: result.duplicate });
    }

    res.redirect('/thank-you?type=caregiver');
  } catch (error) {
    console.error('Error saving caregiver:', error);
    res.status(500).json({ ok: false, error: 'We couldn\'t submit right now. Please try again in a moment.' });
  }
});

router.get('/healthz', (req, res) => {
  res.json({ ok: true });
});

router.get('/admin/login', (req, res) => {
  res.render('login', { error: req.query.error });
});

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.BASIC_AUTH_USER || 'admin';
  const validPass = process.env.BASIC_AUTH_PASS || 'password';

  if (username === validUser && password === validPass) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=Invalid credentials');
  }
});

router.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/admin', requireAuth, (req, res) => {
  const parents = getAllParents();
  const caregivers = getAllCaregivers();

  res.render('admin', {
    stats: {
      parentsCount: parents.length,
      caregiversCount: caregivers.length
    },
    recentParents: parents.slice(0, 10),
    recentCaregivers: caregivers.slice(0, 10)
  });
});

router.get('/admin/export.csv', requireAuth, (req, res) => {

  const type = req.query.type || 'parents';

  try {
    let data, columns;

    if (type === 'parents') {
      data = getAllParents();
      columns = ['id', 'full_name', 'email', 'phone', 'baby_timing', 'start_timeframe', 'notes', 'updates_opt_in', 'created_at', 'updated_at'];
    } else {
      data = getAllCaregivers();
      columns = ['id', 'full_name', 'email', 'phone', 'certs', 'years_experience', 'availability', 'notes', 'updates_opt_in', 'created_at', 'updated_at'];
    }

    const csv = stringify(data, {
      header: true,
      columns: columns
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).send('Error generating export');
  }
});

module.exports = router;