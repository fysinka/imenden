/*
# Moveable Feasts Table

## Overview
Creates a new table to store year-specific moveable Orthodox feasts (подвижни празници)
for 800+ years (2025–2825). These feasts depend on the date of Orthodox Easter and
cannot be stored as fixed MM-DD date keys like the existing church_holidays table.

## New Tables
- `moveable_feasts`
  - `id` (uuid, primary key)
  - `feast_key` (text) - identifies the feast type: 'mesni', 'sirni', 'todorovden', 'vrbnitsa', 'velikden', 'spasovden', 'petdesetnica', 'svduh'
  - `year` (int) - the year this feast falls in
  - `date` (date) - the actual Gregorian date of the feast
  - `name` (text) - Bulgarian name of the feast
  - `description` (text) - description of the feast
  - `is_great_feast` (boolean) - whether this is a Great Feast of the Church
  - `created_at` (timestamptz)

## Security
- RLS enabled
- Public read (TO anon, authenticated USING true) - calendar data is intentionally public
- Admin write (TO authenticated)

## Notes
1. The table is populated by a separate migration that computes all feast dates
   using the Orthodox Easter algorithm (Meeus/Jones/Butcher for Julian Easter,
   converted to Gregorian).
2. A unique constraint on (feast_key, year) prevents duplicate entries.
3. An index on (year, date) allows efficient queries by year.
*/

CREATE TABLE IF NOT EXISTS moveable_feasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feast_key text NOT NULL,
  year int NOT NULL,
  date date NOT NULL,
  name text NOT NULL,
  description text,
  is_great_feast boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(feast_key, year)
);

CREATE INDEX IF NOT EXISTS moveable_feasts_year_date_idx ON moveable_feasts(year, date);
CREATE INDEX IF NOT EXISTS moveable_feasts_date_idx ON moveable_feasts(date);

ALTER TABLE moveable_feasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_moveable_feasts" ON moveable_feasts;
CREATE POLICY "public_select_moveable_feasts" ON moveable_feasts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_moveable_feasts" ON moveable_feasts;
CREATE POLICY "admin_insert_moveable_feasts" ON moveable_feasts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_moveable_feasts" ON moveable_feasts;
CREATE POLICY "admin_update_moveable_feasts" ON moveable_feasts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_moveable_feasts" ON moveable_feasts;
CREATE POLICY "admin_delete_moveable_feasts" ON moveable_feasts FOR DELETE
  TO authenticated USING (true);
