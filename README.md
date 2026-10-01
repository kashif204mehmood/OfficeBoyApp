# Office Boy Management System

A role-based mobile application that digitizes task delegation, staff accountability and leave coverage for a university support-staff team. Built as a university project at BIIT by a team of four.

**Stack:** React Native · ASP.NET Core Web API · SQL Server · Firebase Cloud Messaging

## Problem and objective

University departments rely on office boys and support staff for daily operational work such as deliveries, office upkeep and errands. Coordination was manual and informal: faculty had no structured way to assign and track tasks, and supervisors had no visibility into staff workload, performance or availability.

This project replaces that ad-hoc process with a structured, role-based mobile system where every task, rating and leave request is recorded and visible to the right person.

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile app | React Native (Android), with native device integration for GPS and date/time pickers |
| Backend | ASP.NET Core Web API (C#), organized into role-based RESTful controllers |
| Database | Microsoft SQL Server, relational schema with foreign-key-enforced integrity |
| Notifications | Firebase Cloud Messaging for real-time push alerts |
| Maps | Leaflet / OpenStreetMap for geofence visualization |

## System architecture

```
React Native app  ──►  ASP.NET Core Web API  ──►  SQL Server
        ▲                      │
        └──── Firebase Cloud Messaging (push notifications)
```

Three authenticated portals share a single backend and database. Each user signs in through one login screen and is routed to a dashboard with permissions scoped to their role.

| Role | Responsibility |
|------|----------------|
| **Supervisor** | Oversight and administration: staff, leave, performance, reassignment |
| **Faculty** | Task creation and delegation, and rating completed work |
| **Office Boy** | Task execution, status updates and leave requests |

## Core modules

### Task management
Faculty assign tasks to office boys in three modes:
- **Now:** the task is assigned immediately
- **Later:** the task is scheduled for a future date and time
- **Geofence:** the task activates automatically when the faculty member's live location enters or exits a defined radius around campus

Office boys track tasks through *Pending* and *Completed* states and mark work as done from their dashboard.

### Feedback and performance
After a task is completed, faculty rate it on a 5-star scale with optional remarks. Supervisors can filter and review under-performing tasks (rating of 3 or below) to monitor service quality across the team.

### Leave management
Office boys submit leave requests with a date range and a reason. Supervisors review pending requests and, on approval, can assign a replacement to cover the floor or office. Coverage is reassigned automatically and the original assignment is restored when the leave period ends, so there is no gap in operations.

### Staff reassignment and rotation
Supervisors can move any office boy to a different floor or office at any time to balance workload. Assignment history is preserved in the database.

### Real-time location and notifications
Faculty location is checked live against the campus geofence. When a match occurs, the backend triggers a Firebase push notification so the relevant office boy is alerted instantly, even when the app is in the background.

### In-app messaging
Supervisors can send direct messages to office boys for quick, informal communication outside the structured task system.

## Database and API design

The schema centers on an `Account` table (role-differentiated through a `Role` field) linked to the `Task`, `LeaveRequest`, `OfficeBoyAssignedFloors` and `Message` tables through enforced foreign keys. This keeps assignments, task history and leave records consistent.

The API exposes granular, role-scoped endpoints that follow REST conventions, with request validation and structured error responses. Examples:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/leave/{id}/approve` | Approve a leave request |
| `PUT` | `/api/supervisor/officeboys/{id}/reassign` | Reassign an office boy |

### Database design (ERD)
![ERD](screenshots/erd.png)

## Screenshots

![Login with role selection](screenshots/login.png)
![Supervisor dashboard](screenshots/supervisor-dashboard.png)
![Immediate, scheduled and geofence tasks](screenshots/task-assignment.png)
![Leave approval](screenshots/leave-requests.png)
![Feedback and rating](screenshots/ratings.png)
![Office boy task list](screenshots/office-boy-tasks.png)

## Project structure

```
OfficeBoyApp/
├── OfficeBoyApp/                                   # React Native mobile app
└── OBManagementAPIBackend (4)/
    └── OBManagementAPIBackend/
        └── OBManagementAPI/                        # ASP.NET Core Web API
```

## Getting started

### Prerequisites
- Node.js and npm
- .NET SDK
- SQL Server
- Android Studio (emulator) or a physical Android device
- A Firebase project (for push notifications)

### 1. Run the backend
```bash
cd "OBManagementAPIBackend (4)/OBManagementAPIBackend/OBManagementAPI"
```
1. Set your SQL Server connection string in `appsettings.json`
2. Create the database, then start the API:
```bash
dotnet run
```

### 2. Run the mobile app
```bash
cd OfficeBoyApp
npm install
npm run android
```
Point the app's API base URL to your running backend. On a physical device, use your computer's local IP address. Add your own Firebase configuration to enable push notifications.

## Author

**Kashif Mehmood** · React & React Native Developer · Rawalpindi, Pakistan

- GitHub: [kashif204mehmood](https://github.com/kashif204mehmood)
- LinkedIn: [kashif-mehmood-a54a13366](https://www.linkedin.com/in/kashif-mehmood-a54a13366/)
- Email: kashif204mehmood@gmail.com
