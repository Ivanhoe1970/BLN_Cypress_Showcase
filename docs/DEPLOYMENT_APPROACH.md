# 📦 Deployment Approach

**Emergency Response Automation Suite - Setup & Deployment Instructions**

**Prepared by:** Ivan Ferrer, Emergency Response Automation Lead  
**Audience:** BIT, Development Team, Senior Product Manager

---

## 📋 Table of Contents

- [Purpose of This Document](#purpose-of-this-document)
- [Current System Status](#current-system-status)
- [Project Structure Overview](#project-structure-overview)
- [Local Setup Instructions](#local-setup-instructions)
- [How to Load Demo Alerts](#how-to-load-demo-alerts)
- [How to Run a Full Demo](#how-to-run-a-full-demo)
- [Staging/Production Deployment](#stagingproduction-deployment)
- [Post-Deployment Smoke Test](#post-deployment-smoke-test)
- [Optional Future Integration](#optional-future-integration)
- [Support](#support)

---

## 🎯 Purpose of This Document

This document provides simple, practical setup and deployment instructions for running the Emergency Response Automation Suite. It is designed for stakeholders, BIT, and developers who need to:

- **Run the system locally** for development or testing
- **Demo the system** to stakeholders or customers
- **Deploy it safely** into staging or production environments
- **Validate functionality** after deployment

**This is NOT a deep technical architecture document.**  
**This IS a step-by-step guide for setup, operation, and safe rollout.**

---

## ✅ Current System Status

### **Operational Features (7 of 19)**

✅ Automated 2-minute gas monitoring with normalization detection  
✅ Centralized timer management (eliminates Clock app)  
✅ Context-aware device message classification  
✅ **Intelligent notes analysis with cross-specialist coordination**  
✅ Pre-alert detection and UI lockdown (>24h stale alerts)  
✅ Automated resolution classification (100% accuracy)  
✅ Dynamic protocol engine (configuration-driven)

### **Workflow Support**

- Supports gas and non-gas alert workflows
- 5-step protocol engine active (device call, message flow, EC calls, dispatch, resolution)
- Built-in safety logic (gas HIGH blocking, override modal)
- **Real-time pattern recognition for specialist coordination (75-85% time reduction)**
- Fully functional demo mode for internal presentations and testing

### **Cross-Specialist Coordination**

The newly integrated Intelligent Notes Analysis Engine eliminates manual Teams coordination by detecting resolution intent in specialist notes. When Specialist A sets a 30-minute timer but Specialist B receives a user callback confirming safety, the system automatically detects patterns like "user called in, confirmed okay" and cancels active timers across all specialist sessions. This reduces coordination time from 2-3 minutes to 30 seconds while maintaining complete audit trails and safety validation.

### **Testing Status**

- 200+ automated Cypress tests (optional for BIT deployment)
- 100% test pass rate
- CI/CD pipeline via GitHub Actions
- **Pattern recognition accuracy >95% for high-confidence scenarios**

---

## 📁 Project Structure Overview

The system runs as a **self-contained HTML/JavaScript application**.

### **Key Folders and Files**

| Folder / File | Description |
|---------------|-------------|
| `automated-basic-gas-alert-protocol/` | Gas alert version of the protocol engine |
| `automated-basic-non-gas-alert-protocol/` | Non-gas alert version |
| `emergency-protocol-clean.html` | Main application file (entry point) |
| `fixtures/alerts.json` | Demo alert data for testing |
| `intelligent-notes/` | Pattern recognition and coordination engine |
| `cypress/` | Automation test suite (optional for deployment) |
| `docs/` | Documentation (README, ARCHITECTURE, etc.) |

**To run the app, all you need is:**
- The root folder
- The HTML file
- A local web server (or static hosting)

---

## 🖥️ Local Setup Instructions

### **Step 1: Install Node.js**

**Download from:** [https://nodejs.org](https://nodejs.org)

Required for running a lightweight local server.

**Verify installation:**
```bash
node --version
npm --version
```

---

### **Step 2: Start the Local Server**

Open terminal in the project folder and run:
```bash
npx http-server -p 5500 -c-1 .
```

**What this does:**
- Starts a local web server on port 5500
- Disables caching (`-c-1`) for development
- Serves files from current directory (`.`)

**Server will be available at:**
```
http://127.0.0.1:5500/
```

---

### **Step 3: Open the Application**

Navigate to either:

**Non-Gas Alert Version:**
```
http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/emergency-protocol-clean.html
```

**Gas Alert Version:**
```
http://127.0.0.1:5500/automated-basic-gas-alert-protocol/emergency-protocol-clean.html
```

**The application will load instantly with:**
- Alert details panel
- Gas and connectivity panels
- 5-step protocol workflow
- Timer system
- Protocol log with MST timestamps
- Device messaging interface
- **Intelligent notes analysis interface with pattern detection**

---

## 📥 How to Load Demo Alerts

### **Option A: Use Built-in Demo Buttons** (if present)

Click one of the **Demo/Test** buttons to load sample alerts.

---

### **Option B: Load Alerts Manually via Console**

1. Open Chrome DevTools (`F12` or `Cmd+Option+I` on Mac)
2. Go to the **Console** tab
3. Run one of these commands:

**Load H₂S Gas Alert:**
```javascript
loadAlert("demo-h2s");
```

**Load Fall Detection Alert:**
```javascript
loadAlert("fall-detection-demo");
```

**Load CO Gas Alert:**
```javascript
loadAlert("demo-co");
```

This populates the UI with complete alert data for safe testing and demos.

---

## 🎬 How to Run a Full Demo

### **Gas Alert Demo**

1. **Open the gas alert HTML file**
```
   http://127.0.0.1:5500/automated-basic-gas-alert-protocol/emergency-protocol-clean.html
```

2. **Click "Send Message" (Step 2)**
   - Timer starts automatically (2-minute gas monitoring)
   - Gas panel shows H₂S, CO, LEL, O₂ readings

3. **Simulate a device response:**
   - Open Console (F12)
   - Run:
```javascript
     simulateDeviceResponse("I'm OK");
```

4. **Watch the system:**
   - Updates gas readings in real-time
   - Evaluates resolution logic (blocks if gas HIGH)
   - Shows override modal if needed

5. **Show full audit log** at the end
   - Every step logged with MST timestamps
   - Gas data snapshots included

---

### **Non-Gas Alert Demo**

1. **Open the non-gas HTML file**
```
   http://127.0.0.1:5500/automated-basic-non-gas-alert-protocol/emergency-protocol-clean.html
```

2. **Click Step 1 → Post Note**
   - Select outcome from dropdown
   - Note auto-populates
   - Post to log

3. **Progress through Steps 2-5:**
   - Send device message
   - Call user phone
   - Contact emergency contacts
   - Evaluate dispatch conditions

4. **Show the dispatch decision dropdown**
   - System evaluates location, connectivity, movement
   - Provides pass/fail recommendation

5. **Start the 30-minute follow-up timer** (if dispatch made)

6. **Resolve the alert**
   - System determines resolution type automatically
   - Logs final resolution with timestamp

**The system logs every step with MST timestamps.**

---

### **Cross-Specialist Coordination Demo**

**Demonstrate the intelligent notes analysis feature:**

1. **Start a timer** (Step 4 EC callback - 30 minutes)
   - Shows active countdown timer
   - Timer visible and running

2. **Type a resolution note in manual notes section:**
   ```
   User called in. Confirmed they are okay. Resolving alert.
   ```

3. **Click "Analyze Note"**
   - System detects RESOLUTION_INTENT pattern
   - Shows 95% confidence level
   - Recommends: Cancel Timer + Setup Resolution

4. **Execute coordination actions**
   - Timer automatically cancelled
   - Resolution auto-populated with "callback-confirmed"
   - Full audit trail logged

**Key demo points:**
- **Pattern recognition in real-time** (<100ms analysis)
- **Confidence-based actions** (>85% auto-execute, >95% require confirmation)
- **Safety integration** (HIGH gas blocks automatic resolution)
- **Complete audit trail** (all coordination actions logged)

---

## 🚀 Staging/Production Deployment

### **Requirements for BIT**

The system only needs a **static web host** capable of serving:
- HTML
- JavaScript
- JSON
- CSS (if present)

**Examples of supported hosting:**
- AWS S3 + CloudFront
- NGINX internal server
- Apache static folder
- GitHub Pages
- Any internal static hosting solution

### **Intelligent Notes Analysis Deployment Considerations**

The pattern recognition engine runs entirely client-side with no backend dependencies. However, production deployment should consider:

**Configuration Management:** The NOTE_PATTERNS configuration object can be customized per customer or environment. For production, consider externalizing pattern definitions to a JSON configuration file that can be updated without code deployment. This enables pattern tuning and customer-specific coordination rules without touching the core engine.

**Performance Monitoring:** The pattern recognition engine processes notes in <100ms, but production deployments should monitor analysis performance, especially during high-volume periods. Consider implementing client-side performance logging to track pattern recognition accuracy and response times for optimization.

---

### **Deployment Steps**

#### **1. Copy the entire folder:**

**For non-gas alerts:**
```
automated-basic-non-gas-alert-protocol/
```

**For gas alerts:**
```
automated-basic-gas-alert-protocol/
```

#### **2. Upload to hosting location**

Upload it **exactly as-is** to the hosting location.

**⚠️ Important:** Preserve folder structure (don't flatten directories).

#### **3. Verify the URL**

Ensure the URL for the file looks like:
```
https://<internal-host>/automated-basic-non-gas-alert-protocol/emergency-protocol-clean.html
```

#### **4. Smoke Test**

Open this URL and confirm:
- ✅ Page loads without errors
- ✅ Panels appear (gas, connectivity, protocol steps)
- ✅ Steps and logs function correctly
- ✅ **Intelligent notes analysis UI appears**
- ✅ **Pattern recognition responds to test notes**
- ✅ No console errors appear (F12 → Console)

#### **5. Provide Link to SOC**

Provide SOC specialists with the final link for internal use or demos.

---

## ✅ Post-Deployment Smoke Test Checklist

### **Gas Alerts**

- [ ] UI loads without errors
- [ ] Gas readings appear (H₂S, CO, LEL, O₂)
- [ ] Timer starts after Step 1 or device message
- [ ] Resolution is blocked when gas = HIGH
- [ ] Override modal works correctly
- [ ] Gas normalization triggers auto-resolution

### **Non-Gas Alerts**

- [ ] Steps 1-5 work end-to-end
- [ ] EC contact fields appear correctly
- [ ] Dispatch flow shows decision logic
- [ ] Timer starts when dispatch is posted
- [ ] Resolution dropdown works
- [ ] Pre-alert detection works (>24h alerts)

### **Intelligent Notes Analysis**

- [ ] **Manual notes textarea appears with analysis controls**
- [ ] **"Analyze Note" button becomes enabled when typing**
- [ ] **Pattern detection works with test phrases**
  - Type: `"User called in. Confirmed they are okay."`
  - Verify: RESOLUTION_INTENT pattern detected with 95% confidence
- [ ] **Cross-specialist coordination simulation**
  - Start a timer, then trigger resolution note
  - Verify: Timer cancellation and resolution auto-population
- [ ] **Safety validation integration**
  - Test with HIGH gas conditions
  - Verify: Automatic resolution blocked, supervisor confirmation required
- [ ] **Audit trail completeness**
  - All pattern detection and coordination actions logged with MST timestamps

### **General**

- [ ] Logs generate correctly with MST timestamps
- [ ] Buttons are clickable and visible
- [ ] No missing icons, images, or text
- [ ] No console errors (F12 → Console)
- [ ] Timer countdown updates every second
- [ ] Audio alerts work on timer expiration
- [ ] **Pattern recognition performance <100ms**
- [ ] **Cross-specialist coordination <200ms**

---

## 🔮 Optional Future Integration

The system currently works **fully offline** with demo data.

### **Future Integration with Blackline Live**

Future integration can include:

1. **Live Alert Metadata Feed**
   - API endpoint: `GET /api/alerts/{id}`
   - Replace fixture data with real-time alerts

2. **Device Message Gateway**
   - API endpoint: `POST /api/devices/{id}/message`
   - Send messages to actual G7 devices

3. **Gas Telemetry Stream**
   - WebSocket connection for live gas readings
   - Real-time H₂S, CO, LEL, O₂ updates

4. **Audit Log Write Endpoint**
   - API endpoint: `POST /api/alerts/{id}/logs`
   - Persist logs to BLN Live database

5. **Dispatch Initiation Hook**
   - API endpoint: `POST /api/dispatch/initiate`
   - Trigger actual emergency service dispatch

6. **Cross-Specialist Coordination API**
   - API endpoint: `POST /api/alerts/{id}/coordination`
   - Real-time coordination notifications across specialist sessions
   - Server-side timer state synchronization

**⚠️ None of these are required to deploy or demo the tool today.**

---

## 🆘 Support

For setup, deployments, or integration questions:

**Contact:** Ivan Ferrer  
**Email:** iferrer@blacklinesafety.com  
**Role:** Alerts Specialist & Emergency Response Automation Lead  
**GitHub:** [https://github.com/ivanhoe1970/BLN_Cypress_Showcase](https://github.com/ivanhoe1970/BLN_Cypress_Showcase)

---

## 📚 Related Documentation

- **[README.md](../README.md)** - Project overview and quick start
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical design and 22 critical functions
- **[ROADMAP.md](./ROADMAP.md)** - Future features and strategic vision
- **[TESTING.md](./TESTING.md)** - Test coverage and quality assurance
- **[WORKFLOW_AUTOMATION.md](./WORKFLOW_AUTOMATION.md)** - Manual vs automated workflows

---

**Document Version:** 1.1  
**Last Updated:** November 29, 2025  
**Author:** Ivan Ferrer - Alerts Specialist ("Future" SOC Technical Innovation Lead)