const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Connect to MySQL (replace with your cPanel database details)
const db = mysql.createConnection({
  host: 'localhost',        // e.g., localhost or something like 127.0.0.1
  user: 'deultima_admin',
  password: 'Deultimate2025',
  database: 'deultima_main'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// ✅ Get all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ Add product with image upload
app.post('/products', upload.single('image'), (req, res) => {
  const { title, description, category, price, sales_price, stock } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  const sql = `
    INSERT INTO products (title, description, category, price, sales_price, stock, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [title, description, category, price, sales_price, stock, imagePath];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Product added', productId: result.insertId });
  });
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
