# ✅ Blackline Cypress Automation Showcase

This is a QA automation showcase built specifically to test core workflows in **Blackline Live** using **Cypress**, **JavaScript**, and the **Page Object Model (POM)**.

All tests target live features such as login, alert filtering, and user flow validation — with CI-ready structure and best practices.

---

## 🧠 Purpose

This repo was created to demonstrate:

- A scalable test framework aligned with BLN QA best practices
- Reusable components via Page Object Model (LoginPage, AlertsPage)
- API-based and UI-based login flows
- Clean test structure, fixtures, and environment isolation
- Potential for easy CI/CD integration via GitHub Actions

---

## 🧪 Tech Stack

| Tool             | Purpose                           |
|------------------|------------------------------------|
| **Cypress**      | E2E testing framework              |
| **JavaScript**   | Main scripting language            |
| **GitHub Actions** | CI runner for test execution    |
| **Page Objects** | Locators & logic encapsulated for maintainability |

---

## 🗂️ Folder Structure

cypress/
├── e2e/
│ ├── login_test.cy.js
│ ├── filter_alerts_acknowledged.cy.js
│ ├── filter_alerts_resolved.cy.js
│ └── filter_alerts_unacknowledged.cy.js
├── pages/
│ ├── LoginPage.js
│ └── AlertsPage.js
├── support/
│ ├── commands.js
│ └── e2e.js
cypress.config.js
.gitignore


---

## ✅ Test Coverage

| Area         | Description                                          |
|--------------|------------------------------------------------------|
| 🔐 Login      | Valid and invalid login via UI and API              |
| 🔍 Filters    | Status filter tests: Acknowledged, Unacknowledged, Resolved |
| 🔁 Reusability | Page Object Model to abstract selectors and logic  |
| ⚙️ Stability  | Ignores third-party script errors (e.g. `_LTracker`) |

---

## 🚀 How to Run

> ⚠️ Requires internal BLN test credentials

### 1. Clone the repo and install dependencies

```bash
npm install
