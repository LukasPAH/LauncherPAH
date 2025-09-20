"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const buttonStack_1 = __importDefault(require("./components/buttonStack"));
const root = (0, client_1.createRoot)(document.body);
root.render(react_1.default.createElement(buttonStack_1.default, null));
//# sourceMappingURL=app.js.map