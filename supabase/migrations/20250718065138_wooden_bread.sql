/*
  # Comprehensive Crypto Trading Platform Database Schema

  This migration creates a complete database schema for a crypto trading platform
  with all the functionality similar to Coinbase, including:

  1. User Management & Authentication
    - Enhanced user profiles with KYC/verification
    - Two-factor authentication
    - Account settings and preferences

  2. Cryptocurrency & Market Data
    - Supported cryptocurrencies with detailed information
    - Real-time price data and historical charts
    - Market statistics and trading pairs

  3. Wallet Management
    - Multi-currency wallets for each user
    - Hot and cold wallet addresses
    - Wallet transaction history

  4. Trading System
    - Order management (market, limit, stop orders)
    - Trade execution and matching
    - Trading history and analytics

  5. Transactions & Transfers
    - Deposit and withdrawal tracking
    - Internal transfers between users
    - External blockchain transactions

  6. Security & Compliance
    - Transaction monitoring and alerts
    - Compliance reporting
    - Audit trails

  7. Analytics & Reporting
    - Portfolio tracking
    - Performance analytics
    - Tax reporting data
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USER MANAGEMENT & AUTHENTICATION
-- =============================================

-- Enhanced user profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone_number text,
  date_of_birth date,
  country_code text,
  state_province text,
  city text,
  postal_code text,
  address_line_1 text,
  address_line_2 text,
  
  -- KYC and verification
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
  kyc_level integer DEFAULT 1 CHECK (kyc_level BETWEEN 1 AND 3),
  identity_verified boolean DEFAULT false,
  address_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  
  -- Security settings
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text,
  backup_codes text[],
  
  -- Account settings
  preferred_currency text DEFAULT 'USD',
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  notification_preferences jsonb DEFAULT '{}',
  
  -- Risk and trading settings
  risk_tolerance text DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  trading_experience text DEFAULT 'beginner' CHECK (trading_experience IN ('beginner', 'intermediate', 'advanced', 'professional')),
  max_daily_withdrawal_limit decimal(20,8) DEFAULT 10000,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed')),
  
  UNIQUE(user_id)
);

-- User documents for KYC
CREATE TABLE IF NOT EXISTS user_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement')),
  document_url text NOT NULL,
  document_status text DEFAULT 'pending' CHECK (document_status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  uploaded_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id)
);

-- =============================================
-- CRYPTOCURRENCY & MARKET DATA
-- =============================================

-- Supported cryptocurrencies
CREATE TABLE IF NOT EXISTS cryptocurrencies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  full_name text,
  description text,
  
  -- Technical details
  blockchain text NOT NULL,
  contract_address text,
  decimals integer DEFAULT 18,
  
  -- Market data
  current_price decimal(20,8) NOT NULL DEFAULT 0,
  market_cap decimal(30,2),
  total_supply decimal(30,8),
  circulating_supply decimal(30,8),
  max_supply decimal(30,8),
  
  -- Trading info
  is_tradeable boolean DEFAULT true,
  is_depositable boolean DEFAULT true,
  is_withdrawable boolean DEFAULT true,
  min_withdrawal_amount decimal(20,8) DEFAULT 0,
  withdrawal_fee decimal(20,8) DEFAULT 0,
  
  -- Metadata
  logo_url text,
  website_url text,
  whitepaper_url text,
  explorer_url text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trading pairs
CREATE TABLE IF NOT EXISTS trading_pairs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency_id uuid REFERENCES cryptocurrencies(id),
  quote_currency_id uuid REFERENCES cryptocurrencies(id),
  symbol text UNIQUE NOT NULL, -- e.g., 'BTC/USD'
  
  -- Trading settings
  is_active boolean DEFAULT true,
  min_order_size decimal(20,8) DEFAULT 0,
  max_order_size decimal(20,8),
  price_precision integer DEFAULT 8,
  quantity_precision integer DEFAULT 8,
  
  -- Fees
  maker_fee_rate decimal(5,4) DEFAULT 0.005, -- 0.5%
  taker_fee_rate decimal(5,4) DEFAULT 0.005, -- 0.5%
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(base_currency_id, quote_currency_id)
);

-- Price history for charts
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  price decimal(20,8) NOT NULL,
  volume_24h decimal(30,8),
  market_cap decimal(30,2),
  timestamp timestamptz DEFAULT now(),
  
  -- Index for efficient querying
  UNIQUE(cryptocurrency_id, timestamp)
);

-- Market statistics
CREATE TABLE IF NOT EXISTS market_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trading_pair_id uuid REFERENCES trading_pairs(id),
  
  -- 24h statistics
  price_24h_ago decimal(20,8),
  high_24h decimal(20,8),
  low_24h decimal(20,8),
  volume_24h decimal(30,8),
  price_change_24h decimal(20,8),
  price_change_percent_24h decimal(8,4),
  
  -- Current data
  last_price decimal(20,8),
  bid_price decimal(20,8),
  ask_price decimal(20,8),
  spread decimal(20,8),
  
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- WALLET MANAGEMENT
-- =============================================

-- User wallets for each cryptocurrency
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id),
  
  -- Balances
  available_balance decimal(30,8) DEFAULT 0 CHECK (available_balance >= 0),
  locked_balance decimal(30,8) DEFAULT 0 CHECK (locked_balance >= 0), -- Locked in orders
  total_balance decimal(30,8) GENERATED ALWAYS AS (available_balance + locked_balance) STORED,
  
  -- Addresses
  deposit_address text,
  cold_storage_address text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, cryptocurrency_id)
);

-- Wallet addresses (for receiving deposits)
CREATE TABLE IF NOT EXISTS wallet_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  address text NOT NULL,
  address_type text DEFAULT 'deposit' CHECK (address_type IN ('deposit', 'withdrawal', 'cold_storage')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(wallet_id, address)
);

-- =============================================
-- TRADING SYSTEM
-- =============================================

-- Trading orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trading_pair_id uuid REFERENCES trading_pairs(id),
  
  -- Order details
  order_type text NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity decimal(30,8) NOT NULL CHECK (quantity > 0),
  price decimal(20,8), -- NULL for market orders
  stop_price decimal(20,8), -- For stop orders
  
  -- Order status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'partially_filled', 'filled', 'cancelled', 'rejected')),
  filled_quantity decimal(30,8) DEFAULT 0,
  remaining_quantity decimal(30,8) GENERATED ALWAYS AS (quantity - filled_quantity) STORED,
  average_fill_price decimal(20,8),
  
  -- Fees
  fee_amount decimal(30,8) DEFAULT 0,
  fee_currency_id uuid REFERENCES cryptocurrencies(id),
  
  -- Time constraints
  time_in_force text DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK')), -- Good Till Cancelled, Immediate or Cancel, Fill or Kill
  expires_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  filled_at timestamptz,
  cancelled_at timestamptz
);

-- Trade executions
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trading_pair_id uuid REFERENCES trading_pairs(id),
  
  -- Trade details
  price decimal(20,8) NOT NULL,
  quantity decimal(30,8) NOT NULL,
  total_value decimal(30,8) GENERATED ALWAYS AS (price * quantity) STORED,
  
  -- Orders involved
  maker_order_id uuid REFERENCES orders(id),
  taker_order_id uuid REFERENCES orders(id),
  maker_user_id uuid REFERENCES auth.users(id),
  taker_user_id uuid REFERENCES auth.users(id),
  
  -- Fees
  maker_fee decimal(30,8) DEFAULT 0,
  taker_fee decimal(30,8) DEFAULT 0,
  
  -- Metadata
  executed_at timestamptz DEFAULT now()
);

-- =============================================
-- TRANSACTIONS & TRANSFERS
-- =============================================

-- All transactions (deposits, withdrawals, trades, transfers)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'trade', 'transfer', 'fee', 'reward', 'staking')),
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id),
  amount decimal(30,8) NOT NULL,
  fee_amount decimal(30,8) DEFAULT 0,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- External references
  blockchain_tx_hash text,
  external_address text,
  internal_reference text, -- For internal transfers
  order_id uuid REFERENCES orders(id), -- For trade-related transactions
  
  -- Metadata
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  
  -- Constraints
  CHECK (amount != 0)
);

-- Deposits
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES wallets(id),
  
  -- Deposit details
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id),
  amount decimal(30,8) NOT NULL CHECK (amount > 0),
  
  -- Blockchain info
  from_address text NOT NULL,
  to_address text NOT NULL,
  blockchain_tx_hash text UNIQUE,
  block_number bigint,
  confirmations integer DEFAULT 0,
  required_confirmations integer DEFAULT 6,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'completed', 'failed')),
  
  -- Metadata
  detected_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  credited_at timestamptz
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES wallets(id),
  
  -- Withdrawal details
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id),
  amount decimal(30,8) NOT NULL CHECK (amount > 0),
  fee_amount decimal(30,8) DEFAULT 0,
  net_amount decimal(30,8) GENERATED ALWAYS AS (amount - fee_amount) STORED,
  
  -- Destination
  to_address text NOT NULL,
  destination_tag text, -- For currencies that require it (XRP, etc.)
  
  -- Blockchain info
  blockchain_tx_hash text UNIQUE,
  block_number bigint,
  
  -- Status and approval
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'sent', 'completed', 'failed', 'cancelled')),
  requires_approval boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  -- Security
  two_factor_verified boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  completed_at timestamptz
);

-- Internal transfers between users
CREATE TABLE IF NOT EXISTS internal_transfers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Transfer details
  from_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id),
  amount decimal(30,8) NOT NULL CHECK (amount > 0),
  
  -- Optional message
  message text,
  
  -- Status
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now(),
  
  CHECK (from_user_id != to_user_id)
);

-- =============================================
-- PORTFOLIO & ANALYTICS
-- =============================================

-- Portfolio snapshots for performance tracking
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Portfolio value
  total_value_usd decimal(30,2) NOT NULL,
  total_value_btc decimal(30,8),
  
  -- Holdings breakdown
  holdings jsonb NOT NULL, -- JSON object with cryptocurrency holdings
  
  -- Performance metrics
  daily_change_usd decimal(30,2),
  daily_change_percent decimal(8,4),
  
  -- Metadata
  snapshot_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, snapshot_date)
);

-- User's favorite/watchlist cryptocurrencies
CREATE TABLE IF NOT EXISTS user_watchlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, cryptocurrency_id)
);

-- =============================================
-- SECURITY & COMPLIANCE
-- =============================================

-- Security events and alerts
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Event details
  event_type text NOT NULL CHECK (event_type IN ('login', 'failed_login', 'password_change', '2fa_enabled', '2fa_disabled', 'withdrawal_request', 'large_trade', 'suspicious_activity')),
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Context
  ip_address inet,
  user_agent text,
  location jsonb, -- Country, city, etc.
  additional_data jsonb,
  
  -- Status
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now()
);

-- Transaction monitoring and alerts
CREATE TABLE IF NOT EXISTS transaction_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type text NOT NULL CHECK (alert_type IN ('large_amount', 'unusual_pattern', 'velocity_check', 'compliance_flag')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  description text,
  
  -- Status
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- STAKING & REWARDS
-- =============================================

-- Staking programs
CREATE TABLE IF NOT EXISTS staking_programs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cryptocurrency_id uuid REFERENCES cryptocurrencies(id),
  
  -- Program details
  name text NOT NULL,
  description text,
  annual_percentage_yield decimal(8,4) NOT NULL, -- APY as percentage
  
  -- Requirements
  minimum_stake_amount decimal(30,8) DEFAULT 0,
  lock_period_days integer DEFAULT 0, -- 0 for flexible staking
  
  -- Status
  is_active boolean DEFAULT true,
  max_total_stake decimal(30,8), -- Optional cap
  current_total_staked decimal(30,8) DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User staking positions
CREATE TABLE IF NOT EXISTS staking_positions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  staking_program_id uuid REFERENCES staking_programs(id),
  wallet_id uuid REFERENCES wallets(id),
  
  -- Position details
  staked_amount decimal(30,8) NOT NULL CHECK (staked_amount > 0),
  current_rewards decimal(30,8) DEFAULT 0,
  
  -- Timing
  staked_at timestamptz DEFAULT now(),
  unlock_at timestamptz, -- NULL for flexible staking
  last_reward_at timestamptz DEFAULT now(),
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'unstaking', 'completed')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Staking rewards history
CREATE TABLE IF NOT EXISTS staking_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  staking_position_id uuid REFERENCES staking_positions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Reward details
  reward_amount decimal(30,8) NOT NULL CHECK (reward_amount > 0),
  reward_rate decimal(8,4) NOT NULL, -- Rate at time of reward
  
  -- Period
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);

-- Cryptocurrency indexes
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_symbol ON cryptocurrencies(symbol);
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_tradeable ON cryptocurrencies(is_tradeable) WHERE is_tradeable = true;

-- Trading pair indexes
CREATE INDEX IF NOT EXISTS idx_trading_pairs_active ON trading_pairs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_trading_pairs_base_quote ON trading_pairs(base_currency_id, quote_currency_id);

-- Price history indexes
CREATE INDEX IF NOT EXISTS idx_price_history_crypto_time ON price_history(cryptocurrency_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp DESC);

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_crypto ON wallets(user_id, cryptocurrency_id);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_trading_pair ON orders(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_open ON orders(trading_pair_id, status) WHERE status IN ('open', 'partially_filled');

-- Trade indexes
CREATE INDEX IF NOT EXISTS idx_trades_trading_pair ON trades(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_maker_user ON trades(maker_user_id);
CREATE INDEX IF NOT EXISTS idx_trades_taker_user ON trades(taker_user_id);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_hash ON transactions(blockchain_tx_hash);

-- Deposit/Withdrawal indexes
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_blockchain_hash ON deposits(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- Security event indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all user-related tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_rewards ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Wallet policies
CREATE POLICY "Users can read own wallets"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Order policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transaction policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public read access for market data
CREATE POLICY "Anyone can read cryptocurrencies"
  ON cryptocurrencies
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can read trading pairs"
  ON trading_pairs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can read price history"
  ON price_history
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can read market stats"
  ON market_stats
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can read trades"
  ON trades
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cryptocurrencies_updated_at BEFORE UPDATE ON cryptocurrencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_pairs_updated_at BEFORE UPDATE ON trading_pairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create wallets for new users
CREATE OR REPLACE FUNCTION create_user_wallets()
RETURNS TRIGGER AS $$
BEGIN
  -- Create wallets for all supported cryptocurrencies
  INSERT INTO wallets (user_id, cryptocurrency_id, available_balance, locked_balance)
  SELECT NEW.user_id, c.id, 0, 0
  FROM cryptocurrencies c
  WHERE c.is_tradeable = true;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create wallets when user profile is created
CREATE TRIGGER create_wallets_for_new_user
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallets();

-- Function to update wallet balances after transactions
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update wallet balance based on transaction type
    IF NEW.transaction_type = 'deposit' THEN
      UPDATE wallets 
      SET available_balance = available_balance + NEW.amount
      WHERE user_id = NEW.user_id AND cryptocurrency_id = NEW.cryptocurrency_id;
    ELSIF NEW.transaction_type = 'withdrawal' THEN
      UPDATE wallets 
      SET available_balance = available_balance - NEW.amount
      WHERE user_id = NEW.user_id AND cryptocurrency_id = NEW.cryptocurrency_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update wallet balances
CREATE TRIGGER update_wallet_on_transaction
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert major cryptocurrencies
INSERT INTO cryptocurrencies (symbol, name, full_name, description, blockchain, current_price, is_tradeable, is_depositable, is_withdrawable) VALUES
('BTC', 'Bitcoin', 'Bitcoin', 'The first and most well-known cryptocurrency', 'Bitcoin', 43250.00, true, true, true),
('ETH', 'Ethereum', 'Ethereum', 'A decentralized platform for smart contracts', 'Ethereum', 2890.00, true, true, true),
('USDT', 'Tether', 'Tether USD', 'A stablecoin pegged to the US Dollar', 'Ethereum', 1.00, true, true, true),
('USDC', 'USD Coin', 'USD Coin', 'A regulated stablecoin backed by US dollars', 'Ethereum', 1.00, true, true, true),
('BNB', 'Binance Coin', 'Binance Coin', 'The native token of Binance exchange', 'BSC', 310.50, true, true, true),
('ADA', 'Cardano', 'Cardano', 'A blockchain platform focused on sustainability', 'Cardano', 0.485, true, true, true),
('SOL', 'Solana', 'Solana', 'A high-performance blockchain for decentralized apps', 'Solana', 102.50, true, true, true),
('DOT', 'Polkadot', 'Polkadot', 'A multi-chain blockchain platform', 'Polkadot', 6.75, true, true, true),
('AVAX', 'Avalanche', 'Avalanche', 'A platform for decentralized applications', 'Avalanche', 38.20, true, true, true),
('MATIC', 'Polygon', 'Polygon', 'A scaling solution for Ethereum', 'Polygon', 0.85, true, true, true)
ON CONFLICT (symbol) DO NOTHING;

-- Create major trading pairs
INSERT INTO trading_pairs (base_currency_id, quote_currency_id, symbol, is_active, min_order_size) 
SELECT 
  b.id as base_currency_id,
  q.id as quote_currency_id,
  b.symbol || '/' || q.symbol as symbol,
  true as is_active,
  CASE 
    WHEN b.symbol = 'BTC' THEN 0.0001
    WHEN b.symbol = 'ETH' THEN 0.001
    ELSE 1.0
  END as min_order_size
FROM cryptocurrencies b
CROSS JOIN cryptocurrencies q
WHERE b.symbol IN ('BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'AVAX', 'MATIC', 'BNB')
  AND q.symbol IN ('USDT', 'USDC', 'BTC', 'ETH')
  AND b.symbol != q.symbol
ON CONFLICT (symbol) DO NOTHING;

-- Create staking programs
INSERT INTO staking_programs (cryptocurrency_id, name, description, annual_percentage_yield, minimum_stake_amount, lock_period_days)
SELECT 
  c.id,
  c.name || ' Staking',
  'Earn rewards by staking your ' || c.name,
  CASE 
    WHEN c.symbol = 'ETH' THEN 4.5
    WHEN c.symbol = 'ADA' THEN 5.2
    WHEN c.symbol = 'SOL' THEN 6.8
    WHEN c.symbol = 'DOT' THEN 12.5
    WHEN c.symbol = 'AVAX' THEN 9.2
    ELSE 5.0
  END,
  CASE 
    WHEN c.symbol = 'ETH' THEN 0.1
    WHEN c.symbol = 'ADA' THEN 10
    WHEN c.symbol = 'SOL' THEN 1
    WHEN c.symbol = 'DOT' THEN 1
    WHEN c.symbol = 'AVAX' THEN 1
    ELSE 1
  END,
  0 -- Flexible staking
FROM cryptocurrencies c
WHERE c.symbol IN ('ETH', 'ADA', 'SOL', 'DOT', 'AVAX')
ON CONFLICT DO NOTHING;