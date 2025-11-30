# ROADMAP.md  
## Emergency Response Automation Platform – Strategic Product Roadmap

### Document Purpose
This roadmap outlines how the Emergency Response Automation Platform evolves from a prototype into a fully deployable SOC automation system.  
It integrates:
- Verified manual-workflow baseline (58 actions, 3–4 minutes of non-call work)  
- System performance validated through 207,723 alerts  
- ROI analysis showing 7–9 month payback and $129k–$164k annual value  
- The current state of the codebase (Protocol Engine, Timer Manager, Dispatch Validator, Messaging Engine)

The roadmap is aligned with:
- ARCHITECTURE.md  
- WORKFLOW_AUTOMATION.md  
- DEPLOYMENT_APPROACH.md  
- ROI_Analysis.md  

---

# 1. Current State

## 1.1 Operational Features (7 of 19)
These features are fully implemented in the local prototype and validated with 200+ Cypress tests:

- Automated 2-minute gas monitoring with normalization detection (when applicable per protocol)
- Dynamic protocol display with real-time step activation  
- Automated alert resolution engine with deterministic classification  
- Centralized logging with MST timestamps and operator ID  
- Automated dispatch decisioning using validated eligibility rules  
- Global timer architecture (2-min, 30-min EC callback, 30-min dispatch follow-up)  
- Intelligent notes analysis for detecting resolution intent and coordinating across specialists  

These capabilities collectively eliminate **90–120 seconds of typing**, **all Clock-app use**, and **all manual timestamping**.

---

## 1.2 Baseline Operational Metrics (from BLN Analytics)

- **207,723 alerts** processed (Jan 10 → Sept 9, 2025)  
- **897 alerts/day**, all requiring the same manual workflow  
- **>99%** alerts acknowledged within 60 seconds  
- Manual protocol execution = **58 administrative actions** → **3–4 minutes** of non-call work  
- Over 8 months:  
  - **830,892 context switches**  
  - **5.4M manual actions**  
These values form the benchmark for automation ROI.

---

## 1.3 Projected Automation Gains
Based on Workflow Automation and ROI Analysis:

- Full protocol execution time reduced: **540 seconds → ~60 seconds**  
- Administrative time per alert reduced: **3–4 minutes → 20–50 seconds**  
- Context switching: **13 → 0**  
- Annual capacity gain equivalent to **2.0–2.8 FTEs**  
- Expected **7–9 month** payback  
- **$129k–$164k** annual net benefit  

These projections are derived from real alert volumes, measured timing, and validated manual workflows.

---

# 2. Strategic Features

The roadmap centers on **three core platform features** that, together, transform SOC operations.

---

# Feature 1: Protocol Configuration Manager (PCM)

## Status  
**In development.**  
UI complete, JSON builder functional, validation engine in progress.

## Purpose  
Provide a safe, configuration-driven method for designing and deploying customer-specific emergency response protocols without engineering involvement.

## Key Capabilities  
- JSON-based protocol definitions  
- Device-aware step filtering (G7c vs G7x)  
- Configurable timers (message wait, EC callback, dispatch follow-up)  
- Dispatch policies and service selection  
- Emergency-contact hierarchy builder  
- Multi-language support (EN/FR/ES) for outgoing messages  
- Validation engine preventing unsafe or invalid workflows  
- Self-contained JSON export/import  

## Architecture  
Form UI → Step Builder → Timer/Dispatch configuration → Validation Engine → JSON → ProtocolFactory loader

## Business Value  
- Reduces onboarding time from **weeks/months → hours/days**  
- Eliminates engineering bottlenecks for customer-specific workflows  
- Ensures all protocols are safe, consistent, and deterministic  
- Scales to large enterprise customers with diverse requirements  

---

# Feature 2: Enhanced SOC Dashboard (Real-Time Visual Alert Status)

## Status  
Foundational logic complete; 3–6 months to full readiness.

## Purpose  
Replace the current static urgency indicators with a synchronized, real-time alert timer that shows exactly how long an alert has been active and who has acknowledged it.

## Core Enhancements  
- Real-time timer for every alert  
- Color-coded urgency states:
  - **0–30 sec**: Blue  
  - **31–50 sec**: Yellow  
  - **51+ sec**: Red (with +MM:SS indicator)  
