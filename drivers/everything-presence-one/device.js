"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("dns/promises"));
const debug_1 = __importDefault(require("debug"));
const zod_1 = require("zod");
// @ts-expect-error Client is not typed
const esphome_native_api_1 = require("@2colors/esphome-native-api");
const homey_1 = __importDefault(require("homey"));
const debug = (0, debug_1.default)('epo');
debug_1.default.enable(homey_1.default.env.DEBUG_LOGGING);
const CONNECT_TIMEOUT = 15000;
var DRIVER_SETTINGS;
(function (DRIVER_SETTINGS) {
    DRIVER_SETTINGS["ESP_32_STATUS_LED"] = "esp32_status_led";
    DRIVER_SETTINGS["MMWAVE_LED"] = "mmwave_led";
    DRIVER_SETTINGS["MMWAVE_ON_LATENCY"] = "mmwave_on_latency";
    DRIVER_SETTINGS["MMWAVE_OFF_LATENCY"] = "mmwave_off_latency";
    DRIVER_SETTINGS["MMWAVE_SENSITIVITY"] = "mmwave_sensitivity";
    DRIVER_SETTINGS["MMWAVE_DISTANCE"] = "mmwave_distance";
})(DRIVER_SETTINGS || (DRIVER_SETTINGS = {}));
const entityStateSchema = zod_1.z.object({
    key: zod_1.z.number(),
    state: zod_1.z.union([zod_1.z.number(), zod_1.z.boolean()]),
    missingState: zod_1.z.boolean().optional()
});
// Example entity state
// {
//   config: {
//     objectId: '_illuminance',
//     key: 920262939,
//     name: ' Illuminance',
//     uniqueId: 'everything-presence-one-7083ccsensor_illuminance',
//     icon: '',
//     unitOfMeasurement: 'lx',
//     accuracyDecimals: 1,
//     forceUpdate: false,
//     deviceClass: 'illuminance',
//     stateClass: 1,
//     lastResetType: 0,
//     disabledByDefault: false,
//     entityCategory: 0
//   },
//   name: ' Illuminance',
//   type: 'Sensor',
//   unit: 'lx',
//   state: { key: 920262939, state: 140.69387817382812, missingState: false }
// }
const entitySchema = zod_1.z.object({
    config: zod_1.z.object({
        objectId: zod_1.z.string(),
        key: zod_1.z.number(),
        name: zod_1.z.string(),
        uniqueId: zod_1.z.string(),
        icon: zod_1.z.string(),
        unitOfMeasurement: zod_1.z.string().optional(),
        accuracyDecimals: zod_1.z.number().optional(),
        forceUpdate: zod_1.z.boolean().optional(),
        deviceClass: zod_1.z.string().optional(),
        stateClass: zod_1.z.number().optional(),
        lastResetType: zod_1.z.number().optional(),
        disabledByDefault: zod_1.z.boolean(),
        entityCategory: zod_1.z.number()
    }),
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    unit: zod_1.z.string().optional()
});
// Example entity
// {
//   _events: [Object: null prototype] {
//     error: [Function: bound propagateError] AsyncFunction
//   },
//   _eventsCount: 1,
//   _maxListeners: undefined,
//   handleState: [Function: bound handleState],
//   handleMessage: [Function: bound handleMessage],
//   config: {
//     objectId: '_illuminance',
//     key: 920262939,
//     name: ' Illuminance',
//     uniqueId: 'everything-presence-one-7083ccsensor_illuminance',
//     icon: '',
//     unitOfMeasurement: 'lx',
//     accuracyDecimals: 1,
//     forceUpdate: false,
//     deviceClass: 'illuminance',
//     stateClass: 1,
//     lastResetType: 0,
//     disabledByDefault: false,
//     entityCategory: 0
//   },
//   type: 'Sensor',
//   name: ' Illuminance',
//   id: 920262939,
//   connection: EsphomeNativeApiConnection {
//     _events: [Object: null prototype] {
//       'message.DisconnectRequest': [Function (anonymous)],
//       'message.DisconnectResponse': [Function (anonymous)],
//       'message.PingRequest': [Function (anonymous)],
//       'message.GetTimeRequest': [Function (anonymous)],
//       authorized: [AsyncFunction (anonymous)],
//       unauthorized: [AsyncFunction (anonymous)],
//       'message.DeviceInfoResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesBinarySensorResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesButtonResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesCameraResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesClimateResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesCoverResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesFanResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesLightResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesLockResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesMediaPlayerResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesNumberResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesSelectResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesSensorResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesSirenResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesSwitchResponse': [AsyncFunction (anonymous)],
//       'message.ListEntitiesTextSensorResponse': [AsyncFunction (anonymous)],
//       'message.SubscribeLogsResponse': [AsyncFunction (anonymous)],
//       'message.BluetoothLEAdvertisementResponse': [AsyncFunction (anonymous)],
//       error: [AsyncFunction (anonymous)],
//       message: [Function: onMessage],
//       'message.ListEntitiesDoneResponse': [Function],
//       'message.BinarySensorStateResponse': [Array],
//       'message.LightStateResponse': [Function: bound handleMessage],
//       'message.SensorStateResponse': [Array]
//     },
//     _eventsCount: 30,
//     _maxListeners: undefined,
//     frameHelper: PlaintextFrameHelper {
//       _events: [Object: null prototype],
//       _eventsCount: 5,
//       _maxListeners: undefined,
//       host: 'everything-presence-one-7083cc.local',
//       port: 6053,
//       buffer: <Buffer >,
//       socket: [Socket],
//       [Symbol(kCapture)]: false
//     },
//     _connected: true,
//     _authorized: true,
//     port: 6053,
//     host: 'everything-presence-one-7083cc.local',
//     clientInfo: 'homey',
//     password: '',
//     encryptionKey: '',
//     reconnect: true,
//     reconnectTimer: null,
//     reconnectInterval: 30000,
//     pingTimer: Timeout {
//       _idleTimeout: 15000,
//       _idlePrev: [TimersList],
//       _idleNext: [TimersList],
//       _idleStart: 2919,
//       _onTimeout: [AsyncFunction (anonymous)],
//       _timerArgs: undefined,
//       _repeat: 15000,
//       _destroyed: false,
//       [Symbol(refed)]: true,
//       [Symbol(kHasPrimitive)]: false,
//       [Symbol(asyncId)]: 47,
//       [Symbol(triggerId)]: 0
//     },
//     pingInterval: 15000,
//     pingAttempts: 3,
//     pingCount: 0,
//     [Symbol(kCapture)]: false
//   },
//   [Symbol(kCapture)]: false
// }
// const isEntity = (value: unknown): value is Entity => {
//   return (
//     typeof value === 'object' &&
//     value !== null &&
//     'name' in value &&
//     typeof value.name === 'string' &&
//     'type' in value &&
//     typeof value.type === 'string' &&
//     'config' in value &&
//     typeof value.config === 'object' &&
//     value.config !== null &&
//     'objectId' in value.config &&
//     typeof value.config.objectId === 'string' &&
//     'deviceClass' in value.config &&
//     typeof value.config.deviceClass === 'string' &&
//     'uniqueId' in value.config &&
//     typeof value.config.uniqueId === 'string'
//   );
// };
/**
 * On Homey Pro (Early 2023) the host property in the discovery result ends with .local, on Homey
 * Pro (Early 2019) it doesn't,
 *
 * @param host
 * @returns
 */
