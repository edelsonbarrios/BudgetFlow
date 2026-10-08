package com.edelson.budgetflow.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Fetch;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "budgets")
@Getter @Setter @NoArgsConstructor
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalIncome;


    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<BudgetCategory> categories = new ArrayList<>();

    @Transient
    public BigDecimal getGivenToCategories() {
        return categories.stream()
                .map(BudgetCategory::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transient
    public BigDecimal getLeftToAssign() {
        return totalIncome.subtract(getGivenToCategories()).max(BigDecimal.ZERO);
    }

    @Transient
    public BigDecimal getOverAllocatedAmount() {
        return getGivenToCategories()
                .subtract(totalIncome)
                .max(BigDecimal.ZERO);
    }

    @Transient
    public BigDecimal getTotalSpent() {
        return categories.stream()
                .map(BudgetCategory::getSpentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transient
    public BigDecimal getLeftToSpend() {
        return getGivenToCategories().subtract(getTotalSpent());
    }

    @Transient
    public BigDecimal getPercentUsed() {
        if(totalIncome.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;

        return getTotalSpent()
                .multiply(BigDecimal.valueOf(100))
                .divide(totalIncome, 1, RoundingMode.HALF_UP);
    }
}