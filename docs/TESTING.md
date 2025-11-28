TESTING.md — Emergency Response Automation Suite
Comprehensive Test Architecture, Coverage, Automation Strategy & CI/CD Pipeline

Version: 1.0 — December 2025
Author: Ivan Ferrer — SOC Automation Engineering

📋 Table of Contents

Testing Philosophy

Test Environment & Framework

Test Folder Structure

Page Object Model Architecture

Selector Strategy

Fixtures & Test Data

Subsystem Coverage Map

Critical Test Scenarios

Timer Mocking & Deterministic Testing

Intentional Pending Tests

CI/CD Pipeline Integration

Running Tests Locally

Quality Metrics & Stability

1️⃣ Testing Philosophy

The Emergency Response Automation Suite manages life-safety workflows, so the testing strategy prioritizes deterministic, safety-driven validation.

✔ Deterministic execution using cy.clock()

Timers, delays, monitoring windows, and device-reply timeouts behave identically on every machine.

✔ Subsystem isolation

Each of the 21 core automation subsystems (Protocol Factory → Resolution Engine) is validated individually and through full end-to-end flows.

✔ Data-driven

All alert types — gas, non-gas, missed check-in, fall, SOS — load from static JSON fixtures.

✔ Full lifecycle validation

Tests cover:

Alert load

Protocol execution

Dispatcher conditions

Emergency contacts

Message flows

Resolution gating

Pre-alert logic

Timers

Log contract compliance

✔ Production-safe

The suite interacts only with local HTML/JS assets — no external BLN systems.

2️⃣ Test Environment & Framework
✔ Cypress 14.x
✔ Chrome headless
✔ Live-server via http-server
✔ POM-based test architecture
✔ GitHub Actions CI (fast, reliable)
✔ Deterministic via full clock mocking
3️⃣ Test Folder Structure

Your verified directory structure:

cypress/
│
├── e2e/
│   ├── api/
│   │   └── requests-formation.cy.js
│   │
│   ├── device-connectivity/
│   │   └── device-connectivity.cy.js
│   │
│   ├── emergency-contacts/
│   │   └── emergency-contacts-substeps.cy.js
│   │
│   ├── gas/
│   │   └── gas-guard-and-override.cy.js
│   │
│   ├── gas-scenarios/
│   │   ├── emergency_protocol_gas.cy.js
│   │   ├── gas-alert-messaging.cy.js
│   │   ├── gas-monitoring-sequencing.cy.js
│   │   ├── gas-normalization-sequencing.cy.js
│   │   └── gas-override-modal.cy.js
│   │
│   ├── integration/
│   │   ├── protocol-steps-with-messaging.cy.js
│   │   ├── protocol-workflow.cy.js
│   │   └── smoke_boot_shell.cy.js
│   │
│   ├── logs/
│   │   └── protocol-log-contract.cy.js
│   │
│   ├── manual-notes-system/
│   │   └── manual-notes-system.cy.js
│   │
│   ├── messaging-system/
│   │   ├── device-message-ui.cy.js
│   │   ├── incoming-garbled-message.cy.js
│   │   └── outgoing-device-messaging-and-replies.cy.js
│   │
│   ├── protocol-cycling/
│   │   ├── device-moving-cycling.cy.js
│   │   ├── device-offline-cycling.cy.js
│   │   └── location-stale-cycling.cy.js
│   │
│   ├── protocol-flows/
│   │   ├── emergency_protocol_nongas.cy.js
│   │   ├── fall-detection-protocol.cy.js
│   │   ├── missed-checkin-protocol.cy.js
│   │   ├── no-motion-protocol.cy.js
│   │   └── sos-protocol.cy.js
│   │
│   ├── regression-suite/
│   │   ├── component-tests/
│   │   │   ├── device-messaging.cy.js
│   │   │   ├── protocol-workflow.cy.js
│   │   │   └── timer-management.cy.js
│   │   │
│   │   ├── critical-path/
│   │   │   ├── gas-emergency-flows.cy.js
│   │   │   ├── non-gas-alert-protocols.cy.js
│   │   │   └── system-safety-validations.cy.js
│   │   │
│   │   ├── integration/
│   │   │   ├── alert-resolution.cy.js
│   │   │   ├── dispatch-scenarios.cy.js
│   │   │   └── debug-test.cy.js
│   │   │
│   │   └── resolution-logic/
│   │       ├── pre-alert-system.cy.js
│   │       ├── resolution-false-alert-with-dispatch.cy.js
│   │       ├── resolution-false-alert-without-dispatch.cy.js
│   │       ├── resolution-incident-with-dispatch-gas.cy.js
│   │       └── resolution-incident-without-dispatch-gas.cy.js
│   │
│   └── timer-management/
│       ├── core-timer-functionality.cy.js
│       └── message-device-timers.cy.js
│
├── fixtures/
│   ├── alertsData.json
│   ├── apiResponses.json
│   └── non_gas_alerts.json
│
└── support/
    └── pages/
        └── EmergencyProtocolPage.js


This structure directly aligns with the 21 subsystems in ARCHITECTURE.md.

4️⃣ Page Object Model Architecture
Design Principles:

One-line getters

Return Cypress chainables

Contain DOM logic, not business logic

Readable, high-level actions for tests

Example:

get timer() { return cy.get('[data-cy="timer-display"]'); }
get sendMessageButton() { return cy.get('[data-cy="send-message-btn"]'); }


Action helpers:

sendMessage(text) {
  this.sendMessageButton.click();
  cy.get('[data-cy="message-input"]').type(text);
  cy.get('[data-cy="confirm-send"]').click();
}


