CREATE TABLE budgets (
                         id BIGSERIAL PRIMARY KEY,
                         month INT NOT NULL,
                         year INT NOT NULL,
                         total_income NUMERIC(12, 2) NOT NULL
);

CREATE TABLE budget_categories (
                                   id BIGSERIAL PRIMARY KEY,
                                   budget_id BIGINT NOT NULL REFERENCES budgets(id),
                                   name VARCHAR(100) NOT NULL,
                                   allocated_amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE expenses (
                          id BIGSERIAL PRIMARY KEY,
                          category_id BIGINT NOT NULL REFERENCES budget_categories(id),
                          amount NUMERIC(12, 2) NOT NULL,
                          description VARCHAR(255),
                          expense_date DATE NOT NULL,
                          is_recurring BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE savings_goals (
                               id BIGSERIAL PRIMARY KEY,
                               name VARCHAR(100) NOT NULL,
                               target_amount NUMERIC(12, 2) NOT NULL,
                               current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                               target_date DATE
);