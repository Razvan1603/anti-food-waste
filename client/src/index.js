const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const swaggerUi = require('swagger-ui-express');
const fs = require("fs");


app.use(bodyParser.json());
app.use(cors());



app.use(express.static(path.join(__dirname, './')));

const openApiSpec = path.join(__dirname,"swagger.yaml");
const openApi = fs.readFileSync(openApiSpec,"utf8");

app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(null, {
  swaggerOptions:{ 
    url:"/swagger.yaml"
  },
}))

app.get("/openapi.yaml", (req,res) => {
  res.type("application/x-yaml");
  res.send(openApi);
})

let items = [
  { id: '1', name: 'Milk', expiryDate: '2024-12-10', category: 'dairy' },
  { id: '2', name: 'Apples', expiryDate: '2024-12-08', category: 'fruits' },
];

// api routes
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const newItem = {
    id: `${items.length + 1}`,
    name: req.body.name,
    expiryDate: req.body.expiryDate,
    category: req.body.category,
  };

  if (!newItem.name || !newItem.expiryDate || !newItem.category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  items.push(newItem);
  res.status(201).json(newItem);
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
