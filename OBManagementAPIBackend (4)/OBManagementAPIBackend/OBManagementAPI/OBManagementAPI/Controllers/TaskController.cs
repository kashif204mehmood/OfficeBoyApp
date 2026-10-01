//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using OBManagementAPI.Models;

//namespace OBManagementAPI.Controllers
//{





//    // ---------------------------------------------------------------------------
//    // TasksController
//    // Handles all Task related APIs.
//    //
//    // APIs:
//    //   1. GET    api/tasks                  → Get all tasks
//    //   2. GET    api/tasks/{id}             → Get single task by ID
//    //   3. POST   api/tasks                  → Faculty creates a new task
//    //   4. PUT    api/tasks/{id}/complete    → OfficeBoy marks task as completed
//    //   5. PUT    api/tasks/{id}/rate        → Faculty rates a completed task
//    //   6. GET    api/tasks/pending          → Get all pending tasks
//    //   7. GET    api/tasks/completed        → Get all completed tasks
//    // ---------------------------------------------------------------------------

//    [Route("api/[controller]")]
//    [ApiController]
//    public class TasksController : ControllerBase
//    {
//        // Database connection injected automatically by .NET
//        private readonly ObmanagementContext _context;

//        public TasksController(ObmanagementContext context)
//        {
//            _context = context;
//        }

//        // -----------------------------------------------------------------------
//        // GET api/tasks
//        //
//        // PURPOSE:
//        //   Returns all tasks with full details.
//        //   Used by Supervisor to see every task in the system.
//        //
//        // RESPONSE (200):
//        //   [
//        //     {
//        //       "taskId":      1,
//        //       "description": "Print exam papers",
//        //       "location":    "Photocopy Room",
//        //       "faculty":     "Dr. Ayesha Noor",
//        //       "officeBoy":   "Ali Raza",
//        //       "status":      "Pending",
//        //       "taskTime":    "2025-01-10T09:00:00",
//        //       "rating":      null,
//        //       "remarks":     null
//        //     }
//        //   ]
//        // -----------------------------------------------------------------------
//        [HttpGet]
//        public async Task<IActionResult> GetAllTasks()
//        {
//            var tasks = await _context.Tasks
//                .Select(t => new
//                {
//                    taskId = t.Id,
//                    description = t.Description,
//                    location = t.Location.Name,          // from Location table
//                    faculty = t.FacultyAccount.Name,    // from Account table (Faculty)
//                    officeBoy = t.OfficeBoyAccount.Name,  // from Account table (OfficeBoy)
//                    status = t.Status,
//                    taskTime = t.TaskTime,
//                    rating = t.Rating,
//                    remarks = t.Remarks
//                })
//                .ToListAsync();

//            return Ok(tasks);
//        }

//        // -----------------------------------------------------------------------
//        // GET api/tasks/{id}
//        //
//        // PURPOSE:
//        //   Returns a single task by its ID with full details.
//        //   Used when clicking on a task to see its details.
//        //
//        // URL PARAM:
//        //   id → Task ID
//        //
//        // RESPONSE (200): single task object (same fields as GetAllTasks)
//        // RESPONSE (404): { "message": "Task not found" }
//        // -----------------------------------------------------------------------
//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetTaskById(int id)
//        {
//            var task = await _context.Tasks
//                .Where(t => t.Id == id)
//                .Select(t => new
//                {
//                    taskId = t.Id,
//                    description = t.Description,
//                    location = t.Location.Name,
//                    faculty = t.FacultyAccount.Name,
//                    officeBoy = t.OfficeBoyAccount.Name,
//                    status = t.Status,
//                    taskTime = t.TaskTime,
//                    rating = t.Rating,
//                    remarks = t.Remarks
//                })
//                .FirstOrDefaultAsync();

//            if (task == null)
//                return NotFound(new { message = "Task not found" });

//            return Ok(task);
//        }

