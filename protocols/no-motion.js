window.demoProtocol = {
  name: 'No Motion Protocol',
  description: 'Triggered when device detects prolonged inactivity.',
  steps: [
    { title: 'Step 1', action: 'Call G7c device and user phone.' },
    { title: 'Step 2', action: 'Send message. Wait 2 minutes.' },
    { title: 'Step 3', action: 'Attempt contact with emergency contacts.' },
    { title: 'Step 4', action: 'Dispatch EMS if no answer and GPS is valid.' },
    { title: 'Step 5', action: 'Follow up after 30 minutes.' }
  ]
};
