package com.edelson.budgetflow.repository;

import com.edelson.budgetflow.entities.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {
}
