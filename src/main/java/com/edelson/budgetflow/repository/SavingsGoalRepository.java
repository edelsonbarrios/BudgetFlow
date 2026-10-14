package com.edelson.budgetflow.repository;

import com.edelson.budgetflow.entities.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long>, JpaSpecificationExecutor<SavingsGoal> {
    Optional<SavingsGoal> findByNameIgnoreCase(String name);
}
