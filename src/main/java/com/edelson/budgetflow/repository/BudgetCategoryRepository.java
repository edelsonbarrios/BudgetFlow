package com.edelson.budgetflow.repository;

import com.edelson.budgetflow.entities.BudgetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long>, JpaSpecificationExecutor<BudgetCategory> {
    boolean existsByName(String name);
    boolean existsByBudgetIdAndNameIgnoreCase(Long budgetId, String name);
}
