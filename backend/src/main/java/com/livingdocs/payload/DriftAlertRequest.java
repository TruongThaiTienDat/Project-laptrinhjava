package com.livingdocs.payload;

public class DriftAlertRequest {
    private String userZaloId;
    private String workspaceName;
    private String driftDetails;
    private String approvalUrl;

    public DriftAlertRequest() {}

    public String getUserZaloId() { return userZaloId; }
    public void setUserZaloId(String userZaloId) { this.userZaloId = userZaloId; }

    public String getWorkspaceName() { return workspaceName; }
    public void setWorkspaceName(String workspaceName) { this.workspaceName = workspaceName; }

    public String getDriftDetails() { return driftDetails; }
    public void setDriftDetails(String driftDetails) { this.driftDetails = driftDetails; }

    public String getApprovalUrl() { return approvalUrl; }
    public void setApprovalUrl(String approvalUrl) { this.approvalUrl = approvalUrl; }
}