window.demoProtocol = {
  name: 'Fall Detection Protocol',
  description: 'Triggered when fall is detected by the device.',
  steps: [
    { title: 'Step 1', action: 'Call G7c device. Confirm if user needs assistance.' },
    { title: 'Step 2', action: 'Send message. Wait for response (2 minutes).' },
    { title: 'Step 3', action: 'Contact emergency contacts.' },
    { title: 'Step 4', action: 'Dispatch EMS if no response and location is valid.' },
    { title: 'Step 5', action: 'Start 30-minute follow-up timer and check outcome.' }
  ]
};
