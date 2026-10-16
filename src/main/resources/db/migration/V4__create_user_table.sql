CREATE TABLE users (
                       id          BIGSERIAL PRIMARY KEY,
                       email       VARCHAR(255) NOT NULL UNIQUE,
                       name        VARCHAR(255) NOT NULL,
                       picture_url VARCHAR(500),
                       created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

TRUNCATE TABLE budgets, savings_goals, recurring_expenses CASCADE;

ALTER TABLE budgets
    ADD COLUMN user_id BIGINT NOT NULL REFERENCES users (id);

ALTER TABLE savings_goals
    ADD COLUMN user_id BIGINT NOT NULL REFERENCES users (id);

ALTER TABLE recurring_expenses
    ADD COLUMN user_id BIGINT NOT NULL REFERENCES users (id);

CREATE INDEX idx_budgets_user_id ON budgets (user_id);
CREATE INDEX idx_savings_goals_user_id ON savings_goals (user_id);
CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses (user_id);