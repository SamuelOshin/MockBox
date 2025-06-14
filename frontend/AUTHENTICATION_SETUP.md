# Environment Setup Guide

This guide will help you set up the environment variables needed for authentication to work properly in the MockBox frontend.

## Required Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration (optional - defaults to localhost:8000)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Getting Supabase Credentials

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new organization or use existing
   - Create a new project

2. **Get Project URL and Anon Key**
   - Go to your project dashboard
   - Navigate to Settings → API
   - Copy the "Project URL" and "anon public key"

3. **Set up Authentication Providers**
   - Go to Authentication → Providers
   - Configure Email provider (enabled by default)
   - Optionally configure Google and GitHub OAuth:
     
     **For Google OAuth:**
     - Go to [Google Cloud Console](https://console.cloud.google.com)
     - Create OAuth 2.0 credentials
     - Add authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase
     
     **For GitHub OAuth:**
     - Go to GitHub Settings → Developer settings → OAuth Apps
     - Create new OAuth App
     - Set Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase

4. **Configure URL Settings**
   - Go to Authentication → URL Configuration
   - Set Site URL: `http://localhost:3000` (for development)
   - Add Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/auth/reset-password`

## Database Setup

The authentication system requires the following tables in your Supabase database. These are usually created automatically, but you can verify:

### Users Table (auth.users)
This is automatically created by Supabase Auth.

### User Profiles Table (optional)
If you want to store additional user data:

```sql
-- Create a public profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger to call the function on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Testing Authentication

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test the authentication flow:**
   - Navigate to `http://localhost:3000/auth/login`
   - Try signing up with email
   - Check your email for confirmation
   - Try signing in with credentials
   - Test OAuth providers if configured
   - Test password reset functionality

3. **Verify protected routes:**
   - Try accessing `/dashboard` without authentication (should redirect to login)
   - Sign in and verify you can access `/dashboard`, `/builder`, and `/mocks`

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL | `https://abcdefghijk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key | `eyJhbGci...` |
| `NEXT_PUBLIC_API_URL` | No | Backend API URL | `http://localhost:8000` |

## Troubleshooting

### Common Issues:

1. **Authentication not working**
   - Check if environment variables are set correctly
   - Verify Supabase URL and keys are correct
   - Check browser console for errors

2. **OAuth providers not working**
   - Verify OAuth app configuration in provider settings
   - Check redirect URLs are correct
   - Ensure client credentials are correct in Supabase

3. **Email confirmation not working**
   - Check Supabase email templates
   - Verify site URL is set correctly
   - Check spam folder

4. **Redirects not working**
   - Verify all redirect URLs are added to Supabase settings
   - Check URL configuration in Supabase dashboard

### Debug Mode:

Add this to your `.env.local` for additional debugging:

```bash
# Enable debug mode (optional)
NEXT_PUBLIC_DEBUG_AUTH=true
```

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different Supabase projects for development/production**
3. **Rotate keys regularly in production**
4. **Enable RLS on all database tables**
5. **Use HTTPS in production**
6. **Configure proper CORS settings**

## Production Setup

For production deployment:

1. **Create production Supabase project**
2. **Update environment variables for production URLs**
3. **Configure production OAuth providers with production URLs**
4. **Set up proper domain configuration in Supabase**
5. **Enable additional security features (2FA, etc.)**

---

## Need Help?

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs/guides/auth)
2. Review the browser console for errors
3. Check the Supabase dashboard logs
4. Verify all environment variables are set correctly
