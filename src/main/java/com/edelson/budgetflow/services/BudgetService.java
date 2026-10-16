package com.edelson.budgetflow.services;

import com.edelson.budgetflow.common.web.PageResponse;
import com.edelson.budgetflow.dtos.requests.CreateBudgetRequest;
import com.edelson.budgetflow.dtos.requests.UpdateBudgetRequest;
import com.edelson.budgetflow.dtos.responses.BudgetResponse;
import com.edelson.budgetflow.entities.Budget;
import com.edelson.budgetflow.entities.BudgetCategory;
import com.edelson.budgetflow.entities.User;
import com.edelson.budgetflow.exceptions.DuplicateResourceExpception;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.BudgetCategoryMapper;
import com.edelson.budgetflow.mappers.BudgetMapper;
import com.edelson.budgetflow.repository.BudgetRepository;
import com.edelson.budgetflow.repository.UserRepository;
import com.edelson.budgetflow.specifications.BudgetSpecifications;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.id.BulkInsertionCapableIdentifierGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final BudgetMapper budgetMapper;
    private final UserRepository userRepository;

    public PageResponse<BudgetResponse> filterBudgetsByMonthAndYear(
            Integer month,
            Integer year,
            Pageable pageable,
            Long userId
    ) {
        Specification<Budget> spec = Specification
                .where(BudgetSpecifications.hasYear(year))
                .and(BudgetSpecifications.hasMonth(month))
                .and(BudgetSpecifications.hasUserId(userId));


        Page<Budget> budgets = budgetRepository.findAll(spec, pageable);

        return PageResponse.from(budgets.map(budgetMapper::toResponse));
    }

    @Transactional
    public BudgetResponse createBudget(
            Long userId,
            CreateBudgetRequest request
    )
    {
        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User record with id '%d' does not exist".formatted(userId)
                ));

        if(budgetRepository.existsByUserIdAndYearAndMonth(userId, request.year(), request.month())) {
            throw new DuplicateResourceExpception(
                    "A budget for %d/%d already exists".formatted(request.month(), request.year())
            );
        }

        Budget newBudget = budgetMapper.toEntity(request);
        newBudget.setUser(user);
        Budget createBudget = budgetRepository.save(newBudget);

        return budgetMapper.toResponse(createBudget);
    }

    @Transactional
    public BudgetResponse updateBudget(
            Long id,
            UpdateBudgetRequest request
    ) {
        Budget budgetToUpdate = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget record could not be found"));

        boolean hasChange = !budgetToUpdate.getMonth().equals(request.month())
                || !budgetToUpdate.getYear().equals(request.year());

        boolean budgetExists = budgetRepository.existsByYearAndMonth(request.year(), request.month());

        if(hasChange && budgetExists) {
            throw new DuplicateResourceExpception("A budget for %d/%d already exists".formatted(request.year(), request.month()));
        }

        budgetMapper.updateEntity(request, budgetToUpdate);
        return budgetMapper.toResponse(budgetToUpdate);
    }

    public BudgetResponse getBudgetById(
            Long budgetId
    ) {
        return budgetMapper.toResponse(
                budgetRepository.findById(budgetId)
                        .orElseThrow(() -> new ResourceNotFoundException("Budget record could nto be found"))
        );
    }
}
