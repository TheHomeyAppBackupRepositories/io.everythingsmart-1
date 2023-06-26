"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const homey_1 = __importDefault(require("homey"));
class EverythingSmartApp extends homey_1.default.App {
    /** OnInit is called when the app is initialized. */
    async onInit() {
        this.log('EverythingSmartApp has been initialized');
    }
}
module.exports = EverythingSmartApp;
//# sourceMappingURL=app.js.map