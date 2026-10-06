package com.edelson.budgetflow.repository;

import com.edelson.budgetflow.entities.Budget;
import com.edelson.budgetflow.entities.BudgetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long>, JpaSpecificationExecutor<BudgetCategory> {
    boolean existsByBudgetIdAndCategoryId(Long budgetId, Long categoryId);
    boolean existsByBudgetIdAndCategoryIdAndIdNot(Long budgetId, Long categoryId, Long budgetCategoryId);
    List<BudgetCategory> findAllByBudgetId(Long budgetId);
    Optional<BudgetCategory> findByCategoryNameIgnoreCase(String name);
}
