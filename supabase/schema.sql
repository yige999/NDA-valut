-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE agreement_status AS ENUM ('active', 'expiring_soon', 'expired');

-- Create agreements table
CREATE TABLE IF NOT EXISTS agreements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- in bytes
  counterparty_name TEXT NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  confidentiality_period INTEGER, -- in years, nullable
  status agreement_status DEFAULT 'active' NOT NULL,
  alert_enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_subscriptions table for payment tracking
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_tier TEXT DEFAULT 'free' NOT NULL, -- 'free' or 'pro'
  creem_subscription_id TEXT UNIQUE, -- Store Creem subscription ID
  status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'cancelled', 'expired'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own agreements
CREATE POLICY "Users can view their own agreements"
ON agreements FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own agreements
CREATE POLICY "Users can insert their own agreements"
ON agreements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own agreements
CREATE POLICY "Users can update their own agreements"
ON agreements FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own agreements
CREATE POLICY "Users can delete their own agreements"
ON agreements FOR DELETE
USING (auth.uid() = user_id);

-- Users can only view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own subscriptions (for webhooks)
CREATE POLICY "Users can insert their own subscriptions"
ON user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own subscriptions (for webhooks)
CREATE POLICY "Users can update their own subscriptions"
ON user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agreements_user_id ON agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_agreements_expiration_date ON agreements(expiration_date);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_agreements_updated_at
    BEFORE UPDATE ON agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();