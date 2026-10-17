package com.livingdocs.model;

/**
 * Năm vai trò theo đề bài. Không có tiền tố ROLE_ ở đây,
 * tiền tố được thêm khi tạo quyền (authority) cho Spring Security.
 */
public enum ERole {
    DEVELOPER,
    STAFF,
    MANAGER,
    TECH_LEAD,
    ADMIN
}
