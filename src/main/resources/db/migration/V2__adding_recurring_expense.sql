
CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE
);


INSERT INTO categories (name)
VALUES ('Foods'),
       ('Transportation'),
       ('Housing'),
       ('Bills & Utilities'),
       ('Health'),
       ('Education'),
       ('Shopping'),
       ('Entertainment'),
       ('Subscriptions'),
       ('Family & Gifts'),
       ('Others')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name)
SELECT DISTINCT TRIM(name)
FROM budget_categories
    ON CONFLICT (name) DO NOTHING;

ALTER TABLE budget_categories
    ADD COLUMN category_id BIGINT REFERENCES categories(id);

UPDATE budget_categories bc
SET category_id = c.id
    FROM categories c
WHERE c.name = TRIM(bc.name);

ALTER TABLE budget_categories
    ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE budget_categories
DROP COLUMN name;

ALTER TABLE budget_categories
    ADD CONSTRAINT uq_budget_categories_budget_category UNIQUE (budget_id, category_id);

CREATE TABLE recurring_expenses (
                                    id BIGSERIAL PRIMARY KEY,
                                    category_id BIGINT NOT NULL REFERENCES categories(id),
                                    description VARCHAR(255) NOT NULL,
                                    amount NUMERIC(12, 2) NOT NULL,
                                    due_day INT NOT NULL,
                                    active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE expenses
DROP COLUMN is_recurring;

ALTER TABLE expenses
    ADD COLUMN recurring_expense_id BIGINT REFERENCES recurring_expenses(id);

CREATE INDEX idx_expenses_category_id ON expenses (category_id);
CREATE INDEX idx_expenses_recurring_expense_id ON expenses (recurring_expense_id);