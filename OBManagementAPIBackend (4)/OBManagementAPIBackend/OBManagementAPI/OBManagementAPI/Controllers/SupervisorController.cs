//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using OBManagementAPI.Models;

//namespace OBManagementAPI.Controllers
//{
//    // ---------------------------------------------------------------------------
//    // SupervisorController
//    // Handles all Supervisor related APIs.
//    //
//    // APIs:
//    //   1. GET api/supervisor/dashboard  → counts + full list of everything
//    //   2. GET api/supervisor/floors     → all floors with offices
//    //   3. GET api/supervisor/officeboys → all officeboys
//    //   4. GET api/supervisor/faculty    → all faculty with office info
//    // ---------------------------------------------------------------------------

//    [Route("api/[controller]")]
//    [ApiController]
//    public class SupervisorController : ControllerBase
//    {
//        // Database connection injected automatically by .NET
//        private readonly ObmanagementContext _context;

//        public SupervisorController(ObmanagementContext context)
//        {
//            _context = context;
//        }

//        // -----------------------------------------------------------------------
//        // GET api/supervisor/dashboard
//        //
//        // PURPOSE:
//        //   Returns total counts AND full data for floors, offices,
//        //   officeboys and faculty all in one response.
//        //   Supervisor sees counts on cards and full lists below.
//        //
//        // RESPONSE (200):
//        //   {
//        //     "totalFloors":     4,
//        //     "totalOffices":    8,
//        //     "totalOfficeBoys": 4,
//        //     "totalFaculty":    4,
//        //     "floors":     [ { "floorId": 1, "floorNumber": 1, "offices": [...] } ],
//        //     "officeboys": [ { "id": 1, "name": "Ali Raza" } ],
//        //     "faculty":    [ { "id": 5, "name": "Dr. Ayesha", "office": "CS Dept", "floor": 1 } ]
//        //   }
//        // -----------------------------------------------------------------------
//        [HttpGet("dashboard")]
//        public async Task<IActionResult> GetDashboard()
//        {
//            // Count total floors
//            var totalFloors = await _context.BuildingFloors.CountAsync();

//            // Count total offices
//            var totalOffices = await _context.Offices.CountAsync();

//            // Count OfficeBoys (Role = 1)
//            var totalOfficeBoys = await _context.Accounts
//                .CountAsync(a => a.Role == 1);

//            // Count Faculty (Role = 2)
//            var totalFaculty = await _context.Accounts
//                .CountAsync(a => a.Role == 2);

//            // Get full list of all floors with their offices
//            var floors = await _context.BuildingFloors
//                .Select(f => new
//                {
//                    floorId = f.Id,
//                    floorNumber = f.Number,
//                    offices = f.Offices.Select(o => new
//                    {
//                        id = o.Id,
//                        name = o.OfficeName
//                    }).ToList()
//                })
//                .ToListAsync();

//            // Get full list of all OfficeBoys
//            var officeboys = await _context.Accounts
//                .Where(a => a.Role == 1)
//                .Select(a => new
//                {
//                    id = a.Id,
//                    name = a.Name
//                })
//                .ToListAsync();

//            // Get full list of all Faculty with their office and floor
//            var faculty = await _context.Accounts
//                .Where(a => a.Role == 2)
//                .Select(a => new
//                {
//                    id = a.Id,
//                    name = a.Name,
//                    office = a.FacultyMemberOffices
//                                .Select(f => f.Office.OfficeName)
//                                .FirstOrDefault(),
//                    floor = a.FacultyMemberOffices
//                                .Select(f => f.Office.BuildingFloor.Number)
//                                .FirstOrDefault()
//                })
//                .ToListAsync();

//            // Return everything in one response
//            return Ok(new
//            {
//                totalFloors = totalFloors,
//                totalOffices = totalOffices,
//                totalOfficeBoys = totalOfficeBoys,
//                totalFaculty = totalFaculty,
//                floors = floors,
//                officeboys = officeboys,
//                faculty = faculty
//            });
//        }

//        // -----------------------------------------------------------------------
//        // GET api/supervisor/floors
//        //
//        // PURPOSE:
//        //   Returns all floors with offices inside each floor.
//        //   Called when Supervisor clicks on the Floors card.
//        //
//        // RESPONSE (200):
//        //   [
//        //     {
//        //       "floorId": 1,
//        //       "floorNumber": 1,
//        //       "offices": [
//        //         { "id": 1, "name": "CS Department Office" },
//        //         { "id": 2, "name": "Admin Office" }
//        //       ]
//        //     }
//        //   ]
//        // -----------------------------------------------------------------------
//        [HttpGet("floors")]
//        public async Task<IActionResult> GetFloors()
//        {
//            var floors = await _context.BuildingFloors
//                .Select(f => new
//                {
//                    floorId = f.Id,
//                    floorNumber = f.Number,
//                    //    offices = f.Offices.Select(o => new
//                    //    {
//                    //        id = o.Id,
//                    //        name = o.OfficeName
//                    //    }).ToList()
//                })
//                .ToListAsync();

