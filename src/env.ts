import "dotenv/config";
import { buildEnv, requireCloudCredentialsFrom } from "./env/buildEnv.ts";

/** Central env for WDIO configs and specs. No hidden defaults beyond these. */
export const env = buildEnv(process.env, process.cwd());

export const requireCloudCredentials = () => requireCloudCredentialsFrom(process.env);

export type { MobileEnv } from "./env/buildEnv.ts";
