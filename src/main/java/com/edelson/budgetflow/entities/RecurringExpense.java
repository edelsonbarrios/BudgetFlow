package com.edelson.budgetflow.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "recurring_expenses")
@Getter @Setter @NoArgsConstructor
public class RecurringExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The shared category, so the template works before any budget exists.
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 255)
    private String description;

    // The default amount. The user can change it when marking a month as paid.
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Day of the month it is due (1 to 31). A short month uses its last day.
    @Column(name = "due_day", nullable = false)
    private Integer dueDay;

    // Replaces an end date: false means it is no longer offered.
    @Column(nullable = false)
    private Boolean active = true;
}