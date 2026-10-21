package com.livingdocs.payload;

public class UpgradeSubscriptionRequest {
    private String workspaceId;
    private String packageCode; // Vd: "PRO", "ENTERPRISE"
    private Long amount;        // Số tiền (VND), vd: 199000

    public UpgradeSubscriptionRequest() {}

    public UpgradeSubscriptionRequest(String workspaceId, String packageCode, Long amount) {
        this.workspaceId = workspaceId;
        this.packageCode = packageCode;
        this.amount = amount;
    }

    public String getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(String workspaceId) { this.workspaceId = workspaceId; }

    public String getPackageCode() { return packageCode; }
    public void setPackageCode(String packageCode) { this.packageCode = packageCode; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }
}
