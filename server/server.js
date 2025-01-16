const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const app = express();
const port = 5020;

app.use(cors());
app.use(express.json());

// Dummy data
let fridgeItems = [
  { id: 1, name: 'Milk', expiryDate: '2025-01-18', category: 'Dairy', available: false },
  { id: 2, name: 'Carrots', expiryDate: '2025-01-20', category: 'Vegetables', available: false },
  { id: 3, name: 'Chicken', expiryDate: '2025-01-17', category: 'Meat', available: true },
];

let groups = [
  { id: 1, name: 'Veggie Lovers', tag: 'Vegetarian' },
  { id: 2, name: 'Meat Eaters', tag: 'Carnivores' },
  { id: 3, name: 'Fitness Enthusiasts', tag: 'Healthy' },
];

let alerts = [
  { id: 1, message: 'Milk will expire in 2 days!' },
  { id: 2, message: 'Carrots will expire in 4 days!' },
];

// Swagger setup
const YAML = require('yaml');
const swaggerDocument = YAML.parse(fs.readFileSync('./swagger.yaml', 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
// Get all fridge items
app.get('/api/fridge', (req, res) => {
  res.json(fridgeItems);
});

// Add a new fridge item
app.post('/api/fridge', (req, res) => {
  const newItem = { ...req.body, id: Date.now(), available: false };
  fridgeItems.push(newItem);
  res.status(201).send('Item added successfully');
});

// Mark a fridge item as available
app.post('/api/fridge/mark-available/:id', (req, res) => {
  const { id } = req.params;
  const item = fridgeItems.find((item) => item.id === parseInt(id));
  if (item) {
    item.available = true;
    res.send('Item marked as available');
  } else {
    res.status(404).send('Item not found');
  }
});

// Claim a fridge item
app.post('/api/fridge/claim/:id', (req, res) => {
  const { id } = req.params;
  fridgeItems = fridgeItems.filter((item) => item.id !== parseInt(id));
  res.status(200).send('Item claimed successfully');
});

// Get all groups
app.get('/api/groups', (req, res) => {
  res.json(groups);
});

// Add a new group
app.post('/api/groups', (req, res) => {
  const newGroup = { ...req.body, id: Date.now() };
  groups.push(newGroup);
  res.status(201).send('Group added successfully');
});

// Get all alerts
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// Add a new alert (optional for debugging/testing)
app.post('/api/alerts', (req, res) => {
  const newAlert = { ...req.body, id: Date.now() };
  alerts.push(newAlert);
  res.status(201).send('Alert added successfully');
});

// Start the server
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
