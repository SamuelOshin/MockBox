# User Plan Fix Implementation

This document outlines the fixes implemented to resolve user plan and quota issues.

## Problems Fixed

1. **Case Sensitivity Issue**: Database has "Free" plan but code was looking for "free"
2. **Missing Profiles**: Users without profile records cause errors
3. **Missing Usage Stats**: Users without usage stats records
4. **Poor Error Handling**: Inadequate fallback logic

## Files Modified

### Backend Code Changes

1. **`app/core/database.py`**:
   - Fixed case sensitivity in plan queries ("free" → "Free")
   - Added `_create_profile_with_free_plan()` method
   - Added `ensure_user_usage_stats()` method
   - Improved error handling in `get_user_plan_and_quota()`
   - Better fallback logic in `assign_free_plan_to_user()`

2. **`app/api/v1/ai.py`**:
   - Updated default plan name to "Free" (matching database)

### New Files Created

1. **`migrations/006_fix_user_profiles_and_usage.sql`**:
   - Ensures all users have profiles with Free plan
   - Creates missing AI usage stats records
   - Verifies data integrity

2. **`scripts/diagnose_user_plans.py`**:
   - Comprehensive diagnostic tool
   - Checks database structure and data
   - Auto-fix capabilities for common issues

3. **`scripts/run_migration.py`**:
   - Helper script to apply migration
   - Provides SQL for manual execution

## How to Apply the Fixes

### Option 1: Automatic Fix (Recommended)

1. **Run the diagnostic tool**:
   ```bash
   cd backend
   python scripts/diagnose_user_plans.py
   ```

2. **Follow the auto-fix prompts** when offered

### Option 2: Manual Fix

1. **Run the migration SQL** in Supabase SQL Editor:
   - Copy content from `migrations/006_fix_user_profiles_and_usage.sql`
   - Paste and execute in Supabase dashboard

2. **Restart the backend server**:
   ```bash
   cd backend
   python main.py
   ```

### Option 3: Quick Fix for Specific User

```python
# In Python console or script
from app.core.database import DatabaseManager
from uuid import UUID
import asyncio

async def fix_user():
    db = DatabaseManager()
    user_id = UUID("04520364-4094-4985-a63d-a053acb0e01c")
    await db._create_profile_with_free_plan(user_id)
    await db.close()

asyncio.run(fix_user())
```

## Expected Results

After applying fixes:

1. ✅ **No more PGRST116 errors**
2. ✅ **All users automatically get Free plan**
3. ✅ **Proper quota enforcement**
4. ✅ **Correct usage display in frontend**
5. ✅ **Graceful handling of new users**

## Verification

Run the diagnostic script to verify everything is working:

```bash
python scripts/diagnose_user_plans.py
```

Expected output:
- ✅ Database connection: OK
- ✅ Found 3 user plans (Free, Pro, Enterprise)
- ✅ All profiles have plans assigned
- ✅ User has Free plan (10 daily requests)

## Troubleshooting

### If errors persist:

1. **Check plan names in database** - ensure they match code exactly
2. **Verify Free plan ID** - update migration with correct UUID
3. **Check RLS policies** - ensure they allow profile creation
4. **Review logs** - look for specific error messages

### Common Issues:

- **"Free plan not found"**: Update plan name case in database
- **"Profile creation failed"**: Check RLS policies
- **"Still getting 0 quotas"**: Restart backend after fixes

## Monitoring

Add logging to monitor the fixes:

```python
logger.info(f"User {user_id} plan lookup: {plan_info}")
```

This will help track if the fixes are working correctly in production.
