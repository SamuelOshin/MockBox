#!/usr/bin/env python3
"""
Script to diagnose and fix user plan issues (corrected for actual schema)
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import DatabaseManager
import logging
from uuid import UUID

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def diagnose_and_fix():
    """Diagnose and fix user plan issues with detailed analysis"""
    db = DatabaseManager()
    
    try:
        logger.info("=== USER PLAN DIAGNOSTIC TOOL ===")
        
        # 1. Check user_plans table using admin client
        logger.info("\n1. Checking user_plans table...")
        plans = db.admin_client.table("user_plans").select("*").execute()
        
        # Debug: Print raw response to see what's actually returned
        logger.info(f"Debug - plans.data type: {type(plans.data)}")
        logger.info(f"Debug - plans.data value: {plans.data}")
        
        if not plans.data or len(plans.data) == 0:
            logger.warning("No user plans found! This should not happen after migration...")
        else:
            logger.info(f"✅ Found {len(plans.data)} user plans:")
            for plan in plans.data:
                logger.info(f"   - {plan['name']}: {plan['daily_request_quota']} daily requests, {plan['monthly_token_quota']} monthly tokens")
        
        # 2. Check profiles
        logger.info("\n2. Checking profiles...")
        profiles = db.admin_client.table("profiles")\
            .select("user_id, plan_id, user_plans(name)")\
            .execute()
        
        if profiles.data and len(profiles.data) > 0:
            logger.info(f"✅ Found {len(profiles.data)} profiles:")
            for profile in profiles.data:
                plan_name = profile.get('user_plans', {}).get('name', 'Unknown') if profile.get('user_plans') else 'No Plan'
                logger.info(f"   - User: {profile['user_id'][:8]}... → Plan: {plan_name}")
        else:
            logger.warning("❌ No profiles found")
        
        # 3. Check AI usage stats
        logger.info("\n3. Checking AI usage stats...")
        usage_stats = db.admin_client.table("ai_usage_stats")\
            .select("user_id, requests_today, rate_limit_remaining")\
            .execute()
        
        if usage_stats.data and len(usage_stats.data) > 0:
            logger.info(f"✅ Found {len(usage_stats.data)} usage records:")
            for stat in usage_stats.data:
                logger.info(f"   - User: {stat['user_id'][:8]}... → Today: {stat['requests_today']}, Remaining: {stat['rate_limit_remaining']}")
        else:
            logger.warning("❌ No usage stats found")
        
        # 4. Debug: Print raw response to see what's actually returned
        logger.info(f"\n4. Debug info:")
        logger.info(f"   - plans.data type: {type(plans.data)}")
        logger.info(f"   - plans.data value: {plans.data}")
        logger.info(f"   - plans.data length: {len(plans.data) if plans.data else 'N/A'}")
        
        # 5. Test the specific problematic user
        test_user_id = "04520364-4094-4985-a63d-a053acb0e01c"
        logger.info(f"\n5. Testing problematic user: {test_user_id}")
        
        # Check if user has profile
        profile_check = db.supabase.client.table("profiles")\
            .select("*, user_plans(*)")\
            .eq("user_id", test_user_id)\
            .execute()
        
        if profile_check.data and len(profile_check.data) > 0:
            profile = profile_check.data[0]
            plan = profile.get('user_plans')
            logger.info(f"✅ User has profile with plan: {plan.get('name') if plan else 'No plan data'}")
            
            # Check usage stats
            usage_check = db.supabase.client.table("ai_usage_stats")\
                .select("*")\
                .eq("user_id", test_user_id)\
                .execute()
            
            if usage_check.data and len(usage_check.data) > 0:
                usage = usage_check.data[0]
                logger.info(f"✅ User has usage stats: {usage['requests_today']}/{usage.get('rate_limit_remaining', 'N/A')} (used/remaining)")
            else:
                logger.warning("❌ User missing usage stats - creating fallback...")
                try:
                    await db._create_usage_stats_fallback(UUID(test_user_id))
                except Exception as e:
                    logger.error(f"Failed to create usage stats: {e}")
        else:
            logger.warning("❌ User missing profile - creating...")
            try:
                await db._create_profile_with_free_plan(UUID(test_user_id))
                logger.info("✅ Created profile for user")
            except Exception as e:
                logger.error(f"❌ Failed to create profile: {e}")
                logger.info("💡 This user may not exist in auth.users table")
        
        # 6. Test the API function
        logger.info(f"\n6. Testing get_user_plan_and_quota function...")
        try:
            plan_info = await db.get_user_plan_and_quota(UUID(test_user_id))
            if plan_info:
                logger.info(f"✅ API returned: {plan_info}")
            else:
                logger.warning("❌ API returned None")
        except Exception as e:
            logger.error(f"❌ API error: {e}")
        
        # 7. Summary and recommendations
        logger.info("\n=== DIAGNOSTIC SUMMARY ===")
        if plans.data and len(plans.data) > 0 and profiles.data and len(profiles.data) > 0:
            logger.info("✅ Database structure looks good!")
            logger.info("💡 If you're still seeing errors, try:")
            logger.info("   1. Restart your backend server")
            logger.info("   2. Clear any API caches")
            logger.info("   3. Check if the user actually exists in auth.users")
        else:
            logger.warning("❌ Database issues detected - see details above")
        
    except Exception as e:
        logger.error(f"❌ Error during diagnosis: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await db.close()

async def create_default_plans(db: DatabaseManager):
    """Create default plans matching the schema"""
    plans_to_create = [
        {"name": "Free", "daily_request_quota": 10, "monthly_token_quota": 10000},
        {"name": "Pro", "daily_request_quota": 100, "monthly_token_quota": 100000},
        {"name": "Enterprise", "daily_request_quota": 1000, "monthly_token_quota": 1000000}
    ]
    
    for plan in plans_to_create:
        try:
            result = db.supabase.client.table("user_plans").insert(plan).execute()
            logger.info(f"✅ Created {plan['name']} plan")
            logger.debug(f"   Result: {result.data}")
        except Exception as e:
            if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
                logger.info(f"ℹ️ {plan['name']} plan already exists")
            else:
                logger.error(f"❌ Failed to create {plan['name']} plan: {e}")

if __name__ == "__main__":
    asyncio.run(diagnose_and_fix())