//            return Ok(floors);
//        }
//        [HttpGet("FloorOffices")]

//        public async Task<IActionResult> GetFloorOffices(int id)
//        {
//            var floorOffices = await _context.Offices
//                .Where(f => f.BuildingFloorId == id)
//                .Select(f => new
//                {
//                    OfficeName = f.OfficeName
//                })
//                .ToListAsync();

//            if (floorOffices == null || !floorOffices.Any())
//                return NotFound();

//            return Ok(floorOffices);
//        }

//        // -----------------------------------------------------------------------
//        // GET api/supervisor/officeboys
//        //
//        // PURPOSE:
//        //   Returns all OfficeBoys with their assigned floors.
//        //   Called when Supervisor clicks on the OfficeBoys card.
//        //
//        // RESPONSE (200):
//        //   [
//        //     {
//        //       "id":             1,
//        //       "name":           "Ali Raza",
//        //       "assignedFloors": [1, 2],
//        //       "assignedOffices": ["CS Department Office", "Admin Office"]
//        //     }
//        //   ]
//        // -----------------------------------------------------------------------
//        [HttpGet("officeboys")]
//        public async Task<IActionResult> GetOfficeBoys()
//        {
//            var officeboys = await _context.Accounts
//                .Where(a => a.Role == 1)
//                .Select(a => new
//                {
//                    id = a.Id,
//                    name = a.Name,
//                    // List of floor numbers assigned to this officeboy
//                    assignedFloors = a.OfficeBoyAssignedFloors
//                        .Select(f => f.Floor.Number)
//                        .Distinct()
//                        .ToList(),
//                    // List of office names assigned to this officeboy
//                    //assignedOffices = a.OfficeBoyAssignedFloors
//                    //    .Select(f => f.Office.OfficeName)
//                    //    .ToList()
//                })
//                .ToListAsync();

//            return Ok(officeboys);
//        }

//        // -----------------------------------------------------------------------
//        // GET api/supervisor/faculty
//        //
//        // PURPOSE:
//        //   Returns all Faculty members with their office and floor info.
//        //   Called when Supervisor clicks on the Faculty card.
//        //
//        // RESPONSE (200):
//        //   [
//        //     {
//        //       "id":     5,
//        //       "name":   "Dr. Ayesha Noor",
//        //       "office": "CS Department Office",
//        //       "floor":  1
//        //     }
//        //   ]
//        // -----------------------------------------------------------------------
//        [HttpGet("faculty")]
//        public async Task<IActionResult> GetFaculty()
//        {
//            var faculty = await _context.Accounts
//                .Where(a => a.Role == 2)
//                .Select(a => new
//                {
//                    id = a.Id,
//                    name = a.Name,
//                    office = a.FacultyMemberOffices
//                                .Select(f => f.Office.OfficeName)
//                                .FirstOrDefault(),
//                    floor = a.FacultyMemberOffices
//                                .Select(f => f.Office.BuildingFloor.Number)
//                                .FirstOrDefault()
//                })
//                .ToListAsync();

//            return Ok(faculty);
//        }
//    }
//}







using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OBManagementAPI.Models;

namespace OBManagementAPI.Controllers
{
    // ---------------------------------------------------------------------------
    // SupervisorController
    // Handles all Supervisor related APIs.
    //
    // APIs:
    //   1. GET api/supervisor/dashboard  → counts + full list of everything
    //   2. GET api/supervisor/floors     → all floors with offices
    //   3. GET api/supervisor/officeboys → all officeboys
    //   4. GET api/supervisor/faculty    → all faculty with office info
    //   5. GET api/supervisor/floor/{floorId}/offices → offices on a floor (Reassign picker)
    //   6. PUT api/supervisor/officeboys/{id}/reassign → move officeboy to new floor/office
    // ---------------------------------------------------------------------------

    [Route("api/[controller]")]
    [ApiController]
    public class SupervisorController : ControllerBase
    {
        // Database connection injected automatically by .NET
        private readonly ObmanagementContext _context;

        public SupervisorController(ObmanagementContext context)
        {
            _context = context;
        }