//        // -----------------------------------------------------------------------
//        // GET api/officeboys/byfaculty/{facultyId}
//        //
//        // PURPOSE:
//        //   Returns only OfficeBoys assigned to the same floor as the Faculty.
//        //   Faculty sees these OfficeBoys on their dashboard to assign tasks.
//        //
//        // URL PARAM:
//        //   facultyId → the logged in Faculty's Account ID
//        //
//        // RESPONSE (200):
//        //   [
//        //     {
//        //       "id":    1,
//        //       "name":  "Ali Raza",
//        //       "floor": 1,
//        //       "assignedOffices": ["CS Department Office", "Admin Office"]
//        //     }
//        //   ]
//        //
//        // RESPONSE (404):
//        //   { "message": "Faculty not found" }
//        //   { "message": "No floor assigned to this faculty" }
//        // -----------------------------------------------------------------------
//        [HttpGet("byfaculty/{facultyId}")]
//        public async Task<IActionResult> GetOfficeBoysByFaculty(int facultyId)
//        {
//            // Step 1 — Check faculty exists
//            var faculty = await _context.Accounts
//                .FirstOrDefaultAsync(a => a.Id == facultyId && a.Role == 2);

//            if (faculty == null)
//                return NotFound(new { message = "Faculty not found" });

//            // Step 2 — Get the floor number of this faculty's office
//            var facultyFloorId = await _context.FacultyMemberOffices
//                .Where(f => f.FacultyAccountId == facultyId)
//                .Select(f => f.Office.BuildingFloorId)
//                .FirstOrDefaultAsync();

//            if (facultyFloorId == 0)
//                return NotFound(new { message = "No floor assigned to this faculty" });

//            // Step 3 — Get OfficeBoys assigned to that same floor
//            var officeBoys = await _context.OfficeBoyAssignedFloors
//    .Where(o => o.FloorId == facultyFloorId && o.Status == "Active")
//    .GroupBy(o => new { o.OfficeBoyAccount.Id, o.OfficeBoyAccount.Name, o.Floor.Number })
//    .Select(g => new
//    {
//        id = g.Key.Id,
//        name = g.Key.Name,
//        floor = g.Key.Number,
//        assignedOffices = g.Select(x => x.Office.OfficeName).ToList()
//    })
//    .ToListAsync();

//            return Ok(officeBoys);
//        }


//        // -----------------------------------------------------------------------
//        // POST api/tasks
//        //
//        // PURPOSE:
//        //   Faculty creates a new task and assigns it to an OfficeBoy.
//        //   Status is automatically set to "Pending".
//        //   TaskTime is automatically set to current date and time.
//        //
//        // REQUEST BODY:
//        //   {
//        //     "facultyAccountId":   5,
//        //     "officeBoyAccountId": 1,
//        //     "locationId":         3,
//        //     "description":        "Clean the main corridor before the event"
//        //   }
//        //
//        // RESPONSE (200):
//        //   { "message": "Task created successfully", "taskId": 1 }
//        //
//        // RESPONSE (400):
//        //   { "message": "Faculty not found" }
//        //   { "message": "OfficeBoy not found" }
//        //   { "message": "Location not found" }
//        // -----------------------------------------------------------------------

//        [HttpPost]
//        public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
//        {
//            // Validate that the Faculty exists
//            var faculty = await _context.Accounts
//                .FirstOrDefaultAsync(a => a.Id == request.FacultyAccountId && a.Role == 2);
//            if (faculty == null)
//                return BadRequest(new { message = "Faculty not found" });

//            // Validate that the OfficeBoy exists
//            var officeBoy = await _context.Accounts
//                .FirstOrDefaultAsync(a => a.Id == request.OfficeBoyAccountId && a.Role == 1);
//            if (officeBoy == null)
//                return BadRequest(new { message = "OfficeBoy not found" });

//            // Validate that the Location exists
//            var location = await _context.Locations
//                .FirstOrDefaultAsync(l => l.Id == request.LocationId);
//            if (location == null)
//                return BadRequest(new { message = "Location not found" });

//            // Create the new Task object
//            var task = new OBManagementAPI.Models.Task
//            {
//                FacultyAccountId = request.FacultyAccountId,
//                OfficeBoyAccountId = request.OfficeBoyAccountId,
//                LocationId = request.LocationId,
//                Description = request.Description,
//                Status = "Pending",       // always starts as Pending
//                TaskTime = DateTime.Now,    // auto set to current time
//                Rating = null,            // rated later by Faculty
//                Remarks = null             // added later by Faculty
//            };