- Acknowledged alerts shown in Green with operator ID  
- Resolved alerts shown in neutral state  
- Real-time synchronization across all specialists  

## Architecture  
Alert timestamp → Synchronized timer → Visibility Engine → UI state renderer

## Business Value  
- Eliminates Teams messages to determine ownership  
- Removes ambiguity during simultaneous alerts  
- Reduces SLA breaches by improving situational awareness  
- Strengthens team coordination under high load  

---

# Feature 3: Intelligent Alert Assignment System

## Status  
Design phase; 6–12 months development with SOC + Product alignment.

## Purpose  
Eliminate the current “first-click race” and guarantee immediate, fair, and transparent alert ownership.

## Capabilities  
- Workload balancing based on live alert count  
- Language-aware routing (EN/FR/ES)  
- Availability awareness (breaks, offline time)  
- Sticky routing for repeated alerts from same device  
- Round-robin fallback  
- Full audit trail for assignment decisions  
- Shift Lead override controls  

## Architecture  
Live alert feed → Eligibility Filter → Assignment Engine → Assignment decision → WebSocket broadcast → SOC Dashboard

## Business Value  
- Alert-to-owner time: **25–40 seconds → under 2 seconds**  
- Eliminates “acknowledged but unactioned” uncertainties  
- Ensures equal workload distribution  
- Strengthens SLA consistency and fairness  

---

# 3. Implementation Timeline

## Phase 1 (Months 0–3)
- PCM: JSON builder, validation engine  
- Enhanced Dashboard: real-time timer engine  
- Test coverage expansion  

## Phase 2 (Months 3–9)
- PCM → ProtocolFactory integration  
- Enhanced Dashboard: acknowledgment visualization  
- Multi-specialist state synchronization  

## Phase 3 (Months 9–15)
- Alert Assignment Engine: eligibility + routing  
- Shift Lead dashboard prototype  
- SOC dashboard integration  

## Phase 4 (Months 15–24)
- Enterprise deployment workflows  
- Full assignment audit trail and historical routing analytics  
- Additional automation modules (pattern-based prediction, device-behavior analytics)

---

# 4. Technical Architecture

## 4.1 Integration Model  
- Built on **ProtocolFactory** + **Step Execution Engine**  
- Reuses Gas Safety, Timer Manager, Dispatch Validator, and Resolution Engine  
- Real-time updates via WebSockets or structured polling  
- No new backend dependencies required (static hosting sufficient for Phase 1–2)

## 4.2 Engineering Standards  
- >95% automated test coverage for core logic  
- Deterministic log structure with MST TZ enforcement  
- <100ms UI updates for dashboard  
- <200ms coordination updates for assignment system  
- WCAG AA accessibility

---

# 5. Success Metrics

## Operational  
- Protocol execution: **540 sec → ~60 sec**  
- Multi-specialist coordination: **45–60 sec → ~30 sec**  
- Alert-to-owner time: **25–40 sec → <2 sec**  
- 30% reduction in >60-second acknowledgement breaches  
- 99.9% reliability and uptime target  

## Adoption  
- 90%+ Dashboard adoption within 60 days  
- PCM protocol deployment <48 hours  
- Assignments >85% optimal routing  

## Strategic  
- Equivalent of **5–10 additional specialists** in effective capacity  
- Competitive differentiation over all industry peers  
- Stronger retention and service value for enterprise customers  

---

# 6. Risk Mitigation

## Technical  
- Real-time sync fallback to manual workflow  
- Assignment errors mitigated via transparent audit logs  
- Dashboard performance monitored at <100ms  

## Operational  
- Specialists remain fully in control  
- All safety decisions (EC calls, dispatch, resolution) remain human-led  
- Gas safety subsystem prevents unsafe resolutions  

## Competitive  
- Supports multiple provisional patent applications  
- 12–18 months competitive advantage window  
- Reinforces SOC as a key value driver for enterprise clients  

---

**Document Version:** 1.3  
**Last Updated:** November 30, 2025  
**Author:** Ivan Ferrer – Alerts Specialist ("Future" SOC Technical Innovation Lead)
