package com.edelson.budgetflow.services;

import com.edelson.budgetflow.dtos.requests.CreateBudgetRequest;
import com.edelson.budgetflow.dtos.responses.BudgetResponse;
import com.edelson.budgetflow.entities.Budget;
import com.edelson.budgetflow.exceptions.DuplicateResourceExpception;
import com.edelson.budgetflow.mappers.BudgetMapper;
import com.edelson.budgetflow.repository.BudgetRepository;
import com.edelson.budgetflow.specifications.BudgetSpecifications;
import jakarta.transaction.Transactional;
import org.hibernate.id.BulkInsertionCapableIdentifierGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final BudgetMapper budgetMapper;

    public BudgetService(
       BudgetRepository budgetRepository,
       BudgetMapper budgetMapper
    ) {
        this.budgetRepository = budgetRepository;
        this.budgetMapper = budgetMapper;
    }

    public Page<BudgetResponse> filterBudgetsByMonthAndYear(
    Integer year,
    Integer month,
    Pageable pageable
    )
    {
        Specification<Budget> spec = Specification
                .where(BudgetSpecifications.hasYear(year))
                .and(BudgetSpecifications.hasMonth(month));

        Page<Budget> budgets = budgetRepository.findAll(spec, pageable);
        System.out.println("entities: " + budgets.getContent().size() + ", total: " + budgets.getTotalElements());
        System.out.println("page=" + pageable.getPageNumber() + ", size=" + pageable.getPageSize());
        return budgets.map(budgetMapper::toResponse);
    }

    @Transactional
    public BudgetResponse createBudget(
            CreateBudgetRequest request
    )
    {
        if(budgetRepository.existsByYearAndMonth(request.year(), request.month())) {
            throw new DuplicateResourceExpception(
                    "A budget for %d/%d already exists".formatted(request.month(), request.year())
            );
        }

        Budget newBudget = budgetMapper.toEntity(request);
        Budget createBudget = budgetRepository.save(newBudget);

        return budgetMapper.toResponse(newBudget);
    }
}
