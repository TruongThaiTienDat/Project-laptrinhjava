package com.livingdocs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Lớp khởi động của backend LivingDocs.
 * Bản gốc chưa có lớp này nên Spring Boot không thể chạy.
 */
@SpringBootApplication
public class LivingDocsApplication {
    public static void main(String[] args) {
        SpringApplication.run(LivingDocsApplication.class, args);
    }
}
