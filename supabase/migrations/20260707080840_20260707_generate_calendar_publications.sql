/*
# Generate Daily Calendar Publications

## Overview
Creates a publication (article) for every day of the year that has calendar data
(name days, holidays, church holidays, historical events, famous people, folk traditions).
Each publication is accessible from the calendar via a link in the DayModal.

## Changes
1. Creates a PL/pgSQL function that generates publication content from calendar data
2. Inserts publications for all 366 days of the year (including Feb 29)
3. Each publication has:
   - slug: 'calendar-MM-DD' format (e.g., 'calendar-01-01')
   - title: Based on the day's name day or holiday
   - content: HTML content built from all available data for that day
   - excerpt: Short summary
   - category: 'календар' (calendar)
   - is_published: true
   - published_at: now()

## Notes
- The function is dropped after use to keep the schema clean
- Publications use ON CONFLICT (slug) DO UPDATE to be idempotent
- Content is generated as HTML for rich display in the PublicationPage component
*/

CREATE OR REPLACE FUNCTION _temp_generate_day_content(p_date_key text) RETURNS text AS $$
DECLARE
  v_content text := '';
  v_nd RECORD;
  v_hol RECORD;
  v_ch RECORD;
  v_ev RECORD;
  v_pers RECORD;
  v_trad RECORD;
  v_has_data boolean := false;
BEGIN
  -- Name days
  SELECT * INTO v_nd FROM name_days WHERE date_key = p_date_key;
  IF FOUND THEN
    v_has_data := true;
    v_content := v_content || '<h2>Именни дни</h2>';
    v_content := v_content || '<p>На този ден празнуват: <strong>' || array_to_string(v_nd.names, ', ') || '</strong></p>';
    IF v_nd.description IS NOT NULL AND v_nd.description != '' THEN
      v_content := v_content || '<p>' || v_nd.description || '</p>';
    END IF;
  END IF;

  -- Official holidays
  v_content := v_content || '<h2>Официални празници</h2>';
  FOR v_hol IN SELECT * FROM holidays WHERE date_key = p_date_key ORDER BY type LOOP
    v_has_data := true;
    v_content := v_content || '<h3>' || v_hol.name || '</h3>';
    IF v_hol.description IS NOT NULL AND v_hol.description != '' THEN
      v_content := v_content || '<p>' || v_hol.description || '</p>';
    END IF;
  END LOOP;

  -- Church holidays
  v_content := v_content || '<h2>Църковни празници</h2>';
  FOR v_ch IN SELECT * FROM church_holidays WHERE date_key = p_date_key ORDER BY is_great_feast DESC, name LOOP
    v_has_data := true;
    v_content := v_content || '<h3>' || v_ch.name || '</h3>';
    IF v_ch.description IS NOT NULL AND v_ch.description != '' THEN
      v_content := v_content || '<p>' || v_ch.description || '</p>';
    END IF;
  END LOOP;

  -- Historical events
  v_content := v_content || '<h2>Исторически събития</h2>';
  FOR v_ev IN SELECT * FROM historical_events WHERE date_key = p_date_key ORDER BY year LOOP
    v_has_data := true;
    v_content := v_content || '<h3>';
    IF v_ev.year IS NOT NULL THEN
      v_content := v_content || v_ev.year || ' г. — ';
    END IF;
    v_content := v_content || v_ev.title || '</h3>';
    IF v_ev.description IS NOT NULL AND v_ev.description != '' THEN
      v_content := v_content || '<p>' || v_ev.description || '</p>';
    END IF;
  END LOOP;

  -- Famous people
  v_content := v_content || '<h2>Известни личности</h2>';
  FOR v_pers IN SELECT * FROM famous_people WHERE date_key = p_date_key ORDER BY year LOOP
    v_has_data := true;
    v_content := v_content || '<h3>';
    IF v_pers.event_type = 'born' THEN
      v_content := v_content || 'Роден/а: ';
    ELSE
      v_content := v_content || 'Починал/а: ';
    END IF;
    v_content := v_content || v_pers.name;
    IF v_pers.year IS NOT NULL THEN
      v_content := v_content || ' (' || v_pers.year || ')';
    END IF;
    v_content := v_content || '</h3>';
    IF v_pers.description IS NOT NULL AND v_pers.description != '' THEN
      v_content := v_content || '<p>' || v_pers.description || '</p>';
    END IF;
    IF v_pers.profession IS NOT NULL AND v_pers.profession != '' THEN
      v_content := v_content || '<p><em>Професия: ' || v_pers.profession || '</em></p>';
    END IF;
  END LOOP;

  -- Folk traditions
  v_content := v_content || '<h2>Народни традиции</h2>';
  FOR v_trad IN SELECT * FROM folk_traditions WHERE date_key = p_date_key ORDER BY title LOOP
    v_has_data := true;
    v_content := v_content || '<h3>' || v_trad.title || '</h3>';
    IF v_trad.content IS NOT NULL AND v_trad.content != '' THEN
      v_content := v_content || '<p>' || v_trad.content || '</p>';
    END IF;
    IF v_trad.proverb IS NOT NULL AND v_trad.proverb != '' THEN
      v_content := v_content || '<blockquote>„' || v_trad.proverb || '"</blockquote>';
    END IF;
  END LOOP;

  -- Also add seasonal traditions for the month
  FOR v_trad IN SELECT * FROM folk_traditions WHERE date_key IS NULL AND month = CAST(SPLIT_PART(p_date_key, '-', 1) AS int) ORDER BY title LOOP
    v_has_data := true;
    v_content := v_content || '<h3>' || v_trad.title || '</h3>';
    IF v_trad.content IS NOT NULL AND v_trad.content != '' THEN
      v_content := v_content || '<p>' || v_trad.content || '</p>';
    END IF;
    IF v_trad.proverb IS NOT NULL AND v_trad.proverb != '' THEN
      v_content := v_content || '<blockquote>„' || v_trad.proverb || '"</blockquote>';
    END IF;
  END LOOP;

  IF NOT v_has_data THEN
    RETURN '';
  END IF;

  RETURN v_content;
