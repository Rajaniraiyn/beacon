import { type RequestOptions, request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';

interface BeaconMessage {
  url: string;
  data?: string | Buffer;
}

let pendingRequests = 0;
const messageQueue: BeaconMessage[] = [];
let processing = false;

process.on('message', (message: BeaconMessage) => {
  messageQueue.push(message);
  pendingRequests++;
  if (!processing) {
    processQueue();
  }
});

// Function to process the message queue
async function processQueue() {
  processing = true;
  while (messageQueue.length > 0) {
    const message = messageQueue.shift()!;
    try {
      await sendHttpRequest(message.url, message.data);
    } catch (error) {
      // Handle error as needed
    } finally {
      pendingRequests--;
    }
  }
  processing = false;

  // Exit the process if there are no pending requests
  if (pendingRequests === 0) {
    process.exit(0);
  }
}

function sendHttpRequest(url: string, data?: string | Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';

    const options: RequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8', // Default content type per spec
        'Content-Length': data ? calculateSize(data).toString() : '0',
      },
    };

    // Adjust headers based on data type
    if (typeof data === 'string' && data.includes('=')) {
      options.headers!['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }

    const req = (isHttps ? httpsRequest : httpRequest)(url, options, (res) => {
      res.resume(); // Consume response data to free up memory
      res.on('end', () => {
        resolve();
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

function calculateSize(data: string | Buffer): number {
  if (typeof data === 'string') {
    return Buffer.byteLength(data, 'utf-8');
  }
  if (Buffer.isBuffer(data)) {
    return data.byteLength;
  }
  throw new TypeError('Unsupported data type for size calculation');
}

// Keep the event loop alive
setInterval(() => {
  // Do nothing; this keeps the process alive
}, 1000).unref();