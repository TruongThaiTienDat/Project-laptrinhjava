package com.livingdocs.service;

import com.livingdocs.payload.DriftAlertRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class ZaloNotificationService {

    @Autowired
    private WebClient zaloWebClient;

    @Value("${zalo.oa.access-token:DUMMY_TOKEN}")
    private String zaloAccessToken;

    public String sendDriftAlertAndApproval(DriftAlertRequest request) {
        Map<String, Object> body = new HashMap<>();

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("user_id", request.getUserZaloId());
        body.put("recipient", recipient);

        Map<String, Object> message = new HashMap<>();
        String textMessage = String.format(
                "⚠️ [CẢNH BÁO DRIFT HỆ THỐNG]\n\n" +
                        "Workspace: %s\n" +
                        "Chi tiết: %s\n\n" +
                        "Vui lòng truy cập liên kết sau để xem xét và PHÊ DUYỆT:\n%s",
                request.getWorkspaceName(),
                request.getDriftDetails(),
                request.getApprovalUrl()
        );
        message.put("text", textMessage);
        body.put("message", message);

        try {
            return zaloWebClient.post()
                    .uri("/message/cs")
                    .header("access_token", zaloAccessToken)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            return "Failed to send Zalo message: " + e.getMessage();
        }
    }
}
