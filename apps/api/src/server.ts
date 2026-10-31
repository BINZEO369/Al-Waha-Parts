import { app } from './app.js';
import { getConfig } from './env.js';

const config = getConfig();
app.listen({ port: config.port, host: '0.0.0.0' }).catch((error) => { app.log.error(error); process.exit(1); });
