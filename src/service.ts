require('dotenv').config();
import logger from './logger';

if (process.getuid() === 0) {
  logger.error({ message: 'Aborting because this process is running as root.' });
  process.exit(1);
}

process.on('unhandledRejection', (reason: any) => {
  logger.error(new Error(`Unhandled rejection detected ${reason.stack || reason}`));
});

import * as api from './api';
import * as db from './database';

(async () => {
  try {
    await db.initialize();
    const instance = await api.bootstrap();
    await instance.listen(Number(process.env.PORT || 8400), '0.0.0.0');
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();
