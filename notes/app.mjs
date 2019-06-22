import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
const FileStore = sessionFileStore(session); 
export const sessionCookieName = 'notescookie.sid';
import hbs from 'hbs';
import DBG from 'debug';

const debug = DBG('notes:debug');
const error = DBG('notes:error');

import fs from 'fs-extra';
import rfs from 'rotating-file-stream';
var logStream;

import {router as index} from './routes/index';
import {router as notes} from './routes/notes';
import {router as users, initPassport} from './routes/users';

// const __dirname = path.dirname(new URL(import.meta.url).pathname);

import dirname from './dirname.js';
const {__dirname} = dirname;

const app = express();

const port = process.env.PORT || '3000';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

// Log to file if requested
if(process.env.REQUEST_LOG_FILE){
  (async () => {
    let logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
    await fs.ensureDir(logDirectory);
    logStream = rfs(process.env.REQUEST_LOG_FILE, {
      size: '10M',
      interval: '1d',
      compress: 'gzip'
    });
  })().catch(err => console.err(err))
}

app.use(session({ 
  store: new FileStore({ path: "/tmp/sessions" }), 
  secret: 'keyboard mouse',
  resave: true,
  saveUninitialized: true,
  name: sessionCookieName
})); 
initPassport(app);

app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
  stream: logStream ? logStream: process.stdout
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/vendor/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery')));
// app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
// app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'theme', 'bootstrap-4.1.0', 'dist')));
app.use('/assets/vendor/bootstrap/js', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')))
app.use('/assets/vendor/bootstrap/css', express.static(path.join(__dirname, 'minty')));
app.use('/assets/vendor/popper.js', express.static(path.join(__dirname, 'node_modules', 'popper.js', 'dist')));
app.use('/assets/vendor/feather-icons', express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')));

app.use('/', index);
app.use('/notes', notes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  if(!req.user){
    return next(createError(401, 'Please login to view this page.'));
  }  
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  error(`APP ERROR HANDLER ${err.stack}`);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
