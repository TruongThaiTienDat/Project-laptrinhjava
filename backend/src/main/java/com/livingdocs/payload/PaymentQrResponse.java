package com.livingdocs.payload;

public class PaymentQrResponse {
    private String transactionId;
    private String qrCodeUrl;
    private Long amount;
    private String transferContent;
    private String status;

    public PaymentQrResponse(String transactionId, String qrCodeUrl, Long amount, String transferContent, String status) {
        this.transactionId = transactionId;
        this.qrCodeUrl = qrCodeUrl;
        this.amount = amount;
        this.transferContent = transferContent;
        this.status = status;
    }

    public String getTransactionId() { return transactionId; }
    public String getQrCodeUrl() { return qrCodeUrl; }
    public Long getAmount() { return amount; }
    public String getTransferContent() { return transferContent; }
    public String getStatus() { return status; }
}