package com.livingdocs.controller;

import com.livingdocs.payload.PaymentQrResponse;
import com.livingdocs.payload.UpgradeSubscriptionRequest;
import com.livingdocs.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/upgrade")
    public ResponseEntity<PaymentQrResponse> createUpgradeQr(@RequestBody UpgradeSubscriptionRequest request) {
        PaymentQrResponse response = paymentService.generateUpgradeQr(request);
        return ResponseEntity.ok(response);
    }
}
