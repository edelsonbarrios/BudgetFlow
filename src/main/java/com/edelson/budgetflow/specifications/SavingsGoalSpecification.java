package com.edelson.budgetflow.specifications;

import com.edelson.budgetflow.entities.SavingsGoal;
import com.edelson.budgetflow.enums.SavingsGoalStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class SavingsGoalSpecification {
    public static Specification<SavingsGoal> hasName(String name) {
        return (root, query, cb)
        -> {
            if(name == null || name.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase() + "%");
        };
    }
    public static Specification<SavingsGoal> hasStatus(SavingsGoalStatus status)  {
        return (root, query, cb)
        -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<SavingsGoal> hasTargetDate(LocalDate targetDate) {
        return (root, query, cb)
        -> targetDate == null ? cb.conjunction() : cb.equal(root.get("targetDate"), targetDate);
    }
}
