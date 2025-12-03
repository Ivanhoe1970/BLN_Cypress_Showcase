# Testing Strategy and Verification Framework  
Emergency Response Automation Suite

This document describes the complete automated testing strategy for the Emergency Response Automation Suite. It outlines the test architecture, execution layers, deterministic simulation model, Page Object design, Cypress folder structure, regression strategy, and CI/CD integration. More than 200 tests validate the system's correctness, safety, and stability.

---

## 1. Overview

The automated test suite validates the full Emergency Response Protocol Engine, covering:

- Protocol sequencing  
- Message classification and contextual interpretation  
- Device message handling  
- Timer management (monitoring, callback, dispatch)  
- Gas safety subsystem  
- Resolution engine  
- Dispatch logic  
- Pre-alert detection  
- Manual notes system  
- Multi-cycle protocol repetitions  
- Log format contract validation  
- UI safeguards and error-state protection  

All tests run locally against static HTML/JS assets.  
No Blackline backend systems are invoked.

---

## 2. Test Environment and Framework

**Environment:**

- Cypress 14.x  
- Headless Chrome  
- Local development server (http-server or live-server)  
- Base URL: http://127.0.0.1:5500  
- Deterministic mocks for device messages, gas readings, and resolution results  
- Clock virtualization with `cy.clock()` and `cy.tick()`  

All tests use predictable, deterministic inputs for fully repeatable CI execution.

---

## 3. Test Folder Structure

The folder structure mirrors the system architecture described in **ARCHITECTURE.md**.  
Updated to match the current repo:

```
cypress/
├── e2e/
│   ├── api/
│   │   └── requests-formation.cy.js
│   ├── device-connectivity/
│   │   └── device-connectivity.cy.js
│   ├── emergency-contacts/
│   │   └── emergency-contacts-substeps.cy.js
│   ├── gas/
│   │   └── gas-guard-and-override.cy.js
│   ├── gas-scenarios/
│   │   ├── emergency_protocol_gas.cy.js
│   │   ├── gas-alert-messaging.cy.js
│   │   ├── gas-monitoring-sequencing.cy.js
│   │   ├── gas-normalization-sequencing.cy.js
│   │   └── gas-override-modal.cy.js
│   ├── integration/
│   │   ├── protocol-steps-with-messaging.cy.js
│   │   ├── protocol-workflow.cy.js
│   │   └── smoke_boot_shell.cy.js
│   ├── logs/
│   │   └── protocol-log-contract.cy.js
│   ├── manual-notes-system/
│   │   └── manual-notes-system.cy.js
│   ├── messaging-system/
│   │   ├── device-message-ui.cy.js
│   │   ├── incoming-garbled-message.cy.js
│   │   └── outgoing-device-messaging-and-replies.cy.js
│   ├── protocol-cycling/
│   │   ├── device-moving-cycling.cy.js
│   │   ├── device-offline-cycling.cy.js
│   │   └── location-stale-cycling.cy.js
│   ├── protocol-flows/
│       ├── emergency_protocol_nongas.cy.js
│       ├── fall-detection-protocol.cy.js
│       ├── missed-checkin-protocol.cy.js
│       ├── no-motion-protocol.cy.js
│       └── sos-protocol.cy.js
│
├── regression-suite/
│   ├── component-tests/
│   │   ├── device-messaging.cy.js
│   │   ├── protocol-workflow.cy.js
│   │   └── timer-management.cy.js
│   ├── critical-path/
│   │   ├── gas-emergency-flows.cy.js
│   │   ├── non-gas-alert-protocols.cy.js
│   │   └── system-safety-validations.cy.js
│   ├── integration/
│   │   ├── alert-resolution.cy.js
│   │   └── dispatch-scenarios.cy.js
│   └── debug-test.cy.js
│
├── resolution-logic/
│   ├── pre-alert-system.cy.js
│   ├── resolution-false-alert-with-dispatch.cy.js
│   ├── resolution-false-alert-without-dispatch.cy.js
│   ├── resolution-incident-with-dispatch-gas.cy.js
│   └── resolution-incident-without-dispatch-gas.cy.js
│
├── timer-management/
│   ├── core-timer-functionality.cy.js
│   └── message-device-timers.cy.js
│
├── fixtures/
│   ├── alertsData.json
│   ├── apiResponses.json
│   └── non_gas_alerts.json
│
└── pages/
    └── EmergencyProtocolPage.js
```

This structure provides a direct mapping to the **22 critical functions** of the Protocol Engine.

---

