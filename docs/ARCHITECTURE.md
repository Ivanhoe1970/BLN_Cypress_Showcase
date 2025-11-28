# 🏗️ System Architecture

**Emergency Response Automation Suite – Technical Design Documentation**

This document provides a complete technical overview of the Emergency Response Automation Suite, including the architecture, core subsystems, safety logic, and the 21 critical functions that power protocol execution, gas safety, timers, device communication, and resolution workflows.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Core Architecture Components](#core-architecture-components)
- [Protocol Factory](#protocol-factory)
- [Timer Management System](#timer-management-system)
- [Gas Safety Subsystem](#gas-safety-subsystem)
- [Message Classification Engine](#message-classification-engine)
- [Resolution Engine](#resolution-engine)
- [Error Handling Architecture](#error-handling-architecture)
- [Security Considerations](#security-considerations)
- [Client–Server Boundaries](#clientserver-boundaries)
- [Integration Points](#integration-points)
- [The 21 Critical Functions](#the-21-critical-functions)
- [Design Principles](#design-principles)
- [Performance Characteristics](#performance-characteristics)
- [Future Enhancements](#future-enhancements)

---

## System Overview

The Emergency Response Automation Suite uses a **modular, configuration-driven architecture** designed to:

- Decouple protocol definition from execution  
- Eliminate repetitive manual tasks in Blackline Live workflows  
- Preserve specialist control for all safety-critical decisions  
- Fail safely under uncertainty  
- Scale horizontally using configuration-only protocols  
- Improve auditability through deterministic logs and timestamps  

The system simulates the full Blackline Live alert lifecycle, including:

- Protocol step sequencing  
- Timer-driven escalation  
- Gas monitoring and normalization detection  
- Device messaging and response classification  
- Dispatch decision validation  
- Safety-gated resolution logic  
- Full protocol restart cycles  

---

## Architecture Diagram

Below is the simplified GitHub-compatible Mermaid architecture diagram:

```mermaid
flowchart TD
    A[Emergency Protocol Engine<br>21 Critical Functions] --> B[Gas Safety Subsystem]
    A --> C[Timer Management]
    A --> D[Message Classification]
    A --> E[Resolution Engine]
    A --> F[Dispatch Logic]

    G[Cypress Test Suite<br>200+ Automated Tests] --> A
    H[GitHub Actions CI/CD<br>Deploy + Test Pipeline] --> G

    A --> I[Protocol UI<br>Dynamic Step Workflows]
Core Architecture Components

The system consists of three major layers, each with clear responsibilities.

UI Layer

Handles all direct user interaction:

Dynamic 5-step protocol workflows

Gas telemetry panel

Device connectivity panel

Device messaging interface

Timer display

Resolution controls and override workflow

Automation Engine

Implements the 21 critical functions:

Protocol loading and execution

Timer management and expiration routing

Gas safety validation and normalization detection

Context-aware message classification

Dispatch evaluation

Resolution enforcement

Deterministic audit log generation

Data & Integration Layer

Maintains:

Current alert metadata

Protocol configuration objects

User configuration

Audit log entries

Provides future integration with:

BLN Live API

WebSocket telemetry streams

Protocol Factory

The Protocol Factory dynamically loads and constructs protocol flows based on alert type.

Purpose

Provide a configuration-driven definition of workflows

Remove all hardcoded step sequences

Enable customer-specific variations

Allow new protocols without touching engine code

Example Protocol Object
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

Full configurability

Immediate support for new alert types

Enables advanced configuration tooling (PCM)

Timer Management System

A single global timer ensures predictable, safe, and conflict-free time-driven behavior.

Core Features

Centralized timer state

1-second countdown updates

Visual + audio expiration alerts

Clean cancellation logic

Prevention of overlapping timers

Timer Metadata Example
{
  "stepId": "step-2",
  "label": "Gas Monitoring",
  "duration": 120,
  "startTime": 1732819200000,
  "timerType": "monitoring",
  "isRunning": true
}

Gas Safety Subsystem

The gas engine enforces all safety-critical constraints before allowing workflow progression.

Responsibilities

Real-time rendering of H₂S, CO, LEL, O₂

HIGH vs NORMAL classification

O₂ depletion/enrichment detection

Automatic 2-minute monitoring windows

Normalization detection

Resolution blocking while gas HIGH

Override workflow requiring explicit justification

Gas Classification Rules

If O₂ < 19.5% or > 23.5% → DANGEROUS

If H₂S > 10 ppm, CO > 35 ppm, or LEL > 10% → HIGH

Otherwise → NORMAL

Fail-safe default: Missing gas data → HIGH.

Message Classification Engine

The message classifier interprets device replies based on prompt context, not keyword matching.

Examples
Prompt Sent	Reply	Meaning	Action
Do you need help?	No	User is OK	Resolve
Are you OK?	Yes	User OK	Resolve
Any	Send help	Emergency	Dispatch
Any	Unknown	Ambiguous	Manual

The classification engine is stateful, tracking the last prompt sent.

Resolution Engine

A deterministic algorithm governs all resolution outcomes.

Logic

If gas HIGH → block resolution

If dispatch occurred → incident-with-dispatch

Else → incident-without-dispatch

Additional Rules

Pre-alert detection (≥ 24 hours)

Override required for HIGH gas

Full MST timestamped audit logging

No ambiguous resolution states

Error Handling Architecture

A multi-layer safety architecture ensures every workflow transition is valid.

UI Layer Errors

Disabled buttons prevent unsafe actions

Inline warnings for missing or invalid data

Clear visual error indicators

State Machine Guards

Steps cannot run out of order

Steps cannot run twice

Illegal transitions are blocked

Timer Safety

Only one timer active at any time

Clean cancellation

Controlled expiration routing

Gas Safety Defaults

Missing data = HIGH

Normalization requires all gases NORMAL

Message Classification Errors

Unknown, garbled, or ambiguous messages → manual handling only

Resolution Errors

Resolution blocked during HIGH gas

Invalid workflow states prevented

Override reasoning enforced

Security Considerations
Current (Prototype)

Fully client-side

No external API calls

No credential storage

Sanitized input handling

UI logic separation

CSP-friendly

Future (Production)

Requires:

OAuth2 / JWT authentication

Signed/secure resolution logs

Encrypted device messaging

WebSocket/SSE gas telemetry

Server-side validation

Rate limiting

Client–Server Boundaries
Current Architecture

100% client-side

All alert data from static fixtures

No network or backend dependencies

Future Architecture

Alert retrieval via API

Live gas data streamed via WebSocket

Resolution + dispatch logs POSTed to backend

CI/CD pipeline unchanged

Integration Points

Fixtures mirror these future endpoints:

GET /api/alerts/{id}
POST /api/alerts/{id}/resolve
POST /api/alerts/{id}/logs
POST /api/devices/{id}/message

The 21 Critical Functions
Core Protocol Functions

ProtocolFactory

loadProtocolSteps

loadAlert

startStep

restartProtocolCycle

Gas Safety Functions

startTwoMinuteMonitoring

updateGasReadings

triggerGasNormalization

isGasCurrentlyNormalized

Timer Functions

startGlobalTimer

cancelGlobalTimer

handleGlobalTimerCancellation

Automation Functions

postNote

autoPopulateFromDropdown

addLogEntry

Intelligence Functions

classifyIncomingMessage

handleMessageClassification

evaluateDispatchConditionsFromConnectivity

Resolution Functions

resolveAlert

determineResolutionType

Pre-Alert Functions

21a. isPreAlert
21b. addPreAlertLogEntry
21c. setupPreAlertResolution

Design Principles

Configuration over code

Fail-safe defaults

Idempotency

Single source of truth

Progressive UI disclosure

Conservative safety thresholds

Full auditability

Performance Characteristics

Protocol loading: <50 ms

Step execution: <10 ms

Gas panel updates: <100 ms

Timer updates: 1 second

Runtime memory footprint: <1 MB

Zero timer leaks (guaranteed cleanup)

Future Enhancements

Protocol Configuration Manager (PCM)

Enhanced Alerts Page (urgency indicators, live gas)

Intelligent Alert Assignment System

API-integrated dispatch and resolution

WebSocket real-time gas telemetry

Server-side persistent audit logging

Document Version: 3.3
Last Updated: November 28, 2025
Author: Ivan Ferrer (Op 417)