function formatHostname(host) {
    if (host.endsWith('.local'))
        return host;
    return `${host}.local`;
}
/**
 * Get typed error message from unknown parameter.
 *
 * @param error
 * @returns
 */
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
/**
 * Check if entity has uniqueId that matches the binary sensor mmWave. Note: it appears that between
 * 2023.4.2 (1.1.3) and 2023.7.1 (1.1.6) of the EP1 firmware a breaking change was introduced, the
 * uniqueId binary_sensor_mmwave was changed to binary_sensormmwave. GitHub issue:
 * https://github.com/EverythingSmartHome/everything-presence-one/issues/99
 *
 * @param entity
 * @returns
 */
function includesBinarySensorMMWave(entity) {
    return (entity.config.uniqueId.includes('binary_sensor_mmwave') ||
        entity.config.uniqueId.includes('binary_sensormmwave'));
}
/**
 * Check if entity has uniqueId that matches the binary sensor occupancy. Note: it appears that
 * between 2023.4.2 (1.1.3) and 2023.7.1 (1.1.6) of the EP1 firmware a breaking change was
 * introduced, the uniqueId binary_sensor_occupancy was changed to binary_sensoroccupancy. GitHub
 * issue: https://github.com/EverythingSmartHome/everything-presence-one/issues/99
 *
 * @param entity
 * @returns
 */
