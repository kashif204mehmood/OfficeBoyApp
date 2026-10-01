using System;

namespace OBManagementAPI.Models;

public partial class LeaveRequest
{
    public int Id { get; set; }

    public int OfficeBoyAccountId { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string Reason { get; set; } = null!;

    public string Status { get; set; } = "Pending"; // Pending | Approved | Rejected

    public string? SupervisorRemarks { get; set; }

    public DateTime? RequestedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    // ── Replacement / Rotation ──────────────────────────────
    public int? ReplacementOfficeBoyId { get; set; }

    public int? OriginalFloorId { get; set; }

    public int? OriginalOfficeId { get; set; }

    public bool IsRestored { get; set; } = false;
    // ──────────────────────────────────────────────────────
}
