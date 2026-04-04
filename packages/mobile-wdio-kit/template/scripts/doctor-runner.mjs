#!/usr/bin/env node
import { printDoctorResult, runDoctor } from "./mobile-wdio-doctor-core.mjs";
import { createDoctorMain } from "./doctor-cli.mjs";

const runDoctorMain = createDoctorMain({ runDoctor, printDoctorResult });
const code = await runDoctorMain(process.argv.slice(2));
process.exit(code);
