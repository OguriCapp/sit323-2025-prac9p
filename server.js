const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
app.use(express.json());

// To configure MongoDB connection
const mongoUrl = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'calculator';
let db;

// To connect to MongoDB
async function connectToMongo() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URL:', mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@'));
    const client = await MongoClient.connect(mongoUrl);
    db = client.db(dbName);
    console.log('Successfully connected to MongoDB Atlas');
    console.log('Database:', dbName);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
  }
}

// To log calculation history
async function logCalculation(operation, num1, num2, result) {
  try {
    await db.collection('calculations').insertOne({
      operation,
      num1: Number(num1),
      num2: Number(num2),
      result,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging calculation:', error);
  }
}

// To get calculation history
app.get('/history', async (req, res) => {
  try {
    const history = await db.collection('calculations')
      .find()
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// To add two numbers
app.get('/add', async (req, res) => {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({ error: "Please press the number you want to add" });
  }
  const result = Number(num1) + Number(num2);
  await logCalculation('add', num1, num2, result);
  res.json({ result });
});

// To subtract two numbers
app.get('/subtract', async (req, res) => {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({ error: "Please press the number you want to subtract" });
  }
  const result = Number(num1) - Number(num2);
  await logCalculation('subtract', num1, num2, result);
  res.json({ result });
});

// To multiply two numbers
app.get('/multiply', async (req, res) => {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({ error: "Please press the number you want to multiply" });
  }
  const result = Number(num1) * Number(num2);
  await logCalculation('multiply', num1, num2, result);
  res.json({ result });
});

// To divide two numbers
app.get('/divide', async (req, res) => {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({ error: "Please press the number you want to divide" });
  }
  if (Number(num2) === 0) {
    return res.status(400).json({ error: "Cannot divide by zero" });
  }
  const result = Number(num1) / Number(num2);
  await logCalculation('divide', num1, num2, result);
  res.json({ result });
});

// To calculate power
app.get('/power', async (req, res) => {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({ error: "(num1)base and (num2)exponent should be numbers" });
  }
  const result = Math.pow(Number(num1), Number(num2));
  await logCalculation('power', num1, num2, result);
  res.json({ result });
});

// To calculate square root
app.get('/sqrt', async (req, res) => {
  const { num } = req.query;
  if (isNaN(num)) {
    return res.status(400).json({ error: "Please press the number you want to do sqrt" });
  }
  if (Number(num) < 0) {
    return res.status(400).json({ error: "Please input positive numbers, this function can't deal with negative numbers" });
  }
  const result = Math.sqrt(Number(num));
  await logCalculation('sqrt', num, 0, result);
  res.json({ result });
});

// To calculate modulo
app.get('/modulo', async (req, res) => {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({ error: "Please press the number you want to modulo" });
  }
  if (Number(num2) === 0) {
    return res.status(400).json({ error: "Cannot modulo by zero" });
  }
  const result = Number(num1) % Number(num2);
  await logCalculation('modulo', num1, num2, result);
  res.json({ result });
});

// To create a new calculation record
app.post('/calculations', async (req, res) => {
  try {
    const { operation, num1, num2, result } = req.body;
    const calculation = {
      operation,
      num1: Number(num1),
      num2: Number(num2),
      result: Number(result),
      timestamp: new Date()
    };
    const insertResult = await db.collection('calculations').insertOne(calculation);
    res.status(201).json(insertResult);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create calculation record' });
  }
});

// To get a specific calculation by ID
app.get('/calculations/:id', async (req, res) => {
  try {
    const calculation = await db.collection('calculations').findOne({ _id: new ObjectId(req.params.id) });
    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    res.json(calculation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calculation' });
  }
});

// To update a calculation record
app.put('/calculations/:id', async (req, res) => {
  try {
    const { operation, num1, num2, result } = req.body;
    const update = {
      operation,
      num1: Number(num1),
      num2: Number(num2),
      result: Number(result),
      updatedAt: new Date()
    };
    const updateResult = await db.collection('calculations').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    res.json({ message: 'Calculation updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update calculation' });
  }
});

// To delete a calculation record
app.delete('/calculations/:id', async (req, res) => {
  try {
    const deleteResult = await db.collection('calculations').deleteOne({ _id: new ObjectId(req.params.id) });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    res.json({ message: 'Calculation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete calculation' });
  }
});

// To start server
connectToMongo().then(() => {
  app.listen(8080, () => console.log('Server running on port 8080'));
});