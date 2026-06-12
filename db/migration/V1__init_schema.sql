-- Database Initialization Schema for FinTrack AI
-- Designed for PostgreSQL

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Settings Table
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    telegram_chat_id VARCHAR(100),
    alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    daily_summary_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    monthly_budget NUMERIC(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- 4. API Keys Table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- 5. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    bank VARCHAR(100) NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    balance NUMERIC(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    source VARCHAR(50) NOT NULL DEFAULT 'SMS',
    transaction_id VARCHAR(100) UNIQUE,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transactions_user_timestamp ON transactions(user_id, timestamp DESC);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);
CREATE INDEX idx_transactions_merchant ON transactions(user_id, merchant);

-- 6. Merchant Categories Rule Table
CREATE TABLE merchant_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL DEFAULT 'EXACT', -- EXACT, REGEX, FUZZY
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_merchant_categories_name ON merchant_categories(merchant_name);

-- 7. SMS Logs Table
CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender VARCHAR(50) NOT NULL,
    raw_text TEXT NOT NULL,
    parse_status VARCHAR(50) NOT NULL, -- PARSED, FAILED, IGNORED
    confidence_score NUMERIC(5, 2),
    parsed_json TEXT, -- Contains JSON extraction details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sms_logs_user ON sms_logs(user_id, created_at DESC);

-- 8. Notification Logs Table
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- TELEGRAM, EMAIL
    destination VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- SENT, FAILED
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id, sent_at DESC);

-- 9. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);

-- 10. System Events Table
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_system_events_type ON system_events(event_type, created_at DESC);

-- 11. Budgets Table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    spent NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_category_budget_period UNIQUE (user_id, category, start_date, end_date)
);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, start_date, end_date);

-- 12. Insights Table
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- SPENDING, SAVINGS, ALERTS
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_insights_user ON insights(user_id, generated_at DESC);

-- Seed default categories for mapping
INSERT INTO merchant_categories (id, merchant_name, category, pattern_type) VALUES
(uuid_generate_v4(), 'zomato', 'Food', 'FUZZY'),
(uuid_generate_v4(), 'swiggy', 'Food', 'FUZZY'),
(uuid_generate_v4(), 'uber', 'Travel', 'FUZZY'),
(uuid_generate_v4(), 'ola', 'Travel', 'FUZZY'),
(uuid_generate_v4(), 'amazon', 'Shopping', 'FUZZY'),
(uuid_generate_v4(), 'flipkart', 'Shopping', 'FUZZY'),
(uuid_generate_v4(), 'netflix', 'Entertainment', 'EXACT'),
(uuid_generate_v4(), 'spotify', 'Entertainment', 'EXACT'),
(uuid_generate_v4(), 'jio', 'Bills', 'FUZZY'),
(uuid_generate_v4(), 'airtel', 'Bills', 'FUZZY'),
(uuid_generate_v4(), 'tataclay', 'Shopping', 'FUZZY'),
(uuid_generate_v4(), 'starbucks', 'Food', 'FUZZY');