## 4. Page Object Model Architecture

The Page Object Model:

- Uses one-line getters  
- Returns Cypress chainables only  
- Contains no business logic  
- Provides readable UI interactions  
- Ensures stability when selectors change  

**Example:**

```javascript
get step1Button() { return cy.get('[data-cy="step-1-btn"]'); }
triggerStep1() { return this.step1Button.click(); }
```

All protocol flows depend on this class for consistent, abstracted UI interactions.

---

## 5. Deterministic Simulation and Mocking

The system uses deterministic inputs to ensure stable results:

- Fixed gas readings  
- Forced HIGH/NORMAL transitions  
- Deterministic device replies via `simulateDeviceResponse()`  
- Forced dispatch approvals/denials  
- Mocked resolution payloads  
- Mocked API outcomes for device messaging  

Nothing is randomized.  
Every test produces identical outcomes across runs and environments.

---

## 6. Fixtures and Test Data

### alertsData.json  
Contains user and alert fixtures:

- Device IDs  
- Gas readings  
- Emergency contacts  
- Protocol configurations  
- Pre-alert examples  

### apiResponses.json  
Contains mocked API responses:

- Device messaging  
- Dispatch success  
- Resolution success  
- Gas snapshots  
- Blocking schemas  

### non_gas_alerts.json  
Used for:

- Non-gas workflows  
- Dispatch address population  
- Emergency contact ordering  
- Resolution behavior  

All fixtures load via `cy.fixture()` and are injected into the DOM.

---

## 7. Component Tests

Validates:

- Device messaging UI  
- Timer UI transitions  
- Protocol step enabling/disabling  
- DOM synchronization  

Ensures correctness of isolated components before integration.

---

## 8. Integration Tests

Covers:

- Full protocol sequencing  
- Timers linked to messaging  
- Emergency contacts logic  
- Gas monitoring rules  
- Dispatch routing behavior  

Ensures modules behave correctly when combined.

---

## 9. Gas Safety Test Suites

Validates:

- Gas monitoring sequences  
- HIGH → NORMAL transitions  
- Gas override modal  
- Resolution blocking when gas HIGH  
- Auto-resolution on normalization  

These tests enforce safety gating rules defined in **ARCHITECTURE.md**.

---

## 10. Resolution Logic Tests

Covers:

- Incident with dispatch  
- Incident without dispatch  
- False alert flows  
- Gas alerts requiring override  
- Pre-alert (>24h) lockout  

Ensures deterministic rule-based resolution behavior.

---

## 11. Timer Management Tests

Covers:

- Single global timer behavior  
- Start/cancel flows  
- Countdown correctness  
- Audio alert activation  
- Timeout routing  
- EC callback timers (shortened for tests)  

Ensures consistent centralized timing behavior.

---

## 12. Regression Suite

**Purpose:**

- Prevent regressions  
- Protect critical flows  
- Validate gas & non-gas workflows  
- Guarantee dispatch correctness  
- Preserve timer and safety behaviors  

Always runs on every push via CI.

---

## 13. Protocol Cycling Tests

Simulates repeated cycles triggered by:

- Device motion  
- Device offline  
- Stale or invalid GPS  
- No-contact loops  

Ensures the system safely restarts protocol steps when required.

---

## 14. Manual Notes System Tests

Validates:

- Typed notes  
- Auto-populated templates  
- Logging behavior  
- Resolution overrides  

Ensures complete audit log fidelity.

---

## 15. Log Contract Tests

Every log entry must match:

```
[HH:mm:ss MST] Step X: <Action>. <Note> | Op 417
```

Contract tests verify:

- Time format correctness  
- Step number accuracy  
- Action phrasing  
- Operator ID  
- Gas snapshots (when applicable)  

Guarantees stable audit compliance.

---

## 16. CI/CD Integration

**Pipeline steps:**

- Install dependencies  
- Start local server  
- Run Cypress headless  
- Deploy to GitHub Pages on success  

Ensures `main` remains stable and deployable.

---

## 17. Known Limitations

- No backend persistence  
- No real device telemetry  
- All API calls mocked  
- Auto-ack tests skipped in HIGH gas mode (by design)  

---

## 18. Appendix: Command References

**Run tests interactively:**
```
npx http-server -p 5500 . &
npx cypress open
```

**Run headless tests:**
```
npx http-server -p 5500 . &
npx cypress run --browser chrome
```

---

**Version:** 5.0  
**Last Updated:** December 2, 2025  
**Author:** Ivan Ferrer — Alerts Specialist