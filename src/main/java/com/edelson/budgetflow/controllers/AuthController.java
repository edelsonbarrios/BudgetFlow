package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.auth.AuthService;
import com.edelson.budgetflow.dtos.requests.GoogleLoginRequest;
import com.edelson.budgetflow.dtos.responses.AuthResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public AuthResponse loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.loginWithGoogle(request);
    }
}