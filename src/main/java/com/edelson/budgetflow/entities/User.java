package com.edelson.budgetflow.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 255, nullable = false)
    private String name;

    @Column(length = 500, name = "picture_url")
    private String pictureUrl;

    @Column(nullable = false, name= "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
