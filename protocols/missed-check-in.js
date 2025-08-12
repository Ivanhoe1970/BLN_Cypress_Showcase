window.demoProtocol = {
  name: 'Missed Check-In Protocol',
  description: 'Initiated when scheduled check-in is missed by user.',
  steps: [
    { title: 'Step 1', action: 'Call G7c device and attempt to speak to user.' },
    { title: 'Step 2', action: 'Send message to device. Wait 2 minutes.' },
    { title: 'Step 3', action: 'Contact emergency contacts.' },
    { title: 'Step 4', action: 'Dispatch EMS or appropriate services if needed.' },
    { title: 'Step 5', action: 'Start 30-minute follow-up.' }
  ]
};