//            // Save to database
//            _context.Tasks.Add(task);
//            await _context.SaveChangesAsync();

//            return Ok(new { message = "Task created successfully", taskId = task.Id });
//        }

//        // -----------------------------------------------------------------------
//        // PUT api/tasks/{id}/complete
//        //
//        // PURPOSE:
//        //   OfficeBoy marks a task as Completed after finishing the work.
//        //   Only tasks that are currently "Pending" can be completed.
//        //
//        // URL PARAM:
//        //   id → Task ID
//        //
//        // RESPONSE (200): { "message": "Task marked as completed" }
//        // RESPONSE (404): { "message": "Task not found" }
//        // RESPONSE (400): { "message": "Task is already completed" }
//        // -----------------------------------------------------------------------
//        [HttpPut("{id}/complete")]
//        public async Task<IActionResult> CompleteTask(int id)
//        {
//            // Find the task by ID
//            var task = await _context.Tasks.FindAsync(id);

//            if (task == null)
//                return NotFound(new { message = "Task not found" });

//            // Prevent marking an already completed task
//            if (task.Status == "Completed")
//                return BadRequest(new { message = "Task is already completed" });

//            // Update status to Completed
//            task.Status = "Completed";
//            await _context.SaveChangesAsync();

//            return Ok(new { message = "Task marked as completed" });
//        }

//        // -----------------------------------------------------------------------
//        // PUT api/tasks/{id}/rate
//        //
//        // PURPOSE:
//        //   Faculty adds a rating and remarks to a completed task.
//        //   Only completed tasks can be rated.
//        //
//        // URL PARAM:
//        //   id → Task ID
//        //
//        // REQUEST BODY:
//        //   {
//        //     "rating":  5,
//        //     "remarks": "Excellent work, done very quickly"
//        //   }
//        //
//        // RESPONSE (200): { "message": "Task rated successfully" }
//        // RESPONSE (404): { "message": "Task not found" }
//        // RESPONSE (400): { "message": "Task must be completed before rating" }
//        // RESPONSE (400): { "message": "Rating must be between 1 and 5" }
//        // -----------------------------------------------------------------------
//        [HttpPut("{id}/rate")]
//        public async Task<IActionResult> RateTask(int id, [FromBody] RateTaskRequest request)
//        {
//            // Find the task by ID
//            var task = await _context.Tasks.FindAsync(id);

//            if (task == null)
//                return NotFound(new { message = "Task not found" });

//            // Only completed tasks can be rated
//            if (task.Status != "Completed")
//                return BadRequest(new { message = "Task must be completed before rating" });

//            // Rating must be between 1 and 5
//            if (request.Rating < 1 || request.Rating > 5)
//                return BadRequest(new { message = "Rating must be between 1 and 5" });

//            // Update rating and remarks
//            task.Rating = request.Rating;
//            task.Remarks = request.Remarks;
//            await _context.SaveChangesAsync();

//            return Ok(new { message = "Task rated successfully" });
//        }

//        // -----------------------------------------------------------------------
//        // GET api/tasks/pending
//        //
//        // PURPOSE:
//        //   Returns all tasks that are currently Pending.
//        //   Used by Supervisor or OfficeBoy to see unfinished tasks.
//        //
//        // RESPONSE (200): list of pending tasks (same fields as GetAllTasks)
//        // -----------------------------------------------------------------------
//        [HttpGet("pending")]
//        public async Task<IActionResult> GetPendingTasks()
//        {
//            // Filter tasks where Status = "Pending"
//            var tasks = await _context.Tasks
//                .Where(t => t.Status == "Pending")
//                .Select(t => new
//                {
//                    taskId = t.Id,
//                    description = t.Description,
//                    location = t.Location.Name,
//                    faculty = t.FacultyAccount.Name,
//                    officeBoy = t.OfficeBoyAccount.Name,
//                    status = t.Status,
//                    taskTime = t.TaskTime
//                })
//                .ToListAsync();

//            return Ok(tasks);
//        }

