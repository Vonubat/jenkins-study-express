const express = require('express');
const app = express();
const port = 3000;

// Read the secret from the environment (or default to 'Not Found')
const apiKey = process.env.API_KEY || 'Not Found';

app.get('/', (req, res) => {
  res.send('Hello from the new feature branch!');
});

app.listen(port, () => {
  console.log(`Dummy app listening on port ${port}`);
  console.log(`The securely injected API key is: ${apiKey}`); // We will check the Jenkins logs for this!
});
