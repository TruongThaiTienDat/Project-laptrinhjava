package com.livingdocs.controller;

import com.livingdocs.model.ERole;
import com.livingdocs.model.User;
import com.livingdocs.model.Role;
import com.livingdocs.payload.request.UpdateRolesRequest;
import com.livingdocs.payload.response.MessageResponse;
import com.livingdocs.repository.RoleRepository;
import com.livingdocs.repository.UserRepository;
import com.livingdocs.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserRepository userRepo;
    @Autowired
    RoleRepository roleRepo;

    // Xem thông tin của chính mình (cần đăng nhập)
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetailsImpl principal) {
        Set<String> roles = principal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(Map.of(
                "id", principal.getId(),
                "username", principal.getUsername(),
                "email", principal.getEmail(),
                "roles", roles));
    }

    // Chỉ ADMIN được đổi vai trò của người dùng khác
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRoles(@PathVariable Long id, @Valid @RequestBody UpdateRolesRequest req) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new MessageResponse("Error: User not found!"));
        }

        Set<Role> newRoles = new HashSet<>();
        for (String name : req.getRoles()) {
            ERole eRole;
            try {
                eRole = ERole.valueOf(name.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Role khong hop le: " + name));
            }
            Role role = roleRepo.findByName(eRole)
                    .orElseThrow(() -> new RuntimeException("Error: Role " + eRole + " not found."));
            newRoles.add(role);
        }

        user.setRoles(newRoles);
        userRepo.save(user);
        return ResponseEntity.ok(new MessageResponse("Cap nhat vai tro thanh cong!"));
    }
}

