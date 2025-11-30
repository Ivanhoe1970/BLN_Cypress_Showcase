# Workflow Automation Approach  
**Emergency Response Automation Platform**

This document describes how the Emergency Response Automation Platform eliminates manual actions, reduces cognitive load, and creates a deterministic and safety-gated workflow for handling Blackline emergency alerts. It aligns with `ARCHITECTURE.md`, `ROADMAP.md`, `TESTING.md`, and `DEPLOYMENT_APPROACH.md`.

---

## 1. Purpose and Scope

Manual alert handling today requires:

- Switching between multiple tools (BLN Live, Clock app, Teams, Five9)
- Copying and pasting message templates
- Manually starting and tracking timers
- Interpreting device replies inconsistently
- Logging call attempts by hand
- Tracking gas normalization conditions manually
- Managing dispatch decisions and follow-up windows

The Automation Platform reduces this from **10–19 manual actions** to **0–3**, without removing specialist control. The system automates:

- Template population  
- Caller notes and EC notes  
- Timers (gas, EC callback, dispatch follow-up)  
- Device message interpretation  
- Safety validations  
- Dispatch routing  
- Resolution gating  
- Complete deterministic logging with timestamps  

The result is **faster**, **safer**, and **fully repeatable** alert handling.

---

## 2. Architectural Alignment

Automation is powered by the major subsystems defined in `ARCHITECTURE.md`:

- **Protocol Engine** – loads protocol definitions and governs execution order  
- **Step Execution Engine** – ensures sequencing, idempotency, and correct transitions  
- **Gas Safety Engine** – evaluates real-time gas levels, normalization, and overrides  
- **Connectivity Engine** – monitors last comms, GPS age, signal, battery, motion  
- **Timer Manager** – central controller for all timers  
- **Message Classifier** – interprets device replies contextually  
- **Dispatch Safety Validator** – enforces all dispatch conditions  
- **Resolution Engine** – determines valid resolutions and blocks invalid ones  
- **Audit Logger** – creates deterministic, timestamped, operator-identified entries  

These systems collectively automate the entire protocol lifecycle.

---

## 3. Overall Automated Workflow Structure

All automated workflows follow the same high-level structure:

1. **Pre-Step Logic (Gas Monitoring, when applicable)**  
2. **Step 1 — Call the Device (G7c only)**  
3. **Step 2 — Send message to the device**  
4. **Step 3 — Call the user phone**  
5. **Step 4 — Contact Emergency Contacts (EC1 → EC2)**  
6. **Step 5 — Dispatch decision**  
7. **Resolution**  

Gas alerts introduce additional logic:

- Optional **2-minute gas-monitoring window** *before any steps begin*  
- Automatic normalization detection (auto-resolve if gas returns to NORMAL)  
- Resolution blocking when gas remains HIGH  
- Override pathway for resolution under HIGH gas conditions  
- Gas snapshots for each major step  

Each action is logged with MT timestamps.

---

## 4. Automated Workflow Logic

## 4.1 Pre-Step Logic for Gas Alerts  
*(Only for protocols that require it — not all gas alert types use this.)*

Before any Step (1–5) becomes available:

- A **2-minute gas-monitoring** window may run, depending on protocol type.  
- If **gas normalizes within 2 minutes**, the alert auto-resolves.  
- If **gas remains HIGH**, Step 1 is unlocked.  
- No specialist action is needed during this window.  
- A gas snapshot is recorded automatically.

Specialists do not need to start timers or track normalization manually.

---

## 4.2 Step 1 — Call the Device

Automation:

- Inserts standardized call note  
- Logs timestamp in MT  
- Captures gas snapshot (for gas alerts)  
- Unlocks Step 2  
- Handles G7x device logic (no voice call capability → Step 1 auto-completed)

Manual actions eliminated:

- Template lookup  
- Manual note writing  
- Gas monitoring logic  
- Call outcome logging  

---

## 4.3 Step 2 — Send Device Message

Automation:

- Inserts correct message template (“Do you need help?” or protocol-specific copy)  
- Logs outgoing message  
- Starts wait window timer as required  
- Classifies incoming device replies automatically:

| Device Reply | Interpretation | Automated Action |
|--------------|----------------|------------------|
| "I’m OK" | User confirms safety | Offer resolution |
| "No" | Equivalent to “I’m OK” | Offer resolution |
| "Send help" | Emergency | Unlock dispatch path |
| Unknown text | Ambiguous | Specialist decides |

Manual steps eliminated:

- Copy/pasting message text  
- Starting timers manually  
- Interpreting ambiguous replies incorrectly  
- Logging replies  

---

## 4.4 Step 3 — Call the User

Automation:

- Inserts standardized call attempt note  
- Logs timestamp  
- Handles connectivity-aware routing:
  - If offline or no last-comm → adjusted messaging  
  - If stale GPS > 5 minutes → warnings logged  

Manual steps eliminated:

- Manual call-out logging  
- Repeated inconsistent attempts  

