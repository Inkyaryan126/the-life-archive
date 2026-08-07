-- Migration: Add hero image focal position & zoom crop metadata to archives table
ALTER TABLE public.archives
  ADD COLUMN IF NOT EXISTS hero_image_position_x NUMERIC NOT NULL DEFAULT 50 CONSTRAINT archives_hero_image_position_x_check CHECK (hero_image_position_x >= 0 AND hero_image_position_x <= 100),
  ADD COLUMN IF NOT EXISTS hero_image_position_y NUMERIC NOT NULL DEFAULT 50 CONSTRAINT archives_hero_image_position_y_check CHECK (hero_image_position_y >= 0 AND hero_image_position_y <= 100),
  ADD COLUMN IF NOT EXISTS hero_image_zoom NUMERIC NOT NULL DEFAULT 1.0 CONSTRAINT archives_hero_image_zoom_check CHECK (hero_image_zoom >= 1.0 AND hero_image_zoom <= 3.0);
