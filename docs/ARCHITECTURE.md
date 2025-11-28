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
2. **Enhanced Mermaid diagram** – visual rendering supported by GitHub  

---

### **ASCII Diagram (Primary, 100% Reliable)**

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


---

### **Mermaid Diagram (Enhanced Visual)**

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

3. Core Architecture Components
UI Layer

Renders protocol steps, gas readings, messaging interfaces, connectivity status, timers, and resolution controls.

Automation Engine

Executes protocol logic, enforces safety gates, manages timers, routes workflow transitions, and produces audit logs.

Data Layer

Stores alert metadata, protocol configurations, and audit log entries.
Defines the future boundary for integration with Blackline Live APIs.

4. Protocol Factory
Purpose

Defines how protocols are selected, instantiated, and executed.

Design Principle

Protocols are data, not code.

Example Protocol Configuration
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

Benefits

Add new protocols without modifying JavaScript

Consistency across 30+ alert types

Enables the future Protocol Configuration Manager

5. Timer Management System

A single global timer prevents overlaps and ensures deterministic behavior.

Key Features

Centralized state

Visual countdown

Audio alerts

Deterministic expiration routing

Safe cancellation and logging

Leak-free design

Timer Metadata Example
{
  "stepId": "step-2",
  "label": "Gas Monitoring",
  "duration": 120,
  "startTime": 1732819200000,
  "timerType": "monitoring",
  "isRunning": true
}

6. Gas Safety Subsystem

Responsible for:

Real-time gas telemetry

HIGH vs NORMAL classification

O₂ depletion / enrichment detection

2-minute monitoring windows

Gas normalization detection

Resolution gating

Override workflows

Gas Threshold Logic
If O₂ < 19.5% or > 23.5% → Dangerous  
If H₂S > 10ppm / CO > 35ppm / LEL > 10% → HIGH  
Else → NORMAL

7. Message Classification Engine

A context-aware classification workflow:

Prompt Sent	Reply	Meaning	Action
Do you need help?	No	User OK	Resolve
Are you OK?	Yes	User OK	Resolve
Any	Send help	Emergency	SOS
Any	Unknown text	Ambiguous	Manual step

Meaning depends on context, not keyword alone.

8. Resolution Engine

A deterministic resolver:

If gas alert AND gas HIGH → block resolution  
Else if dispatch occurred → incident-with-dispatch  
Else → incident-without-dispatch


Pre-alert logic triggers auto-resolution for alerts older than 24 hours.

All outcomes logged with MST timestamps and operator ID.

9. Error Handling Architecture
UI Errors

Non-blocking

Safe-guarded operations

User warnings

State Machine Errors

Prevent out-of-order step execution

Timer Errors

Prevent simultaneous timers

Gas Safety Errors

Missing gas data defaults to dangerous

Classification Errors

Unknown replies → manual review

Resolution Errors

HIGH gas always blocks resolution

10. Security Considerations

Even as a client-only prototype, the design aligns with production expectations.

Current guarantees:

No external requests

No credential storage

Sanitized input

Strict UI/Engine separation

Future API requirements:

OAuth tokens

Secure audit endpoints

Encrypted messaging

WebSocket gas telemetry

11. Client–Server Boundaries
Current State

Fully client-side

Fixture-driven

No network dependencies

Future State

Alerts from API

Dispatch/resolution logging to server

Real-time gas streams

SOC operator identity & auditing

The architecture already isolates these concerns.

12. Integration Points

Potential backend endpoints:

GET /api/alerts/{id}
POST /api/alerts/{id}/resolve
POST /api/alerts/{id}/logs
POST /api/devices/{id}/message


Fixtures model these endpoints to support deterministic Cypress testing.

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

Timer

startGlobalTimer

cancelGlobalTimer

handleGlobalTimerCancellation

Automation

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

isPreAlert / addPreAlertLogEntry / setupPreAlertResolution

14. Design Principles

Configuration over code

Fail-safe defaults

Idempotent step execution

Single source of truth

Clear UI/Engine separation

Full auditability

15. Performance Characteristics

<50ms protocol load

<10ms step execution

<100ms gas rendering

1-second global timer updates

<1MB memory footprint

No timer leaks

Stable long-running operation

16. Future Enhancements

Protocol Configuration Manager

Intelligent Alert Assignment System

Enhanced alerts page with urgency scoring

Persistent server-side audit logs

WebSocket gas telemetry

Document Version: 2.1
Last Updated: November 28, 2025
Author: Ivan Ferrer (Op 417)