        // -----------------------------------------------------------------------
        // GET api/supervisor/dashboard
        //
        // PURPOSE:
        //   Returns total counts AND full data for floors, offices,
        //   officeboys and faculty all in one response.
        //   Supervisor sees counts on cards and full lists below.
        //
        // RESPONSE (200):
        //   {
        //     "totalFloors":     4,
        //     "totalOffices":    8,
        //     "totalOfficeBoys": 4,
        //     "totalFaculty":    4,
        //     "floors":     [ { "floorId": 1, "floorNumber": 1, "offices": [...] } ],
        //     "officeboys": [ { "id": 1, "name": "Ali Raza" } ],
        //     "faculty":    [ { "id": 5, "name": "Dr. Ayesha", "office": "CS Dept", "floor": 1 } ]
        //   }
        // -----------------------------------------------------------------------
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            // Count total floors
            var totalFloors = await _context.BuildingFloors.CountAsync();

            // Count total offices
            var totalOffices = await _context.Offices.CountAsync();

            // Count OfficeBoys (Role = 1)
            var totalOfficeBoys = await _context.Accounts
                .CountAsync(a => a.Role == 1);

            // Count Faculty (Role = 2)
            var totalFaculty = await _context.Accounts
                .CountAsync(a => a.Role == 2);

            // Get full list of all floors with their offices
            var floors = await _context.BuildingFloors
                .Select(f => new
                {
                    floorId = f.Id,
                    floorNumber = f.Number,
                    offices = f.Offices.Select(o => new
                    {
                        id = o.Id,
                        name = o.OfficeName
                    }).ToList()
                })
                .ToListAsync();

            // Get full list of all OfficeBoys
            var officeboys = await _context.Accounts
                .Where(a => a.Role == 1)
                .Select(a => new
                {
                    id = a.Id,
                    name = a.Name
                })
                .ToListAsync();

            // Get full list of all Faculty with their office and floor
            var faculty = await _context.Accounts
                .Where(a => a.Role == 2)
                .Select(a => new
                {
                    id = a.Id,
                    name = a.Name,
                    office = a.FacultyMemberOffices
                                .Select(f => f.Office.OfficeName)
                                .FirstOrDefault(),
                    floor = a.FacultyMemberOffices
                                .Select(f => f.Office.BuildingFloor.Number)
                                .FirstOrDefault()
                })
                .ToListAsync();

            // Return everything in one response
            return Ok(new
            {
                totalFloors = totalFloors,
                totalOffices = totalOffices,
                totalOfficeBoys = totalOfficeBoys,
                totalFaculty = totalFaculty,
                floors = floors,
                officeboys = officeboys,
                faculty = faculty
            });
        }

        // -----------------------------------------------------------------------
        // GET api/supervisor/floors
        //
        // PURPOSE:
        //   Returns all floors with offices inside each floor.
        //   Called when Supervisor clicks on the Floors card.
        //
        // RESPONSE (200):
        //   [
        //     {
        //       "floorId": 1,
        //       "floorNumber": 1,
        //       "offices": [
        //         { "id": 1, "name": "CS Department Office" },
        //         { "id": 2, "name": "Admin Office" }
        //       ]
        //     }
        //   ]
        // -----------------------------------------------------------------------
        [HttpGet("floors")]
        public async Task<IActionResult> GetFloors()
        {
            var floors = await _context.BuildingFloors
                .Select(f => new
                {
                    floorId = f.Id,
                    floorNumber = f.Number,
                    //    offices = f.Offices.Select(o => new
                    //    {
                    //        id = o.Id,
                    //        name = o.OfficeName
                    //    }).ToList()
                })
                .ToListAsync();

            return Ok(floors);
        }
        [HttpGet("FloorOffices")]

        public async Task<IActionResult> GetFloorOffices(int id)
        {
            var floorOffices = await _context.Offices
                .Where(f => f.BuildingFloorId == id)
                .Select(f => new
                {
                    OfficeName = f.OfficeName
                })
                .ToListAsync();

            if (floorOffices == null || !floorOffices.Any())
                return NotFound();

            return Ok(floorOffices);
        }

        // -----------------------------------------------------------------------
        // GET api/supervisor/floor/{floorId}/offices
        //
        // PURPOSE:
        //   Returns offices (with Id) on a given floor. Used by the
        //   "Reassign Office Boy" picker (Rotation/Replacement feature).
        //
        // RESPONSE (200):
        //   [ { "id": 3, "name": "CS Department Office" } ]
        // -----------------------------------------------------------------------
        [HttpGet("floor/{floorId}/offices")]
        public async Task<IActionResult> GetOfficesByFloor(int floorId)
        {
            var offices = await _context.Offices
                .Where(o => o.BuildingFloorId == floorId)
                .Select(o => new
                {
                    id = o.Id,
                    name = o.OfficeName
                })
                .ToListAsync();

            return Ok(offices);
        }

