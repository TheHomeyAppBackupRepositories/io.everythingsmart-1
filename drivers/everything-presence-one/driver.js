"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const homey_1 = __importDefault(require("homey"));
const util_1 = require("./../../lib/util");
const discoveryResultSchema = zod_1.z.object({
    txt: zod_1.z.object({
        mac: zod_1.z.string(),
        version: zod_1.z.string(),
        project_version: zod_1.z.string()
    }),
    host: zod_1.z.string(),
    address: zod_1.z.string(),
    port: zod_1.z.number(),
    name: zod_1.z.string()
});
class EverythingPresenceOneDriver extends homey_1.default.Driver {
    /** OnInit is called when the driver is initialized. */
    async onInit() {
        this.log('EverythingPresenceOneDriver has been initialized');
    }
    /**
     * OnPairListDevices is called when a user is adding a device and the 'list_devices' view is
     * called. This should return an array with the data of devices that are available for pairing.
     */
    async onPairListDevices() {
        const discoveryStrategy = this.getDiscoveryStrategy();
        const discoveryResults = discoveryStrategy.getDiscoveryResults();
        const devices = Object.values(discoveryResults).map((discoveryResult) => {
            // Parse the discovery result with zod
            const parseResult = discoveryResultSchema.safeParse(discoveryResult);
            if (!parseResult.success) {
                this.error('Got invalid discovery result, error:', parseResult.error);
                return null;
            }
            return {
                name: `Everything Presence One (${(0, util_1.formatMacString)(parseResult.data.txt.mac)})`,
                data: {
                    id: parseResult.data.txt.mac
                },
                store: {
                    host: parseResult.data.host,
                    port: parseResult.data.port
                },
                settings: {
                    mac: (0, util_1.formatMacString)(parseResult.data.txt.mac),
                    ip: parseResult.data.address,
                    host: parseResult.data.host,
                    port: String(parseResult.data.port),
                    esp_home_version: parseResult.data.txt.version,
                    project_version: parseResult.data.txt.project_version
                }
            };
        });
        // Filter out null entries (TS doesn't understand this)
        return devices.filter((device) => Boolean(device));
    }
}
// Example discovery result:
// id: 'd4d4da708528',
// lastSeen: '2023-05-05T19:54:59.414Z',
// address: '192.168.178.148',
// host: 'everything-presence-one-708528',
// port: 6053,
// name: 'everything-presence-one-708528',
// fullname: 'everything-presence-one-708528._esphomelib._tcp.local.',
// txt: {
//   version: '2023.4.2',
//   mac: 'd4d4da708528',
//   platform: 'ESP32',
//   board: 'esp32dev',
//   network: 'wifi',
//   project_name: 'Everything_Smart_Technology.Everything_Presence_One',
//   project_version: '1.1.3',
//   package_import_url: 'github://everythingsmarthome/presence-one/everything-presence-one.yaml@main'
// },
module.exports = EverythingPresenceOneDriver;
//# sourceMappingURL=driver.js.map