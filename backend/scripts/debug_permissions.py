#!/usr/bin/env python3
"""
Debug script to check actual API permissions and data access
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import DatabaseManager
from app.core.config import settings
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def debug_permissions():
    """Debug actual data access and permissions"""
    db = DatabaseManager()
    
    try:
        logger.info("=== PERMISSION DEBUG ===")
        
        # Check what API key we're using
        logger.info(f"Supabase URL: {settings.supabase_url}")
        logger.info(f"API Key (first 20 chars): {settings.supabase_key[:20]}...")
        
        # Try to read user_plans with raw query
        logger.info("\n1. Raw user_plans query...")
        try:
            plans_response = db.supabase.client.table("user_plans").select("*").execute()
            logger.info(f"Response status: Success")
            logger.info(f"Data returned: {len(plans_response.data) if plans_response.data else 0} records")
            logger.info(f"Full response: {plans_response.data}")
        except Exception as e:
            logger.error(f"user_plans query failed: {e}")
        
        # Try to read profiles with join
        logger.info("\n2. Profiles with join query...")
        try:
            profiles_response = db.supabase.client.table("profiles")\
                .select("user_id, plan_id, user_plans(id, name, daily_request_quota)")\
                .execute()
            logger.info(f"Response status: Success")
            logger.info(f"Data returned: {len(profiles_response.data) if profiles_response.data else 0} records")
            logger.info(f"Full response: {profiles_response.data}")
        except Exception as e:
            logger.error(f"Profiles join query failed: {e}")
        
        # Test the specific user with our API function
        logger.info("\n3. Testing API function...")
        test_user_id = "04520364-4094-4985-a63d-a053acb0e01c"
        try:
            plan_info = await db.get_user_plan_and_quota(test_user_id)
            logger.info(f"API function result: {plan_info}")
        except Exception as e:
            logger.error(f"API function failed: {e}")
            import traceback
            traceback.print_exc()
        
        # Check if we're using the admin client correctly
        if hasattr(db, 'admin_client'):
            logger.info("\n4. Testing admin client...")
            try:
                admin_plans = db.admin_client.table("user_plans").select("*").execute()
                logger.info(f"Admin client plans: {len(admin_plans.data) if admin_plans.data else 0} records")
                logger.info(f"Admin plans data: {admin_plans.data}")
            except Exception as e:
                logger.error(f"Admin client failed: {e}")
        
    except Exception as e:
        logger.error(f"Debug failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(debug_permissions())