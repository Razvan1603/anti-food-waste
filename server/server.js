const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const User = require('./models/user.js');
const FridgeItem = require('./models/fridgeItem');
const Group = require('./models/group');
const Alert = require('./models/alert');

// Configurare .env
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const PORT = 5020;

// Middleware
app.use(express.json());


const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
};

app.use(cors()); // apply cors middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// MongoDB connection
mongoose
  .connect('mongodb+srv://ciuntudaniel22:FoodSharing25@foodsharing.s1fhm.mongodb.net/?retryWrites=true&w=majority&appName=foodSharing', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    const user = await User.findOne({ username });
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fridge Items
app.get('/api/fridge', authenticate, async (req, res) => {
  const items = await FridgeItem.find({ owner: req.user.username });
  res.json(items);
});

app.post('/api/fridge', authenticate, async (req, res) => {
  const { name, expiryDate, category } = req.body;
  try {
    const newItem = new FridgeItem({
      name,
      expiryDate,
      category,
      available: true,
      owner: req.user.username, // Asociem utilizatorului conectat
    });
    await newItem.save();
    res.status(201).json({ message: 'Item added successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Groups
app.get('/api/groups', authenticate, async (req, res) => {
  const groups = await Group.find({ owner: req.user.username });
  res.json(groups);
});

app.post('/api/groups', authenticate, async (req, res) => {
  const { name, tag } = req.body;
  try {
    const newGroup = new Group({
      name,
      tag,
      owner: req.user.username, // Asociem utilizatorului conectat
    });
    await newGroup.save();
    res.status(201).json({ message: 'Group added successfully', group: newGroup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Alerts
app.get('/api/alerts', authenticate, async (req, res) => {
  const alerts = await Alert.find();
  res.json(alerts);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));