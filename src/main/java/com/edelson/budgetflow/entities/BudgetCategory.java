package com.edelson.budgetflow.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Entity
@Table(name = "budget_categories")
@Getter @Setter @NoArgsConstructor
public class BudgetCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal allocatedAmount;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<Expense> expenses;

    @Transient
    public BigDecimal getSpentAmount() {
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transient
    public BigDecimal getRemainingAmount() {
        return allocatedAmount.subtract(getSpentAmount()).max(BigDecimal.ZERO);
    }

    @Transient
    public BigDecimal getPercentUsed() {
        if(allocatedAmount.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;

        return getSpentAmount()
                .multiply(BigDecimal.valueOf(100))
                .divide(allocatedAmount, 1, RoundingMode.HALF_UP);
    }
}
