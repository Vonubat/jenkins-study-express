import express, { Request, Response } from 'express';

const app = express();
const port = 3000;
const apiKey = process.env.API_KEY || 'Not Found';

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the TypeScript Express app!');
});

app.listen(port, () => {
  console.log(`TS App listening on port ${port}`);
});
