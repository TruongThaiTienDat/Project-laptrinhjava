package com.livingdocs.payload.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

/** Dữ liệu Admin gửi lên khi gán vai trò cho một người dùng. */
public class UpdateRolesRequest {
    @NotEmpty
    private Set<String> roles;

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}
