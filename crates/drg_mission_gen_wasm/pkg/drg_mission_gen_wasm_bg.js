/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}
 */
export const Biome = Object.freeze({
    CrystallineCaverns: 0, "0": "CrystallineCaverns",
    FungusBogs: 1, "1": "FungusBogs",
    MagmaCore: 2, "2": "MagmaCore",
    RadioactiveExclusionZone: 3, "3": "RadioactiveExclusionZone",
    DenseBiozone: 4, "4": "DenseBiozone",
    SandblastedCorridors: 5, "5": "SandblastedCorridors",
    SaltPits: 6, "6": "SaltPits",
    GlacialStrata: 7, "7": "GlacialStrata",
    AzureWeald: 8, "8": "AzureWeald",
    HollowBough: 9, "9": "HollowBough",
    OssuaryDepths: 10, "10": "OssuaryDepths",
});

/**
 * @enum {0 | 1 | 2}
 */
export const Complexity = Object.freeze({
    Simple: 0, "0": "Simple",
    Average: 1, "1": "Average",
    Complex: 2, "2": "Complex",
});

export class ConverterError {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ConverterError.prototype);
        obj.__wbg_ptr = ptr;
        ConverterErrorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    toJSON() {
        return {
            message: this.message,
            type: this.type,
        };
    }
    toString() {
        return JSON.stringify(this);
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConverterErrorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_convertererror_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get message() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_convertererror_message(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_convertererror_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) ConverterError.prototype[Symbol.dispose] = ConverterError.prototype.free;

export class DeepDive {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DeepDive.prototype);
        obj.__wbg_ptr = ptr;
        DeepDiveFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DeepDiveFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_deepdive_free(ptr, 0);
    }
    /**
     * @returns {DeepDiveMission[]}
     */
    get missions() {
        const ret = wasm.deepdive_missions(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Biome}
     */
    get biome() {
        const ret = wasm.__wbg_get_deepdive_biome(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_deepdive_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) DeepDive.prototype[Symbol.dispose] = DeepDive.prototype.free;

export class DeepDiveMission {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DeepDiveMission.prototype);
        obj.__wbg_ptr = ptr;
        DeepDiveMissionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DeepDiveMissionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_deepdivemission_free(ptr, 0);
    }
    /**
     * @returns {DeepDivePrimaryObjective}
     */
    get primaryObjective() {
        const ret = wasm.deepdivemission_primaryObjective(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {DeepDiveSecondaryObjective}
     */
    get secondaryObjective() {
        const ret = wasm.deepdivemission_secondaryObjective(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Complexity}
     */
    get complexity() {
        const ret = wasm.__wbg_get_deepdivemission_complexity(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Duration}
     */
    get duration() {
        const ret = wasm.__wbg_get_deepdivemission_duration(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {DeepDiveMutator | undefined}
     */
    get mutator() {
        const ret = wasm.__wbg_get_deepdivemission_mutator(this.__wbg_ptr);
        return ret === 5 ? undefined : ret;
    }
    /**
     * @returns {DeepDiveWarning | undefined}
     */
    get warning() {
        const ret = wasm.__wbg_get_deepdivemission_warning(this.__wbg_ptr);
        return ret === 16 ? undefined : ret;
    }
}
if (Symbol.dispose) DeepDiveMission.prototype[Symbol.dispose] = DeepDiveMission.prototype.free;

/**
 * @enum {0 | 1 | 2 | 3 | 4}
 */
export const DeepDiveMutator = Object.freeze({
    BloodSugar: 0, "0": "BloodSugar",
    CriticalWeakness: 1, "1": "CriticalWeakness",
    LowGravity: 2, "2": "LowGravity",
    RichAtmosphere: 3, "3": "RichAtmosphere",
    VolatileGuts: 4, "4": "VolatileGuts",
});

export class DeepDiveResult {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DeepDiveResult.prototype);
        obj.__wbg_ptr = ptr;
        DeepDiveResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DeepDiveResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_deepdiveresult_free(ptr, 0);
    }
    /**
     * @returns {DeepDive}
     */
    get elite() {
        const ret = wasm.__wbg_get_deepdiveresult_elite(this.__wbg_ptr);
        return DeepDive.__wrap(ret);
    }
    /**
     * @returns {DeepDive}
     */
    get normal() {
        const ret = wasm.__wbg_get_deepdiveresult_normal(this.__wbg_ptr);
        return DeepDive.__wrap(ret);
    }
    /**
     * @returns {Seed}
     */
    get seed() {
        const ret = wasm.__wbg_get_deepdiveresult_seed(this.__wbg_ptr);
        return Seed.__wrap(ret);
    }
}
if (Symbol.dispose) DeepDiveResult.prototype[Symbol.dispose] = DeepDiveResult.prototype.free;

/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15}
 */
export const DeepDiveWarning = Object.freeze({
    CaveLeechCluster: 0, "0": "CaveLeechCluster",
    DuckAndCover: 1, "1": "DuckAndCover",
    EboniteOutbreak: 2, "2": "EboniteOutbreak",
    EliteThreat: 3, "3": "EliteThreat",
    ExploderInfestation: 4, "4": "ExploderInfestation",
    HauntedCave: 5, "5": "HauntedCave",
    LethalEnemies: 6, "6": "LethalEnemies",
    LowOxygen: 7, "7": "LowOxygen",
    MacteraPlague: 8, "8": "MacteraPlague",
    Parasites: 9, "9": "Parasites",
    PitJawColony: 10, "10": "PitJawColony",
    RegenerativeBugs: 11, "11": "RegenerativeBugs",
    RivalPresence: 12, "12": "RivalPresence",
    ScrabNestingGrounds: 13, "13": "ScrabNestingGrounds",
    ShieldDisruption: 14, "14": "ShieldDisruption",
    Swarmageddon: 15, "15": "Swarmageddon",
});

/**
 * @enum {0 | 1 | 2}
 */
export const Duration = Object.freeze({
    Short: 0, "0": "Short",
    Normal: 1, "1": "Normal",
    Long: 2, "2": "Long",
});

export class Seed {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Seed.prototype);
        obj.__wbg_ptr = ptr;
        SeedFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SeedFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_seed_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get value() {
        const ret = wasm.seed_as_u32(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} s
     */
    constructor(s) {
        const ret = wasm.seed_new(s);
        this.__wbg_ptr = ret >>> 0;
        SeedFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Seed.prototype[Symbol.dispose] = Seed.prototype.free;

/**
 * @param {Seed} seed
 * @returns {DeepDiveResult}
 */
export function generate(seed) {
    _assertClass(seed, Seed);
    var ptr0 = seed.__destroy_into_raw();
    const ret = wasm.generate(ptr0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DeepDiveResult.__wrap(ret[0]);
}
export function __wbg___wbindgen_debug_string_ab4b34d23d6778bd(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_6b64449b9b9ed33c(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg_convertererror_new(arg0) {
    const ret = ConverterError.__wrap(arg0);
    return ret;
}
export function __wbg_deepdivemission_new(arg0) {
    const ret = DeepDiveMission.__wrap(arg0);
    return ret;
}
export function __wbg_new_682678e2f47e32bc() {
    const ret = new Array();
    return ret;
}
export function __wbg_new_aa8d0fa9762c29bd() {
    const ret = new Object();
    return ret;
}
export function __wbg_set_3bf1de9fab0cd644(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_set_6be42768c690e380(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
}
export function __wbindgen_cast_0000000000000001(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
const ConverterErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_convertererror_free(ptr >>> 0, 1));
const DeepDiveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_deepdive_free(ptr >>> 0, 1));
const DeepDiveMissionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_deepdivemission_free(ptr >>> 0, 1));
const DeepDiveResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_deepdiveresult_free(ptr >>> 0, 1));
const SeedFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_seed_free(ptr >>> 0, 1));

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
