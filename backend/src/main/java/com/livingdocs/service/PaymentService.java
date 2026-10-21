package com.livingdocs.service;

import com.livingdocs.payload.PaymentQrResponse;
import com.livingdocs.payload.UpgradeSubscriptionRequest;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class PaymentService {

    private static final String BANK_ID = "MB";
    private static final String ACCOUNT_NO = "0868532476";
    private static final String ACCOUNT_NAME = "LE THI THANH TUYEN";
    private static final String TEMPLATE = "compact2";

    public PaymentQrResponse generateUpgradeQr(UpgradeSubscriptionRequest request) {
        String transactionId = "TX" + System.currentTimeMillis();

        String transferContent = String.format("SUB %s %s %s",
                request.getWorkspaceId(),
                request.getPackageCode(),
                transactionId);

        String encodedContent = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);
        String encodedAccountName = URLEncoder.encode(ACCOUNT_NAME, StandardCharsets.UTF_8);

        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                BANK_ID, ACCOUNT_NO, TEMPLATE, request.getAmount(), encodedContent, encodedAccountName);

        return new PaymentQrResponse(transactionId, qrUrl, request.getAmount(), transferContent, "PENDING");
    }
}
