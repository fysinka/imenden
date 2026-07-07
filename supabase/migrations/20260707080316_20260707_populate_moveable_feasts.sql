/*
# Populate Moveable Feasts for 800+ Years (2025–2825)

## Overview
Creates a PL/pgSQL function to compute Orthodox Easter (Julian calendar, converted to Gregorian)
and uses it to populate the `moveable_feasts` table with all 8 moveable feasts for every year
from 2025 to 2825 (801 years × 8 feasts = 6,408 rows).

## Moveable Feasts Computed
1. Месни заговезни (Meatfare Sunday) – 56 days before Easter
2. Сирни заговезни (Cheesefare Sunday / Forgiveness Sunday) – 49 days before Easter
3. Тодоровден (Theodore Saturday) – 43 days before Easter (first Saturday of Great Lent)
4. Връбница (Palm Sunday / Цветница) – 7 days before Easter
5. Великден (Easter / Pascha) – the base date
6. Възнесение Господне (Spasovden / Ascension) – 40 days after Easter
7. Петдесетница (Pentecost / Trinity Sunday) – 50 days after Easter
8. Св. Дух (Holy Spirit Monday / Духов ден) – 51 days after Easter

## Algorithm
Uses the Meeus/Jones/Butcher algorithm for Julian calendar Easter, then converts to Gregorian
by adding the Julian-Gregorian date offset (13 days for 1900-2099, increasing by 1 per century
that is not divisible by 400).

## Notes
- The function is dropped after use to keep the schema clean.
- All inserts use ON CONFLICT to be idempotent.
*/

CREATE OR REPLACE FUNCTION _temp_orthodox_easter(y int) RETURNS date AS $$
DECLARE
  a int; b int; c int; d int; e int;
  m int; dd int;
  julian_easter date;
  diff int;
  century int;
BEGIN
  a := y % 4;
  b := y % 7;
  c := y % 19;
  d := (19 * c + 15) % 30;
  e := (2 * a + 4 * b - d + 34) % 7;
  m := (d + e + 114) / 31;
  dd := ((d + e + 114) % 31) + 1;
  julian_easter := make_date(y, m, dd);

  IF y >= 1900 THEN
    diff := 13;
    century := 2100;
    WHILE century <= y LOOP
      diff := diff + 1;
      century := century + 100;
      IF (century - 100) % 400 = 0 THEN
        diff := diff - 1;
      END IF;
    END LOOP;
  ELSE
    diff := 12;
  END IF;

  RETURN julian_easter + diff;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DO $$
DECLARE
  y int;
  easter date;
  feast_date date;
BEGIN
  FOR y IN 2025..2825 LOOP
    easter := _temp_orthodox_easter(y);

    -- Месни заговезни (Meatfare Sunday) - 56 days before Easter
    feast_date := easter - 56;
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('mesni', y, feast_date, 'Месни заговезни',
      'Месни заговезни (Неделя Мясопустна) – последната неделя, в която се яде месо преди Великия пост. Подготвителна седмица преди началото на поста.',
      false)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;

    -- Сирни заговезни (Cheesefare Sunday / Forgiveness Sunday) - 49 days before Easter
    feast_date := easter - 49;
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('sirni', y, feast_date, 'Сирни заговезни',
      'Сирни заговезни (Неделя Сыропустна / Прошка) – последната неделя преди Великия пост, в която се ядат млечни продукти. В България е известна като празника на прошката – хората си просяват прошка един от друг.',
      false)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;

    -- Тодоровден (Theodore Saturday) - 43 days before Easter (first Saturday of Great Lent)
    feast_date := easter - 43;
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('todorovden', y, feast_date, 'Тодоровден',
      'Тодоровден (Тодорова събота) – първата събота от Великия пост. Посветен на Свети великомъченик Теодор Тирон. В България е свързан с конски надбягвания и здраве.',
      false)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;

    -- Връбница (Palm Sunday / Цветница) - 7 days before Easter
    feast_date := easter - 7;
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('vrbnitsa', y, feast_date, 'Връбница (Цветница)',
      'Връбница (Цветница / Неделя ваийна) – неделята преди Великден, възпоменание за Влизането на Иисус Христос в Йерусалим. Един от 12-те велики празника.',
      true)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;

    -- Великден (Easter / Pascha)
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('velikden', y, easter, 'Великден (Възкресение Христово)',
      'Великден (Възкресение Христово / Пасха) – най-важният християнски празник, възпоменание за Възкресението на Иисус Христос. Най-важният подвижен празник в православния календар.',
      true)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;

    -- Възнесение Господне (Spasovden / Ascension) - 40 days after Easter
    feast_date := easter + 40;
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('spasovden', y, feast_date, 'Възнесение Господне (Спасовден)',
      'Възнесение Господне (Спасовден) – чества се 40 дни след Великден. Възпоменание за възнесението на Иисус Христос на небето. Един от 12-те велики празници.',
      true)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;

    -- Петдесетница (Pentecost / Trinity Sunday) - 50 days after Easter
    feast_date := easter + 50;
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('petdesetnica', y, feast_date, 'Петдесетница',
      'Петдесетница (Неделя на Петдесетница / Троица) – 50 дни след Великден. Възпоменание за слизането на Светия Дух върху апостолите. Един от 12-те велики празници.',
      true)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;

    -- Св. Дух (Holy Spirit Monday / Духов ден) - 51 days after Easter
    feast_date := easter + 51;
    INSERT INTO moveable_feasts (feast_key, year, date, name, description, is_great_feast)
    VALUES ('svduh', y, feast_date, 'Св. Дух (Ден на Светия Дух)',
      'Ден на Светия Дух (Духов ден) – понеделникът след Петдесетница. Продължение на празника Петдесетница, посветен на Светия Дух.',
      true)
    ON CONFLICT (feast_key, year) DO UPDATE SET date = EXCLUDED.date, name = EXCLUDED.name, description = EXCLUDED.description, is_great_feast = EXCLUDED.is_great_feast;
  END LOOP;
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS _temp_orthodox_easter(int);
