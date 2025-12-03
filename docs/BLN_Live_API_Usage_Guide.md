# BLN Live API Usage Guide  
### Emergency Response Automation Suite  

---

## Purpose of This Document
This guide provides a **clear, concise mapping** of how the Emergency Response Automation Suite integrates with **existing** BLN Live APIs.

Key premise:

> **No new backend APIs are required.**  
> The automation layer operates entirely on **existing alert, notes, messaging, and resolution endpoints** already used in the BLN Live portal.

This document is intended for internal architecture review with BIT, Development, and Product Management.

---

## Integration Philosophy

The Emergency Response Automation Suite is a **UI/automation layer** built on top of the current BLN Live platform.  
It:

- Does **not** modify backend infrastructure  
- Does **not** require new endpoints  
- Does **not** change database entities  
- Does **not** alter BLN's authentication model  
- Does **not** introduce any new API contracts  

Instead, it automates and streamlines the specialist workflow by consuming the **same API calls** the portal already uses.

---

## High-Level Architecture

The automation layer depends on four categories of existing data:

1. Alert information (type, user, device, timestamps)  
2. Device telemetry (gas readings, connectivity, location)  
3. Device messaging (outgoing messages and incoming replies)  
4. Notes and resolution updates  

All additional automation logic (timers, dispatch checks, gas-gating, message intelligence) is performed client-side.

---

## Existing BLN Live API Endpoints Used

The endpoints listed below are inferred from BLN Live's current portal behavior, URL patterns, and DevTools network activity. They represent existing functionality already used by the platform today. Actual request/response schemas should be confirmed with the Development Team. No new backend endpoints are required for Phase 1 of the automation layer.

### 1. Alert Data
**GET /api/alerts/{alertId}**  
Used to load alert type, timestamps, gas configuration, device ID, and user details.

---

### 2. Device Sensor Data
**GET /api/devices/{deviceId}/sensors**  
Polled during the gas monitoring phase.  
Follows the same REST/XHR polling model currently used by BLN Live.

---

### 3. Device Messaging
**POST /api/devices/{deviceId}/messages**  
Enables the "message-device" workflow step.  
Triggers a 2-minute response timer and supports handling incoming messages.

---

### 4. Emergency Contacts
**GET /api/users/{userId}/emergency-contacts**  
Provides emergency contact lists for the "call-emergency-contacts" workflow step.

---

### 5. Notes / Protocol Log
**POST /api/alerts/{alertId}/notes**  
Used to log structured protocol entries:  
`[HH:mm:ss MST] Step X: <action>. <details> | Op 417`

The API stores notes in UTC ISO format; MST/MDT formatting is applied in the UI.

---

### 6. Alert Resolution
**POST /api/alerts/{alertId}/resolve**  
Used to submit final resolution, with client-side validation for gas safety and override logic.

---

## Client-Side Features Requiring No API Changes

The following features operate entirely on the client using existing BLN data:

- Global timer system  
- Dispatch readiness validation  
- Automated note generation  
- Gas-level safety gating  
- Message interpretation logic  

All of these are implemented with JavaScript and do not require backend support.

---

## Data Flow Example

A typical alert workflow uses only existing endpoints:

1. Load alert details  
2. Poll device gas data (if required)  
3. Send device message  
4. Log protocol actions  
5. Load emergency contacts  
6. Validate dispatch readiness  
7. Submit resolution  

All additional workflow logic remains client-side.

---

## Production Integration Requirements

To integrate into BLN Live, the following are required:

1. Access to existing alert, messaging, notes, and sensor endpoints  
2. Confirmation of request/response schemas  
3. Reuse of BLN Live's existing session-based authentication  
4. A staging environment for testing  
5. Replacement of the static "Protocol" tab with the automation UI  

No backend changes are required for Phase 1.

---

## Key Assumptions

- BLN Live's REST/XHR polling pattern remains unchanged  
- Messaging and notes APIs remain accessible  
- Resolution API behavior remains consistent  
- All automation logic is executed in the browser  
- Existing authentication and authorization flows are preserved  

---

## Summary

The Emergency Response Automation Suite integrates cleanly with BLN Live using the same APIs already present in the platform. All automation, safety validation, timers, and workflow logic are implemented on the client side.

No new API endpoints, backend development, or infrastructure changes are required for Phase 1.

---

**Version:** 5.0  
**Last Updated:** December 2, 2025  
**Author:** Ivan Ferrer — Alerts Specialist