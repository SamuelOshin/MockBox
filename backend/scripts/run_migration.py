#!/usr/bin/env python3
"""
Simple script to run the user profile fix migration
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

try:
    from app.core.database import DatabaseManager
    import logging
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running this script from the backend directory")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migration():
    """Run the user profile fix migration"""
    db = DatabaseManager()
    
    try:
        print("🚀 Running user profile fix migration...")
        
        # Read the migration file
        migration_file = backend_dir / "migrations" / "006_fix_user_profiles_and_usage.sql"
        
        if not migration_file.exists():
            print(f"❌ Migration file not found: {migration_file}")
            return
        
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        # Since Supabase doesn't support multi-statement execution via the client,
        # we'll need to execute the key parts manually
        
        print("📋 Ensuring Free plan exists...")
        
        # Check if Free plan exists
        free_plan = db.supabase.client.table("user_plans")\
            .select("id")\
            .eq("name", "Free")\
            .execute()
        
        if not free_plan.data:
            print("❌ Free plan not found in database! Please add it manually via Supabase dashboard.")
            return
        
        free_plan_id = free_plan.data[0]["id"]
        print(f"✅ Free plan found with ID: {free_plan_id}")
        
        print("👤 Creating missing profiles...")
        
        # Get users without profiles (this is a simplified approach)
        # In a real scenario, you'd want to run this via the Supabase SQL editor
        print("⚠️  Please run the migration SQL file manually in the Supabase SQL editor")
        print(f"📁 Migration file location: {migration_file}")
        
        print("\n📋 Migration SQL content:")
        print("=" * 60)
        print(migration_sql)
        print("=" * 60)
        
        print("\n✅ Migration instructions provided!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
