//using System;
//using System.Collections.Generic;

//namespace OBManagementAPI.Models;

//public partial class Task
//{
//    public int Id { get; set; }

//    public int FacultyAccountId { get; set; }

//    public int OfficeBoyAccountId { get; set; }

//    public int LocationId { get; set; }

//    public string? Description { get; set; }

//    public int? Rating { get; set; }

//    public string? Remarks { get; set; }

//    public DateTime? TaskTime { get; set; }

//    public string Status { get; set; } = null!;

//    public virtual Account FacultyAccount { get; set; } = null!;

//    public virtual Location Location { get; set; } = null!;

//    public virtual Account OfficeBoyAccount { get; set; } = null!;

//    public virtual ICollection<OfficeBoyLocation> OfficeBoyLocations { get; set; } = new List<OfficeBoyLocation>();
//}




//new



using System;
using System.Collections.Generic;

namespace OBManagementAPI.Models;

public partial class Task
{
    public int Id { get; set; }

    public int FacultyAccountId { get; set; }

    public int OfficeBoyAccountId { get; set; }

    public int LocationId { get; set; }

    public string? Description { get; set; }

    public int? Rating { get; set; }

    public string? Remarks { get; set; }

    public DateTime? TaskTime { get; set; }

    public string Status { get; set; } = null!;

    // ── Geofence fields ──────────────────────────────────
    public string TaskMode { get; set; } = "Now"; // Now | Later | Geofence

    public string? GeofenceTrigger { get; set; } // IN | OUT

    public double? GeofenceRadius { get; set; }

    public double? GeofenceLatitude { get; set; }

    public double? GeofenceLongitude { get; set; }
    // ──────────────────────────────────────────────────────

    public virtual Account FacultyAccount { get; set; } = null!;

    public virtual Location Location { get; set; } = null!;

    public virtual Account OfficeBoyAccount { get; set; } = null!;

    public virtual ICollection<OfficeBoyLocation> OfficeBoyLocations { get; set; } = new List<OfficeBoyLocation>();
}
