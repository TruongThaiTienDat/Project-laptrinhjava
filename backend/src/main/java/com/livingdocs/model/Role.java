package com.livingdocs.model;

import jakarta.persistence.*;

/**
 * Bảng roles trong cơ sở dữ liệu.
 * Bản gốc để Role là enum nhưng controller lại dùng như entity nên không biên dịch được.
 */
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, unique = true, nullable = false)
    private ERole name;

    public Role() {
    }

    public Role(ERole name) {
        this.name = name;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public ERole getName() { return name; }
    public void setName(ERole name) { this.name = name; }
}

