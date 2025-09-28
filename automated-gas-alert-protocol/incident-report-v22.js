/* Incident Report Auto-Generation System - Version 22 (hydrated)
   - Mountain Time everywhere (America/Edmonton)
   - Minimal dispatch fields rendered
   - Challenges blank when none found
   - Timeline shows full datetime with MST/MDT
   - PDF path rebuilds reportData
   - Validation gates (no "agencies" requirement)
   - Hydrates missing timestamps & dispatch snapshot from Protocol Log (via protocol-log-hydrator-v22.js)
   - UPDATED: Matches exact BlackLine Safety incident report format with proper table structure
   - FIXED: Timeline sorting, HTML escaping, MT timestamp handling, validation logic
*/

class IncidentReportGenerator {
  constructor() {
    this.reportData = {};
    this.timezone = "America/Edmonton";
    this.timelineTimezone = "America/Edmonton";
  }

  // VALIDATION (agencies requirement removed, address-only dispatch allowed)
  _validateForReport() {
    const state = window.protocolState || {};
    if (!state.dispatchMade) {
      throw new Error("Dispatch not made — incident report blocked.");
    }

    const dispatch = state.dispatch || {};
    const missing = [];

    if (!dispatch.requestedAt) missing.push("dispatch.requestedAt");

    const location = dispatch.locationSnapshot || {};
    const hasCoords = location.lat != null && location.lng != null;
    const hasCivic = !!(location.address || location.lsd);
    if (!(hasCoords || hasCivic))
      missing.push("dispatch.location (lat/lng OR address/LSD)");

    const alert = window.currentAlert || {};
    if (!alert.acknowledgedAt) missing.push("alert.acknowledgedAt");

    if (missing.length) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
    return true;
  }

  detectDispatchStatus() {
    return Boolean(window?.protocolState?.dispatchMade);
  }

  // MAIN GENERATION
  async generateAndDisplayReport() {
    try {
      // Hydrate from Protocol Log first (fills timestamps + dispatch snapshot)
      if (typeof window.hydrateFromProtocolLogV22 === "function") {
        window.hydrateFromProtocolLogV22();
      }

      // Validation gate
      this._validateForReport();

      // Generate Word document
      return this.generateWordDocument();
    } catch (error) {
      console.error("Incident report validation failed:", error);
      if (error.message.includes("Dispatch not made")) {
        // Expected soft stop, no report when no dispatch
        return null;
      }
      window.alert(
        `Cannot generate incident report:\n${error.message}\n\nPlease ensure all dispatch information is complete.`
      );
      return null;
    }
  }

