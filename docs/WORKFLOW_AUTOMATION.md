# Workflow Automation Approach

**Eliminating manual actions, reducing cognitive load, and improving consistency across Blackline SOC workflows**

This document explains how the Emergency Response Automation Suite replaces manual actions performed by Safety Operations Center (SOC) specialists with deterministic, repeatable, and safety-gated automation.

---

## 1. Purpose of Workflow Automation

Alert handling currently requires extensive manual work, including:

- Switching across multiple applications (BLN Live, Clock app, Teams, Five9)
- Manually starting and tracking timers
- Copying message templates
- Logging call outcomes by hand
- Interpreting device replies inconsistently

A single alert can require **10–19 manual actions**.

Automation reduces this to **0–3 actions** by:

- Auto-filling templates  
- Auto-starting timers  
- Auto-interpreting device messages  
- Auto-routing workflow steps  
- Auto-generating notes and logs  
- Auto-validating gas and connectivity conditions  

Specialists remain in control, but the repetitive mechanics are eliminated.

---

## 2. Architecture Overview

Workflow automation is powered by several core subsystems:

- **Protocol Engine** – loads and executes protocol configurations  
- **Step Execution Engine** – enforces sequencing and idempotency  
- **Gas Safety Engine** – evaluates live gas data and safety rules  
- **Timer Manager** – runs all timers centrally  
- **Message Classifier** – interprets device replies contextually  
- **Dispatch Validator** – ensures dispatch rules are met  
- **Resolution Engine** – determines correct resolution outcome  
- **Audit Logger** – generates deterministic operator logs  

These systems correspond to the **21 critical functions** documented in the annotated source code.

---

## 3. End-to-End Workflow Structure

All alert workflows follow a consistent structure:

1. **Call the device**  
2. **Send message to the device**  
3. **Call the user**  
4. **Contact EC1 & EC2**  
5. **Dispatch decision**  
6. **Resolution**

Gas alerts add safety layers:

- 2-minute monitoring windows  
- Normalization detection  
- Resolution blocking  
- Override workflow  

Each step produces a timestamped log entry.

---

## 4. Automated Workflow Logic

### 4.1 Step 1 — Call the Device

Automation performs:

- Auto-fills standardized call note  
- Logs the action with precise timestamp  
- For gas alerts:  
  - Starts the 2-minute monitoring timer  
  - Captures initial gas snapshot  
- Unlocks Step 2  

Manual actions eliminated:

- Template lookup  
- Writing notes manually  
- Starting gas monitoring timers  
- Tracking normalization manually  

---

### 4.2 Step 2 — Send Device Message

Automation:

- Inserts correct message template  
- Sends message and logs outcome  
- Begins waiting window (timer) when required  
- Classifies any device replies:
  - **“I’m OK” → Resolve**
  - **“Send help” → Dispatch**
  - Unknown text → manual decision  
- Logs all actions  

Manual actions eliminated:

- Copy/paste templates  
- Starting timers  
- Manual interpretation of replies  

---

### 4.3 Step 3 — Call the User

Automation:

- Inserts pre-written call attempt note  
- Logs call outcome  
- Adjusts logic when device connectivity is degraded  
- Unlocks the next step  

Manual actions eliminated:

- Logging call attempts  
- Repeating call attempts inconsistently  

---

### 4.4 Step 4 — Emergency Contacts (EC1 → EC2)

Automation:

- Prevents skipping EC1  
- Auto-fills call notes  
- Auto-starts a **30-minute callback timer** when EC agrees to check  
- Logs timer start, cancellation, and expiration events  

Manual actions eliminated:

- Finding EC phone numbers  
- Tracking callback windows  
- Logging follow-up actions  

---

### 4.5 Step 5 — Dispatch Logic

Dispatch is permitted only when all safety rules pass:

- Gas is **NORMAL**  
- Recent location (< 5 minutes old)  
- Device is online  
- Speed < 5 km/h  
- Connectivity valid  

If dispatch is allowed:

- Dispatch note auto-filled including services and location  
- Starts **30-minute dispatch follow-up timer**  
- Logs all actions  

If dispatch is not allowed:

- Specialist selects reason  
- System logs: **“Dispatch skipped. Reason: ___.”**  
- Protocol loops back to Steps 1–4  

Manual actions eliminated:

- Copying dispatch note templates  
- Managing follow-up timers manually  
- Inconsistent dispatch decisions  

---

## 5. Resolution Logic

The Resolution Engine enforces deterministic rules:

- **Gas HIGH → resolution blocked until override**  
- **Dispatch → incident-with-dispatch**  
- **No dispatch → incident-without-dispatch**  
- **Alert >24h old → pre-alert resolution**  

Other automation:

- Cancels active timers  
- Logs final resolution with timestamp and operator ID  
- Prevents invalid or unsafe resolutions  

---

## 6. Intelligent Message Classification

Message interpretation uses contextual state:

| Device Reply | Meaning | Automated Action |
|--------------|---------|------------------|
| "I’m OK" | User is safe | Resolve |
| “No” (to “Do you need help?”) | User is safe | Resolve |
| “Send help” | Emergency | Dispatch |
| Unknown | Ambiguous | Manual handling |

Prevents misinterpretation of ambiguous or context-dependent replies.

---

## 7. Timer Automation

The system manages:

- **2-minute gas monitoring**
- **30-minute EC callbacks**
- **30-minute dispatch follow-up**

Each timer includes:

- Countdown display  
- Audio alert  
- Visual highlight  
- Log entry on start  
- Log entry on cancellation  
- Log entry on expiration  

Manual actions eliminated:

- Using the Clock app  
- Tracking callback windows  
- Remembering to log follow-ups  

---

## 8. Manual Action Reduction Summary

### Before Automation

- 10–19 manual actions  
- 13 context switches  
- Manual timers  
- Manual note generation  
- Inconsistent outcomes  

### After Automation

- 0–3 manual actions  
- No context switching  
- Automatic logging and routing  
- Full safety-gated behavior  

---

## 9. Stakeholder Benefits

### SOC Management

- Lower cognitive load  
- Consistent, repeatable outcomes  
- Faster alert handling  
- Complete auditability  

### Product and Engineering

- Protocols defined by configuration  
- High test coverage (200+ tests)  
- Clean integration boundaries  

### Senior Leadership

- Annual ROI: **$129K–$164K**  
- Equivalent capacity gain: **5–10 specialists**  
- Significant competitive advantage  

---

## 10. Future Enhancements

Planned expansion includes:

- Protocol Configuration Manager  
- Enhanced Alerts Page  
- Intelligent Alert Assignment System  
- API-based logging and resolution  
- WebSocket telemetry  
- Server-side audit storage  

---

## Document Information

**Document:** Workflow Automation Approach  
**Version:** 4.0  
**Last Updated:** November 28, 2025  
**Author:** Ivan Ferrer - Alerts Specialist ("Future" SOC Technical Innovation Lead)

