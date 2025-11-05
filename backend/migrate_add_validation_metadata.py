"""
Migration script to add validation_metadata column to responses table
Run this once to update existing databases
"""
import sqlite3
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Get database path (from config)
from app.core.config import settings

# Extract database path from SQLite URL
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///"):
    db_path = Path(db_url.replace("sqlite:///", ""))
    # If relative path, make it relative to backend directory
    if not db_path.is_absolute():
        db_path = Path(__file__).parent / db_path
else:
    print(f"Database URL format not supported: {db_url}")
    exit(1)

if not db_path.exists():
    print(f"Database not found at {db_path}")
    print("The database will be created automatically on next run.")
    exit(0)

print(f"Migrating database at {db_path}...")

try:
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(responses)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'validation_metadata' in columns:
        print("Column 'validation_metadata' already exists. Migration not needed.")
        conn.close()
        exit(0)
    
    # Add the column
    print("Adding validation_metadata column...")
    cursor.execute("""
        ALTER TABLE responses 
        ADD COLUMN validation_metadata JSON
    """)
    
    conn.commit()
    print("Migration completed successfully!")
    
except sqlite3.Error as e:
    print(f"Error during migration: {e}")
    conn.rollback()
    exit(1)
finally:
    conn.close()

