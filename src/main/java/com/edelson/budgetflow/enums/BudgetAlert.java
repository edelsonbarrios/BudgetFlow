package com.edelson.budgetflow.enums;

import java.math.BigDecimal;

public enum BudgetAlert {
    OK,
    WARNING,
    EXCEEDED;

    // WARNING starts when spent reaches this percent of the limit.
    private static final BigDecimal WARNING_PERCENT = BigDecimal.valueOf(80);
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    // Compares the exact amounts, not the rounded percent, so 4,501 of 4,500 is EXCEEDED.
    public static BudgetAlert of(BigDecimal spent, BigDecimal limit) {
        // No limit at all: any spending is over it.
        if (limit.compareTo(BigDecimal.ZERO) == 0) {
            return spent.compareTo(BigDecimal.ZERO) > 0 ? EXCEEDED : OK;
        }
        if (spent.compareTo(limit) > 0) {
            return EXCEEDED;
        }
        // spent / limit >= 80%  is the same as  spent * 100 >= limit * 80
        if (spent.multiply(HUNDRED).compareTo(limit.multiply(WARNING_PERCENT)) >= 0) {
            return WARNING;
        }
        return OK;
    }
}