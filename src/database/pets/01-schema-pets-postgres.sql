CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS pets;

CREATE TABLE IF NOT EXISTS pets.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  species VARCHAR(80) NOT NULL,
  breed VARCHAR(120) NOT NULL,
  age_years INTEGER NOT NULL CHECK (age_years >= 0),
  health_status VARCHAR(16) NOT NULL DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'attention', 'checkup')),
  vaccination_status VARCHAR(16) NOT NULL DEFAULT 'up_to_date' CHECK (
    vaccination_status IN ('up_to_date', 'pending', 'overdue')
  ),
  photo_url VARCHAR(255) NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  next_care_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_species ON pets.pets (species);
CREATE INDEX IF NOT EXISTS idx_pets_health_status ON pets.pets (health_status);
CREATE INDEX IF NOT EXISTS idx_pets_vaccination_status ON pets.pets (vaccination_status);
CREATE INDEX IF NOT EXISTS idx_pets_next_care_at ON pets.pets (next_care_at);

CREATE OR REPLACE FUNCTION pets.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pets_touch_updated_at ON pets.pets;

CREATE TRIGGER trg_pets_touch_updated_at
BEFORE UPDATE ON pets.pets
FOR EACH ROW
EXECUTE FUNCTION pets.touch_updated_at();
