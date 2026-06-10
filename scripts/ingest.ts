/**
 * Run the content ingestion pipeline from the command line:
 *
 *   npm run ingest
 *
 * (The npm script sets --conditions=react-server so server-only modules can
 * load outside Next.js.) Useful for local testing and external cron systems
 * that prefer running a process over calling the HTTP endpoint.
 */
import "dotenv/config";
import { runIngestionPipeline } from "../lib/ingestion/pipeline";

runIngestionPipeline()
  .then((report) => {
    console.log("\n✔ Ingestion pipeline finished:\n");
    console.table(report);
    console.log(
      "Note: the running site refreshes its cache on the next revalidation " +
        "window, or immediately when the /api/cron/ingest endpoint is used.\n",
    );
  })
  .catch((err) => {
    console.error("\n✖ Ingestion failed:", err.message ?? err);
    process.exit(1);
  });