//        // -----------------------------------------------------------------------
//        // GET api/tasks/completed
//        //
//        // PURPOSE:
//        //   Returns all tasks that have been completed.
//        //   Used by Supervisor or Faculty to see finished tasks with ratings.
//        //
//        // RESPONSE (200): list of completed tasks (same fields as GetAllTasks)
//        // -----------------------------------------------------------------------
//        [HttpGet("completed")]
//        public async Task<IActionResult> GetCompletedTasks()
//        {
//            // Filter tasks where Status = "Completed"
//            var tasks = await _context.Tasks
//                .Where(t => t.Status == "Completed")
//                .Select(t => new
//                {
//                    taskId = t.Id,
//                    description = t.Description,
//                    location = t.Location.Name,
//                    faculty = t.FacultyAccount.Name,
//                    officeBoy = t.OfficeBoyAccount.Name,
//                    status = t.Status,
//                    taskTime = t.TaskTime,
//                    rating = t.Rating,
//                    remarks = t.Remarks
//                })
//                .ToListAsync();

//            return Ok(tasks);
//        }


//        [HttpGet("locations")]
//        public async Task<IActionResult> GetLocations()
//        {
//            var locations = await _context.Locations
//                .Select(l => new
//                {
//                    id = l.Id,
//                    name = l.Name,     // ya jo bhi columns hain

//                })
//                .ToListAsync();

//            return Ok(locations);
//        }

//        [HttpGet("TaskAllShow/{facultyId}")]
//        public async Task<IActionResult> GetFacultyTasks(int facultyId)
//        {
//            try
//            {
//                // 1. Database se is Faculty ke saare tasks fetch karein
//                // NOTE: Include ki zaroorat nahi kyunki Select ke andar Navigation Properties use ho rahi hain
//                var rawTasks = await _context.Tasks
//                    .Where(t => t.FacultyAccountId == facultyId)
//                    .OrderByDescending(t => t.TaskTime) // Latest task upar aayega
//                    .Select(t => new
//                    {
//                        taskId = t.Id,
//                        description = t.Description,
//                        locationName = t.Location.Name,           // ← Auto JOIN ho jayega
//                        officeBoyName = t.OfficeBoyAccount.Name,   // ← Auto JOIN ho jayega
//                        status = t.Status,
//                        taskTime = t.TaskTime,
//                        rating = t.Rating,
//                        remarks = t.Remarks
//                    })
//                    .ToListAsync();

//                // 2. Logic Implementation (In-Memory Filtering)

//                // ALL Tab: Aaj ke tasks + Purane pending + Completed without rating
//                var today = DateTime.Today;

//                var allTab = rawTasks
//                    .Where(t => t.status == "Pending" || (t.status == "Completed" && t.rating == null))
//                    .ToList();

//                // PENDING Tab: Sirf pending tasks (chahe kitne bhi purane hon)
//                var pendingTab = rawTasks
//                    .Where(t => t.status == "Pending")
//                    .ToList();

//                // COMPLETED Tab: Completed tasks with NULL rating (Feedback Needed)
//                var completedTab = rawTasks
//                    .Where(t => t.status == "Completed" && t.rating == null)
//                    .ToList();

//                // 3. Final Response JSON format mein
//                return Ok(new
//                {
//                    success = true,
//                    data = new
//                    {
//                        all = allTab,
//                        pending = pendingTab,
//                        completed = completedTab
//                    },
//                    stats = new
//                    {
//                        allCount = allTab.Count,
//                        pendingCount = pendingTab.Count,
//                        completedCount = completedTab.Count
//                    }
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = ex.Message });
//            }
//        }
//        // GET /api/tasks/poor-feedback
//        // yeh jo poor feedback hain wo supervisior ko show kry ga
//        [HttpGet("poor-feedback")]
//        public async Task<IActionResult> GetPoorFeedback()
//        {
//            try
//            {
//                var poorFeedback = await _context.Tasks
//                    .Include(t => t.FacultyAccount)
//                    .Include(t => t.OfficeBoyAccount)
//                    .Include(t => t.Location)
//                    .Where(t => t.Rating != null && t.Rating <= 3 && t.Status == "Completed")
//                    .OrderByDescending(t => t.TaskTime)
//                    .Select(t => new
//                    {
//                        taskId = t.Id,
//                        description = t.Description,
//                        faculty = t.FacultyAccount.Name,
//                        officeBoy = t.OfficeBoyAccount.Name,
//                        location = t.Location.Name,
//                        rating = t.Rating,
//                        remarks = t.Remarks,
//                        taskTime = t.TaskTime,
//                        status = t.Status
//                    })
//                    .ToListAsync();

