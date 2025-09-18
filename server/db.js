const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite');
const db = new Database(dbPath);

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      baby_timing TEXT,
      start_timeframe TEXT NOT NULL,
      notes TEXT,
      updates_opt_in INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS caregivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      certs TEXT,
      years_experience INTEGER,
      availability TEXT NOT NULL,
      notes TEXT,
      updates_opt_in INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);
    CREATE INDEX IF NOT EXISTS idx_caregivers_email ON caregivers(email);
  `);
}

function insertParent(data) {
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM parents WHERE email = ?').get(data.email);

  if (existing) {
    const stmt = db.prepare(`
      UPDATE parents
      SET full_name = ?, phone = ?, baby_timing = ?, start_timeframe = ?,
          notes = ?, updates_opt_in = ?, updated_at = ?
      WHERE email = ?
    `);
    stmt.run(
      data.full_name,
      data.phone || null,
      data.baby_timing || null,
      data.start_timeframe,
      data.notes || null,
      data.updates_opt_in ? 1 : 0,
      now,
      data.email
    );
    return { duplicate: true };
  } else {
    const stmt = db.prepare(`
      INSERT INTO parents (full_name, email, phone, baby_timing, start_timeframe, notes, updates_opt_in, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      data.full_name,
      data.email,
      data.phone || null,
      data.baby_timing || null,
      data.start_timeframe,
      data.notes || null,
      data.updates_opt_in ? 1 : 0,
      now,
      now
    );
    return { duplicate: false };
  }
}

function insertCaregiver(data) {
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM caregivers WHERE email = ?').get(data.email);

  if (existing) {
    const stmt = db.prepare(`
      UPDATE caregivers
      SET full_name = ?, phone = ?, certs = ?, years_experience = ?,
          availability = ?, notes = ?, updates_opt_in = ?, updated_at = ?
      WHERE email = ?
    `);
    stmt.run(
      data.full_name,
      data.phone,
      data.certs || null,
      data.years_experience || null,
      data.availability,
      data.notes || null,
      data.updates_opt_in ? 1 : 0,
      now,
      data.email
    );
    return { duplicate: true };
  } else {
    const stmt = db.prepare(`
      INSERT INTO caregivers (full_name, email, phone, certs, years_experience, availability, notes, updates_opt_in, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      data.full_name,
      data.email,
      data.phone,
      data.certs || null,
      data.years_experience || null,
      data.availability,
      data.notes || null,
      data.updates_opt_in ? 1 : 0,
      now,
      now
    );
    return { duplicate: false };
  }
}

function getAllParents() {
  return db.prepare('SELECT * FROM parents ORDER BY created_at DESC').all();
}

function getAllCaregivers() {
  return db.prepare('SELECT * FROM caregivers ORDER BY created_at DESC').all();
}

initDatabase();

module.exports = {
  db,
  insertParent,
  insertCaregiver,
  getAllParents,
  getAllCaregivers
};