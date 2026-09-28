package com.edelson.budgetflow.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "savings_goals")
@Getter @Setter @NoArgsConstructor
public class SavingsGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2, name = "target_amount")
    private BigDecimal targetAmount;

    @Column(name = "current_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal currentAmount;

    @Column(name = "target_date")
    private LocalDate targetDate;
}
