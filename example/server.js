const http = require('http');

const PORT = 3000; // You can change this port if needed

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    const bodyChunks = [];

    await new Promise((resolve) => setTimeout(resolve, 5e3)); // Simulate a slow server

    req.on('data', (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on('end', () => {
      const body = Buffer.concat(bodyChunks).toString();
      console.log(`Received data: ${body}`);

      // Optionally send a response back to the client
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Data received\n');
    });
  } else {
    // Handle other HTTP methods if necessary
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed\n');
  }
});

server.listen(PORT, () => {
  console.log(`Echo server is listening on port ${PORT}`);
});