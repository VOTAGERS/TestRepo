import express from 'express';
import { config } from 'dotenv';
import expressEjsLayouts from 'express-ejs-layouts';
import cors from 'cors';
import path from 'path';
import AppRoute from '../routes/AppRoute.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import serverless from 'serverless-http';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressEjsLayouts);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/', AppRoute);

app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, '../views'));

export default serverless(app);