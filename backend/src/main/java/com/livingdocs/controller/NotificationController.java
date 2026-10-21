package com.livingdocs.controller;

import com.livingdocs.payload.DriftAlertRequest;
import com.livingdocs.service.ZaloNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private ZaloNotificationService zaloNotificationService;

    @PostMapping("/zalo/drift-alert")
    public ResponseEntity<?> sendDriftAlert(@RequestBody DriftAlertRequest request) {
        String result = zaloNotificationService.sendDriftAlertAndApproval(request);
        return ResponseEntity.ok(result);
    }
}