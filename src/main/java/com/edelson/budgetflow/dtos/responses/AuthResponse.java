package com.edelson.budgetflow.dtos.responses;

public record AuthResponse(
        String token,
        String email,
        String name,
        String pictureUrl
) { }
