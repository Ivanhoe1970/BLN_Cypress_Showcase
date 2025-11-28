System Architecture

Emergency Response Automation Suite – Technical Design Documentation

This document provides a complete technical overview of the Emergency Response Automation Suite, describing the architecture, design rationale, and implementation of the 21 safety-critical automation functions powering the system.

Table of Contents

System Overview

Architecture Stack Diagram

Core Architecture Components

Protocol Factory

Timer Management System

Gas Safety Subsystem

Message Classification Engine

Resolution Engine

Error Handling Architecture

Security Considerations

Client–Server Boundaries

Integration Points

21 Critical Functions

Design Principles

Performance Characteristics

Future Enhancements

1. System Overview

The Emergency Response Automation Suite is a configuration-driven system that simulates Blackline Live alert workflows end-to-end, including timers, dispatch logic, resolution gating, gas monitoring, device messaging, and repeat-cycle protocols.

Goals:

Separate protocol definition from execution

Eliminate repetitive manual actions

Keep specialists fully in control

Fail safely under all conditions

Scale horizontally using protocol configs

Improve consistency, audit traceability, and operational safety

2. Architecture Stack Diagram

Two diagrams are included:

ASCII Diagram (guaranteed to render everywhere)

Mermaid Diagram (GitHub enhanced visual)

Both represent the same system architecture.

ASCII Diagram (Always Works)
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

Mermaid Diagram (GitHub Compatible)
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
        C5[API Integration (Future)]
    end

    UI --> Engine --> Data

3. Core Architecture Components
UI Layer

Renders protocol steps, gas data, connectivity, outgoing/incoming messages, timers, and resolution workflows.

Automation Engine

Executes protocol logic, manages timers, enforces safety gates, evaluates dispatch conditions, classifies messages, and logs all workflow actions.

Data Layer

Stores alert metadata, protocol definitions, user configuration, and audit logs.
Designed for future migration to BLN Live API-backed storage.

4. Protocol Factory

Purpose: Build protocol steps dynamically from configuration.
Principle: Protocols are data, not code.

Example:

{
  "name": "Gas Emergency Protocol",
  "steps": [
    { "id": "step-1", "action": "call-device" },
    { "id": "step-2", "action": "message-device", "timer": 120 },
    { "id": "step-3", "action": "call-user" },
    { "id": "step-4", "action": "contact-ecs" },
    { "id": "step-5", "action": "dispatch" }
  ]
}


Benefits:

Add new protocols without touching JavaScript

Supports customer-specific behavior

Enables the future Protocol Configuration Manager (PCM)

5. Timer Management System

A single global timer guarantees that only one timer runs at a time.

Capabilities:

Centralized timer state

Accurate countdown rendering

Audio + visual alerts on expiry

Cancellation with audit log entry

Strict prevention of overlapping timers

Timer metadata example:

{
  "stepId": "step-2",
  "label": "Gas Monitoring",
  "duration": 120,
  "startTime": 1732819200000,
  "timerType": "monitoring",
  "isRunning": true
}

6. Gas Safety Subsystem

This subsystem governs:

Real-time gas telemetry (H₂S, CO, LEL, O₂)

HIGH vs NORMAL status

O₂ enrichment/depletion safety

2-minute monitoring windows

Gas normalization detection

Resolution gating (HIGH blocks resolution)

Override workflow requiring explicit confirmation

Gas thresholds:

If O₂ < 19.5% or > 23.5% → Dangerous
If H₂S > 10ppm / CO > 35ppm / LEL > 10% → HIGH
Else → NORMAL

7. Message Classification Engine

Context-based reply interpretation.

Prompt	Reply	Meaning	Action
Are you OK?	Yes	OK	Resolve
Do you need help?	No	OK	Resolve
—	Send help	Emergency	Dispatch
—	Unknown	Ambiguous	Manual step

Classification is stateful, not keyword-only.

8. Resolution Engine

Deterministic outcomes:

If gas HIGH → block resolution
If dispatch occurred → incident-with-dispatch
Else → incident-without-dispatch


Pre-alerts (>24h old) trigger:

Auto-filled “pre-alert” resolution

Disabled steps

Only “Resolve Alert” allowed

All resolutions log MST timestamps and Operator ID.

9. Error Handling Architecture

Layers:

UI Errors

Warnings for missing data, disabled steps, unsafe actions.

State Machine Errors

Prevents illegal transitions (e.g., skipping steps).

Timer Errors

Avoids overlapping timers.

Gas Safety Errors

Missing gas data → treated as HIGH.

Classification Errors

Unknown incoming messages → manual action required.

Resolution Errors

Blocking unsafe resolutions (HIGH gas, invalid states).

10. Security Considerations

Although this is a client-only prototype, design matches production expectations:

No external calls

No sensitive data stored

No backend dependencies

Sanitized inputs

Separation of UI vs logic

CSP-friendly structure

Future API integration will require:

OAuth/token authentication

Signed resolution logs

Secure message channels

WebSocket telemetry

11. Client–Server Boundaries
Current State (Prototype)

100% client-side

HTML/JS only

No server calls

Future State (Production Integration)

Load alerts via REST

Log dispatch/resolution via POST

Subscribe to gas telemetry via WebSocket

Fetch user metadata from BLN Live

Architecture already partitions into layers to support this.

12. Integration Points

Expected future endpoints:

GET /api/alerts/{id}
POST /api/alerts/{id}/resolve
POST /api/alerts/{id}/logs
POST /api/devices/{id}/message


Fixtures emulate these endpoints during testing.

13. The 21 Critical Functions
Core Protocol

ProtocolFactory

loadProtocolSteps

loadAlert

startStep

restartProtocolCycle

Gas Safety

startTwoMinuteMonitoring

updateGasReadings

triggerGasNormalization

isGasCurrentlyNormalized

Timers

startGlobalTimer

cancelGlobalTimer

handleGlobalTimerCancellation

Automation Helpers

postNote

autoPopulateFromDropdown

addLogEntry

Intelligence

classifyIncomingMessage

handleMessageClassification

evaluateDispatchConditionsFromConnectivity

Resolution

resolveAlert

determineResolutionType

Pre-Alert

21a. isPreAlert
21b. addPreAlertLogEntry
21c. setupPreAlertResolution

14. Design Principles

Configuration over code

Fail-safe logic

Idempotency

Single source of truth

Progressive UI disclosure

Conservative safety thresholds

Full auditability

15. Performance Characteristics

<50ms protocol load

<10ms step execution

Real-time gas rendering <100ms

Timers update every 1s

<1MB memory footprint

No timer leaks

16. Future Enhancements

Protocol Configuration Manager

Enhanced alerts page with prioritization

Intelligent Alert Assignment System

Persistent audit storage

WebSocket real-time gas telemetry

Document Version: 3.0
Last Updated: November 28, 2025
Author: Ivan Ferrer (Op 417)