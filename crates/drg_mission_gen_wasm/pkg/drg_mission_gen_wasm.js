/* @ts-self-types="./drg_mission_gen_wasm.d.ts" */
import * as wasm from "./drg_mission_gen_wasm_bg.wasm";
import { __wbg_set_wasm } from "./drg_mission_gen_wasm_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    Biome, Complexity, ConverterError, DeepDive, DeepDiveMission, DeepDiveMutator, DeepDiveResult, DeepDiveWarning, Duration, Seed, generate
} from "./drg_mission_gen_wasm_bg.js";
