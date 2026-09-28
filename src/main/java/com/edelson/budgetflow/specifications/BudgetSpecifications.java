package com.edelson.budgetflow.specifications;

import com.edelson.budgetflow.entities.Budget;
import org.springframework.beans.factory.BeanRegistry;
import org.springframework.data.jpa.domain.Specification;

public class BudgetSpecifications {
    public static Specification<Budget> hasYear(Integer year) {
        return(root, query, cb)
        -> year == null ? null : cb.equal(root.get("year"), year);
    }

    public static Specification<Budget> hasMonth(Integer month) {
        return (root, query, cb)
        -> month == null ? null : cb.equal(root.get("month"), month);
    }
}
