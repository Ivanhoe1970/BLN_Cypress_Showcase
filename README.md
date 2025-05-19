✅ Blackline Cypress Automation Showcase
This is a QA automation showcase built specifically to test core workflows in Blackline Live using Cypress, JavaScript, and the Page Object Model (POM).

All tests target live features such as login, alert filtering, and user flow validation — with CI-ready structure and best practices.

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/ivanhoe1970/BLN_Cypress_Showcase/cypress-ci.yaml?label=CI&style=for-the-badge" alt="CI Status"/>
  <img src="https://img.shields.io/badge/Tested%20With-Cypress-04C38E?style=for-the-badge" alt="Cypress"/>
  <img src="https://img.shields.io/github/license/ivanhoe1970/BLN_Cypress_Showcase?style=for-the-badge" alt="License"/>
</p>

---
“This is a fully working Cypress-based E2E test framework that I designed and built from scratch to automate real workflows in Blackline Live. It covers UI and API-based login flows, dynamic alert filtering (Acknowledged, Unacknowledged, Resolved), and implements the Page Object Model for scalability. All tests run in both GUI and CI headless modes with GitHub Actions.”

---

## 🧠 Purpose

This repo was created to demonstrate:

- A scalable test framework aligned with BLN QA best practices  
- Reusable components via Page Object Model (LoginPage, AlertsPage)  
- API-based and UI-based login flows  
- Clean test structure, fixtures, and environment isolation  
- Potential for CI/CD integration via GitHub Actions  

---

## ✏️ Tech Stack

| Tool            | Purpose                                               |
|-----------------|-------------------------------------------------------|
| Cypress         | E2E testing framework                                 |
| JavaScript      | Main scripting language                               |
| GitHub Actions  | CI runner for test execution                          |
| Page Objects    | Locators & logic encapsulated for maintainability     |

---

## 🗂 Folder Structure

cypress/
└── e2e/
├── login_test.cy.js
├── filter_alerts_acknowledged.cy.js
├── filter_alerts_unacknowledged.cy.js
├── filter_alerts_resolved.cy.js
└── pages/
├── LoginPage.js
├── AlertsPage.js
└── support/
├── commands.js
├── e2e.js
└── cypress.config.js
└── cypress.env.json


---

## ✅ Test Coverage

| Area         | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| 🔐 Login      | Valid and invalid login via UI only (API login was prototyped and skipped) |
| 📊 Filters    | Status filter tests: Acknowledged, Unacknowledged, Resolved                |
| ♻️ Reusability | Page Object Model used to abstract selectors and test logic                |
| 🧘 Stability   | Ignores noisy third-party scripts during test runs (e.g., `_lTracker`)     |

---

## 🚀 How to Run

⚠️ Requires internal **BLN test credentials**

### 1. Clone the repo and install dependencies:

```bash
npm install


Run tests in headed mode:

npx cypress open

Or run all specs in headless mode:

npx cypress run

🔄 CI/CD with GitHub Actions
This repo uses a GitHub Actions workflow: .github/workflows/cypress-ci.yaml

name: Run Cypress Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  cypress-run:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Install Dependencies
        run: npm install

      - name: Run Cypress in headless mode
        run: npx cypress run

✅ CI status updates with every push or PR to main.

