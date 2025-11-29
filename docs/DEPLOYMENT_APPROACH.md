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

### **Operational Features (6 of 19)**

✅ Automated 2-minute gas monitoring with normalization detection  
✅ Centralized timer management (eliminates Clock app)  
✅ Context-aware device message classification  
✅ Pre-alert detection and UI lockdown (>24h stale alerts)  
✅ Automated resolution classification (100% accuracy)  
✅ Dynamic protocol engine (configuration-driven)

### **Workflow Support**

- Supports gas and non-gas alert workflows
- 5-step protocol engine active (device call, message flow, EC calls, dispatch, resolution)
- Built-in safety logic (gas HIGH blocking, override modal)
- Fully functional demo mode for internal presentations and testing

### **Testing Status**

- 200+ automated Cypress tests (optional for BIT deployment)
- 100% test pass rate
- CI/CD pipeline via GitHub Actions

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

### **General**

- [ ] Logs generate correctly with MST timestamps
- [ ] Buttons are clickable and visible
- [ ] No missing icons, images, or text
- [ ] No console errors (F12 → Console)
- [ ] Timer countdown updates every second
- [ ] Audio alerts work on timer expiration

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
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical design and 21 critical functions
- **[ROADMAP.md](./ROADMAP.md)** - Future features and strategic vision
- **[TESTING.md](./TESTING.md)** - Test coverage and quality assurance
- **[WORKFLOW_AUTOMATION.md](./WORKFLOW_AUTOMATION.md)** - Manual vs automated workflows

---

**Document Version:** 1.0  
**Last Updated:** November 28, 2025  
**Author:** Ivan Ferrer - Alerts Specialist ("Future" SOC Technical Innovation Lead)