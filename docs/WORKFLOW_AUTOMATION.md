# WORKFLOW_AUTOMATION.md  
## Emergency Response Automation – Workflow Automation Approach  

# 1. Purpose of This Document

This document explains, in a **clear and stakeholder-friendly** way, how the Emergency Response Automation Platform eliminates the manual steps, context switches, and cognitive load involved in current Blackline SOC workflows.

It integrates manual-workflow text from internal analysis and pairs it with the **precise technical automation mechanics** implemented in the emergency-protocol-clean.html Code Base.

The result: a complete picture of **the pain**, **the automation**, and **the measurable value**.

---

# 2. Current-State Manual Workflows 

## 2.1 Manual Actions Required Today to SEND A MESSAGE to a G7 Device in Blackline Live  

**TOTAL: 13 manual actions and 5 context switches**

**1.** Switch to the Notes app (**context switch #1**)  
**2.** Copy the pre-written message text from Notes: 'Do you need help?', for example 
**3.** Switch back to Blackline Live (**context switch #2**)  
**4.** Click inside the “Enter message” textbox  
**5.** Paste the message  
**6.** Click “Send”  
**7.** Switch to the Clock app (**context switch #3**)  
**8.** Start the 2-minute or 5-minute timer  
**9.** Switch back to Blackline Live (**context switch #4**)  
**10.** Click inside the “Add Notes” box  
**11.** Paste (or type) the message outcome documentation  
**12.** Click “Post Note”  
**13.** When the timer expires, switch again to the Clock app and tap “Dismiss” (**context switch #5**)

---

## 2.2 Manual Actions Required Today to CALL THE USER in Blackline Live  

**TOTAL: 8 manual actions and 2 context switches**

**1.** Click on the link with the user’s phone number  
**2.** Five9 opens — click “Dial” to start the call  
**3.** Click “End Call” when finished  
**4.** Click to choose the correct **call disposition** in Five9  
**5.** Click “End Interaction”  
**6.** Switch to the Notes app (**context switch #1**) and copy the pre-written text documenting the call outcome  
**7.** Switch back to the alert management page (**context switch #2**) and paste the text inside the “Add Notes” box  
**8.** Click “Post Note”

---

## 2.3 Manual Actions Required Today to CALL a G7 Device in Blackline Live  

**Total: 9 manual actions**

**1.** Click the “Call Device” link in Blackline Live  
**2.** Switch to Five9 (**context switch #1**)  
**3.** Enter the PIN to call that specific device  
**4.** Click “End Call” when finished  
**5.** Choose the correct **call disposition** in Five9  
**6.** Click “End Interaction”  
**7.** Switch back to Blackline Live (**context switch #2**)  
**8.** Click inside the “Add Notes” box and document the device call outcome (typed manually or copy/paste)  
**9.** Click “Post Note”

---

## 2.4 Manual Actions Required Today to CALL EMERGENCY CONTACTS (ECs)  

**TOTAL: 12 manual actions and 3 context switches for each EC call**

**1.** Click on the “Contacts” tab to access the EC list  
**2.** Click the EC’s phone number link in Blackline Live  
**3.** Five9 opens — click “Dial” to start the call  
**4.** Click “End Call” when finished  
**5.** Click to choose the correct **call disposition** in Five9  
**6.** Click “End Interaction”  
**7.** Switch to the EC tab in the alert management page  
**8.** Copy the EC’s name and phone number  
**9.** Switch to the Notes app (**context switch #1**) and copy the pre-written EC call-outcome template (e.g., “They will contact the user and call back. Waiting 30 minutes… OP 417.”)  
**10.** Switch back to Blackline Live (**context switch #2**)  
**11.** Click inside the “Add Notes” box and paste the full EC call note (name, phone, outcome)  
**12.** Click “Post Note”  
**13.** If applicable: Switch to the Clock app (**context switch #3**) to start the 30-minute timer for callback follow-up

---

## 2.5 Manual Actions Required Today to DISPATCH EMERGENCY SERVICES  

**TOTAL: 9 manual actions and 2 context switches**

**1.** Switch to Five9, type and select the dispatch phone number  
**2.** Click “Dial” to initiate the dispatch call  
**3.** Provide dispatch with **location + alert details verbally**  
**4.** Click “End Call” when finished  
**5.** Click to choose the correct **call disposition** in Five9 (e.g., “Dispatch”)  
**6.** Click “End Interaction”  
**7.** Switch to the Notes app (**context switch #1**) and copy the pre-written dispatch note template  
**8.** Switch back to Blackline Live (**context switch #2**), click inside the “Add Notes” box, and paste the dispatch outcome note  
**9.** Click “Post Note”  
**10.** Switch to the Clock app (**context switch #3**) and start the **30-minute follow-up timer** required after dispatch

---

## 2.6 The Situation

The current BLN Live portal requires alert specialists to spend **45–50% of non-call time on manual documentation**—typing notes, copy/pasting data, switching between applications, and manually coordinating workflows. For a complete protocol execution involving all five steps (call device, message device, call user, contact emergency contacts, and dispatch), this results in **58 actions taking 3–4 minutes of non-call time per alert.**

---

# 3. Automated Workflow (Future-State)

This section now describes how the Emergency Response Automation Platform removes the manual actions above.  
All descriptions here are based on the actual Code Base (emergency-protocol-clean.html) and aligned with ARCHITECTURE.md.

---

## 3.1 System Architecture Summary

Automation is driven by these core engines:

- Protocol Engine  
- Step Execution Engine  
- Gas Safety Engine  
- Timer Manager  
- Messaging Engine  
- Dispatch Validator  
- Resolution Engine  
- Audit Logger  

These implement the **22 critical functions** documented in the Architecture file.

---

# 4. Automated Workflow Logic

### IMPORTANT RULE ABOUT GAS ALERTS  
**The 2-minute gas monitoring window is *not* a protocol step.**  
It is a *pre-step safety window*.  
If gas normalizes → Auto-resolve.  
If gas stays HIGH → Step 1 unlocks.  
If the alert type is not configured for this → No gas window is applied.

---

## 4.1 Step 1 — Call the Device

Automation performs:

- Inserts standardized call attempt note  
- Logs action with MST timestamp  
- For gas alerts  
  - Captures gas snapshot at moment zero  
- Unlocks Step 2 automatically  

Manual work eliminated:

- No template lookup  
- No typing call notes  
- No copy/paste  
- No manual timestamps  

---

## 4.2 Step 2 — Send Message to Device

Automation handles:

- Auto-inserting correct “Do you need help?” message  
- Auto-starting required waiting timer  
- Auto-classifying replies:

| Device reply | Meaning | Automatically does |
|--------------|---------|--------------------|
| "I’m OK" | User is safe | Resolve |
| "No" | User is safe | Resolve |
| "Send help" | User requests help | Move to dispatch path |
| Other text | Ambiguous | Manual decision |

Manual work eliminated:

- No Clock app  
- No Notes app  
- No interpreting free text  

---

## 4.3 Step 3 — Call the User

Automation:

- Auto-generates call attempt note  
- Logs timestamp  
- Unlocks next step  

---

## 4.4 Step 4 — Call EC1 → EC2

Automation:

- Prevents calling EC2 before EC1  
- Auto-inserts call templates  
- Auto-starts and manages 30-minute callback timer  
- Logs timer start, cancellation, and expiry events  

Manual work eliminated:

- No switching to Contacts tab  
- No copying EC names/numbers  
- No Clock app timers  

---

## 4.5 Step 5 — Dispatch Decision  
(Aligned with ARCHITECTURE.md and Code Base)

Dispatch is **allowed only if all rules pass**:

- GPS location age < 5 minutes  
- Device online  
- Movement speed < 5 km/h  
- Connectivity stable  

Automation:

- Auto-fills dispatch note with selected services + location  
- Starts 30-minute dispatch follow-up timer  
- Logs all required steps  

If dispatch is **not** allowed:

- Specialist selects reason  
- System logs:  
  **“Dispatch skipped. Reason: _____.”**  
- Workflow automatically loops back to Steps 1–4  

---

# 5. Automated Resolution Logic

Rules enforced automatically:

- Gas HIGH → resolution blocked until override  
- If dispatch occurred → “Incident with dispatch”  
- If no dispatch → “Incident without dispatch”  
- Timers auto-cancel on resolution  
- All logs MST-timestamped with operator ID  

---

# 6. Impact Summary 

### WORKFLOW IMPROVEMENTS:
- 50% fewer actions (58 → 29)  
- 90% elimination of typing (90–120 sec → 10–15 sec)  
- 65% reduction in non-call time (3–4 min → 20–50 sec)  
- 100% elimination of context switching (15 switches → 0)

### QUALITY IMPROVEMENTS:
- 85–95% reduction in documentation errors  
- 100% consistent audit trails with automated timestamps  
- Intelligent gas monitoring with automatic normalization detection  
- Automated dispatch validation with readiness checks

### SPECIALIST EXPERIENCE:
- No more Clock app switching  
- No more manual note typing  
- No more copy/pasting gas data  
- Better positioning for concurrent alert handling  

### FINANCIAL & CAPACITY IMPACT:
- $129K–$164K savings at current volumes (897 alerts/day)  
- ROI: 129–164% in Year 1  
- Payback: 7–9 months  
- 448–627 hours saved per specialist annually (5–7 work weeks)  
- 10–18% capacity increase per specialist  
- Equivalent of 2.0–2.8 additional FTEs team-wide  
- No recruitment or training costs  

---

# 7. Document Notes

- All automation descriptions align with the **real Code Base** and the **Architecture** file.  
- Dispatch logic matches the actual dispatch validator in the system.  

---

# Document Information

**Version:** 5.0  
**Last Updated:** December 2, 2025  
**Author:** Ivan Ferrer — Alerts Specialist