END;
$$ LANGUAGE plpgsql;

-- Generate publications for all days of the year
DO $$
DECLARE
  m int;
  d int;
  v_date_key text;
  v_slug text;
  v_title text;
  v_content text;
  v_excerpt text;
  v_nd RECORD;
  v_hol RECORD;
  v_month_names text[] := ARRAY['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];
  v_days_in_month int;
BEGIN
  FOR m IN 1..12 LOOP
    v_days_in_month := EXTRACT(DAY FROM (make_date(2024, m, 1) + interval '1 month - 1 day'));
    FOR d IN 1..v_days_in_month LOOP
      v_date_key := lpad(m::text, 2, '0') || '-' || lpad(d::text, 2, '0');
      v_slug := 'calendar-' || v_date_key;
      v_content := _temp_generate_day_content(v_date_key);

      IF v_content = '' THEN
        CONTINUE;
      END IF;

      -- Build title
      v_title := d::text || ' ' || v_month_names[m];
      SELECT * INTO v_nd FROM name_days WHERE date_key = v_date_key LIMIT 1;
      IF FOUND THEN
        v_title := v_title || ' — ' || array_to_string(v_nd.names[1:3], ', ');
      ELSE
        SELECT * INTO v_hol FROM holidays WHERE date_key = v_date_key LIMIT 1;
        IF FOUND THEN
          v_title := v_title || ' — ' || v_hol.name;
        ELSE
          SELECT * INTO v_hol FROM church_holidays WHERE date_key = v_date_key LIMIT 1;
          IF FOUND THEN
            v_title := v_title || ' — ' || v_hol.name;
          END IF;
        END IF;
      END IF;

      -- Build excerpt
      v_excerpt := 'Календар за ' || d::text || ' ' || v_month_names[m] || '. ';
      IF FOUND AND v_nd.names IS NOT NULL THEN
        v_excerpt := v_excerpt || 'Именни дни: ' || array_to_string(v_nd.names[1:3], ', ') || '.';
      END IF;

      INSERT INTO publications (title, slug, content, excerpt, category, tags, is_published, published_at)
      VALUES (
        v_title,
        v_slug,
        v_content,
        v_excerpt,
        'календар',
        ARRAY['календар', v_date_key],
        true,
        now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        excerpt = EXCLUDED.excerpt,
        category = EXCLUDED.category,
        tags = EXCLUDED.tags,
        is_published = true;
    END LOOP;
  END LOOP;
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS _temp_generate_day_content(text);
