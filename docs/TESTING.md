# Testing Strategy and Verification Framework  
Emergency Response Automation Suite

This document describes the full automated testing strategy for the Emergency Response Automation Suite. It covers the test architecture, folder structure, deterministic mocking, POM design, fixture management, regression strategy, CI integration, and contract guarantees validated through more than 200 automated tests.

---

# 1. Overview

The test suite validates the entire Emergency Response Protocol Engine:

- Protocol sequencing  
- Message classification  
- Device reply handling  
- Timer behavior  
- Gas safety logic  
- Resolution logic  
- Dispatch logic  
- Pre-alert logic  
- Manual notes system  
- Protocol restart cycles  
- Log contract validation  
- UI consistency and error safeguards  

All tests run fully locally against static HTML/JS assets.  
No external Blackline systems are contacted.

---

# 2. Test Environment & Framework

Environment:

- Cypress 14.x  
- Chrome headless  
- Local server launched via `http-server`  
- Base URL: `http://127.0.0.1:5500`  
- Deterministic mocks for device messages, gas readings, and resolution states  
- Clock control via `cy.clock()` and `cy.tick()`  

---

# 3. Test Folder Structure

The full end-to-end test structure is:

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

This structure matches the subsystems in `ARCHITECTURE.md`.

---

# 4. Page Object Model Architecture

Design principles:

- One-line getters  
- Return Cypress chainables  
- No business logic  
- Provide readable high-level actions  

Example:

```javascript
get step1Button() { return cy.get('[data-cy="step-1-btn"]'); }
triggerStep1() { return this.step1Button.click(); }
```

The POM centralizes all selectors and enables stable test maintenance.

---

# 5. Deterministic Simulation & Mocking

All device messages, gas readings, and UI behaviors are deterministic:

- Deterministic gas snapshots  
- Forced HIGH/NORMAL values  
- Simulated device replies (`simulateDeviceResponse()`)  
- Mocked dispatch responses  
- Mocked resolution outputs  
- Mocked API success/error states  

This ensures fully repeatable tests.

---

# 6. Fixtures & Test Data

Fixtures used:

### alertsData.json  
Contains:
- All test users  
- Emergency contacts  
- Device conditions  
- Gas scenarios  
- Protocol configurations  
- Pre-alert cases  

### apiResponses.json  
Models:
- Successful device message delivery  
- Successful dispatch  
- Successful resolution  
- HIGH gas snapshots  
- Resolution blocking schemas  

### non_gas_alerts.json  
Used for:
- Non-gas alert workflows  
- Dispatch address insertion  
- Emergency contact ordering  
- Resolution behavior  

All fixtures are loaded via `cy.fixture()` and injected into the DOM at runtime.

---

# 7. Component Tests

Examples:
- Device messaging UI  
- Timer management UI  
- Protocol workflow UI  

Component tests validate:
- Button enabling/disabling  
- Proper DOM rendering  
- Dynamic text insertion  
- Timer visibility transitions  

---

# 8. Integration Tests

Examples:
- Protocol workflow  
- Step-by-step sequencing  
- Message + timer interactions  
- EC call behavior  
- Gas monitoring transitions  

These tests verify that the individual parts interact correctly.

---

# 9. Gas Safety Test Suites

Includes:
- Gas monitoring sequencing  
- Gas normalization  
- Gas override modal  
- Guarding resolution while HIGH  
- Automated normalization-triggered resolution  

All HIGH vs NORMAL transitions are checked.

---

# 10. Resolution Logic Tests

Covers:
- Incident with dispatch  
- Incident without dispatch  
- False alerts  
- Gas alerts with overrides  
- Pre-alert detection  
- Safety gating  

These validate the deterministic algorithm described in `ARCHITECTURE.md`.

---

# 11. Timer Management Tests

Validates:
- Single global timer rule  
- Start/cancel flows  
- Visual countdown  
- Audio alert activation  
- Timer expiration routing  
- Message timeout flows  
- EC callback 30-min timers (shortened for tests)  

---

# 12. Regression Suite

Guarantees long-term stability:

- Component reliability  
- Critical path flows  
- Gas emergency flows  
- Non-gas protocols  
- System safety validations  
- Integration tests for dispatch + resolution  

This suite prevents regressions when new features are added.

---

# 13. Protocol Cycling Tests

Simulate:
- Device moving  
- Device offline  
- Location stale  
- Repeating protocol loops  

Ensures consistent behavior across repeated cycles.

---

# 14. Manual Notes System Tests

Validates:
- Note editing  
- Auto-populated templates  
- Logging behavior  
- Resolution note overrides  

---

# 15. Log Contract Tests

Ensures every log entry matches required format:

```
[HH:mm:ss MST] Step X: <Action>. <Note> | Op 417
```

Contract tests validate:
- Timestamp  
- Step number  
- Action text  
- Operator  
- Gas snapshots (when applicable)  

Pending tests (5) remain intentionally skipped for HIGH-gas auto-ack scenarios.

---

# 16. CI/CD Integration

The GitHub Actions pipeline:

```
name: Deploy and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

Workflow:
1. Install dependencies  
2. Start local server  
3. Run Cypress in Chrome headless  
4. If tests pass → deploy GitHub Pages site  

Benefits:
- Fast  
- Deterministic  
- Fully automated  
- Ensures main branch always has stable builds  

---

# 17. Known Limitations

- No true backend  
- No persistent logs  
- Device telemetry simulated  
- API calls mocked  
- Skipped auto-ack tests in HIGH gas mode (intentional)  

---

# 18. Appendix: Command References

### Run tests locally:
```
npx http-server -p 5500 . &
npx cypress open
```

### Run CI tests locally:
```
npx http-server -p 5500 . &
npx cypress run --browser chrome
```

---

Document Version: 2.0  
Last Updated: November 28, 2025  
Author: Ivan Ferrer (Op 417)

