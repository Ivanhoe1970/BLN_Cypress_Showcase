# Emergency Response Automation Suite  
Technical Architecture and Prototype Overview

The Emergency Response Automation Suite is a fully functional prototype that automates the core emergency-response workflows used by Blackline Safety's SOC.  
It models gas and non-gas alert handling, protocol execution, messaging logic, safety gating, dispatch validation, intelligent notes analysis, and deterministic resolution.

This repository contains:

- Full system architecture  
- End-to-end prototype (HTML + JavaScript)  
- 22-function Automation Engine  
- Intelligent coordination subsystem  
- Comprehensive Cypress test suite  
- Complete technical documentation for stakeholder review  

The system is entirely client-side and configuration-driven.

---

## Table of Contents

- [Global Documentation Index (/docs)](#global-documentation-index-docs)
- [1. System Overview](#1-system-overview)
- [2. Architecture Summary](#2-architecture-summary)
- [3. Core Subsystems](#3-core-subsystems)
- [4. Protocol Engine](#4-protocol-engine)
- [5. Timer Management](#5-timer-management)
- [6. Gas Safety Engine](#6-gas-safety-engine)
- [7. Messaging Engine](#7-device-messaging-engine)
- [8. Intelligent Notes Analysis](#8-intelligent-notes-analysis-engine)
- [9. Dispatch Logic](#9-dispatch-logic)
- [10. Resolution Engine](#10-resolution-engine)
- [11. The 22 Critical Functions](#11-the-22-critical-functions)
- [12. Design Principles](#12-design-principles)
- [13. Integration Points](#13-integration-points)
- [14. Performance Characteristics](#14-performance-characteristics)
- [15. File and Folder Structure](#15-file-and-folder-structure)
- [16. Related Documentation](#16-related-documentation)
- [17. Document Information](#17-document-information)

---

## Global Documentation Index (/docs)

Below is a complete Table of Contents for **all Markdown files in `/docs`**, with correct GitHub anchor links.

```
docs/
├── ARCHITECTURE.md
├── BLN_Live_API_Usage_Guide.md
├── DEPLOYMENT_APPROACH.md
├── ROADMAP.md
├── ROI_Analysis.md
├── TESTING.md
└── WORKFLOW_AUTOMATION.md
```

### ARCHITECTURE.md
- [System Overview](docs/ARCHITECTURE.md#system-overview)
- [Architecture Diagram](docs/ARCHITECTURE.md#architecture-diagram)
- [Core Architecture Components](docs/ARCHITECTURE.md#core-architecture-components)
- [Protocol Factory](docs/ARCHITECTURE.md#protocol-factory)
- [Timer Management System](docs/ARCHITECTURE.md#timer-management-system)
- [Gas Safety Subsystem](docs/ARCHITECTURE.md#gas-safety-subsystem)
- [Message Classification Engine](docs/ARCHITECTURE.md#message-classification-engine)
- [Resolution Engine](docs/ARCHITECTURE.md#resolution-engine)
- [The 22 Critical Functions](docs/ARCHITECTURE.md#the-22-critical-functions)

### BLN_Live_API_Usage_Guide.md
- [API Overview](docs/BLN_Live_API_Usage_Guide.md#api-overview)
- [Endpoints](docs/BLN_Live_API_Usage_Guide.md#endpoints)
- [Device Messaging](docs/BLN_Live_API_Usage_Guide.md#device-messaging)
- [Alert Resolution](docs/BLN_Live_API_Usage_Guide.md#alert-resolution)
- [Authentication](docs/BLN_Live_API_Usage_Guide.md#authentication)

### DEPLOYMENT_APPROACH.md
- [Local Setup](docs/DEPLOYMENT_APPROACH.md#local-setup)
- [Prototype Execution](docs/DEPLOYMENT_APPROACH.md#prototype-execution)
- [Production Deployment](docs/DEPLOYMENT_APPROACH.md#production-deployment)
- [Integration Requirements](docs/DEPLOYMENT_APPROACH.md#integration-requirements)

### ROADMAP.md
- [Current State](docs/ROADMAP.md#current-state)
- [Strategic Vision](docs/ROADMAP.md#strategic-vision)
- [Core Strategic Features](docs/ROADMAP.md#core-strategic-features)
- [Implementation Timeline](docs/ROADMAP.md#implementation-timeline)

### ROI_Analysis.md
- [Executive Summary](docs/ROI_Analysis.md#executive-summary)
- [Cost Breakdown](docs/ROI_Analysis.md#cost-breakdown)
- [Time Savings](docs/ROI_Analysis.md#time-savings)
- [ROI Calculation](docs/ROI_Analysis.md#roi-calculation)

### TESTING.md
- [Testing Strategy](docs/TESTING.md#testing-strategy)
- [Test Architecture](docs/TESTING.md#test-architecture)
- [Deterministic Simulation](docs/TESTING.md#deterministic-simulation)
- [Cypress Structure](docs/TESTING.md#cypress-structure)

### WORKFLOW_AUTOMATION.md
- [Workflow Automation Overview](docs/WORKFLOW_AUTOMATION.md#workflow-automation-overview)
- [Manual Action Elimination](docs/WORKFLOW_AUTOMATION.md#manual-action-elimination)
- [Dispatch Automation](docs/WORKFLOW_AUTOMATION.md#dispatch-automation)

---

## 1. System Overview

The Emergency Response Automation Suite simulates the complete lifecycle of an alert:

- Device call attempts  
- Device messaging  
- Gas monitoring and normalization logic  
- User call workflows  
- Emergency contact escalation  
- Dispatch readiness validation  
- Resolution enforcement  
- Intelligent cross-specialist coordination  
- Fully deterministic audit logs with MST timestamps  

The system eliminates large portions of the repetitive manual work in Blackline Live alert management, while preserving all safety-critical decisions for the specialist.

---

## 2. Architecture Summary

The platform follows a modular, configuration-driven design.  
Protocol steps, timer behavior, gas rules, message templates, escalation flows, and dispatch logic are all defined through configuration rather than hardcoded logic.

The system is composed of:

- Protocol Engine (Protocol Factory)  
- 22-function Automation Engine  
- Gas Safety Subsystem  
- Timer Management System  
- Device Messaging Engine  
- Intelligent Notes Analysis Engine  
- Dispatch Validator  
- Resolution Engine  
- Unified Audit Logger  

All modules operate client-side and interact through a predictable state architecture.

---

## 3. Core Subsystems

### Protocol Engine
Loads protocol definitions and orchestrates step execution using configuration objects.

### Step Execution Engine
Ensures steps run in order, cannot be skipped, and are idempotent.

### Gas Safety Engine
Evaluates gas levels, 2-minute monitoring window (where applicable), normalization conditions, and resolution blocking rules.

### Timer Manager
Provides a single global timer for monitoring, callback, and dispatch follow-up windows.

### Messaging Engine
Handles sending device messages, interpreting replies, waiting windows, and timeout logic.

### Dispatch Validator
Validates whether dispatch is allowed using safety rules defined in ARCHITECTURE.md.

### Resolution Engine
Determines correct resolution type using deterministic rules and enforces safety boundaries.

### Intelligent Notes Analysis Engine
Analyzes specialist notes to infer resolution intent, detect callback confirmations, synchronize state, and cancel timers when appropriate.

### Audit Logger
Generates deterministic MST timestamps and enforces log contract.

---

## 4. Protocol Engine

The Protocol Factory transforms JSON configuration into runnable workflows.

**Capabilities:**

- Dynamic step sequences  
- Conditional steps based on device type (G7c vs G7x)  
- Configurable EC hierarchy and routing  
- Custom message templates  
- Customer-specific variants  

The engine is the foundation for the future Protocol Configuration Manager.

---

## 5. Timer Management System

A single global timer eliminates confusion and replaces the Clock app.

**Features:**

- Monitoring timer  
- EC callback timer  
- Dispatch follow-up timer  
- Accurate countdown and audio alert  
- Full logging on start, cancellation, and expiration  

Timers are context-aware and directly tied to protocol steps.

---

## 6. Gas Safety Engine

Gas alerts include an optional 2-minute gas monitoring window depending on the protocol.

- If gas normalizes: alert auto-resolves  
- If gas remains HIGH: Step 1 unlocks  
- Every gas update appears in the telemetry panel  
- HIGH gas blocks resolution unless override provided  
- O₂ depleted/enriched detection supported  

**Normalization rule:**
```
H2S === NORMAL &&
CO === NORMAL &&
LEL === NORMAL &&
O2 === NORMAL
```

---

## 7. Device Messaging Engine

Provides intelligent messaging control:

- Auto-populates message templates  
- Tracks message windows  
- Interprets device replies using context  
- Identifies ambiguous responses  

**Examples:**

| Message     | Meaning                     |
|-------------|-----------------------------|
| "I'm OK"    | User is safe                |
| "No"        | User is safe (to help query)|
| "Send help" | Dispatch required           |

---

## 8. Intelligent Notes Analysis Engine

Automates cross-specialist coordination.

**Functions:**

- Detects resolution intent  
- Detects user callback confirmations  
- Cancels timers automatically  
- Synchronizes state across sessions  
- Ensures consistent audit trail  

Time savings: **75–85% reduction** in coordination overhead.

---

## 9. Dispatch Logic

Dispatch is permitted only when all safety rules pass:

- GPS location age under 5 minutes  
- Device online  
- Movement speed under 5 km/h  
- Connectivity valid  

Automation:

- Auto-fills dispatch note  
- Starts 30-minute follow-up timer  
- Logs dispatch action deterministically  

If dispatch cannot proceed:

- Specialist selects reason  
- System logs: “Dispatch skipped. Reason: ___.”  
- Protocol loops back to Steps 1–4  

---

## 10. Resolution Engine

Enforces deterministic resolution logic:

- Gas HIGH blocks resolution until override  
- If dispatch occurred → incident-with-dispatch  
- If no dispatch → incident-without-dispatch  
- False alert classification  
- Pre-alert logic (>24h)  
- Cancels all active timers  
- Logs final resolution  

---

## 11. The 22 Critical Functions

The system implements 22 technically defined functions across:

- Core protocol logic  
- Gas safety  
- Timer management  
- Message classification  
- Notes analysis  
- Resolution logic  
- Pre-alert handling  

See ARCHITECTURE.md for full function list.

---

## 12. Design Principles

- Configuration over code  
- Fail-safe defaults  
- Deterministic transitions  
- Idempotent operations  
- Safety-first logic  
- Full auditability  
- Minimal cognitive load  
- Predictable performance  

---

## 13. Integration Points

Prototype:

- Fully standalone  
- No network dependencies  
- Uses fixture data  

Production:

- BLN Live Alert API  
- Resolution API  
- Device Messaging API  
- WebSocket gas telemetry  
- Server-side audit logging  

Architecture requires no new backend endpoints.

---

## 14. Performance Characteristics

Performance goals:

- Protocol load: <50 ms  
- Step execution: <10 ms  
- Gas panel: <100 ms  
- Notes analysis: <100 ms  
- Sync: <200 ms  
- Memory: <2 MB  

Scales to unlimited protocols and alert types.

---

## 15. File and Folder Structure

Repository structure:

```
BLN AUTOMATION SHOWCASE/
│
├── .github/workflows/
│     └── deploy-and-test.yml
│
├── .vscode/
│
├── automated-gas-alert-protocol/
│     ├── configs/
│     ├── cypress/
│     ├── fixtures/
│     ├── annotation-template.txt
│     ├── cypress.config.js
│     ├── emergency-protocol-clean.html
│     ├── incident-report-v22.js
│     ├── index.html
│     ├── protocol-config-manager.html
│     └── protocol-log-hydrator-v22.js
│
├── cypress/
│     ├── e2e/
│     ├── fixtures/
│     ├── pages/
│     ├── screenshots/
│     └── support/
│
├── docs/
│     ├── ARCHITECTURE.md
│     ├── BLN_Live_API_Usage_Guide.md
│     ├── DEPLOYMENT_APPROACH.md
│     ├── ROADMAP.md
│     ├── ROI_Analysis.md
│     ├── ROI_Analysis.pdf
│     ├── TESTING.md
│     └── WORKFLOW_AUTOMATION.md
│
├── node_modules/
│
├── .gitignore
└── package.json
```

---

## 16. Related Documentation

- ARCHITECTURE.md  
- ROADMAP.md  
- WORKFLOW_AUTOMATION.md  
- TESTING.md  
- DEPLOYMENT_APPROACH.md  
- ROI_Analysis.md  
- VERSION_HISTORY.md  

---

## 17. Document Information

**Version:** 2.0  
**Last Updated:** November 30, 2025  
**Author:** Ivan Ferrer – SOC Technical Innovation Lead