  // WORD DOCUMENT GENERATION
  generateWordDocument() {
    try {
      // Optional: hydrate here too for direct calls
      if (typeof window.hydrateFromProtocolLogV22 === "function") {
        window.hydrateFromProtocolLogV22();
      }

      const currAlert = window.currentAlert;
      if (!currAlert) {
        throw new Error("No alert data available");
      }

      // Extract all data using deterministic methods
      this.reportData = {
        alertInfo: this._extractAlertInformation(currAlert),
        orgDetails: this._extractOrganizationDetails(currAlert),
        dispatchDetails: this._extractDispatchDetails(currAlert),
        alertSummary: this._extractAlertSummary(currAlert),
        timeline: this._extractTimelineEvents(),
      };

      const data = this.reportData;

      // Generate Word document HTML
      const wordHTML = this._generateWordHTML(data);

      // Create and download file
      const blob = new Blob([wordHTML], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // SAFE FILENAME: Use MT calendar date
      link.download = this._makeFilename({
        date: this._formatDateForFilenameTZ(
          currAlert.timestamp || new Date(),
          this.timezone
        ),
        deviceName: data.orgDetails.deviceName, // Not used in new format
        org: data.orgDetails.organizationName,
        deviceId: data.orgDetails.deviceId,
        alertType: data.alertInfo.alertType,
        resolution: data.alertInfo.resolutionReason,
      });

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Incident Report generated: ${link.download}`);
      window.alert(
        `✅ Incident Report Generated!\n\nFile: ${link.download}\n\nThe Word document is ready for review and completion.`
      );

      return wordHTML;
    } catch (error) {
      console.error("Error generating Word document:", error);
      window.alert(`❌ Error generating incident report:\n${error.message}`);
      return null;
    }
  }

  // PDF GENERATION
  generatePDFReport() {
    try {
      // Hydrate before validation
      if (typeof window.hydrateFromProtocolLogV22 === "function") {
        window.hydrateFromProtocolLogV22();
      }
      this._validateForReport();

      // Rebuild fresh data for PDF
      const currAlert = window.currentAlert;
      this.reportData = {
        alertInfo: this._extractAlertInformation(currAlert),
        orgDetails: this._extractOrganizationDetails(currAlert),
        dispatchDetails: this._extractDispatchDetails(currAlert),
        alertSummary: this._extractAlertSummary(currAlert),
        timeline: this._extractTimelineEvents(),
      };

      const reportHTML = this._generateHTMLReport();

      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow.document.write(reportHTML);
      printWindow.document.close();

      printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
      };

      return reportHTML;
    } catch (error) {
      console.error("Error generating PDF report:", error);
      window.alert(`❌ Error generating PDF report:\n${error.message}`);
      return null;
    }
  }

  // -------- DATA EXTRACTION --------

  _extractAlertInformation(currAlert) {
    return {
      agentName: "", // left blank for specialist to fill
      alertId: this._extractFromDOM('[data-cy="alert-id"]') || "9717935",
      timeOfAlert:
        this._formatTimeOnlyInTZ(
          currAlert.timestamp || new Date(),
          this.timezone
        ) +
        " " +
        this._getTzAbbrev(
          currAlert.timestamp || new Date().toISOString(),
          this.timezone
        ),
      dateOfIncident: this._formatDateOnly(currAlert.timestamp || new Date()),
      alertType: this._cleanAlertType(this._extractFromDOM("#alert-title")),
      resolutionReason: this._extractResolutionReason(),
    };
  }

  _cleanAlertType(alertTitle) {
    if (!alertTitle) return "SOS alert";

    // Remove emoji and extract just the alert type
    const cleaned = alertTitle
      .replace(/🚨\s*/, "")
      .replace("Alert Management - ", "");

    if (cleaned.includes("SOS")) return "SOS alert";
    if (cleaned.includes("Fall")) return "Fall detection alert";
    if (cleaned.includes("No motion")) return "No motion alert";
    if (cleaned.includes("Gas")) return "Gas alert";

    return "SOS alert"; // Default fallback
  }

  _extractOrganizationDetails(currAlert) {
    return {
      organizationName:
        this._extractFromDOM("#employee-details")?.split(" - ")[1] ||
        "WM - Corporate",
      deviceName:
        this._extractFromDOM("#device-details")?.split("-")[0] ||
        "G7x-3571031421",
      deviceId:
        this._extractFromDOM("#device-details")?.match(/\d{10}/)?.[0] ||
        "3571031421",
      userActualName:
        this._extractFromDOM("#employee-details")?.split(" - ")[0] ||
        "Zach Sowell (ID: 373595)",
    };
  }

  _extractDispatchDetails() {
    const state = window.protocolState || {};
    const dispatch = state.dispatch || {};
    const location = dispatch.locationSnapshot || {};

    return {
      dispatch: "Yes", // validated already
      latLong:
        location.lat != null && location.lng != null
          ? `${location.lat}, ${location.lng}`
          : "N/A",
      lsd: location.lsd || "N/A",
      country:
        this._extractCountryFromAddress(location.address) || "United States",
      provinceState:
        this._extractStateFromAddress(location.address) || "Unknown",
      city: this._extractCityFromAddress(location.address) || "Unknown",
      streetAddress:
        this._extractStreetFromAddress(location.address) || "Unknown",
      additional: location.additional || "N/A",
    };
  }

  _extractAlertSummary(currAlert) {
    const ackTime =
      currAlert.acknowledgedAt || window.protocolState?.acknowledgedAt;
    const dispatchTime =
      window.protocolState?.dispatch?.requestedAt || // Primary source (new)
      currAlert.dispatchedAt || // Fallback for backward compatibility
      null;

    return {
      timeFromAckToDispatch: this._computeTimeToDispatch(ackTime, dispatchTime),
      challengesNotes: "", // Always blank for specialist to fill
      detailedTimeline: this._extractDetailedTimeline(),
    };
  }

  _extractDetailedTimeline() {
    const timeline = [];
    const logContainer = document.getElementById("protocolLog");
    if (!logContainer) return timeline;

    const entries = logContainer.querySelectorAll(".log-entry");
    const currAlert = window.currentAlert || {};

    // Add system events first if we have them
    if (currAlert.triggeredAt) {
      timeline.push({
        ts: currAlert.triggeredAt,
        time: this._formatTimestampForReport(currAlert.triggeredAt),
        note: '<span class="note-italic">Alert triggered by device</span>',
      });
    }
    if (currAlert.receivedAt) {
      timeline.push({
        ts: currAlert.receivedAt,
        time: this._formatTimestampForReport(currAlert.receivedAt),
        note: '<span class="note-italic">Alert received by server</span>',
      });
    }
    if (currAlert.acknowledgedAt) {
      timeline.push({
        ts: currAlert.acknowledgedAt,
        time: this._formatTimestampForReport(currAlert.acknowledgedAt),
        note: '<span class="note-italic">Alert acknowledged</span>',
      });
    }

    // Extract protocol log entries
    entries.forEach((entry) => {
      const timeElement = entry.querySelector(".log-timestamp");
      const contentElement = entry.querySelector(".log-content");

      if (timeElement && contentElement) {
        const timeText = timeElement.textContent.replace(/[\[\]]/g, "").trim();
        const content = contentElement.textContent.trim();

        // Convert to proper timestamp format
        const fullTimestamp = this._convertLogTimeToFullTimestamp(
          timeText,
          currAlert.timestamp
        );

        if (fullTimestamp && content && !this._isSystemEvent(content)) {
          timeline.push({
            ts: fullTimestamp,
            time: this._formatTimestampForReport(fullTimestamp),
            note: `<span class="note-italic">${this._escapeHtml(
              content
            )}</span>`,
          });
        }
      }
    });

    // Add resolution
    if (currAlert.resolvedAt) {
      timeline.push({
        ts: currAlert.resolvedAt,
        time: this._formatTimestampForReport(currAlert.resolvedAt),
        note: '<span class="note-italic">Alert resolved.</span>',
      });
    }

    // Sort chronologically by raw timestamp
    timeline.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    return timeline;
  }

  _convertLogTimeToFullTimestamp(logTime, baseTimestamp) {
    // Convert log time like "16:57:00 MST" to full ISO timestamp
    const timeMatch = logTime.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!timeMatch) return null;

    const [, hours, minutes, seconds] = timeMatch;
    const H = parseInt(hours);
    const M = parseInt(minutes);
    const S = parseInt(seconds);

    // Get the incident day in MT, then set H:M:S on that MT day
    const base = baseTimestamp || new Date().toISOString();
    const { y, m: mo, d } = this._getYMDInZone(base, this.timelineTimezone);

    // Create a date representing the MT wall clock time
    const mtDate = new Date();
    mtDate.setFullYear(y, mo - 1, d);
    mtDate.setHours(H, M, S, 0);

    return mtDate.toISOString();
  }

  _extractTimelineEvents() {
    const events = [];
    const currAlert = window.currentAlert || {};

    // System events using real timestamps (hydrated if needed)
    if (currAlert.triggeredAt) {
      events.push({
        timestamp: currAlert.triggeredAt,
        note: "Alert triggered by device",
        type: "system",
      });
    }
    if (currAlert.receivedAt) {
      events.push({
        timestamp: currAlert.receivedAt,
        note: "Alert received by server",
        type: "system",
      });
    }
    if (currAlert.acknowledgedAt) {
      events.push({
        timestamp: currAlert.acknowledgedAt,
        note: "Alert acknowledged",
        type: "system",
      });
    }

    // Protocol log derived events
    const protocolEvents = this._extractProtocolLogEvents();
    events.push(...protocolEvents);

    // Resolution
    const resolutionTime = currAlert.resolvedAt || this._findResolutionTime();
    if (resolutionTime) {
      events.push({
        timestamp: resolutionTime,
        note: "Alert resolved.",
        type: "system",
      });
    }

    return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // -------- UTILITIES --------

  _escapeHtml(s = "") {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c] || c)
    );
  }

  // -------- TIMEZONE UTILS --------

  _getTzAbbrev(iso, tz = this.timelineTimezone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(new Date(iso));
    return parts.find((p) => p.type === "timeZoneName")?.value || "MT";
  }

  _formatTimestampForReport(iso) {
    if (!iso) return "";
    const dt = new Date(iso);
    const base = new Intl.DateTimeFormat("en-CA", {
      timeZone: this.timelineTimezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .format(dt)
      .replace(",", "");
    return `${base} ${this._getTzAbbrev(iso, this.timelineTimezone)}`;
  }

  _formatTimeOnlyInTZ(iso, tz = this.timezone) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(iso));
  }

  _formatDateForFilenameTZ(iso, tz = this.timezone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "numeric",
    }).formatToParts(new Date(iso));
    const get = (t) => parts.find((p) => p.type === t)?.value;
    return `${get("day")} ${get("month")} ${get("year")}`;
  }

  // -------- PROTOCOL LOG PARSING FOR TIMELINE --------

  _getYMDInZone(iso, tz = this.timelineTimezone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(iso));
    const get = (t) => +parts.find((p) => p.type === t).value;
    return { y: get("year"), m: get("month"), d: get("day") };
  }

  _extractTimestampFromLogEntry(entry, baseIso) {
    const m = entry
      .querySelector(".log-timestamp")
      ?.textContent?.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    const [H, M, S] = m.slice(1).map(Number);

    // Get the incident day in MT, then set H:M:S on that MT day
    const base = baseIso || new Date().toISOString();
    const { y, m: mo, d } = this._getYMDInZone(base, this.timelineTimezone);

    // Create a date representing the MT wall clock time
    const mtDate = new Date();
    mtDate.setFullYear(y, mo - 1, d);
    mtDate.setHours(H, M, S, 0);

    return mtDate.toISOString();
  }

  _extractProtocolLogEvents() {
    const events = [];
    const log = document.getElementById("protocolLog");
    if (!log) return events;

    // Use incident base date to avoid cross-midnight drift
    const baseIso =
      window.currentAlert?.timestamp ||
      window.currentAlert?.acknowledgedAt ||
      window.currentAlert?.triggeredAt;

    log.querySelectorAll(".log-entry").forEach((entry) => {
      const timestamp = this._extractTimestampFromLogEntry(entry, baseIso);
      const content = this._cleanLogContent(entry.textContent || "");
      if (timestamp && content && !this._isSystemEvent(content)) {
        events.push({ timestamp, note: content, type: "protocol" });
      }
    });
    return events;
  }

  // -------- MISC UTILS --------

  _computeTimeToDispatch(ackIso, reqIso) {
    if (!ackIso || !reqIso) return "N/A";

    const a = Date.parse(ackIso);
    const d = Date.parse(reqIso);
    if (!Number.isFinite(a) || !Number.isFinite(d) || d < a) return "N/A";

    const ms = d - a;

    // UX: show a friendly label for sub-minute gaps
    if (ms < 60_000) return "< 1 minute";

    // Otherwise round to nearest minute
    const minutes = Math.round(ms / 60_000);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  _makeFilename({ date, deviceName, org, deviceId, alertType, resolution }) {
    const userName =
      this._extractFromDOM("#employee-details")
        ?.split(" - ")[0]
        ?.split(" (")[0] || "Unknown User";

    const base = `Incident Report ${date} - ${userName} - ${org} - Device ID ${deviceId} - ${alertType} - ${resolution}`;
    return base.replace(/[\\/:*?"<>|]/g, "_") + ".doc"; // Changed from .doc
  }

  _formatDateOnly(date) {
    return new Date(date).toLocaleDateString("en-CA");
  }

  _extractFromDOM(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : null;
  }

  _getUserData(currAlert) {
    if (currAlert.user && AlertDataManager?.usersData?.[currAlert.user]) {
      return AlertDataManager.usersData[currAlert.user];
    }
    return null;
  }

  _extractDeviceIdFromDOM() {
    const deviceText = this._extractFromDOM("#device-details") || "";
    const deviceMatch = deviceText.match(/(\d{10,})/);
    return deviceMatch ? deviceMatch[1] : null;
  }

  _getReadableAlertType(alertType) {
    if (!alertType) return "Unknown alert";
    // If it already looks human-readable, keep it
    if (/\s/.test(alertType) || /H₂S|CO|O₂|LEL/i.test(alertType))
      return alertType;

    const typeMap = {
      "no-motion": "No motion alert",
      "fall-detection": "Fall detection alert",
      "missed-check-in": "Missed check-in alert",
      "gas-h2s": "H₂S gas alert",
      "gas-co": "CO gas alert",
      "gas-o2": "O₂ gas alert",
      "gas-lel": "LEL gas alert",
      sos: "SOS alert",
    };
    return typeMap[alertType] || alertType || "Unknown alert";
  }

  _extractResolutionReason() {
    const resolutionSelect = document.getElementById("resolution-reason");
    if (resolutionSelect && resolutionSelect.value) {
      return this._formatResolutionReason(resolutionSelect.value);
    }
    return "Unknown resolution";
  }

  _formatResolutionReason(value) {
    const map = {
      "false-alert-with-dispatch": "False alert with dispatch",
      "false-alert-without-dispatch": "False alert without dispatch",
      "incident-with-dispatch": "Incident with dispatch",
      "incident-without-dispatch": "Incident without dispatch",
      "pre-alert": "Pre-alert",
    };
    return map[value] || value;
  }

  _cleanLogContent(content) {
    return content.replace(/\s+/g, " ").trim();
  }

  _isSystemEvent(content) {
    const systemEvents = [
      /alert triggered by device/i,
      /alert received by server/i,
      /alert acknowledged/i,
    ];
    return systemEvents.some((pattern) => pattern.test(content));
  }

  _extractChallengesFromLogs() {
    const log = document.getElementById("protocolLog");
    if (!log) return "";
    const challenges = [];
    log.querySelectorAll(".log-entry").forEach((entry) => {
      const t = entry.textContent || "";
      if (/no answer|voicemail|unable to|failed to|confirmed okay/i.test(t)) {
        challenges.push(t.trim());
      }
    });
    return challenges.length ? challenges.join("; ") : "";
  }

  _findResolutionTime() {
    const log = document.getElementById("protocolLog");
    if (!log) return null;

    const baseIso =
      window.currentAlert?.timestamp ||
      window.currentAlert?.acknowledgedAt ||
      window.currentAlert?.triggeredAt;

    for (const entry of log.querySelectorAll(".log-entry")) {
      if (
        /alert resolved|resolution|resolving alert/i.test(
          entry.textContent || ""
        )
      ) {
        return this._extractTimestampFromLogEntry(entry, baseIso);
      }
    }
    return null;
  }

  _extractCountryFromAddress(address) {
    if (!address) return "United States";
    const s = address.toLowerCase();
    if (
      s.includes("canada") ||
      /\b(ab|bc|on|qc|mb|sk|nl|nb|pe|nt|nu|yt)\b/.test(s)
    ) {
      return "Canada";
    }
    return "United States";
  }

  _extractStateFromAddress(address) {
    if (!address) return "Unknown";
    const stateMatch = address.match(
      /\b([A-Z]{2})\b(?=\s*\d{5}|\s*[A-Z]\d[A-Z]\s*\d[A-Z]\d|\s*$)/
    );
    return stateMatch ? stateMatch[1] : "Unknown";
  }

  _extractCityFromAddress(address) {
    if (!address) return "Unknown";
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      return parts[parts.length - 2].replace(/\s+\w{2}\s*\d+.*$/, "").trim();
    }
    return "Unknown";
  }

  _extractStreetFromAddress(address) {
    if (!address) return "Unknown";
    const firstPart = address.split(",")[0];
    return firstPart?.trim() || "Unknown";
  }

  // -------- HTML GENERATION (UPDATED TO MATCH BLACKLINE FORMAT) --------
  _generateWordHTML(data) {
    const header = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word">
      <head>
        <title>Incident Report - Alert ${data.alertInfo.alertId}</title>
        <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
        <style>
          @page { margin: 0.75in; size: 8.5in 11in; }
          body { 
  font-family: Calibri, Arial, sans-serif; 
  font-size: 11pt; 
  line-height: 1.2; 
  margin: 0; 
}
.logo { 
  color: #000; 
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 24pt; 
  font-weight: 400; /* normal */
  margin-bottom: 6pt; 
}
.logo .safety { color: #d32f2f; }
.header { 
  text-align: right; 
  color: #000; 
  font-style: italic; 
  margin-bottom: 12pt; 
  font-family: Calibri, Arial, sans-serif;
  font-size: 16pt; 
  font-weight: bold;
}
h2 { 
  color: #d32f2f; 
  font-size: 12pt; 
  font-weight: bold; 
  margin: 15pt 0 10pt 0; 
}
table { 
  width: 100%; 
  border-collapse: collapse; 
  margin-bottom: 15pt; 
}
td { 
  border: 1pt solid #000; 
  padding: 6pt; 
  vertical-align: top; 
  font-size: 11pt;
  /* Remove any fixed height - let content determine row height */
}

.timeline-table td { 
  border: 1pt solid #000; 
  padding: 6pt; /* Reduced from 8pt for tighter spacing */
  vertical-align: top; /* Ensure top alignment for variable content */
}
.field-label { font-weight: bold; }
.timeline-table { margin-top: 10pt; }
.timeline-table td { border: 1pt solid #000; padding: 8pt; }
.time-column { 
  width: 120pt; 
  font-weight: bold;
  white-space: nowrap; /* Prevent time from wrapping */
}

.note-column {
  /* Let this column expand/contract based on content */
  word-wrap: break-word; /* Allow long words to wrap if needed */
}
.note-italic { 
  font-style: italic; 
  font-weight: normal; /* Changed from bold to normal */
}
.challenges-label { font-weight: bold; margin-top: 10pt; margin-bottom: 5pt; }
.section-header {
  background-color: #d32f2f;
  color: white;
  font-weight: bold;
  padding: 8pt;
  font-size: 12pt;
  margin: 15pt 0 10pt 0;
}

  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10pt;
  }
  .data-table td {
  border: 1pt solid #000;
  padding: 6pt;
  vertical-align: top;
  font-size: 11pt;
}
        </style>
      </head>
      <body>
        <div class="logo">blackline<span class="safety">safety</span></div>
        <div class="header">Incident Report</div>`;

    // Alert Information section (invisible borders)
    const alertInfoSection = `
<div class="section-header">Alert Information</div>
<table class="data-table">
        <tr>
          <td><span class="field-label">Agent Name:</span> ${data.alertInfo.agentName}</td>
          <td><span class="field-label">Alert ID:</span> ${data.alertInfo.alertId}</td>
        </tr>
        <tr>
          <td><span class="field-label">Time of Alert:</span> ${data.alertInfo.timeOfAlert}</td>
          <td><span class="field-label">Date of Incident:</span> ${data.alertInfo.dateOfIncident}</td>
        </tr>
        <tr>
          <td><span class="field-label">Alert Type:</span> ${data.alertInfo.alertType}</td>
          <td><span class="field-label">Resolution Reason:</span> ${data.alertInfo.resolutionReason}</td>
        </tr>
      </table>`;

    // Organization Details section (invisible borders)
    const orgDetailsSection = `
<div class="section-header">Organization Details</div>
<table class="data-table">
        <tr>
          <td><span class="field-label">Organization Name:</span> ${data.orgDetails.organizationName}</td>
          <td><span class="field-label">Device Name:</span> ${data.orgDetails.deviceName}</td>
        </tr>
        <tr>
          <td><span class="field-label">Device ID:</span> ${data.orgDetails.deviceId}</td>
          <td><span class="field-label">User's Name:</span> ${data.orgDetails.userActualName}</td>
        </tr>
      </table>`;

    // Dispatch Details section (invisible borders)
    const dispatchDetailsSection = `
<div class="section-header">Dispatch Details</div>
<table class="data-table">
        <tr>
          <td><span class="field-label">Dispatch:</span> ${data.dispatchDetails.dispatch}</td>
          <td><span class="field-label">Lat/Long:</span> ${data.dispatchDetails.latLong}</td>
        </tr>
        <tr>
          <td><span class="field-label">LSD:</span> ${data.dispatchDetails.lsd}</td>
          <td><span class="field-label">Country:</span> ${data.dispatchDetails.country}</td>
        </tr>
        <tr>
          <td><span class="field-label">Province/State:</span> ${data.dispatchDetails.provinceState}</td>
          <td><span class="field-label">City:</span> ${data.dispatchDetails.city}</td>
        </tr>
        <tr>
          <td><span class="field-label">Street Address:</span> ${data.dispatchDetails.streetAddress}</td>
          <td><span class="field-label">Additional:</span> ${data.dispatchDetails.additional}</td>
        </tr>
      </table>`;

    // Alert Summary section
    const alertSummarySection = `
<div class="section-header">Alert Summary</div>
<table class="data-table">
        <tr>
          <td colspan="2"><span class="field-label">Time from Alert Acknowledgement to Dispatch:</span> <em style="color: #d32f2f; font-style: italic;">${
            data.alertSummary.timeFromAckToDispatch
          }</em></td>
        </tr>
      </table>
      
      <div class="challenges-label">Challenges/Notes:</div>
      <div style="margin-bottom: 10pt;">${this._escapeHtml(
        data.alertSummary.challengesNotes
      )}</div>
      
      <table class="timeline-table">
        <tr>
          <td class="time-column"><strong>Time</strong></td>
          <td class="note-column"><strong>Note</strong></td>
        </tr>`;

    // Generate timeline rows
    const timelineRows = data.alertSummary.detailedTimeline
      .map(
        (entry) => `
        <tr>
          <td class="time-column">${entry.time}</td>
          <td class="note-column">${entry.note}</td>
        </tr>`
      )
      .join("");

    const footer = `
      </table>
      </body>
      </html>`;

    return (
      header +
      alertInfoSection +
      orgDetailsSection +
      dispatchDetailsSection +
      alertSummarySection +
      timelineRows +
      footer
    );
  }

  _generateHTMLReport() {
    // For PDF generation - uses same HTML structure
    return this._generateWordHTML(this.reportData);
  }
}

// -------- DISPATCH STATE MANAGEMENT / HOOKS / INIT --------

function enhanceDispatchTracking() {
  const originalCallDispatch = window.callDispatch || function () {};
  window.callDispatch = function (options = {}) {
    const result = originalCallDispatch.apply(this, arguments);

    if (!window.protocolState) window.protocolState = {};
    window.protocolState.dispatchMade = true;
    window.protocolState.dispatch = {
      ...(window.protocolState.dispatch || {}),
      agencies: options.agencies || ["Emergency Services"], // not required for validation/rendering
      operator: options.operator || "Unknown",
      caseRef: options.caseRef || null,
      requestedAt: new Date().toISOString(),
      locationSnapshot: {
        lat: options.location?.lat ?? null,
        lng: options.location?.lng ?? null,
        address: options.location?.address ?? null,
        lsd: options.location?.lsd ?? null,
        connectivityAtDispatch: window.protocolState?.connectivity || "Unknown",
        locationAgeSecAtDispatch: window.protocolState?.locationAgeSec || null,
      },
    };

    console.log("Dispatch state set:", window.protocolState.dispatch);
    return result;
  };
}

function enhanceResolutionWithIncidentReport() {
  const originalResolveAlert = window.resolveAlert || function () {};
  window.resolveAlert = function (...args) {
    const result = originalResolveAlert.apply(this, args);
    setTimeout(() => {
      const generator = window.incidentReportGenerator;
      if (generator && generator.detectDispatchStatus()) {
        console.log(
          "Alert resolved with dispatch - auto-generating incident report"
        );
        generator.generateAndDisplayReport();
      }
    }, 1000);
    return result;
  };
}

// Initialization
window.incidentReportGenerator = new IncidentReportGenerator();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    enhanceDispatchTracking();
    enhanceResolutionWithIncidentReport();
  });
} else {
  enhanceDispatchTracking();
  enhanceResolutionWithIncidentReport();
}
