import cluster from 'cluster';
import logger from './logger';
const numCPUs = require('os').cpus().length;

let severeCount = 0;

function spawn(cluster: any) {
  cluster.fork();
}

if (cluster.isMaster) {
  logger.info(`cluster: master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    spawn(cluster);
  }
  cluster.on('exit', (worker: cluster.Worker) => {
    logger.warn(`cluster: worker ${worker.process.pid} died`);
    if (severeCount < 15) {
      logger.error(`stopping respawns because processing is always stopping`);
      spawn(cluster);
    }
    severeCount++;
  });
} else {
  logger.info(`cluster: worker ${process.pid} started`);
  require('./service');
}