function includesBinarySensorOccupancy(entity) {
    return (entity.config.uniqueId.includes('binary_sensor_occupancy') ||
        entity.config.uniqueId.includes('binary_sensoroccupancy'));
}
class EverythingPresenceOneDevice extends homey_1.default.Device {
    constructor() {
        super(...arguments);
        this.debugEntity = debug.extend('entity');
        this.debugClient = debug.extend('client');
        this.debugDiscovery = debug.extend('discovery');
        this.entities = new Map();
    }
    /** OnInit is called when the device is initialized. */
    async onInit() {
        this.log('EverythingPresenceOneDevice has been initialized');
        this.connect().catch((err) => {
            this.error('EverythingPresenceOneDevice failed to connect', err);
        });
    }
    /**
     * Create Client instance and connect to device.
     *
     * @returns
     */
    async connect() {
        const addressProps = {
            host: formatHostname(this.getStoreValue('host')),
            port: this.getStoreValue('port')
        };
        this.debugClient('connecting:', addressProps);
        this.client = new esphome_native_api_1.Client({
            ...addressProps,
            clearSession: false,
            initializeDeviceInfo: false,
            initializeListEntities: false,
            initializeSubscribeStates: true,
            initializeSubscribeLogs: false,
            initializeSubscribeBLEAdvertisements: false,
            clientInfo: 'homey',
            encryptionKey: '',
            password: '',
            reconnect: true,
            reconnectInterval: 30000,
            pingInterval: 15000,
            pingAttempts: 3
        });
        // Listen for entities
        this.client.on('newEntity', (entity) => this.registerEntity(entity));
        // Listen for client errors
        this.client.on('error', (error) => {
            this.debugClient('error:', error);
            if (getErrorMessage(error).includes('Bad format: Encryption expected')) {
                this.setUnavailable(this.homey.__('error.unavailable_encrypted')).catch((err) => this.log('Could not set unavailable', err));
                return;
            }
            this.setUnavailable(this.homey.__('error.unavailable')).catch((err) => this.log('Could not set unavailable', err));
        });
        return new Promise((resolve, reject) => {
            const connectTimeout = this.homey.setTimeout(() => reject(new Error(this.homey.__('error.connect_timeout'))), CONNECT_TIMEOUT);
            this.client.connect();
            this.client.on('initialized', () => {
                this.debugClient('connected', addressProps);
                this.homey.clearTimeout(connectTimeout);
                // Fetch all entities
                this.client.connection.listEntitiesService().catch((err) => {
                    this.error('Failed to list entities service:', err);
                });
                // Resolve hostname to ip address
                promises_1.default
                    .lookup(addressProps.host)
                    .then((result) => {
                    this.debugClient('resolved hostname to:', result);
                    return this.setSettings({ ip: result.address });
                })
                    .catch((err) => this.debugClient('failed to update ip address in settings', err));
                // Mark device as available in case it was unavailable
                this.setAvailable().catch((err) => this.log('Could not set available', err));
                return resolve(this.client);
            });
        });
    }
    disconnect() {
        var _a, _b;
        this.debugClient('disconnect');
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.disconnect();
        (_b = this.client) === null || _b === void 0 ? void 0 : _b.removeAllListeners();
        this.entities.forEach((entity) => {
            // Validate entity.original.removeAllListeners
            if (typeof entity.original !== 'object' ||
                entity.original === null ||
                !('removeAllListeners' in entity.original) ||
                typeof entity.original.removeAllListeners !== 'function') {
                throw new Error('Expected entity.removeAllListeners to be a function');
            }
            entity.original.removeAllListeners();
        });
    }
    /**
     * Register an entity, bind state listener and subscribe to state events.
     *
     * @param entity
     */
    registerEntity(entity) {
        // Parse entity data
        const parseEntityResult = entitySchema.safeParse(entity);
        if (!parseEntityResult.success) {
            this.debugEntity('Invalid entity object received, error:', parseEntityResult.error, entity);
            return;
        }
        // Cache entity
        this.entities.set(parseEntityResult.data.config.objectId, {
            data: parseEntityResult.data,
            original: entity
        });
        this.debugEntity(`Register entity: ${parseEntityResult.data.config.objectId}:`, parseEntityResult.data);
        // Validate entity.connection
        if (typeof entity !== 'object' ||
            entity === null ||
            !('connection' in entity) ||
            !(entity.connection instanceof esphome_native_api_1.Connection)) {
            throw new Error('Expected entity.connection to be instanceof Connection');
        }
        // @ts-expect-error subscribeStatesService exists but is not typed
        entity.connection.subscribeStatesService();
        // Validate entity.on
        if (typeof entity !== 'object' ||
            entity === null ||
            !('on' in entity) ||
            typeof entity.on !== 'function') {
            throw new Error('Expected entity.on to be a function');
        }
        // Subscribe to entity events
        entity.on(`state`, (state) => this.onEntityState(parseEntityResult.data.config.objectId, state));
    }
    /**
     * Called when a state event is received for a specific entity.
     *
     * @param entity
     * @param state
     */
    onEntityState(entityId, state) {
        var _a;
        const parseResult = entityStateSchema.safeParse(state);
        if (!parseResult.success) {
            this.debugEntity(`Got invalid entity state for entityId ${entityId}, error:`, parseResult.error, state);
            return;
        }
        const parsedState = parseResult.data;
        // Get entity
        const entity = (_a = this.entities.get(entityId)) === null || _a === void 0 ? void 0 : _a.data;
        if (!entity)
            throw new Error(`Missing entity ${entityId}`);
        this.debugEntity(`state`, {
            config: entity.config,
            name: entity.name,
            type: entity.type,
            unit: entity.config.unitOfMeasurement !== undefined ? entity.config.unitOfMeasurement || '' : '',
            state: parsedState
        });
        switch (entity.config.deviceClass) {
            case 'temperature':
                // Throw when state is not a number
                zod_1.z.number().parse(parsedState.state);
                this.debugEntity(`Capability: measure_temperature: state event`, parsedState.state);
                this.setCapabilityValue('measure_temperature', parsedState.state).catch((err) => this.debugEntity('Failed to set measure_temperature capability value', err));
                break;
            case 'humidity':
                // Throw when state is not a number
                zod_1.z.number().parse(parsedState.state);
                this.debugEntity(`Capability: measure_humidity: state event`, parsedState.state);
                this.setCapabilityValue('measure_humidity', parsedState.state).catch((err) => this.debugEntity('Failed to set measure_humidity capability value', err));
                break;
            case 'illuminance':
                // Throw when state is not a number
                zod_1.z.number().parse(parsedState.state);
                this.debugEntity(`Capability: measure_luminance: state event`, parsedState.state);
                this.setCapabilityValue('measure_luminance', parsedState.state).catch((err) => this.debugEntity('Failed to set measure_luminance capability value', err));
                break;
            case 'motion':
                // Throw when state is not a boolean
                zod_1.z.boolean().parse(parsedState.state);
                this.debugEntity(`Capability: alarm_motion.pir: state event`, parsedState.state);
                this.setCapabilityValue('alarm_motion.pir', parsedState.state).catch((err) => this.debugEntity('Failed to set alarm_motion.pir capability value', err));
                break;
            case 'occupancy':
                // Throw when state is not a boolean
                zod_1.z.boolean().parse(parsedState.state);
                if (includesBinarySensorMMWave(entity)) {
                    this.debugEntity(`Capability: alarm_motion.mmwave: state event`, parsedState.state);
                    this.setCapabilityValue('alarm_motion.mmwave', parsedState.state).catch((err) => this.debugEntity('Failed to set alarm_motion.mmwave capability value', err));
                }
                else if (includesBinarySensorOccupancy(entity)) {
                    this.debugEntity(`Capability: alarm_motion: state event`, parsedState.state);
                    this.setCapabilityValue('alarm_motion', parsedState.state).catch((err) => this.debugEntity('Failed to set alarm_motion capability value', err));
                }
                break;
            default:
                this.debugEntity('Unknown device class:', entity.config.deviceClass);
        }
        // Read and update settings
        switch (entity.config.objectId) {
            case DRIVER_SETTINGS.MMWAVE_SENSITIVITY:
            case DRIVER_SETTINGS.MMWAVE_ON_LATENCY:
            case DRIVER_SETTINGS.MMWAVE_OFF_LATENCY:
            case DRIVER_SETTINGS.MMWAVE_DISTANCE:
                // Throw when state is not a number
                zod_1.z.number().parse(parsedState.state);
                this.debugEntity(`Setting: ${entity.config.objectId}: state event`, parsedState.state);
                this.setSettings({
                    [entity.config.objectId]: parsedState.state
                });
                break;
            case DRIVER_SETTINGS.MMWAVE_LED:
            case DRIVER_SETTINGS.ESP_32_STATUS_LED:
                // Throw when state is not a boolean
                zod_1.z.boolean().parse(parsedState.state);
                this.debugEntity(`Setting: ${entity.config.objectId}: state event`, parsedState.state);
                this.setSettings({
                    [entity.config.objectId]: parsedState.state
                });
                break;
            default:
                this.debugEntity('Unknown setting:', entity.config.objectId);
        }
    }
    /** OnAdded is called when the user adds the device, called just after pairing. */
    async onAdded() {
        this.log('EverythingPresenceOneDevice has been added');
    }
    /**
     * OnSettings is called when the user updates the device's settings.
     *
     * @param {object} event The onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string | void>} Return a custom message that will be displayed
     */
    async onSettings({ newSettings, changedKeys }) {
        this.log('EverythingPresenceOneDevice settings were changed');
        for (const changedKey of changedKeys) {
            switch (changedKey) {
                case DRIVER_SETTINGS.MMWAVE_SENSITIVITY:
                case DRIVER_SETTINGS.MMWAVE_ON_LATENCY:
                case DRIVER_SETTINGS.MMWAVE_OFF_LATENCY:
                case DRIVER_SETTINGS.MMWAVE_DISTANCE:
                case DRIVER_SETTINGS.MMWAVE_LED:
                case DRIVER_SETTINGS.ESP_32_STATUS_LED:
                    const entity = this.entities.get(changedKey);
                    if (!entity)
                        throw new Error(`Missing entity ${changedKey}`);
                    if (!entity.original)
                        throw new Error(`Missing original entity ${changedKey}`);
                    const value = newSettings[changedKey];
                    if (typeof value === 'number' || typeof value === 'boolean') {
                        // Validate entity.original.setState
                        if (typeof entity.original !== 'object' ||
                            entity.original === null ||
                            !('setState' in entity.original) ||
                            typeof entity.original.setState !== 'function') {
                            throw new Error('Expected entity.setState to be a function');
                        }
                        entity.original.setState(value);
                    }
                    break;
                default:
                    this.log('Unknown changed setting key:', changedKey);
            }
        }
    }
    /**
     * OnRenamed is called when the user updates the device's name. This method can be used this to
     * synchronise the name to the device.
     *
     * @param {string} name The new name
     */
    async onRenamed(name) {
        this.log('EverythingPresenceOneDevice was renamed to:', name);
    }
    /** OnDeleted is called when the user deleted the device. */
    async onDeleted() {
        this.log('EverythingPresenceOneDevice has been deleted');
        this.disconnect();
    }
    /**
     * Return a truthy value here if the discovery result matches your device.
     *
     * @param discoveryResult
     * @returns
     */
    onDiscoveryResult(discoveryResult) {
        this.debugDiscovery(`result match: ${discoveryResult.id === this.getData().id}`);
        return discoveryResult.id === this.getData().id;
    }
    /**
     * This method will be executed once when the device has been found (onDiscoveryResult returned
     * true).
     *
     * @param discoveryResult
     */
    async onDiscoveryAvailable(discoveryResult) {
        var _a, _b;
        this.debugDiscovery('available', discoveryResult);
        const settings = this.getSettings();
        if (typeof discoveryResult.address === 'string' && settings.ip !== discoveryResult.address) {
            settings.ip = discoveryResult.address;
        }
        if (typeof ((_a = discoveryResult.txt) === null || _a === void 0 ? void 0 : _a.version) === 'string' &&
            settings.esp_home_version !== discoveryResult.txt.version) {
            settings.esp_home_version = discoveryResult.txt.version;
        }
        if (typeof ((_b = discoveryResult.txt) === null || _b === void 0 ? void 0 : _b.project_version) === 'string' &&
            settings.project_version !== discoveryResult.txt.project_version) {
            settings.project_version = discoveryResult.txt.project_version;
        }
        // Update settings if needed
        if (Object.keys(settings).length > 0) {
            this.setSettings(settings).catch((err) => {
                this.error('Failed to update IP in settings', err);
            });
        }
    }
}
module.exports = EverythingPresenceOneDevice;
//# sourceMappingURL=device.js.map