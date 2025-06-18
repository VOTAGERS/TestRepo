import express from 'express';
import { config } from 'dotenv';
import expressEjsLayouts from 'express-ejs-layouts';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import AppRoute from './routes/AppRoute.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// Middleware global untuk view
app.use((req, res, next) => {
  res.locals.successMsg = req.flash('success');
  res.locals.errorMsg = req.flash('error');
  next();
});

app.use(expressEjsLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', AppRoute);

app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));

app.listen(PORT, () => {
    console.log(`Express running Apps on http://localhost:${PORT}`);
});