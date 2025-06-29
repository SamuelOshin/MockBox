# AI Usage Tracking and Quota Management Plan

## 1. Separate Usage from Quota/Allowance
- **[DONE]** Usage columns (`requests_today`, `tokens_used_today`, etc.) are in `ai_usage_stats` and always start at 0.
- **[DONE]** Quota/allowance columns (`daily_request_quota`, `monthly_token_quota`) are in `user_plans`.

## 2. User Plan/Subscription Table
- **[DONE]** `user_plans` table created.
- **[DONE]** `profiles` table created to map each user to a plan (via `plan_id`).
- **[DONE]** Trigger in place to auto-create a profile for new users and assign the default plan.

## 3. Usage Enforcement
- **[DONE]** Backend logic checks usage against the user's plan quota before allowing requests.
- **[DONE]** Usage is incremented only as users make requests.

## 4. Reset Mechanism
- **[DONE]** SQL functions to reset daily and monthly usage counters are implemented.
- **[DONE]** Instructions provided to schedule these resets using Supabase's pg_cron extension.
- **[TODO]** (Optional) Monitor scheduled jobs to ensure they run as expected and handle any failures.

## 5. Migration Path
- **[DONE]** Usage columns are initialized to 0.
- **[DONE]** `profiles` table and `user_plans` table are in place.
- **[DONE]** Quota columns are in the plan table, not the usage table.

## 6. Example Schema
- **[DONE]** Schema matches the plan (with `profiles` table instead of direct `plan_id` on users).

## 7. Business Logic
- **[DONE]** On signup, users are assigned the default plan via the trigger.
- **[DONE]** Upgrades update `plan_id` in `profiles`.
- **[DONE]** Usage is checked against quota on each request.

---

**Summary:**
- All major components of the AI usage tracking and quota management system are implemented and integrated.
- The only remaining task is to monitor the scheduled reset jobs and ensure they are running as expected (optional, but recommended for production).
- The system is now scalable, flexible, and follows industry best practices for SaaS and AI platforms.
