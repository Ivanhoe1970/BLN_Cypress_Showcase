window.demoProtocol = {
  name: 'SOS Protocol',
  description: 'Triggered by user in distress using SOS button.',
  steps: [
    { title: 'Step 1', action: 'Call G7c device and user phone.' },
    { title: 'Step 2', action: 'Send message to device. Wait 2 minutes.', timer: 120 },
    { title: 'Step 3', action: 'Contact emergency contacts in order.' },
    { title: 'Step 4', action: 'Dispatch EMS or Police if location is valid.' },
    { title: 'Step 5', action: 'Wait 30 minutes and follow up with dispatch.', timer: 1800 }
  ]
};
