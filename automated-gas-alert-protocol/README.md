# Gas Alert Protocol - Unified Emergency Response System

## Overview
This unified alert management system handles both gas and non-gas alerts with enhanced safety features.

## Features
- **Universal Alert Handling**: Works with all alert types (Gas, SOS, Fall, No Motion)
- **Real-time Gas Monitoring**: Live gas readings with automatic HIGH/NORMAL detection
- **Smart Device Messaging**: Bidirectional communication with G7c devices
- **Gas-informed Resolution**: Override protection when gas levels remain elevated
- **Professional Interface**: Clean, modern UI matching Blackline Live standards

## Alert Types Supported
- **Gas Alerts**: H₂S, CO, LEL, O₂ with continuous monitoring
- **Non-Gas Alerts**: SOS, Fall Detection, No Motion, Manual alerts

## Gas Protocol Types
- **Standard**: Direct 5-step escalation protocol
- **Monitoring**: 2-minute automated monitoring with auto-resolution

## Testing
Use `cypress/e2e/protocols/protocol_gas.cy.js` for automated testing.

## Demo Data
See `cypress/fixtures/gas_alerts.json` for test scenarios.