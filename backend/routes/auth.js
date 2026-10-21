const express = require('express');
const jwt = require('jsonwebtoken');

function createAuthRouter({ usersFile, readJSON, writeJSON, SECRET_KEY }) {
  const router = express.Router();

  router.post('/register', (req, res) => {
    const { username, password, userType = 'Member' } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    if (!['Member', 'Administrator'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }
    const users = readJSON(usersFile);
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ message: 'User already exists' });
    }
    users.push({ username, password, userType, favorites: [] });
    writeJSON(usersFile, users);
    res.status(201).json({ message: 'User registered' });
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const userType = user.userType === 'Administrator' ? 'Administrator' : 'Member';
    const token = jwt.sign({ username, userType }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, userType });
  });

  return router;
}

module.exports = createAuthRouter;
