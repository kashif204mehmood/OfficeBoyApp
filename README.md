# Office Boy Management System

A university project (BIIT) built by a team of four: a full-stack mobile workforce management application for coordinating office-boy services across a university campus. It has three role-based portals (**Supervisor**, **Faculty** and **Office Boy**) so tasks can be assigned, tracked and reviewed in one place.

**Tech stack:** React Native · ASP.NET Core Web API · SQL Server

## Features

### Task management
- Assign tasks in three modes: **immediate**, **scheduled**, and **geofence-triggered** (the task activates based on location)
- Track task status from assignment to completion

### Leave management
- Office boys can request leave, and supervisors approve or reject it
- Automatic **staff replacement** while someone is on leave, and **reinstatement** when they return, so floor coverage is never interrupted

### Performance and staffing
- Feedback and **rating system** for office boys
- Dynamic staff **reassignment and rotation** tools

### Role-based dashboards
| Role | What they can do |
|------|------------------|
| **Supervisor** | Assign tasks, approve leave, manage staff, view ratings |
| **Faculty** | Request services and give feedback |
| **Office Boy** | View assigned tasks, update status, request leave |

## Architecture

```
Mobile app (React Native)  ──►  REST API (ASP.NET Core Web API)  ──►  SQL Server
```

- The mobile app talks to the backend through a RESTful API
- The database uses relational tables with foreign keys to keep data consistent
- The system was tested end to end on emulators and physical devices

### Database design (ERD)
![ERD](screenshots/erd.png)

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
- .NET SDK (for ASP.NET Core)
- SQL Server
- Android Studio (emulator) or a physical device

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
Make sure the app's API base URL points to your running backend (use your computer's local IP address when testing on a physical device).

## Screenshots

![Login with role selection](screenshots/login.png)
![Supervisor dashboard](screenshots/supervisor-dashboard.png)
![Immediate, scheduled and geofence tasks](screenshots/task-assignment.png)
![Leave approval](screenshots/leave-requests.png)
![Feedback and rating](screenshots/ratings.png)
![Office boy task list](screenshots/office-boy-tasks.png)

## Author

**Kashif Mehmood** · React & React Native Developer · Rawalpindi, Pakistan

- GitHub: [kashif204mehmood](https://github.com/kashif204mehmood)
- LinkedIn: [kashif-mehmood-a54a13366](https://www.linkedin.com/in/kashif-mehmood-a54a13366/)
- Email: kashif204mehmood@gmail.com