This keeps tests clean, readable, and maintainable.

5️⃣ Selector Strategy

All selectors use data-cy:

✔ Stable across UI refactors
✔ Zero coupling to layout/CSS
✔ Industry best practice for Cypress

Examples:

<div data-cy="protocol-log-container"></div>
<button data-cy="dispatch-btn"></button>

6️⃣ Fixtures & Test Data
✔ alertsData.json

A deep, multi-alert fixture powering gas and non-gas scenarios.
Includes:

usersData → Device info, EC contacts

alertTypesData → All alert types used in tests:

H₂S high (spontaneous/response)

CO high (normalization)

O₂ depletion normalization

O₂ enrichment escalation

Fall detection

SOS

No motion

Missed check-in

Pre-alert (25 hours old)

Device conditions used in dispatch validation:

lastComm

battery

signal

deviceSpeed

locationAge

deviceStatus

This is the primary gas fixture.

✔ apiResponses.json

Simulates backend behavior:

send message → success

dispatch → success

resolution → success

gas snapshot → HIGH

resolution blocked → HIGH gas

Used in:

messaging tests

dispatch tests

resolution gating

✔ non_gas_alerts.json

Contains realistic production-style non-gas alerts, including:

SOS

Message tests

EC contact info

Device telemetry

Geo info

Gas readings normalized

Used in:

protocol-flows for non-gas

logs

resolution logic

dispatch scenarios with valid GPS

7️⃣ Subsystem Coverage Map

High-level subsystem → test suite mapping:

Subsystem	Covered In	Validates
Protocol Factory	protocol-flows/, integration/	Config-driven step loading
Timer Engine	timer-management/, component-tests/	Start, cancel, expire, countdown UI
Gas Safety Engine	gas-scenarios/, gas/	HIGH gas, O₂ depletion, normalization
Device Messaging Engine	messaging-system/	Outgoing prompt flow, reply classification
EC Contact Engine	emergency-contacts/	Step 4 sequence, retry logic
Dispatch Engine	dispatch-scenarios/, critical-path	GPS validity, device speed, overrides
Resolution Engine	resolution-logic/, alert-resolution	Incident classification, blocking
Connectivity Engine	device-connectivity/, cycling/	Offline detection, stale locations
Pre-alert Engine	pre-alert-system	>24h lockout, auto-resolution
Log Engine	logs/	Timestamp format, contract integrity
Regression Suite	regression-suite/	Full cross-system safety validation
8️⃣ Critical Test Scenarios
🟩 Gas Scenarios

CO HIGH → NORMAL after Step 1

O₂ depletion → normalize after 60s

O₂ enrichment → escalate

H₂S HIGH → block resolution

Gas override modal behavior

Monitoring timer (120s under cy.tick)

🟦 Timer System

Message timer

Monitoring timer

EC callback timer

Dispatch callback timer

Timer cancellation logs

🟧 Dispatch Conditions

Location valid (<5 min)

Device stationary (<5 km/h)

Device online

Skip reasons (offline, stale)

Dispatch override

🟨 Resolution Logic

False alert with dispatch

False alert without dispatch

Incident with dispatch

Incident without dispatch

HIGH gas resolution block

Pre-alert auto-resolution

🟪 Log Contract Tests

Correct MST timestamps

Correct step numbering

Auto-ack logs

Device message logs

Gas snapshot logs

9️⃣ Timer Mocking & Deterministic Testing

All timer-based flows use:

cy.clock(Date.now());
cy.tick(120000); // simulate 2 minutes


This ensures:

No flakiness

Millisecond-level determinism

Fast CI runs

Accurate expiration logic

Timers validated:

2-minute gas monitoring

Device reply timeout

30-minute EC callback

30-minute dispatch callback

🔟 Intentional Pending Tests

Your suite includes 5 pending tests, all intentional.

Cause:
The log-contract spec uses conditional test execution:

s.supportsAutoAck ? it : it.skip


Meaning:

Gas HIGH → auto-ack must not fire

Non-gas & normalized gas → auto-ack must fire

Skipped tests = Cypress reports them as pending, by design.

This is not a failure.
This is contract enforcement for safety logic.
1️⃣1️⃣ CI/CD Pipeline Integration

Your actual .github/workflows/cypress-ci.yaml:

Runs tests on every push and PR to main

Uses Node 20

Uses npm ci for deterministic installs

Launches http-server to serve the entire repo

Waits for port 5500 via wait-on

Runs Cypress:

npx cypress run --browser chrome --config baseUrl=http://127.0.0.1:5500


If tests pass → deploys via GitHub Pages

Uses concurrency to cancel redundant runs

No deploy is triggered if tests fail

CI Runtime: ~4m 23s
Stability: 100% passing last 20 runs

This is a clean, fast, reproducible CI pipeline suitable for internal adoption.

1️⃣2️⃣ Running Tests Locally
Open Cypress UI:
npm run cy:open

Headless run:
npm run cy:run

Single test:
cypress open --spec "cypress/e2e/gas-scenarios/gas-monitoring-sequencing.cy.js"

1️⃣3️⃣ Quality Metrics & Stability
✔ Total Tests: 209
✔ Passing: 204
✔ Pending (expected): 5
✔ Failing: 0
✔ Runtime: 4m 23s
✔ Flaky tests: 0
✔ CI Stability: 100%

All tests validate:

Gas + non-gas

Dispatch

EC contacts

Device connectivity

Resolution logic

Timers

Log contracts

Pre-alert logic

Message classification

System-wide regression suite