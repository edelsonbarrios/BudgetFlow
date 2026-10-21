package com.edelson.budgetflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BudgetFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(BudgetFlowApplication.class, args);
    }
}