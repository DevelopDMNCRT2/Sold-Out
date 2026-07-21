import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import eventRoutes from './routes/events.js';
import uploadRoutes from './routes/upload.js';
import orderRoutes from './routes/orders.js';
import usersRoutes from './routes/users.js';
import customersRoutes from './routes/customers.js';
import contactRoutes from './routes/contact.js';
import scannerRoutes from './routes/scanner.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/scanner', scannerRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Sold-Out API is running' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