        // -----------------------------------------------------------------------
        // PUT api/supervisor/officeboys/{id}/reassign
        //
        // PURPOSE:
        //   Rotation / Replacement — moves an OfficeBoy to a different
        //   Floor + Office. Old assignment(s) are marked Inactive, a new
        //   Active assignment row is created.
        //
        // REQUEST BODY:
        //   { "floorId": 2, "officeId": 5 }
        //
        // RESPONSE (200): { "message": "Office boy reassigned successfully" }
        // RESPONSE (400): { "message": "OfficeBoy not found" }
        // -----------------------------------------------------------------------
        [HttpPut("officeboys/{id}/reassign")]
        public async Task<IActionResult> ReassignOfficeBoy(int id, [FromBody] ReassignRequest request)
        {
            var officeBoy = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == id && a.Role == 1);
            if (officeBoy == null)
                return BadRequest(new { message = "OfficeBoy not found" });

            var office = await _context.Offices
                .FirstOrDefaultAsync(o => o.Id == request.OfficeId && o.BuildingFloorId == request.FloorId);
            if (office == null)
                return BadRequest(new { message = "Office not found on this floor" });

            // Purani active assignment(s) ko Inactive kar dein
            var oldAssignments = await _context.OfficeBoyAssignedFloors
                .Where(f => f.OfficeBoyAccountId == id && f.Status == "Active")
                .ToListAsync();
            foreach (var old in oldAssignments)
            {
                old.Status = "Inactive";
            }

            // Nayi active assignment banayein
            _context.OfficeBoyAssignedFloors.Add(new OfficeBoyAssignedFloor
            {
                FloorId = request.FloorId,
                OfficeId = request.OfficeId,
                OfficeBoyAccountId = id,
                Status = "Active"
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Office boy reassigned successfully" });
        }

        // -----------------------------------------------------------------------
        // GET api/supervisor/officeboys
        //
        // PURPOSE:
        //   Returns all OfficeBoys with their assigned floors.
        //   Called when Supervisor clicks on the OfficeBoys card.
        //
        // RESPONSE (200):
        //   [
        //     {
        //       "id":             1,
        //       "name":           "Ali Raza",
        //       "assignedFloors": [1, 2],
        //       "assignedOffices": ["CS Department Office", "Admin Office"]
        //     }
        //   ]
        // -----------------------------------------------------------------------
        [HttpGet("officeboys")]
        public async Task<IActionResult> GetOfficeBoys()
        {
            var officeboys = await _context.Accounts
                .Where(a => a.Role == 1)
                .Select(a => new
                {
                    id = a.Id,
                    name = a.Name,
                    // List of floor numbers assigned to this officeboy
                    assignedFloors = a.OfficeBoyAssignedFloors
                        .Select(f => f.Floor.Number)
                        .Distinct()
                        .ToList(),
                    // List of office names assigned to this officeboy
                    //assignedOffices = a.OfficeBoyAssignedFloors
                    //    .Select(f => f.Office.OfficeName)
                    //    .ToList()
                })
                .ToListAsync();

            return Ok(officeboys);
        }

        // -----------------------------------------------------------------------
        // GET api/supervisor/faculty
        //
        // PURPOSE:
        //   Returns all Faculty members with their office and floor info.
        //   Called when Supervisor clicks on the Faculty card.
        //
        // RESPONSE (200):
        //   [
        //     {
        //       "id":     5,
        //       "name":   "Dr. Ayesha Noor",
        //       "office": "CS Department Office",
        //       "floor":  1
        //     }
        //   ]
        // -----------------------------------------------------------------------
        [HttpGet("faculty")]
        public async Task<IActionResult> GetFaculty()
        {
            var faculty = await _context.Accounts
                .Where(a => a.Role == 2)
                .Select(a => new
                {
                    id = a.Id,
                    name = a.Name,
                    office = a.FacultyMemberOffices
                                .Select(f => f.Office.OfficeName)
                                .FirstOrDefault(),
                    floor = a.FacultyMemberOffices
                                .Select(f => f.Office.BuildingFloor.Number)
                                .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(faculty);
        }
    }

    // ---------------------------------------------------------------------------
    // ReassignRequest — request body for PUT api/supervisor/officeboys/{id}/reassign
    // ---------------------------------------------------------------------------
    public class ReassignRequest
    {
        public int FloorId { get; set; }
        public int OfficeId { get; set; }
    }
}