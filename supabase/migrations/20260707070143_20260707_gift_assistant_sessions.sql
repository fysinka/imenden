/*
# Create gift_assistant_sessions table

1. Purpose
- Stores gift assistant wizard sessions for anonymous users
- Each session tracks progress through the recommendation wizard
- Sessions are identified by a client-generated session_id (stored in localStorage)

2. New Tables
- `gift_assistant_sessions`
  - `id` (uuid, primary key)
  - `session_id` (text, unique identifier for client session)
  - `occasion` (text - birthday, nameday, anniversary, holiday, other)
  - `recipient_name` (text, name of the gift recipient)
  - `recipient_gender` (text - male, female, other)
  - `recipient_age_range` (text - child, teen, young_adult, adult, senior)
  - `relationship` (text - family, friend, partner, colleague, other)
  - `interests` (text array - hobbies/interests categories)
  - `budget_min` (numeric, minimum budget)
  - `budget_max` (numeric, maximum budget)
  - `personality_traits` (text array - creative, practical, adventurous, etc.)
  - `additional_notes` (text, free-form notes about the recipient)
  - `recommended_products` (jsonb, array of recommended product IDs with scores)
  - `status` (text - in_progress, completed)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

3. Security
- Enable RLS on `gift_assistant_sessions`
- Allow anon + authenticated CRUD (single-tenant app, no auth screen)
- Sessions are intentionally shared/accessible via session_id

4. Notes
- This is a single-tenant app without user authentication
- Sessions are identified by a UUID stored in browser localStorage
- Anyone with the session_id can access the session data
*/

CREATE TABLE IF NOT EXISTS gift_assistant_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  occasion text,
  recipient_name text,
  recipient_gender text,
  recipient_age_range text,
  relationship text,
  interests text[] DEFAULT '{}',
  budget_min numeric DEFAULT 0,
  budget_max numeric DEFAULT 1000,
  personality_traits text[] DEFAULT '{}',
  additional_notes text,
  recommended_products jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gift_assistant_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for anon + authenticated (no auth screen in app)
DROP POLICY IF EXISTS "anon_select_sessions" ON gift_assistant_sessions;
CREATE POLICY "anon_select_sessions" ON gift_assistant_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON gift_assistant_sessions;
CREATE POLICY "anon_insert_sessions" ON gift_assistant_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON gift_assistant_sessions;
CREATE POLICY "anon_update_sessions" ON gift_assistant_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON gift_assistant_sessions;
CREATE POLICY "anon_delete_sessions" ON gift_assistant_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- Create index for session_id lookups
CREATE INDEX IF NOT EXISTS idx_gift_assistant_sessions_session_id ON gift_assistant_sessions(session_id);
