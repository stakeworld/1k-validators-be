import { CronJob } from "cron";
import Db from "./db";
import { config } from "node:process";
import { MONITOR_CRON, SIXTEEN_HOURS } from "./constants";
import logger from "./logger";
import Monitor from "./monitor";

// Monitors the latest GitHub releases and ensures nodes have upgraded
// within a timely period.
export const startMonitorJob = async (config, db: Db) => {
  logger.info(
    `(cron::startMonitorJob) Starting Monitor Cron Job with frequency ${config.cron.monitor}`
  );

  const monitor = new Monitor(db, SIXTEEN_HOURS);
  const monitorFrequency = config.cron.monitor
    ? config.cron.monitor
    : MONITOR_CRON;

  const monitorCron = new CronJob(monitorFrequency, async () => {
    logger.info(
      `{Start} Monitoring the node version by polling latst GitHub releases every ${
        config.global.test ? "three" : "fifteen"
      } minutes.`
    );
    await monitor.getLatestTaggedRelease();
    await monitor.ensureUpgrades();
  });

  await monitor.getLatestTaggedRelease();
  await monitor.ensureUpgrades();
  monitorCron.start();
};
