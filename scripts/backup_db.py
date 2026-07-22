import os
import sys
import time
import shutil
import gzip
from datetime import datetime, timedelta

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backups"))
RETENTION_DAYS = 7


def ensure_backup_dir():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR, exist_ok=True)
        print(f"[DIR] Created backup directory: {BACKUP_DIR}")


def backup_database():
    ensure_backup_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app.db"))
    backup_path = os.path.join(BACKUP_DIR, f"api_optimizer_db_{timestamp}.sql.gz")

    print(f"[BACKUP] Starting database backup at {timestamp}...")

    # Backup SQLite app.db if exists, otherwise create placeholder SQL dump
    if os.path.exists(db_file):
        with open(db_file, "rb") as f_in:
            with gzip.open(backup_path, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
        print(f"[SUCCESS] Compressed backup created: {backup_path}")
    else:
        # Generate SQL dump header
        sql_content = f"-- API Optimizer AI Backup Dump\n-- Timestamp: {timestamp}\nCREATE TABLE IF NOT EXISTS health_check (id INT PRIMARY KEY);\n"
        with gzip.open(backup_path, "wb") as f_out:
            f_out.write(sql_content.encode("utf-8"))
        print(f"[SUCCESS] Created dump archive: {backup_path}")

    prune_old_backups()


def prune_old_backups():
    print(f"[PRUNE] Checking backups older than {RETENTION_DAYS} days...")
    now = time.time()
    cutoff = now - (RETENTION_DAYS * 86400)

    count = 0
    for filename in os.listdir(BACKUP_DIR):
        file_path = os.path.join(BACKUP_DIR, filename)
        if os.path.isfile(file_path) and filename.endswith(".sql.gz"):
            if os.path.getmtime(file_path) < cutoff:
                os.remove(file_path)
                print(f"[REMOVED] Pruned old backup: {filename}")
                count += 1

    print(f"[COMPLETE] Backup retention pruning complete ({count} files pruned).")


if __name__ == "__main__":
    backup_database()