---

## 4.5 Step 4 — Emergency Contacts (EC1 → EC2)

Automation:

- Prevents skipping EC1  
- Populates standardized EC call notes  
- Logs outcomes deterministically  
- If EC agrees to check on user → auto-starts **30-minute callback timer**  
- Timer is centrally managed:
  - Start logged  
  - Cancel logged  
  - Expiration logged (“30-minute callback window expired.”)

Manual actions eliminated:

- Finding EC phone numbers  
- Tracking 30-minute callback timer  
- Writing EC notes  
- Handling follow-up logic inconsistently  

---

## 4.6 Step 5 — Dispatch Decision  
*(Aligned with `ARCHITECTURE.md` and the real Code Base)*

Dispatch is allowed **only when all dispatch safety checks pass**:

**Dispatch Safety Rules (Non-Gas Alerts)**  
All must be true:
- GPS age < 5 minutes  
- Device online  
- Motion < 5 km/h  
- Connectivity valid  
- Location available  

**Dispatch Safety Rules (Gas Alerts)**  
All the above  
**AND gas must be NORMAL**

Important clarifications:

- **Gas HIGH does NOT block dispatch.**  
  Many gas-alert protocols require dispatch even under HIGH gas.

- **Gas HIGH blocks resolution, not dispatch.**  
  If gas remains HIGH, the specialist cannot resolve until:
  - Gas normalizes, or  
  - Override pathway is used  

Automation when dispatch is permitted:

- Auto-fills dispatch note with:
  - Selected agencies (EMS, Fire, Police, or combinations)
  - Full location snapshot
- Logs dispatch initiation  
- Starts **30-minute dispatch follow-up timer**  
- Logs timer start, cancel, and expiry  

If dispatch is NOT permitted (due to safety rule failure):

- Specialist selects reason  
- System logs:  
  `"Dispatch skipped. Reason: <selected reason>. Repeating Steps 1–4."`  
- Protocol loops back to Step 1  

Manual actions eliminated:

- Copying/pasting dispatch templates  
- Managing follow-up timers  
- Inconsistent dispatch decisions  

---

## 5. Resolution Logic (Deterministic)

The Resolution Engine enforces strict rules:

### 5.1 Gas Alerts
- If **gas HIGH**, resolution is **blocked**  
- Specialist must:
  - Wait for normalization OR  
  - Use override (documented reason required)

### 5.2 Dispatch Scenarios
- If dispatch occurred → resolution must be **incident-with-dispatch**  
- If no dispatch → **incident-without-dispatch**

### 5.3 Pre-Alert Conditions
- If alert > 24h old → marked **pre-alert resolution**

Additional automation:

- Active timers cancelled  
- Resolution timestamp logged  
- Operator ID included  
- Invalid resolutions are blocked  

---

## 6. Message Interpretation Engine

Incoming device replies are interpreted using contextual state:

- Current protocol step  
- Whether waiting window is active  
- Gas alert type  
- Messaging history  
- Connectivity  

This avoids incorrect interpretations, especially for short or ambiguous replies.

---

## 7. Timer Automation

Three major timers are controlled centrally:

### 7.1 Gas Monitoring (2 minutes)
- Runs before Step 1 (only for protocols requiring it)
- Auto-resolve on normalization

### 7.2 EC Callback Timer (30 minutes)
- Started automatically when EC agrees to check on user

### 7.3 Dispatch Follow-Up (30 minutes)
- Started automatically after dispatch

Each timer:

- Displays countdown  
- Issues audio/visual alerts  
- Logs start, cancel, and expiration  

Manual use of the Clock app is eliminated.

---

## 8. Manual Action Reduction Summary

### Before Automation
- 10–19 manual actions  
- Context switching to 3–4 apps  
- Manual timers  
- Manual note writing  
- Inconsistent outcomes  
- High cognitive workload  

### After Automation
- 0–3 manual actions  
- No app-switching  
- Automatic logging  
- Automatic timers  
- Deterministic behavior  
- Strong safety gating  

---

## 9. Benefits for Stakeholders

### SOC Management
- Consistent execution  
- Lower cognitive load  
- Reduced variance  
- Higher throughput  

### Product & Engineering
- Protocols defined by configuration  
- Clean client–server boundaries  
- 200+ automated tests  
- High reliability  

### Leadership
- Annual ROI: **$129K–$164K**  
- Equivalent productivity gain: **5–10 specialists**  
- Strong competitive differentiator  

---

## 10. Future Enhancements

- Protocol Configuration Manager (PCM)  
- Enhanced Alerts Page  
- Intelligent Alert Assignment System  
- Server-side audit pipeline  
- WebSocket telemetry  
- Externalized protocol templates  
- Organization-level customization  

---

## Document Information

**Document:** WORKFLOW_AUTOMATION.md  
**Version:** 5.0  
**Last Updated:** November 30, 2025  
**Author:** Ivan Ferrer — Alerts Specialist (“Future” SOC Technical Innovation Lead”)
