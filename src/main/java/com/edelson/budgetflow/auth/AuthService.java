package com.edelson.budgetflow.auth;

import com.edelson.budgetflow.dtos.requests.GoogleLoginRequest;
import com.edelson.budgetflow.dtos.responses.AuthResponse;
import com.edelson.budgetflow.entities.User;
import com.edelson.budgetflow.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(GoogleTokenVerifier googleTokenVerifier,
                       UserRepository userRepository,
                       JwtService jwtService) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.idToken());

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setName(name != null ? name : email);
        user.setPictureUrl(picture);
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getPictureUrl());
    }
}