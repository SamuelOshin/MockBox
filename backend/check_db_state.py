#!/usr/bin/env python3
"""
Test script to check current database state and trigger status
"""

import asyncio
from uuid import UUID
from app.core.database import DatabaseManager, get_usage_stats_for_user
from app.core.config import get_settings

async def main():
    settings = get_settings()
    db = DatabaseManager(settings)

    print("=== Current Database State ===")
    
    # Check user plans
    plans = db.admin_client.table('user_plans').select('*').execute()
    print('Available plans:')
    for plan in plans.data:
        print(f'  - {plan["name"]}: {plan["id"]}')

    # Test our current plan and usage fetching system
    test_user_id = '00000000-0000-0000-0000-000000000001'
    try:
        # Test plan fetching
        plan = await db.get_user_plan_and_quota(UUID(test_user_id))
        print(f'\nTest plan for {test_user_id}: {plan}')
        
        # Test usage stats fetching  
        usage = await get_usage_stats_for_user(UUID(test_user_id))
        print(f'Test usage for {test_user_id}: {usage}')
    except Exception as e:
        print(f'Error: {e}')

    print("\n=== Checking Existing Profiles ===")
    profiles = db.admin_client.table('profiles').select('*').limit(5).execute()
    print(f"Found {len(profiles.data)} profiles (showing first 5):")
    for profile in profiles.data:
        print(f"  User: {profile['user_id']}, Plan: {profile['plan_id']}")

if __name__ == "__main__":
    asyncio.run(main())
