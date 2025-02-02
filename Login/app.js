const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'Login', 'views'))); // Serving static files

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));