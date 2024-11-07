import { sendBeacon } from '..';

const ECHO_SERVER_URL = 'http://localhost:3000';

let counter = 0;
const INTERVAL_MS = 2000; // Send data every 2 seconds

function sendPeriodicData() {
  counter++;
  const data = JSON.stringify({
    event: 'periodicUpdate',
    value: counter,
    timestamp: new Date().toISOString(),
  });

  const success = sendBeacon(ECHO_SERVER_URL, data);

  if (!success) {
    console.error('Failed to queue the beacon request.');
  } else {
    console.log('Beacon request queued successfully.');
  }

  // Schedule the next data send
  setTimeout(sendPeriodicData, INTERVAL_MS);
}

// Start sending data
sendPeriodicData();

// Keep the process alive
process.stdin.resume();

// Handle process exit gracefully
process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting process.');
  process.exit(0);
});