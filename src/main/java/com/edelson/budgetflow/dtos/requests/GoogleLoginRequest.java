package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest (
        @NotBlank
        String idToken
){ }
