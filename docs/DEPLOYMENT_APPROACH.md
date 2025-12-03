# DEPLOYMENT_APPROACH.md  
## Production Deployment Specification  
### Emergency Response Automation Platform

---

## 1. Purpose

This document defines the production-ready deployment approach for the Emergency Response Automation Platform.  
It specifies the required file structure, build artifacts, hosting model, environment configuration, integration points with Blackline Live, and ongoing operational requirements.

This is a deployment-focused document. It complements (but does not duplicate):

- ARCHITECTURE.md  
- ROADMAP.md  
- README.md  
- TESTING.md  

Its purpose is to give BIT/Dev/SOC stakeholders a unified reference for installing, hosting, validating, and maintaining the platform.

---

## 2. Deployment Model

The platform is deployed as a **static web application** containing:

- A single HTML execution environment (main runtime)
- An optional configuration builder (PCM)
- Supporting JavaScript utilities (log hydrator, incident report formatter)
- Local fixtures (for demo/staging only)

No backend server, database, or container infrastructure is required to run the local execution environment.  
Production hosting (internal Blackline environment) must supply:

- HTTPS hosting  
- CORS permissions from BLN Live  
- Authentication via the user's existing BLN Live session  
- Access to messaging and notes endpoints  

All protocol execution, timers, logic, and UI state run on the client side.

---

## 3. Required File Structure

Only the following files inside the `automated-gas-alert-protocol/` directory are required for production deployment:

```
automated-gas-alert-protocol/
│
├── emergency-protocol-clean.html      ← Main execution environment (gas + non-gas)
├── protocol-config-manager.html        ← PCM (admin-side protocol generator)
├── protocol-log-hydrator-v22.js        ← Log hydration + timeline inference engine
├── incident-report-v22.js              ← (Optional) Incident report auto-generation
│
└── fixtures/                           ← Only used for demo/staging; not required for production
      └── *.json
```

Everything outside this folder (tests, CI files, docs, Cypress, screenshots) is **not included** in production deployment.

### 3.1 Main Runtime: emergency-protocol-clean.html

Contains:

- Protocol engine (Steps 1–5)  
- Device messaging  
- Gas safety subsystem  
- Location gating  
- Dispatch flow  
- Resolution engine  
- Timer management  
- Note Intelligence Engine  
- UI layout with BLN branding  

Used by specialists during live alert handling.

### 3.2 Protocol Configuration Manager (PCM)

`protocol-config-manager.html`  
Used only by internal configuration staff to generate JSON-based protocol templates for:

- Organizations  
- Alert types  
- Device types  
- Language preferences (EN/FR/ES – future)  

PCM output JSON files can be loaded by the main app in future modular versions of the system.

### 3.3 protocol-log-hydrator-v22.js

Hydrates:

- currentAlert timestamps  
- Dispatch snapshots  
- Address / LSD / lat/lng extraction  
- Missing or malformed time formats (MST/MDT/CST/UTC, etc.)

Used during:

- Incident report generation  
- Retrospective analysis  
- Multi-step dispatch reconstruction  

### 3.4 Incident Report Generator

`incident-report-v22.js`  
Generates a fully BLN-aligned incident report with:

- Timeline  
- Dispatch section  
- Challenges section (auto-filled or blank)  
- Correct Mountain Time handling  

Not required for protocol execution but included for completeness.

---

## 4. Hosting Requirements

### 4.1 HTTPS Required

All hosting must occur on HTTPS.  
Required to:

- Access BLN Live authenticated APIs  
- Enable device messaging  
- Enable resolution posting  
- Support upcoming File System API features (PCM exports)

Local development may use:  
`http://127.0.0.1` or `http://localhost:<port>`.

### 4.2 CORS Requirements

To allow the app to send messages and resolutions through BLN Live's API:

The BLN Live backend must allow:

```
Access-Control-Allow-Origin: https://<deployment-domain>
Access-Control-Allow-Credentials: true
```

Example deployment:

```
https://internal-tools.blacklinesafety.com/protocol/
```

This domain must be explicitly added to BLN Live's CORS allowlist.

### 4.3 Authentication Model

The Emergency Response Automation Platform uses the operator's existing BLN Live session.

Requirements:

- User must already be logged into BLN Live  
- Cookies/session tokens must remain accessible  
- No separate auth flow required  

If session expires → messaging, resolution, and profile fetches fail gracefully.

---

## 5. Integration Requirements

### 5.1 BLN Live Device Messaging API

Used for:

