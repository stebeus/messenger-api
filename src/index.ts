import { createServer } from './app.ts';
import { config } from './config.ts';

createServer(config.port);
