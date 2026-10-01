using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // <--- Yeh line sabse zaroori hai errors khatam karne ke liye
using OBManagementAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OBManagementAPI.Controllers
{
    [ApiController]
    [Route("api/tracking")]
    public class TrackingController : ControllerBase
    {
        private readonly ObmanagementContext _context;

        // University ki boundary
        private const double UNIVERSITY_LAT = 33.6007;
        private const double UNIVERSITY_LNG = 73.0679;
        private const double UNIVERSITY_RADIUS_METERS = 300;

        public TrackingController(ObmanagementContext context)
        {
            _context = context;
        }

        // ─── 1. Office Boy apni location share kare ───────────
        [HttpPost("ob-location")]
        public async Task<IActionResult> UpdateOfficeBoyLocation([FromBody] OBLocationRequest req)
        {
            var existing = await _context.OfficeBoyLocations
                .FirstOrDefaultAsync(x => x.OfficeBoyAccountId == req.OfficeBoyAccountId && x.TaskId == req.TaskId);

            if (existing != null)
            {
                existing.CurrentLatitude = req.CurrentLatitude;
                existing.CurrentLongitude = req.CurrentLongitude; //dotnet restore
                existing.LocationName = req.LocationName;
                existing.UpdatedAt = DateTime.Now;
            }
            else
            {
                _context.OfficeBoyLocations.Add(new OfficeBoyLocation
                {
                    OfficeBoyAccountId = req.OfficeBoyAccountId,
                    TaskId = req.TaskId,
                    CurrentLatitude = req.CurrentLatitude,
                    CurrentLongitude = req.CurrentLongitude,
                    LocationName = req.LocationName,
                    UpdatedAt = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Location updated" });
        }

        // ─── 2. Faculty apne floor ke OB ki location dekhe ───
        [HttpGet("ob-locations/{facultyId}")]
        public async Task<IActionResult> GetOBLocationsForFaculty(int facultyId)
        {
            // Fix: Faculty ka floor nikalne ke liye FacultyMemberOffice use kiya
            var facultyOfficeInfo = await _context.FacultyMemberOffices
                .Include(fmo => fmo.Office)
                .FirstOrDefaultAsync(fmo => fmo.FacultyAccountId == facultyId);

            if (facultyOfficeInfo == null)
                return NotFound(new { message = "Faculty office not assigned" });

            var facultyFloorId = facultyOfficeInfo.Office.BuildingFloorId;

            // Us floor ke sare OBs ki locations
            var locations = await _context.OfficeBoyLocations
                .Include(l => l.OfficeBoyAccount)
                .Include(l => l.Task)
                .Where(l => l.OfficeBoyAccount.OfficeBoyAssignedFloors.Any(f => f.FloorId == facultyFloorId))
                .Select(l => new
                {
                    officeBoyId = l.OfficeBoyAccountId,
                    officeBoyName = l.OfficeBoyAccount.Name,
                    taskId = l.TaskId,
                    taskDesc = l.Task.Description,
                    locationName = l.LocationName,
                    latitude = l.CurrentLatitude,
                    longitude = l.CurrentLongitude,
                    updatedAt = l.UpdatedAt
                })
                .ToListAsync();

            return Ok(locations);
        }

        // ─── 3. Faculty Arrival/Departure task set kare ───────
        [HttpPost("faculty-task")]
        public async Task<IActionResult> SetFacultyTask([FromBody] FacultyTaskRequest req)
        {
            var existing = await _context.FacultyTrackings
                .FirstOrDefaultAsync(f => f.FacultyAccountId == req.FacultyAccountId && f.TaskType == req.TaskType);

            if (existing != null)
            {
                existing.SelectedLatitude = req.SelectedLatitude;
                existing.SelectedLongitude = req.SelectedLongitude;
                existing.UpdatedAt = DateTime.Now;
            }
            else
            {
                _context.FacultyTrackings.Add(new FacultyTracking
                {
                    FacultyAccountId = req.FacultyAccountId,
                    TaskType = req.TaskType,
                    TaskDescription = req.TaskDescription,
                    SelectedLatitude = req.SelectedLatitude,
                    SelectedLongitude = req.SelectedLongitude,
                    IsInsideRegion = false,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Faculty task saved" });
        }

        // ─── 4. Region check — teacher andar hai ya bahar ─────
        [HttpPost("check-region")]
        public async Task<IActionResult> CheckRegion([FromBody] RegionCheckRequest req)
        {
            var distanceMeters = CalculateDistance(req.CurrentLatitude, req.CurrentLongitude, UNIVERSITY_LAT, UNIVERSITY_LNG);
            var isInside = distanceMeters <= UNIVERSITY_RADIUS_METERS;

            var tracking = await _context.FacultyTrackings
                .Where(f => f.FacultyAccountId == req.FacultyAccountId)
                .OrderByDescending(f => f.UpdatedAt)
                .FirstOrDefaultAsync();

            if (tracking != null)
            {
                tracking.IsInsideRegion = isInside;
                tracking.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                isInsideRegion = isInside,
                distanceMeters = Math.Round(distanceMeters, 2),
                message = isInside ? "Teacher is inside university" : "Teacher is outside university"
            });
        }

        // ─── 5. Faculty ka active task nikalo ─────────────────
        [HttpGet("faculty-task/{facultyId}")]
        public async Task<IActionResult> GetFacultyTask(int facultyId)
        {
            var tasks = await _context.FacultyTrackings
                .Where(f => f.FacultyAccountId == facultyId)
                .OrderByDescending(f => f.UpdatedAt)
                .Select(f => new
                {
                    id = f.Id,
                    taskType = f.TaskType,
                    taskDescription = f.TaskDescription,
                    latitude = f.SelectedLatitude,
                    longitude = f.SelectedLongitude,
                    isInsideRegion = f.IsInsideRegion,
                    updatedAt = f.UpdatedAt
                })
                .ToListAsync();

            return Ok(tasks);
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000;
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRad(double deg) => deg * Math.PI / 180;
    }

    // Models niche bilkul sahi hain
    public class OBLocationRequest { public int OfficeBoyAccountId { get; set; } public int TaskId { get; set; } public double CurrentLatitude { get; set; } public double CurrentLongitude { get; set; } public string LocationName { get; set; } }
    public class FacultyTaskRequest { public int FacultyAccountId { get; set; } public string TaskType { get; set; } public string TaskDescription { get; set; } public double SelectedLatitude { get; set; } public double SelectedLongitude { get; set; } }
    public class RegionCheckRequest { public int FacultyAccountId { get; set; } public double CurrentLatitude { get; set; } public double CurrentLongitude { get; set; } }
}