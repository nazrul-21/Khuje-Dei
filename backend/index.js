import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import router from './routes/route.js';
<<<<<<< HEAD

=======
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
>>>>>>> origin/main
dotenv.config();
const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); 

// Routes
app.use('/api', router);
<<<<<<< HEAD
=======
// Update the static file serving path to point to the correct directory
const projectRoot = path.join(__dirname, '..');
const uploadsPath = path.join(projectRoot, 'uploads');
console.log('Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));
>>>>>>> origin/main


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
