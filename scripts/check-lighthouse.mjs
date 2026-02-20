import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts");
const reportPath = path.join(artifactsDir, "lighthouse-report.json");
const serverUrl = "http://127.0.0.1:4173/";

const thresholds = {
  performance: 0.85,
  lcp: 3000,
  cls: 0.1
};

function runCommand(command, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: root,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      ...options
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

function waitForServerReady(serverProcess, timeoutMs = 15000) {
  const readyPattern = /available on:|hit ctrl-c to stop the server/i;
  return new Promise((resolve, reject) => {
    let logs = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Server readiness timeout.\n${logs}`));
    }, timeoutMs);

    const onData = (chunk) => {
      logs += chunk.toString();
      if (!settled && readyPattern.test(logs)) {
        settled = true;
        clearTimeout(timer);
        resolve();
      }
    };

    serverProcess.stdout.on("data", onData);
    serverProcess.stderr.on("data", onData);
    serverProcess.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`Server exited early with code ${code}.\n${logs}`));
    });
  });
}

function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.killed) return Promise.resolve();

  if (process.platform === "win32") {
    return runCommand(`taskkill /pid ${serverProcess.pid} /t /f`).then(() => undefined);
  }

  serverProcess.kill("SIGTERM");
  return Promise.resolve();
}

function parseReport() {
  if (!fs.existsSync(reportPath)) {
    throw new Error("Lighthouse report file was not created.");
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  return {
    performance: report.categories?.performance?.score ?? null,
    fcp: report.audits?.["first-contentful-paint"]?.numericValue ?? null,
    lcp: report.audits?.["largest-contentful-paint"]?.numericValue ?? null,
    cls: report.audits?.["cumulative-layout-shift"]?.numericValue ?? null
  };
}

function formatMs(value) {
  if (typeof value !== "number") return "n/a";
  return `${Math.round(value)}ms`;
}

function formatScore(value) {
  if (typeof value !== "number") return "n/a";
  return value.toFixed(2);
}

async function main() {
  fs.mkdirSync(artifactsDir, { recursive: true });

  if (fs.existsSync(reportPath)) {
    fs.rmSync(reportPath);
  }

  const serverProcess = spawn("npx http-server -p 4173 .", {
    cwd: root,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServerReady(serverProcess);

    const command = [
      "npx lighthouse",
      serverUrl,
      "--quiet",
      "--output=json",
      "--output-path=artifacts/lighthouse-report.json",
      "\"--chrome-flags=--headless=new --disable-gpu --disable-dev-shm-usage --user-data-dir=.lighthouseci/chrome-profile\""
    ].join(" ");

    const result = await runCommand(command);
    const metrics = parseReport();

    if (result.code !== 0) {
      const isKnownCleanupIssue = /EPERM,\s*Permission denied:.*lighthouse\./i.test(result.stderr);
      if (isKnownCleanupIssue) {
        console.warn("Lighthouse exited non-zero due to known Windows cleanup issue. Using generated report for budget checks.");
      } else {
        console.warn(`Lighthouse exited with code ${result.code}. Using generated JSON report for budget checks.`);
        if (result.stderr.trim()) {
          console.warn(result.stderr.trim().split("\n").slice(-4).join("\n"));
        }
      }
    }

    console.log("Lighthouse metrics:");
    console.log(` - performance: ${formatScore(metrics.performance)}`);
    console.log(` - FCP: ${formatMs(metrics.fcp)}`);
    console.log(` - LCP: ${formatMs(metrics.lcp)}`);
    console.log(` - CLS: ${typeof metrics.cls === "number" ? metrics.cls.toFixed(4) : "n/a"}`);

    const failures = [];
    if (typeof metrics.performance !== "number" || metrics.performance < thresholds.performance) {
      failures.push(`performance < ${thresholds.performance}`);
    }
    if (typeof metrics.lcp !== "number" || metrics.lcp > thresholds.lcp) {
      failures.push(`LCP > ${thresholds.lcp}ms`);
    }
    if (typeof metrics.cls !== "number" || metrics.cls > thresholds.cls) {
      failures.push(`CLS > ${thresholds.cls}`);
    }

    if (failures.length) {
      console.error("Lighthouse budget check failed:");
      failures.forEach((issue) => console.error(` - ${issue}`));
      process.exit(1);
    }

    console.log("Lighthouse budget check passed.");
  } finally {
    await stopServer(serverProcess);
  }
}

main().catch(async (error) => {
  console.error(`Lighthouse check crashed: ${error.message}`);
  process.exit(1);
});
