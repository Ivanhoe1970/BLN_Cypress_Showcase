# System Architecture

Emergency Response Automation Suite – Technical Design Documentation

This document provides a complete technical overview of the Emergency Response Automation Suite, describing the architecture, design rationale, and implementation of the 21 safety-critical automation functions powering the system.

---

## Table of Contents

1. System Overview
2. Architecture Stack Diagram
3. Core Architecture Components
4. Protocol Factory
5. Timer Management System
6. Gas Safety Subsystem
7. Message Classification Engine
8. Resolution Engine
9. Error Handling Architecture
10. Security Considerations
11. Client–Server Boundaries
12. Integration Points
13. 21 Critical Functions
14. Design Principles
15. Performance Characteristics
16. Future Enhancements

---

# 1. System Overview

The Emergency Response Automation Suite is a modular, configuration-driven system designed to:

- Separate protocol definition from execution logic
- Maintain specialist control while removing repetitive manual tasks
- Fail safely under all conditions
- Scale horizontally by adding new protocols without modifying core logic
- Improve consistency, audit reliability, and operational safety

The system simulates Blackline Live alert workflows end-to-end, including timers, dispatch logic, resolution gating, gas monitoring, device messaging, and protocol restart cycles.

---

# 2. Architecture Stack Diagram

Two views of the architecture are provided:

1. **Primary ASCII diagram** – universally reliable across all Markdown renderers
2. **Enhanced Mermaid diagram** – a visual representation for GitHub’s renderer

Both diagrams depict the same architecture.

---

### ASCII Diagram (Primary, 100% Reliable)

```
UI Layer
 ├── Protocol Steps UI
 ├── Gas & Connectivity Panel
 ├── Message Interface
 ├── Timer Display
 └── Resolution Panel

Automation Engine
 ├── Protocol Factory
 ├── Step Execution Engine
 ├── Timer Manager
 ├── Gas Safety Engine
 ├── Message Classifier
 ├── Dispatch Validator
 └── Resolution Engine

Data & Integration Layer
 ├── Alert Data
 ├── Protocol Configurations
 ├── User Config
 ├── Audit Log
 └── BLN Live API Integration (Future)
```

---

### Mermaid Diagram (Enhanced Visual)

```mermaid
flowchart TB

    subgraph UI [UI Layer]
        A1[Protocol Steps UI]
        A2[Gas & Connectivity Panel]
        A3[Message Interface]
        A4[Timer Display]
        A5[Resolution Panel]
    end

    subgraph Engine [Automation Engine]
        B1[Protocol Factory]
        B2[Step Execution Engine]
        B3[Timer Manager]
        B4[Gas Safety Engine]
        B5[Message Classifier]
        B6[Dispatch Validator]
        B7[Resolution Engine]
    end

    subgraph Data [Data & Integration Layer]
        C1[Alert Data]
        C2[Protocol Configurations]
        C3[User Config]
        C4[Audit Log]
        C5[BLN Live API Integration (Future)]
    end

    UI --> Engine --> Data
```

---

# 3. Core Architecture Components

The system is composed of three layers:

### UI Layer

Renders protocol steps, gas data, connectivity, messages, timers, and resolution controls.

### Automation Engine

Executes protocol logic, enforces safety gates, manages timers, routes workflow states, and logs audit events.

### Data Layer

Stores alert metadata, protocol configurations, user configuration, and audit logs.  
Provides future integration boundaries for BLN Live APIs.

---

# 4. Protocol Factory

**Purpose:**  
Defines how protocols are selected, built, and executed.

**Design Decision:**  
Protocols are data, not code.

**Example Configuration:**

```json
{
  "name": "Gas Emergency Protocol",
  "steps": [
    { "id": "step-1", "action": "call-device", "timer": 0 },
    { "id": "step-2", "action": "message-device", "timer": 120 },
    { "id": "step-3", "action": "call-user", "timer": 0 },
    { "id": "step-4", "action": "contact-ecs", "timer": 0 },
    { "id": "step-5", "action": "dispatch", "timer": 0 }
  ]
}
```

Benefits:

- New protocols require configuration only
- Supports customer-specific logic variations
- Powers the future Protocol Configuration Manager

---

# 5. Timer Management System

A single global timer prevents concurrent or conflicting timers.

### Key Features

- Centralized timer state
- Visual countdown
- Audio alerts
- Deterministic expiration routing
- Cancelation logic with log entries
- Prevents accidental overlap

### Timer Metadata

```json
{
  "stepId": "step-2",
  "label": "Gas Monitoring",
  "duration": 120,
  "startTime": 1732819200000,
  "timerType": "monitoring",
  "isRunning": true
}
```

---

# 6. Gas Safety Subsystem

