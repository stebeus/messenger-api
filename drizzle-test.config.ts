import { configureDrizzle } from './drizzle.config.ts';
import { config } from './src/config.ts';

export default configureDrizzle(config.db.testUrl);
