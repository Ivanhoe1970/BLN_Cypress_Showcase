window.demoProtocol = {
  name: 'Silent SOS with Cancel Phrase Protocol',
  description: 'Silent SOS with optional cancel code used by the user to de-escalate.',
  steps: [
    { title: 'Step 1', action: 'Send message requesting confirmation from user.' },
    { title: 'Step 2', action: 'Evaluate user response for presence of cancel phrase.' },
    { title: 'Step 3', action: 'If cancel phrase is absent, continue contacting ECs.' },
    { title: 'Step 4', action: 'Dispatch EMS/Police if no valid response.' },
    { title: 'Step 5', action: 'Log event and complete 30-minute follow-up.' }
  ]
};
