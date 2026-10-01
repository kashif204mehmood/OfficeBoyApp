using System;
using System.Collections.Generic;

namespace OBManagementAPI.Models;

public partial class FacultyTracking
{
    public int Id { get; set; }

    public int FacultyAccountId { get; set; }

    public string TaskType { get; set; } = null!;

    public string TaskDescription { get; set; } = null!;

    public double SelectedLatitude { get; set; }

    public double SelectedLongitude { get; set; }

    public bool? IsInsideRegion { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Account FacultyAccount { get; set; } = null!;
}
