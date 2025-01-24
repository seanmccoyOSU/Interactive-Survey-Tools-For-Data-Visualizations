require('dotenv').config(); // Load environment variables from .env file
const express = require('express')

//mysql2/promise for async/await
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
module.exports = pool;

pool.getConnection()
  .then(conn => {
    console.log("== Successfully connected to MySQL. ==");
    conn.release();
  })
  .catch(err => {
    console.error("!! Error connecting to MySQL:", err);
  });

const port = process.env.PORT || 8000;

const app = express()
const path = require('path')

app.use(express.json())

app.use(express.static('public'))

app.get('/', function(req,res,next) {
    const options = {
        root: path.join(__dirname, "public")
    };

    res.status(200).sendFile("visualizer.html", options)
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
