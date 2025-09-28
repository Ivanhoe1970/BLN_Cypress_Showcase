// protocol-log-hydrator-v22.js (V22.1)
// Hydrates currentAlert + protocolState.dispatch from the visible Protocol Log.
// Fixes: read timestamps from .log-timestamp DOM (data-iso|datetime|title|text),
//        more tolerant "Alert acknowledged" match, robust MT/MST/MDT parsing.

(function attachHydratorV22() {
    'use strict';
  
    const ZONE = 'America/Edmonton';
    const TZ_OFFSETS = { MST:-7, MDT:-6, CST:-6, CDT:-5, EST:-5, EDT:-4, UTC:0, MT:null };
    const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
  
    function getMTAbbrevForDate(baseIso) {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, timeZoneName: 'short' })
        .formatToParts(new Date(baseIso || Date.now()));
      return (parts.find(p => p.type === 'timeZoneName')?.value || 'MT').toUpperCase(); // MST/MDT
    }
  
    function ymdFromZone(baseIso, tz = ZONE) {
      try {
        const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit' });
        const parts = fmt.formatToParts(new Date(baseIso || Date.now()));
        const get = t => +parts.find(p => p.type === t).value;
        return { y:get('year'), m:get('month')-1, d:get('day') };
      } catch {
        const d = new Date(baseIso || Date.now());
        return { y:d.getFullYear(), m:d.getMonth(), d:d.getDate() };
      }
    }
  
    function toISOFromLocalParts(y,m,d,h,mi,s,abbr,baseIsoForMT) {
      let zone = (abbr || '').toUpperCase();
      if (zone === 'MT') zone = getMTAbbrevForDate(baseIsoForMT);
      const off = TZ_OFFSETS[zone];
      if (off == null) zone = getMTAbbrevForDate(baseIsoForMT);
      const offset = (TZ_OFFSETS[zone] ?? 0) * 3600 * 1000;
      const utcMs = Date.UTC(y,m,d,h,mi,s) + offset;
      return new Date(utcMs).toISOString();
    }
  
    // ---------- parsers on raw strings ----------
    function parseBracketTime(str, baseIso) {
      const m = str.match(/\[(\d{2}):(\d{2})(?::(\d{2}))?\s+(MST|MDT|CST|CDT|EST|EDT|UTC|MT)\]/i);
      if (!m) return null;
      const { y, m:mo, d } = ymdFromZone(baseIso);
      return toISOFromLocalParts(y,mo,d, +m[1], +m[2], +(m[3]||0), m[4].toUpperCase(), baseIso);
    }
  
    function parseFullDateWithAbbr(str) {
      // 2025-09-23 19:19:20 EDT
      let m = str.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s+(MST|MDT|CST|CDT|EST|EDT|UTC|MT)\b/i);
      if (m) return toISOFromLocalParts(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6], m[7].toUpperCase(), `${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  
      // Sep 23, 2025 at 17:19 MDT
      m = str.match(/\b([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})\s+at\s+(\d{2}):(\d{2})(?::(\d{2}))?\s+(MST|MDT|CST|CDT|EST|EDT|UTC|MT)\b/i);
      if (m) return toISOFromLocalParts(+m[3], MONTHS[m[1].toLowerCase()], +m[2], +m[4], +m[5], +(m[6]||0), m[7].toUpperCase(), `${m[3]}-${String(MONTHS[m[1].toLowerCase()]+1).padStart(2,'0')}-${String(+m[2]).padStart(2,'0')}T00:00:00Z`);
  
      return null;
    }
  
    function parseClockWithAbbr(str, baseIso) {
      // 21:45 MDT | 21:45:30 MDT | 21:45 MT
      const m = str.match(/\b(\d{2}):(\d{2})(?::(\d{2}))?\s+(MST|MDT|CST|CDT|EST|EDT|UTC|MT)\b/i);
      if (!m) return null;
      const { y, m:mo, d } = ymdFromZone(baseIso);
      return toISOFromLocalParts(y,mo,d, +m[1], +m[2], +(m[3]||0), m[4].toUpperCase(), baseIso);
    }
  
    // ---------- DOM timestamp reader ----------
    function readTimestampFromEntry(entry, baseIso) {
      // Priority 1: explicit attributes on entry or .log-timestamp
      const node = entry.querySelector('.log-timestamp') || entry;
      const attrs = ['data-iso','data-ts','data-datetime','datetime','data-time','title'];
      for (const a of attrs) {
        const v = node.getAttribute && node.getAttribute(a);
        if (v && !Number.isNaN(new Date(v).valueOf())) return new Date(v).toISOString();
      }
      // Priority 2: text inside .log-timestamp
      if (node && node.textContent) {
        const tsText = node.textContent.trim();
        const iso =
          parseFullDateWithAbbr(tsText) ||
          parseBracketTime(tsText, baseIso) ||
          parseClockWithAbbr(tsText, baseIso);
        if (iso) return iso;
      }
      // Priority 3: fallback to whole entry text
      const raw = entry.textContent || '';
      const text = raw.replace(/\s+/g, ' ').trim();
      return (
        parseFullDateWithAbbr(raw) ||
        parseFullDateWithAbbr(text) ||
        parseBracketTime(raw, baseIso) ||
        parseBracketTime(text, baseIso) ||
        parseClockWithAbbr(raw, baseIso) ||
        parseClockWithAbbr(text, baseIso) ||
        null
      );
    }
  
    // ---------- Location extractors ----------
    function extractLatLng(str) {
      let m = str.match(/Latitude\s+(-?\d+(?:\.\d+)?)[,\s]+Longitude\s+(-?\d+(?:\.\d+)?)/i);
      if (m) return { lat:+m[1], lng:+m[2] };
      m = str.match(/\bLat(?:itude)?[:\s/]*(-?\d+(?:\.\d+)?)[,\s/]+Long(?:itude)?[:\s/]*(-?\d+(?:\.\d+)?)/i);
      if (m) return { lat:+m[1], lng:+m[2] };
      m = str.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
      if (m) return { lat:+m[1], lng:+m[2] };
      return {};
    }
  
    function extractAddress(str) {
      let m = str.match(/Approximate Address\s*:?\s*([^]+?)(?=(Latitude|Lat\b|Last Location|Last Communication|Battery|Signal|Waiting|Dispatch|$))/i);
      if (m) return m[1].replace(/\s+/g,' ').trim();
      m = str.match(/\bAddress\s*:?\s*([^]+?)(?=(Latitude|Lat\b|Last Location|Last Communication|Battery|Signal|Waiting|Dispatch|$))/i);
      if (m) return m[1].replace(/\s+/g,' ').trim();
      m = str.match(/\bLocation\s*:?\s*([^]+?)(?=(Latitude|Lat\b|Last Location|Last Communication|Battery|Signal|Waiting|Dispatch|$))/i);
      if (m) return m[1].replace(/\s+/g,' ').trim();
      return null;
    }
  
    function extractLSD(str) {
      const m = str.match(/\bLSD\s*:?\s*([^\n\r]+)/i);
      return m ? m[1].trim() : null;
    }
  
    // ---------- Main ----------
    window.hydrateFromProtocolLogV22 = function hydrateFromProtocolLogV22() {
      const log = document.getElementById('protocolLog');
      if (!log) return { ok:false, reason:'#protocolLog not found' };
  
      const baseIso = (window.currentAlert?.timestamp ||
                       window.currentAlert?.acknowledgedAt ||
                       new Date().toISOString());
  
      const entries = Array.from(log.querySelectorAll('.log-entry'));
      if (!entries.length) return { ok:false, reason:'no .log-entry items' };
  
      window.currentAlert  = window.currentAlert  || {};
      window.protocolState = window.protocolState || {};
      const ps = window.protocolState;
  
      for (const entry of entries) {
        const raw = entry.textContent || '';
        const text = raw.replace(/\s+/g,' ').trim();
  
        const ts = readTimestampFromEntry(entry, baseIso);
  
        // ------- alert timeline -------
        if (/Alert triggered by device/i.test(text)) {
          if (!window.currentAlert.triggeredAt && ts) window.currentAlert.triggeredAt = ts;
        }
        if (/Alert received by server/i.test(text)) {
          if (!window.currentAlert.receivedAt && ts) window.currentAlert.receivedAt = ts;
        }
        // tolerate trailing punctuation or extra words
        if (/Alert acknowledged\b\.?/i.test(text)) {
          if (!window.currentAlert.acknowledgedAt && ts) window.currentAlert.acknowledgedAt = ts;
        }
        if (/\bAlert resolved\b\.?/i.test(text)) {
          if (!window.currentAlert.resolvedAt && ts) window.currentAlert.resolvedAt = ts;
        }
  
        // ------- dispatch -------
        if (/(Called dispatch|Initiating dispatch|Dispatch completed|Requested\s+EMS|Dispatched\b)/i.test(text)) {
          ps.dispatchMade = true;
          ps.dispatch = ps.dispatch || {};
          if (!ps.dispatch.requestedAt) ps.dispatch.requestedAt = ts || new Date().toISOString();
  
          ps.dispatch.locationSnapshot = ps.dispatch.locationSnapshot || {};
          const addr = extractAddress(raw) || extractAddress(text);
          if (addr && !ps.dispatch.locationSnapshot.address) ps.dispatch.locationSnapshot.address = addr;
  
          const lsd = extractLSD(raw) || extractLSD(text);
          if (lsd && !ps.dispatch.locationSnapshot.lsd) ps.dispatch.locationSnapshot.lsd = lsd;
  
          const ll = extractLatLng(raw) || extractLatLng(text);
          if (ll && (ll.lat!=null) && (ll.lng!=null)) {
            if (ps.dispatch.locationSnapshot.lat == null) ps.dispatch.locationSnapshot.lat = ll.lat;
            if (ps.dispatch.locationSnapshot.lng == null) ps.dispatch.locationSnapshot.lng = ll.lng;
          }
        }
      }
  
      const ok = !!(window.currentAlert?.acknowledgedAt &&
        ps.dispatchMade &&
        ps.dispatch?.requestedAt &&
        (ps.dispatch.locationSnapshot?.address || ps.dispatch.locationSnapshot?.lsd) &&
        (ps.dispatch.locationSnapshot?.lat != null) &&
        (ps.dispatch.locationSnapshot?.lng != null));
  
      return {
        ok,
        currentAlert: window.currentAlert,
        protocolState: window.protocolState,
        reason: ok ? undefined : 'One or more required fields could not be hydrated from the Protocol Log'
      };
    };
  })();
  