- Sending messages to G7c or G7x devices  
- Replaying incoming device replies  
- Simulating message classification  
- Triggering Step 2 timers

Requirements:

- Valid BLN session  
- CORS allowlist  
- Device must be online for real messages

### 5.2 Notes & Resolution API

Used for:

- Posting specialist notes  
- Logging Steps 1–5  
- Posting the final resolution  
- Recording overrides

Requirements:

- Valid BLN session  
- CORS allowlist  
- Correct alert ID in runtime state

### 5.3 Location API (Optional in current version)

A future enhancement may query:

- Last known GPS  
- Location freshness  
- Address normalization  

Today, the system uses the fixture or BLN-provided alert payload.

---

## 6. Deployment Environments

### 6.1 Local Development Environment

No build step required.

Served via:

```
live-server
python -m http.server
VS Code Live Preview
```

### 6.2 Internal Staging / Demo Deployment

Hosted on an internal BLN HTTPS environment.

Used for:

- Internal demos  
- Validation by BIT/Dev  
- Stakeholder reviews  

### 6.3 Production Deployment

Hosted in BLN-controlled infrastructure.

Requirements:

- HTTPS  
- CORS allowlist applied  
- Static file hosting (NGINX, S3+CloudFront, or internal host)  
- Version foldering (v1, v1.1, v2, etc.)  
- Access restricted to authenticated BLN accounts  

---

## 7. Operational Responsibilities

### 7.1 SOC Specialists

- Perform all protocol actions  
- Confirm Note Intelligence suggestions  
- Handle alerts end-to-end (ack → resolution)  
- No supervisor approval gates involved  

### 7.2 BIT / Dev Team

- Apply CORS updates  
- Maintain hosting environment  
- Provide API status monitoring  
- Support future modular deployments (PCM → App runtime)

### 7.3 Automation Owner

- Update codebase when features evolve  
- Maintain documentation (architecture, testing, roadmap)  
- Validate feature stability through Cypress CI  
- Support configuration teams using the PCM  

---

## 8. Deployment Steps

### 8.1 Prepare Production Bundle

Copy only:

```
emergency-protocol-clean.html
protocol-config-manager.html
protocol-log-hydrator-v22.js
incident-report-v22.js (optional)
fixtures/ (optional for demos)
```

### 8.2 Configure Hosting Environment

- Serve files via HTTPS  
- Apply correct MIME types (HTML/JS/JSON)  
- Ensure caching is disabled or versioned  

### 8.3 Update BLN Live CORS Allowlist

Add the deployment domain:

```
https://<your-internal-hosting-domain>
```

### 8.4 Validate API Connectivity

1. Confirm operator login persists  
2. Open the app  
3. Trigger a device message  
4. Confirm it is delivered  
5. Trigger a resolution note  
6. Confirm BLN Live accepts the POST request

### 8.5 Validate Specialist Workflow

Run:

- A full non-gas alert  
- A full gas alert (HIGH → NORMAL → resolution)  
- A dispatch scenario  
- A location-invalid scenario  
- An incoming message classification scenario  

---

## 9. Monitoring & Observability

Because the system is client-side:

- No backend logs by default  
- Browser console logs used for diagnostics  
- BLN Live audit trail captures:
  - Notes  
  - Steps  
  - Resolution  
  - Dispatch events  

Future options:

- Internal JS telemetry endpoint  
- Error reporting service  
- Page load analytics  

---

## 10. Versioning Strategy

Use semantic versioning:

```
v1.0 – Initial stable deployment
v1.1 – PCM enhancements
v2.0 – Modular runtime (JSON-based protocol loading)
v2.1 – G7x/G7c adaptive logic
```

Each version should reside in a dedicated folder:

```
/protocol/v1/
/protocol/v1.1/
/protocol/v2/
```

Avoid overwriting live production files.

---

## 11. Known Limitations

- No server-side state  
- Requires BLN Live session to function  
- PCM does not yet auto-load generated JSON into runtime (planned v2.0)  
- Gas analytics work entirely client-side  
- Dispatch requires valid location snapshot  
- G7x cannot receive calls (device awareness included)  

---

## 12. Future Deployment Enhancements

- Server-hosted JSON protocol registry (PCM → runtime)
- Per-customer protocol profiles
- Multi-language device messages (EN/FR/ES)
- Secure audit export endpoints
- Alert ingestion API for standalone demo environments

---

## Metadata

**Version:** 5.0  
**Last Updated:** December 2, 2025  
**Author:** Ivan Ferrer — Alerts Specialist