package com.edelson.budgetflow.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(List.of(clientId)) // rejects tokens made for a different app
                .build();
    }

    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
            }

            return payload;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Could not verify Google token");
        }
    }
}