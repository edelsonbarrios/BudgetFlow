package com.edelson.budgetflow.services;

import com.edelson.budgetflow.common.web.PageResponse;
import com.edelson.budgetflow.dtos.filters.SavingsGoalFilters;
import com.edelson.budgetflow.dtos.requests.AddSavingsRequest;
import com.edelson.budgetflow.dtos.requests.CreateSavingsGoalRequest;
import com.edelson.budgetflow.dtos.requests.UpdateSavingsGoalRequest;
import com.edelson.budgetflow.dtos.responses.SavingsGoalResponse;
import com.edelson.budgetflow.entities.SavingsGoal;
import com.edelson.budgetflow.enums.SavingsGoalStatus;
import com.edelson.budgetflow.exceptions.BusinessRuleException;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.SavingsGoalMapper;
import com.edelson.budgetflow.repository.SavingsGoalRepository;
import com.edelson.budgetflow.specifications.SavingsGoalSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SavingsGoalService {
    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsGoalMapper savingsGoalMapper;
    private static final Set<SavingsGoalStatus> VALID_STATUSES = EnumSet.of(
            SavingsGoalStatus.ACTIVE,
            SavingsGoalStatus.PAUSED
    );

    public PageResponse<SavingsGoalResponse> filterPaginatedSavingsGoal(SavingsGoalFilters filters) {
        SavingsGoalStatus statusValue = parseStatus(filters.status());

        Pageable pageable = PageRequest.of(
                filters.page() - 1,
                filters.size(),
                Sort.by(Sort.Order.asc("targetDate"))
        );

        Specification<SavingsGoal> spec = Specification
                .where(SavingsGoalSpecification.hasName(filters.searchQuery()))
                .and(SavingsGoalSpecification.hasStatus(statusValue))
                .and(SavingsGoalSpecification.hasTargetDate(filters.targetDate()));

        Page<SavingsGoal> savingsGoals = savingsGoalRepository.findAll(spec, pageable);

        return PageResponse.from(savingsGoals.map(savingsGoalMapper::toResponse));
    }

    public SavingsGoalResponse getSavingsGoalByName(String name) {
        return savingsGoalMapper.toResponse(
                savingsGoalRepository.findByNameIgnoreCase(name)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No savings goal with name '%s' found"
                                        .formatted(name)
                        ))
        );
    }

    @Transactional
    public SavingsGoalResponse createSavingsGoal(CreateSavingsGoalRequest request) {
        SavingsGoal newSavingsGoal = savingsGoalMapper.toEntity(request);

        SavingsGoal createSavingsGoal = savingsGoalRepository.save(newSavingsGoal);

        return savingsGoalMapper.toResponse(createSavingsGoal);
    }

    @Transactional
    public SavingsGoalResponse addSavings(AddSavingsRequest request) {
        SavingsGoal savingsGoal = savingsGoalRepository.findById(request.id())
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal record could not be found"));
        assertAcceptSavings(savingsGoal);

        savingsGoal.setCurrentAmount(savingsGoal.getCurrentAmount().add(request.amountToAdd()));
        return savingsGoalMapper.toResponse(savingsGoal);
    }

    @Transactional
    public SavingsGoalResponse updateSavingsGoal(UpdateSavingsGoalRequest request) {
        SavingsGoal goalToUpdate = findOrThrowById(request.id());

        LocalDate newDate = request.targetDate();
        if(newDate != null && newDate.isBefore(LocalDate.now()) && !newDate.equals(goalToUpdate.getTargetDate())) {
            throw new BusinessRuleException("Target date cannot be in the past");
        }

        SavingsGoalStatus statusChange = parseStatus(request.status());
        if(statusChange == null)
            throw new BusinessRuleException("Status is required");

        goalToUpdate.setStatus(statusChange);
        savingsGoalMapper.updateSavingsGoal(request, goalToUpdate);

        return savingsGoalMapper.toResponse(goalToUpdate);
    }

    private SavingsGoalStatus parseStatus(String status) {
        if(status == null || status.isBlank()) {
            return null;
        }
        try {
            return SavingsGoalStatus.valueOf(status.toUpperCase(Locale.ROOT));
        }catch(IllegalArgumentException e) {
            throw new BusinessRuleException(
                    "Invalid status '%s'. Allowed values '%s'"
                            .formatted(status, Arrays.toString(SavingsGoalStatus.values()))
            );
        }
    }

    private void assertAcceptSavings(SavingsGoal goal) {
        if(!VALID_STATUSES.contains(goal.getStatus())) {
            throw new BusinessRuleException(
                    "Cannot add savings to a goal with status '%s'".formatted(goal.getStatus())
            );
        }
    }

    private SavingsGoal findOrThrowById(Long id) {
        return savingsGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal record does not exist"));
    }
}