//                if (poorFeedback == null || !poorFeedback.Any())
//                {
//                    return Ok(new { message = "No poor feedback records found." });
//                }

//                return Ok(poorFeedback);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { message = "Error fetching data", error = ex.Message });
//            }
//        }
//    }

//    // ---------------------------------------------------------------------------
//    // CreateTaskRequest
//    // Request body model for POST api/tasks
//    // Faculty sends these fields when creating a task
//    // ---------------------------------------------------------------------------
//    public class CreateTaskRequest
//    {
//        public int FacultyAccountId { get; set; }  // ID of the Faculty creating the task
//        public int OfficeBoyAccountId { get; set; }  // ID of the OfficeBoy being assigned
//        public int LocationId { get; set; }  // ID of the location for the task
//        public string Description { get; set; }  // What needs to be done
//    }

//    // ---------------------------------------------------------------------------
//    // RateTaskRequest
//    // Request body model for PUT api/tasks/{id}/rate
//    // Faculty sends these fields when rating a completed task
//    // ---------------------------------------------------------------------------
//    public class RateTaskRequest
//    {
//        public int Rating { get; set; }  // Rating from 1 to 5
//        public string Remarks { get; set; }  // Optional feedback/comments
//    }
//}









//new 



using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OBManagementAPI.Models;

namespace OBManagementAPI.Controllers
{





    // ---------------------------------------------------------------------------
    // TasksController
    // Handles all Task related APIs.
    //
    // APIs:
    //   1. GET    api/tasks                  → Get all tasks
    //   2. GET    api/tasks/{id}             → Get single task by ID
    //   3. POST   api/tasks                  → Faculty creates a new task
    //   4. PUT    api/tasks/{id}/complete    → OfficeBoy marks task as completed
    //   5. PUT    api/tasks/{id}/rate        → Faculty rates a completed task
    //   6. GET    api/tasks/pending          → Get all pending tasks
    //   7. GET    api/tasks/completed        → Get all completed tasks
    // ---------------------------------------------------------------------------

    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        // Database connection injected automatically by .NET
        private readonly ObmanagementContext _context;

        // University ka fixed center point (geofence tasks ke liye)
        private const double UNIVERSITY_LAT = 33.6007;
        private const double UNIVERSITY_LNG = 73.0679;

        public TasksController(ObmanagementContext context)
        {
            _context = context;
        }

        // -----------------------------------------------------------------------
        // GET api/tasks
        // -----------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _context.Tasks
                .Select(t => new
                {
                    taskId = t.Id,
                    description = t.Description,
                    location = t.Location.Name,
                    faculty = t.FacultyAccount.Name,
                    officeBoy = t.OfficeBoyAccount.Name,
                    status = t.Status,
                    taskTime = t.TaskTime,
                    rating = t.Rating,
                    remarks = t.Remarks
                })
                .ToListAsync();

