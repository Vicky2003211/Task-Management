require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [   
    'http://localhost:5173',        
  ],
  credentials: true   
}));

app.use(express.json());    

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,      
  useUnifiedTopology: true    
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  
  const Routes = require('./Routes/Route');
  app.use('/api', Routes);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);  
});

app.get('/', (req, res) => {
  res.send('Agent Management System API - MongoDB Connected!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