Handles:

- Real-time gas telemetry (H₂S, CO, LEL, O₂)
- HIGH vs NORMAL classification
- O₂ depletion and enrichment safety
- Automatic 2-minute monitoring windows
- Normalization detection
- Resolution gating (HIGH gas blocks resolution)
- Override workflow requiring explicit reasoning

### Gas Status Logic

```
If O₂ < 19.5% or > 23.5% → Dangerous
If H₂S > 10ppm / CO > 35ppm / LEL > 10% → HIGH
Else → NORMAL
```

---

# 7. Message Classification Engine

Context-aware, stateful message interpretation:

| Prompt Sent       | Reply        | Meaning   | Action      |
| ----------------- | ------------ | --------- | ----------- |
| Do you need help? | No           | User OK   | Resolve     |
| Are you OK?       | Yes          | User OK   | Resolve     |
| Any               | Send help    | Emergency | SOS         |
| Any               | Unknown text | Ambiguous | Manual step |

Classification depends on context, not keywords.

---

# 8. Resolution Engine

A deterministic algorithm decides resolution outcomes:

```
If gas alert AND gas HIGH → block resolution
Else if dispatch occurred → incident-with-dispatch
Else → incident-without-dispatch
```

Pre-alert detection:

- Alerts older than 24 hours
- Steps disabled
- Resolution auto-filled to “pre-alert”

All resolutions are logged with MST timestamps and operator ID.

---

# 9. Error Handling Architecture

The system uses layered error handling.

### UI Errors

- Non-blocking
- Display warnings
- Prevent unsafe actions
- Example: Trying to start a step with missing gas data

### State Machine Errors

- Prevent illegal transitions
- Example: Completing step 3 before step 1

### Timer Errors

- Prevent multiple timers from running simultaneously

### Gas Safety Errors

- Missing gas data → treated as dangerous (fail-safe default)

### Message Classification Errors

- Unknown messages → require manual intervention

### Resolution Errors

- Attempting resolution during HIGH gas → blocked

---

# 10. Security Considerations

The prototype is client-only, but design follows production security expectations:

- No external requests
- No operator credential storage
- No personal data persisted
- Sanitized inputs
- Separation of UI and execution logic
- CSP-friendly structure

For future integration with Blackline APIs, requirements include:

- OAuth/token-based authentication
- Audit-secure resolution APIs
- Encrypted message channels
- WebSocket-based device telemetry streams

---

# 11. Client–Server Boundaries

### Current State

- Entirely client-side
- No backend
- No network dependencies

### Future State

- Alert loading via API
- Dispatch & resolution logs via POST
- Real-time gas via WebSocket
- User metadata loaded from BLN services

The architecture is already partitioned to allow future backend migration.

---

# 12. Integration Points

Future endpoints:

```
GET /api/alerts/{id}
POST /api/alerts/{id}/resolve
POST /api/alerts/{id}/logs
POST /api/devices/{id}/message
```

Fixtures model these endpoints to support deterministic Cypress testing.

---

# 13. The 21 Critical Functions

Grouped into categories:

### Core Protocol Functions

1. ProtocolFactory
2. loadProtocolSteps
3. loadAlert
4. startStep
5. restartProtocolCycle

### Gas Safety Functions

6. startTwoMinuteMonitoring
7. updateGasReadings
8. triggerGasNormalization
9. isGasCurrentlyNormalized

### Timer Functions

10. startGlobalTimer
11. cancelGlobalTimer
12. handleGlobalTimerCancellation

### Automation Functions

13. postNote
14. autoPopulateFromDropdown
15. addLogEntry

### Intelligence Functions

16. classifyIncomingMessage
17. handleMessageClassification
18. evaluateDispatchConditionsFromConnectivity

### Resolution Functions

19. resolveAlert
20. determineResolutionType

### Pre-Alert Functions

21a. isPreAlert  
21b. addPreAlertLogEntry  
21c. setupPreAlertResolution

---

# 14. Design Principles

- Configuration over code
- Fail-safe logic
- Idempotency
- Single source of truth
- Progressive disclosure in UI
- Conservative thresholds
- Full auditability

---

# 15. Performance Characteristics

- <50ms protocol load time
- <10ms step execution
- Real-time gas rendering (<100ms)
- 1-second timer updates
- <1MB runtime memory footprint

Proper cleanup prevents timer leaks and ensures long-running stability.

---

# 16. Future Enhancements

- Protocol Configuration Manager
- Enhanced alerts page with prioritization
- Intelligent Alert Assignment System
- Persistent server-side log storage
- WebSocket telemetry for live gas data

---

Document Version: 2.0  
Last Updated: November 28, 2025  
Author: Ivan Ferrer (Op 417)
