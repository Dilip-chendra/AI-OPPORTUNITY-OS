"""
DATABASE MIGRATION — Add missing columns to opportunities table
and fix business_profile schema issues.
This runs SQLite ALTER TABLE statements for columns that exist in the model
but not in the physical database.
"""
import sqlite3
import sys

DB_PATH = 'opportunity_os.db'

def get_existing_columns(cur, table):
    cur.execute(f'PRAGMA table_info({table})')
    return {row[1] for row in cur.fetchall()}

migrations = [
    # opportunities — new Phase 2 columns
    ('opportunities', 'signal_type', 'ALTER TABLE opportunities ADD COLUMN signal_type VARCHAR'),
    ('opportunities', 'source_health', 'ALTER TABLE opportunities ADD COLUMN source_health VARCHAR DEFAULT \'good\''),
    ('opportunities', 'data_completeness_score', 'ALTER TABLE opportunities ADD COLUMN data_completeness_score FLOAT DEFAULT 0.8'),
    ('opportunities', 'change_fingerprint', 'ALTER TABLE opportunities ADD COLUMN change_fingerprint VARCHAR'),
    ('opportunities', 'last_change_detected_at', 'ALTER TABLE opportunities ADD COLUMN last_change_detected_at DATETIME'),
    ('opportunities', 'opportunity_family_id', 'ALTER TABLE opportunities ADD COLUMN opportunity_family_id VARCHAR'),
    # applications — new Phase 2/3 columns
    ('applications', 'lifecycle_thread', 'ALTER TABLE applications ADD COLUMN lifecycle_thread JSON'),
    ('applications', 'lifecycle_stage', 'ALTER TABLE applications ADD COLUMN lifecycle_stage VARCHAR DEFAULT \'discovery\''),
    ('applications', 'bid_decision', 'ALTER TABLE applications ADD COLUMN bid_decision VARCHAR'),
    ('applications', 'bid_reason', 'ALTER TABLE applications ADD COLUMN bid_reason TEXT'),
    ('applications', 'bid_decided_at', 'ALTER TABLE applications ADD COLUMN bid_decided_at DATETIME'),
    ('applications', 'deadline_plan', 'ALTER TABLE applications ADD COLUMN deadline_plan JSON'),
    ('applications', 'submission_checklist', 'ALTER TABLE applications ADD COLUMN submission_checklist JSON'),
    ('applications', 'compliance_matrix', 'ALTER TABLE applications ADD COLUMN compliance_matrix JSON'),
    ('applications', 'extracted_requirements', 'ALTER TABLE applications ADD COLUMN extracted_requirements JSON'),
]

db = sqlite3.connect(DB_PATH)
cur = db.cursor()

applied = 0
skipped = 0
errors = 0

for table, col, sql in migrations:
    existing = get_existing_columns(cur, table)
    if col in existing:
        print(f'  SKIP  {table}.{col} (already exists)')
        skipped += 1
    else:
        try:
            cur.execute(sql)
            db.commit()
            print(f'  ADDED {table}.{col}')
            applied += 1
        except Exception as e:
            print(f'  ERROR {table}.{col}: {e}')
            errors += 1

db.close()
print(f'\nMigration complete: {applied} added, {skipped} skipped, {errors} errors')
