package com.edelson.budgetflow.repository;

import com.edelson.budgetflow.entities.Budget;
import com.edelson.budgetflow.entities.BudgetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long>, JpaSpecificationExecutor<BudgetCategory> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByBudgetIdAndNameIgnoreCase(Long budgetId, String name);
    boolean existsByBudgetIdAndNameIgnoreCaseAndIdNot(Long budgetId, String name, Long budgetCategoryId);
    List<BudgetCategory> findAllByBudgetId(Integer budgetId);

    Integer budget(Budget budget);
}
