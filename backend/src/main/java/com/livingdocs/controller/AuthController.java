package com.livingdocs.controller;

import com.livingdocs.model.ERole;
import com.livingdocs.model.User;
import com.livingdocs.model.Role;
import com.livingdocs.payload.request.LoginRequest;
import com.livingdocs.payload.request.SignupRequest;
import com.livingdocs.payload.response.JwtResponse;
import com.livingdocs.payload.response.MessageResponse;
import com.livingdocs.repository.RoleRepository;
import com.livingdocs.repository.UserRepository;
import com.livingdocs.service.UserDetailsImpl;
import com.livingdocs.util.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authManager;
    @Autowired
    UserRepository userRepo;
    @Autowired
    RoleRepository roleRepo;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest req) {
        Authentication auth;
        try {
            auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: Sai ten dang nhap hoac mat khau!"));
        }
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetailsImpl user = (UserDetailsImpl) auth.getPrincipal();
        List<String> roles = user.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        String jwt = jwtUtils.generateJwtToken(auth);
        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User(req.getUsername(), req.getEmail(), encoder.encode(req.getPassword()));

        // Người dùng tự đăng ký luôn là DEVELOPER.
        // Các vai trò cao hơn do Admin gán qua PUT /api/users/{id}/roles.
        Role developerRole = roleRepo.findByName(ERole.DEVELOPER)
                .orElseThrow(() -> new RuntimeException("Error: Role DEVELOPER not found."));
        user.setRoles(Set.of(developerRole));

        userRepo.save(user);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
