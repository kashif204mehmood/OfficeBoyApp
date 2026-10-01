using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OBManagementAPI.Models;

namespace OBManagementAPI.Controllers
{
    // ---------------------------------------------------------------------------
    // LeaveController
    // Handles Leave Request APIs, including Replacement/Rotation.
    //
    // APIs:
    //   1. POST api/leave                     → OfficeBoy submits a leave request
    //   2. GET  api/leave/officeboy/{id}       → OfficeBoy sees his own requests
    //   3. GET  api/leave/pending              → Supervisor sees pending requests
    //   4. GET  api/leave                      → Supervisor sees all requests (history)
    //   5. PUT  api/leave/{id}/approve         → Supervisor approves + assigns replacement
    //   6. PUT  api/leave/{id}/reject          → Supervisor rejects
    //   7. PUT  api/leave/{id}/restore         → Supervisor restores original assignment
    // ---------------------------------------------------------------------------

    [Route("api/[controller]")]
    [ApiController]
    public class LeaveController : ControllerBase
    {
        private readonly ObmanagementContext _context;

        public LeaveController(ObmanagementContext context)
        {
            _context = context;
        }

        // -----------------------------------------------------------------------
        // POST api/leave
        // -----------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> CreateLeaveRequest([FromBody] CreateLeaveRequest request)
        {
            var officeBoy = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == request.OfficeBoyAccountId && a.Role == 1);
            if (officeBoy == null)
                return BadRequest(new { message = "OfficeBoy not found" });

            if (request.ToDate < request.FromDate)
                return BadRequest(new { message = "To Date cannot be before From Date" });

            var leave = new LeaveRequest
            {
                OfficeBoyAccountId = request.OfficeBoyAccountId,
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                Reason = request.Reason,
                Status = "Pending",
                RequestedAt = DateTime.Now
            };

            _context.LeaveRequests.Add(leave);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave request submitted successfully", leaveId = leave.Id });
        }

        // -----------------------------------------------------------------------
        // GET api/leave/officeboy/{id}
        // -----------------------------------------------------------------------
        [HttpGet("officeboy/{id}")]
        public async Task<IActionResult> GetLeavesByOfficeBoy(int id)
        {
            var leaves = await _context.LeaveRequests
                .Where(l => l.OfficeBoyAccountId == id)
                .OrderByDescending(l => l.RequestedAt)
                .Select(l => new
                {
                    leaveId = l.Id,
                    fromDate = l.FromDate,
                    toDate = l.ToDate,
                    reason = l.Reason,
                    status = l.Status,
                    supervisorRemarks = l.SupervisorRemarks,
                    requestedAt = l.RequestedAt,
                    reviewedAt = l.ReviewedAt,
                    isRestored = l.IsRestored
                })
                .ToListAsync();

            return Ok(leaves);
        }

        // -----------------------------------------------------------------------
        // GET api/leave/pending
        // -----------------------------------------------------------------------
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingLeaves()
        {
            var leaves = await _context.LeaveRequests
                .Where(l => l.Status == "Pending")
                .OrderBy(l => l.FromDate)
                .Join(_context.Accounts,
                    l => l.OfficeBoyAccountId,
                    a => a.Id,
                    (l, a) => new
                    {
                        leaveId = l.Id,
                        officeBoyId = a.Id,
                        officeBoyName = a.Name,
                        fromDate = l.FromDate,
                        toDate = l.ToDate,
                        reason = l.Reason,
                        status = l.Status,
                        requestedAt = l.RequestedAt
                    })
                .ToListAsync();

            return Ok(leaves);
        }

        // -----------------------------------------------------------------------
        // GET api/leave
        // Supervisor ki taraf se saari requests (history)
        // -----------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllLeaves()
        {
            var leaves = await _context.LeaveRequests
                .OrderByDescending(l => l.RequestedAt)
                .Join(_context.Accounts,
                    l => l.OfficeBoyAccountId,
                    a => a.Id,
                    (l, a) => new { l, officeBoyName = a.Name })
                .ToListAsync();

            // Replacement office boy ka naam bhi laga dein (agar hai)
            var replacementIds = leaves
                .Where(x => x.l.ReplacementOfficeBoyId != null)
                .Select(x => x.l.ReplacementOfficeBoyId!.Value)
                .Distinct()
                .ToList();

            var replacementNames = await _context.Accounts
                .Where(a => replacementIds.Contains(a.Id))
                .ToDictionaryAsync(a => a.Id, a => a.Name);

            var result = leaves.Select(x => new
            {
                leaveId = x.l.Id,
                officeBoyId = x.l.OfficeBoyAccountId,
                officeBoyName = x.officeBoyName,
                fromDate = x.l.FromDate,
                toDate = x.l.ToDate,
                reason = x.l.Reason,
                status = x.l.Status,
                supervisorRemarks = x.l.SupervisorRemarks,
                requestedAt = x.l.RequestedAt,
                reviewedAt = x.l.ReviewedAt,
                replacementOfficeBoyId = x.l.ReplacementOfficeBoyId,
                replacementOfficeBoyName = x.l.ReplacementOfficeBoyId != null && replacementNames.ContainsKey(x.l.ReplacementOfficeBoyId.Value)
                    ? replacementNames[x.l.ReplacementOfficeBoyId.Value]
                    : null,
                isRestored = x.l.IsRestored
            });

            return Ok(result);
        }

