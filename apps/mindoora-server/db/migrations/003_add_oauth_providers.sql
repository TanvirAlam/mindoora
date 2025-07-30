-- Migration: Add OAuth providers tracking table
-- This table tracks which OAuth providers each user has linked to their account

CREATE TABLE IF NOT EXISTS "OAuthProviders" (
    id SERIAL PRIMARY KEY,
    "userId" UUID NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'facebook', 'discord', 'linkedin', 'twitter', 'instagram')),
    "providerId" VARCHAR NOT NULL,
    "lastUsed" TIMESTAMP DEFAULT NOW(),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_oauth_providers_user FOREIGN KEY ("userId") REFERENCES "Register"(id) ON DELETE CASCADE,
    UNIQUE("userId", provider)
);

-- Indexes for better performance
CREATE INDEX idx_oauth_providers_user_id ON "OAuthProviders"("userId");
CREATE INDEX idx_oauth_providers_provider ON "OAuthProviders"(provider);
CREATE INDEX idx_oauth_providers_last_used ON "OAuthProviders"("lastUsed");
