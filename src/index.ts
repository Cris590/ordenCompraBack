import cookieParser from 'cookie-parser';
import cors from 'cors';
import Debug from 'debug';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import fileUpload from 'express-fileupload';

import http from 'http';
import { router as index } from './routes/_index';

import { blackbox } from './helpers/logger';
import { validateApiRoute } from './middleware';
import { excludeDaemonsMiddleware } from './middleware/jwt';

const debug = Debug('hph-backend:server');

const app = express();
const corsOptions = {
  origin: ['http://93.127.217.189','http://localhost:3200', 'http://ordenesdev.brtsistema.com.co/','http://ordenes.brtsistema.com.co'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  credentials: true
};


dotenv.config();
app.use(cors());

// app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// view engine setup
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({limit: '5mb', extended: false }));
app.use(cookieParser());
// manejo de archivos
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));


app.use('/api', [excludeDaemonsMiddleware, validateApiRoute], index);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});


/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT ?? '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
    console.log(`Server on port ${port}`);
})
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): boolean | string | number {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : `Port  ${+port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      blackbox.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      blackbox.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void {
  const addr = server.address();
  const bind =
    typeof addr === 'string' ? 'pipe ' + addr : `port ${addr?.port ?? 8000}`;
  debug('Listening on ' + bind);
}