        // -----------------------------------------------------------------------
        // PUT api/leave/{id}/approve
        //
        // PURPOSE:
        //   Approves the leave. If a replacementOfficeBoyId is given:
        //     - Remembers the leaving officeboy's current floor/office
        //     - Deactivates his assignment
        //     - Activates the replacement officeboy on that same floor/office
        //
        // REQUEST BODY (optional):
        //   { "remarks": "Approved", "replacementOfficeBoyId": 7 }
        // -----------------------------------------------------------------------
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveLeave(int id, [FromBody] ReviewLeaveRequest? request)
        {
            var leave = await _context.LeaveRequests.FindAsync(id);
            if (leave == null)
                return NotFound(new { message = "Leave request not found" });

            if (leave.Status != "Pending")
                return BadRequest(new { message = "Only pending requests can be reviewed" });

            leave.Status = "Approved";
            leave.SupervisorRemarks = request?.Remarks;
            leave.ReviewedAt = DateTime.Now;

            // Agar replacement diya gaya hai, to floor/office switch kar dein
            if (request?.ReplacementOfficeBoyId != null)
            {
                var replacementId = request.ReplacementOfficeBoyId.Value;

                var replacement = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Id == replacementId && a.Role == 1);
                if (replacement == null)
                    return BadRequest(new { message = "Replacement office boy not found" });

                // Jo office boy leave par ja raha hai, uski current assignment dhoondein
                var currentAssignment = await _context.OfficeBoyAssignedFloors
                    .FirstOrDefaultAsync(f => f.OfficeBoyAccountId == leave.OfficeBoyAccountId && f.Status == "Active");

                if (currentAssignment != null)
                {
                    // Yaad rakhein taake baad mein restore kar sakein
                    leave.OriginalFloorId = currentAssignment.FloorId;
                    leave.OriginalOfficeId = currentAssignment.OfficeId;
                    leave.ReplacementOfficeBoyId = replacementId;

                    // Leave wale ki assignment band kar dein
                    currentAssignment.Status = "Inactive";

                    // Replacement ki purani active assignment (agar ho) bhi band kar dein
                    var replacementOldAssignments = await _context.OfficeBoyAssignedFloors
                        .Where(f => f.OfficeBoyAccountId == replacementId && f.Status == "Active")
                        .ToListAsync();
                    foreach (var old in replacementOldAssignments)
                        old.Status = "Inactive";

                    // Replacement ko usi floor/office par active kar dein
                    _context.OfficeBoyAssignedFloors.Add(new OfficeBoyAssignedFloor
                    {
                        FloorId = currentAssignment.FloorId,
                        OfficeId = currentAssignment.OfficeId,
                        OfficeBoyAccountId = replacementId,
                        Status = "Active"
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave request approved" });
        }

        // -----------------------------------------------------------------------
        // PUT api/leave/{id}/reject
        // -----------------------------------------------------------------------
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectLeave(int id, [FromBody] ReviewLeaveRequest? request)
        {
            var leave = await _context.LeaveRequests.FindAsync(id);
            if (leave == null)
                return NotFound(new { message = "Leave request not found" });

            if (leave.Status != "Pending")
                return BadRequest(new { message = "Only pending requests can be reviewed" });

            leave.Status = "Rejected";
            leave.SupervisorRemarks = request?.Remarks;
            leave.ReviewedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave request rejected" });
        }

        // -----------------------------------------------------------------------
        // PUT api/leave/{id}/restore
        //
        // PURPOSE:
        //   Leave khatam hone par: replacement ki assignment band karke,
        //   asal office boy ko wapis usi floor/office par active kar deta hai.
        // -----------------------------------------------------------------------
        [HttpPut("{id}/restore")]
        public async Task<IActionResult> RestoreAssignment(int id)
        {
            var leave = await _context.LeaveRequests.FindAsync(id);
            if (leave == null)
                return NotFound(new { message = "Leave request not found" });

            if (leave.Status != "Approved")
                return BadRequest(new { message = "Only approved leaves can be restored" });

            if (leave.IsRestored)
                return BadRequest(new { message = "This leave has already been restored" });

            if (leave.ReplacementOfficeBoyId == null || leave.OriginalFloorId == null || leave.OriginalOfficeId == null)
                return BadRequest(new { message = "No replacement was set for this leave" });

            // Replacement ki assignment band kar dein
            var replacementAssignments = await _context.OfficeBoyAssignedFloors
                .Where(f => f.OfficeBoyAccountId == leave.ReplacementOfficeBoyId
                         && f.FloorId == leave.OriginalFloorId
                         && f.OfficeId == leave.OriginalOfficeId
                         && f.Status == "Active")
                .ToListAsync();
            foreach (var a in replacementAssignments)
                a.Status = "Inactive";

            // Asal office boy ko wapis active kar dein
            _context.OfficeBoyAssignedFloors.Add(new OfficeBoyAssignedFloor
            {
                FloorId = leave.OriginalFloorId.Value,
                OfficeId = leave.OriginalOfficeId.Value,
                OfficeBoyAccountId = leave.OfficeBoyAccountId,
                Status = "Active"
            });

            leave.IsRestored = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Original assignment restored" });
        }
    }

    // ---------------------------------------------------------------------------
    // CreateLeaveRequest — request body for POST api/leave
    // ---------------------------------------------------------------------------
    public class CreateLeaveRequest
    {
        public int OfficeBoyAccountId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string Reason { get; set; } = null!;
    }

    // ---------------------------------------------------------------------------
    // ReviewLeaveRequest — request body for approve/reject
    // ---------------------------------------------------------------------------
    public class ReviewLeaveRequest
    {
        public string? Remarks { get; set; }
        public int? ReplacementOfficeBoyId { get; set; }
    }
}