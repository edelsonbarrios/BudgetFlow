package com.edelson.budgetflow.services;

import com.edelson.budgetflow.dtos.responses.RecurringExpenseResponse;
import com.edelson.budgetflow.entities.RecurringExpense;
import com.edelson.budgetflow.mappers.RecurringExpenseMapper;
import com.edelson.budgetflow.repository.RecurringExpenseRepository;
import jakarta.transaction.TransactionScoped;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecurringExpenseService {
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final RecurringExpenseMapper recurringExpenseMapper;

    public List<RecurringExpenseResponse> getAllRecurringExpenseByUserId(Long userId) {
        return recurringExpenseRepository.findAllByUserId(userId)
                .stream()
                .map(recurringExpenseMapper::toResponse)
                .toList();
    }
}
