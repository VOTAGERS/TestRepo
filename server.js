import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const SERVICES = {};

app.post('/deploy', (req, res) => {
  const { branch, token, service } = req.body;
  const authHeader = req.headers['x-auth'];

  if (!branch || !token || !service) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (authHeader !== token) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }

  if (SERVICES[branch]) {
    return res.status(409).json({ success: false, message: 'Service already exists' });
  }

  SERVICES[branch] = {
    name: service,
    deployedAt: new Date().toISOString(),
    token,
  };

  console.log(`[DEPLOY] Service created for branch '${branch}' as '${service}' with token: ${token}`);
  res.json({ success: true, message: `Service '${service}' created for branch '${branch}'` });
});

app.get('/services', (req, res) => {
  res.json(SERVICES);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Deployment server running on port ${PORT}`);
});
