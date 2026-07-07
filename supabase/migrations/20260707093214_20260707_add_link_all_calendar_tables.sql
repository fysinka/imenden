ALTER TABLE holidays ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE church_holidays ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE moveable_feasts ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE historical_events ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE famous_people ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE name_days ADD COLUMN IF NOT EXISTS link text;