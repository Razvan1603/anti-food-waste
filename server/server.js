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
const Friend = require('./models/friend'); // Modelul Friend

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors());
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

// User Registration
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

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
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

app.get('/api/fridgelist', async (req, res) => {
  try {
    const items = await FridgeItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fridge', authenticate, async (req, res) => {
  const { name, expiryDate, category } = req.body;
  try {
    const newItem = new FridgeItem({
      name,
      expiryDate,
      category,
      available: true,
      owner: req.user.username,
    });
    await newItem.save();
    res.status(201).json({ message: 'Item added successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/fridgelist/:_id', (req, res) => {
  const { _id } = req.params; // _id luat din parametrii URL
  const { available } = req.body; // Starea claimed trimisă în body

  console.log(`Updating item with _id: ${_id}, available: ${available}`); // Log pentru debugging

  FridgeItem.findByIdAndUpdate(_id, { available }, { new: true })
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }
      console.log('Updated item:', updatedItem); // Log pentru a vedea rezultatul
      res.json(updatedItem); // Răspundem cu alimentul actualizat
    })
    .catch((err) => {
      console.error('Error during update:', err); // Log pentru eroare
      res.status(500).json({ error: err.message }); // Tratează eroarea și o trimite ca JSON
    });
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
      owner: req.user.username,
    });
    await newGroup.save();
    res.status(201).json({ message: 'Group added successfully', group: newGroup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alerts
app.get('/api/alerts', async (req, res) => {
  const now = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + 5);
  thresholdDate.setHours(23, 59, 59, 999);

  try {
    const alerts = await FridgeItem.find({
      expiryDate: { $lte: thresholdDate },
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Friends
app.get('/api/friends', authenticate, async (req, res) => {
  try {
    const friends = await Friend.find({ owner: req.user.username });
    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/friends', authenticate, async (req, res) => {
  const { username } = req.body;
  const currentUsername = req.user.username;

  if (username === currentUsername) {
    return res.status(400).json({ message: 'You cannot add yourself as a friend.' });
  }

  try {
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existingFriendship = await Friend.findOne({ owner: currentUsername, username });
    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists.' });
    }

    const newFriendForCurrentUser = new Friend({ username, owner: currentUsername });
    const newFriendForTargetUser = new Friend({ username: currentUsername, owner: username });

    await newFriendForCurrentUser.save();
    await newFriendForTargetUser.save();

    res.status(201).json({
      message: 'Friendship added successfully.',
      friends: [newFriendForCurrentUser, newFriendForTargetUser],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/friends/:username', authenticate, async (req, res) => {
  const { username } = req.params;
  const currentUsername = req.user.username;

  try {
    const friendToDelete = await Friend.findOneAndDelete({ owner: currentUsername, username });
    const reciprocalFriendToDelete = await Friend.findOneAndDelete({ owner: username, username: currentUsername });

    if (!friendToDelete || !reciprocalFriendToDelete) {
      return res.status(404).json({ message: 'Friendship not found.' });
    }

    res.status(200).json({ message: 'Friendship removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