            return Ok(tasks);
        }

        // -----------------------------------------------------------------------
        // GET api/tasks/{id}
        // -----------------------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            var task = await _context.Tasks
                .Where(t => t.Id == id)
                .Select(t => new
                {
                    taskId = t.Id,
                    description = t.Description,
                    location = t.Location.Name,
                    faculty = t.FacultyAccount.Name,
                    officeBoy = t.OfficeBoyAccount.Name,
                    status = t.Status,
                    taskTime = t.TaskTime,
                    rating = t.Rating,
                    remarks = t.Remarks
                })
                .FirstOrDefaultAsync();

            if (task == null)
                return NotFound(new { message = "Task not found" });

            return Ok(task);
        }

        // -----------------------------------------------------------------------
        // GET api/officeboys/byfaculty/{facultyId}
        // -----------------------------------------------------------------------
        [HttpGet("byfaculty/{facultyId}")]
        public async Task<IActionResult> GetOfficeBoysByFaculty(int facultyId)
        {
            var faculty = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == facultyId && a.Role == 2);

            if (faculty == null)
                return NotFound(new { message = "Faculty not found" });

            var facultyFloorId = await _context.FacultyMemberOffices
                .Where(f => f.FacultyAccountId == facultyId)
                .Select(f => f.Office.BuildingFloorId)
                .FirstOrDefaultAsync();

            if (facultyFloorId == 0)
                return NotFound(new { message = "No floor assigned to this faculty" });

            var officeBoys = await _context.OfficeBoyAssignedFloors
    .Where(o => o.FloorId == facultyFloorId && o.Status == "Active")
    .GroupBy(o => new { o.OfficeBoyAccount.Id, o.OfficeBoyAccount.Name, o.Floor.Number })
    .Select(g => new
    {
        id = g.Key.Id,
        name = g.Key.Name,
        floor = g.Key.Number,
        assignedOffices = g.Select(x => x.Office.OfficeName).ToList()
    })
    .ToListAsync();

            return Ok(officeBoys);
        }


        // -----------------------------------------------------------------------
        // POST api/tasks
        //
        // REQUEST BODY:
        //   {
        //     "facultyAccountId":   5,
        //     "officeBoyAccountId": 1,
        //     "locationId":         3,
        //     "description":        "Clean the main corridor before the event",
        //     "taskMode":           "Now",   // Now | Later | Geofence
        //     "geofenceTrigger":    "IN",    // sirf Geofence ke liye
        //     "geofenceRadius":     300      // sirf Geofence ke liye
        //   }
        // -----------------------------------------------------------------------

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
        {
            var faculty = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == request.FacultyAccountId && a.Role == 2);
            if (faculty == null)
                return BadRequest(new { message = "Faculty not found" });

            var officeBoy = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == request.OfficeBoyAccountId && a.Role == 1);
            if (officeBoy == null)
                return BadRequest(new { message = "OfficeBoy not found" });

            var location = await _context.Locations
                .FirstOrDefaultAsync(l => l.Id == request.LocationId);
            if (location == null)
                return BadRequest(new { message = "Location not found" });

            var isGeofence = request.TaskMode == "Geofence";

            var task = new OBManagementAPI.Models.Task
            {
                FacultyAccountId = request.FacultyAccountId,
                OfficeBoyAccountId = request.OfficeBoyAccountId,
                LocationId = request.LocationId,
                Description = request.Description,
                Status = "Pending",
                TaskTime = DateTime.Now,
                Rating = null,
                Remarks = null,
                TaskMode = request.TaskMode,
                GeofenceTrigger = isGeofence ? request.GeofenceTrigger : null,
                GeofenceRadius = isGeofence ? request.GeofenceRadius : null,
                GeofenceLatitude = isGeofence ? UNIVERSITY_LAT : null,
                GeofenceLongitude = isGeofence ? UNIVERSITY_LNG : null
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task created successfully", taskId = task.Id });
        }

        // -----------------------------------------------------------------------
        // PUT api/tasks/{id}/complete
        // -----------------------------------------------------------------------
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            if (task.Status == "Completed")
                return BadRequest(new { message = "Task is already completed" });

            task.Status = "Completed";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task marked as completed" });
        }

        // -----------------------------------------------------------------------
        // PUT api/tasks/{id}/rate
        // -----------------------------------------------------------------------
        [HttpPut("{id}/rate")]
        public async Task<IActionResult> RateTask(int id, [FromBody] RateTaskRequest request)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            if (task.Status != "Completed")
                return BadRequest(new { message = "Task must be completed before rating" });

            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest(new { message = "Rating must be between 1 and 5" });

            task.Rating = request.Rating;
            task.Remarks = request.Remarks;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task rated successfully" });
        }

        // -----------------------------------------------------------------------
        // GET api/tasks/pending
        // -----------------------------------------------------------------------
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingTasks()
        {
            var tasks = await _context.Tasks
                .Where(t => t.Status == "Pending")
                .Select(t => new
                {
                    taskId = t.Id,
                    description = t.Description,
                    location = t.Location.Name,
                    faculty = t.FacultyAccount.Name,
                    officeBoy = t.OfficeBoyAccount.Name,
                    status = t.Status,
                    taskTime = t.TaskTime
                })
                .ToListAsync();

            return Ok(tasks);
        }

        // -----------------------------------------------------------------------
        // GET api/tasks/completed
        // -----------------------------------------------------------------------
        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedTasks()
        {
            var tasks = await _context.Tasks
                .Where(t => t.Status == "Completed")
                .Select(t => new
                {
                    taskId = t.Id,
                    description = t.Description,
                    location = t.Location.Name,
                    faculty = t.FacultyAccount.Name,
                    officeBoy = t.OfficeBoyAccount.Name,
                    status = t.Status,
                    taskTime = t.TaskTime,
                    rating = t.Rating,
                    remarks = t.Remarks
                })
                .ToListAsync();

            return Ok(tasks);
        }


        [HttpGet("locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _context.Locations
                .Select(l => new
                {
                    id = l.Id,
                    name = l.Name,

                })
                .ToListAsync();

            return Ok(locations);
        }

        [HttpGet("TaskAllShow/{facultyId}")]
        public async Task<IActionResult> GetFacultyTasks(int facultyId)
        {
            try
            {
                var rawTasks = await _context.Tasks
                    .Where(t => t.FacultyAccountId == facultyId)
                    .OrderByDescending(t => t.TaskTime)
                    .Select(t => new
                    {
                        taskId = t.Id,
                        description = t.Description,
                        locationName = t.Location.Name,
                        officeBoyName = t.OfficeBoyAccount.Name,
                        status = t.Status,
                        taskTime = t.TaskTime,
                        rating = t.Rating,
                        remarks = t.Remarks
                    })
                    .ToListAsync();

                var today = DateTime.Today;

                var allTab = rawTasks
                    .Where(t => t.status == "Pending" || (t.status == "Completed" && t.rating == null))
                    .ToList();

                var pendingTab = rawTasks
                    .Where(t => t.status == "Pending")
                    .ToList();

                var completedTab = rawTasks
                    .Where(t => t.status == "Completed" && t.rating == null)
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        all = allTab,
                        pending = pendingTab,
                        completed = completedTab
                    },
                    stats = new
                    {
                        allCount = allTab.Count,
                        pendingCount = pendingTab.Count,
                        completedCount = completedTab.Count
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/tasks/poor-feedback
        [HttpGet("poor-feedback")]
        public async Task<IActionResult> GetPoorFeedback()
        {
            try
            {
                var poorFeedback = await _context.Tasks
                    .Include(t => t.FacultyAccount)
                    .Include(t => t.OfficeBoyAccount)
                    .Include(t => t.Location)
                    .Where(t => t.Rating != null && t.Rating <= 3 && t.Status == "Completed")
                    .OrderByDescending(t => t.TaskTime)
                    .Select(t => new
                    {
                        taskId = t.Id,
                        description = t.Description,
                        faculty = t.FacultyAccount.Name,
                        officeBoy = t.OfficeBoyAccount.Name,
                        location = t.Location.Name,
                        rating = t.Rating,
                        remarks = t.Remarks,
                        taskTime = t.TaskTime,
                        status = t.Status
                    })
                    .ToListAsync();

                if (poorFeedback == null || !poorFeedback.Any())
                {
                    return Ok(new { message = "No poor feedback records found." });
                }

                return Ok(poorFeedback);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching data", error = ex.Message });
            }
        }
    }

    // ---------------------------------------------------------------------------
    // CreateTaskRequest
    // ---------------------------------------------------------------------------
    public class CreateTaskRequest
    {
        public int FacultyAccountId { get; set; }
        public int OfficeBoyAccountId { get; set; }
        public int LocationId { get; set; }
        public string Description { get; set; }

        // Geofence ke liye (optional, sirf TaskMode = "Geofence" ho tab bhejein)
        public string TaskMode { get; set; } = "Now";      // Now | Later | Geofence
        public string? GeofenceTrigger { get; set; }       // IN | OUT
        public double? GeofenceRadius { get; set; }         // meters
    }

    // ---------------------------------------------------------------------------
    // RateTaskRequest
    // ---------------------------------------------------------------------------
    public class RateTaskRequest
    {
        public int Rating { get; set; }
        public string Remarks { get; set; }
    }
}