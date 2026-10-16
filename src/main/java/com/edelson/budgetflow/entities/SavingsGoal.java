package com.edelson.budgetflow.entities;

import com.edelson.budgetflow.enums.SavingsGoalStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Entity
@Table(name = "savings_goals")
@Getter @Setter @NoArgsConstructor
public class SavingsGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2, name = "target_amount")
    private BigDecimal targetAmount = BigDecimal.ZERO;

    @Column(name = "current_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SavingsGoalStatus status = SavingsGoalStatus.ACTIVE;

    @Transient
    public BigDecimal getRemainingAmount() {
        return targetAmount.subtract(currentAmount).max(BigDecimal.ZERO);
    }

    @Transient
    public Boolean isCompleted() {
        return currentAmount.compareTo(targetAmount) >= 0;
    }

    @Transient
    public BigDecimal getPercentAmount() {
        if(targetAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return currentAmount
                .multiply(BigDecimal.valueOf(100))
                .divide(targetAmount, 1, RoundingMode.HALF_UP)
                .min(BigDecimal.valueOf(100));
    }

    @Transient
    public boolean isOverdue() {
        return status == SavingsGoalStatus.ACTIVE
                && !isCompleted()
                && targetDate != null
                && targetDate.isBefore(LocalDate.now());
    }
}
