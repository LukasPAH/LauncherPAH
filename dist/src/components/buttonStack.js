"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Stack_1 = __importDefault(require("@mui/material/Stack"));
const Button_1 = __importDefault(require("@mui/material/Button"));
const react_1 = __importDefault(require("react"));
const historical_versions_json_1 = __importDefault(require("../../data/historical_versions.json"));
const progress_1 = __importDefault(require("./progress"));
function buttonClick(index) {
    window.electronAPI.send("download", {
        url: historical_versions_json_1.default.versions[index].url,
        properties: { directory: "../../data" },
    });
}
function ButtonStack() {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(Stack_1.default, { spacing: 2 },
            historical_versions_json_1.default.versions.map((version, index) => (react_1.default.createElement(Button_1.default, { key: index, variant: "outlined", onClick: () => {
                    buttonClick(index);
                } }, version.version))),
            react_1.default.createElement(Button_1.default, { key: "test", variant: "outlined", onClick: () => {
                    window.electronAPI.send("install", {});
                } }, "Install Test")),
        react_1.default.createElement("div", { style: { width: 0, height: "1rem" } }),
        react_1.default.createElement(progress_1.default, null)));
}
exports.default = ButtonStack;
//# sourceMappingURL=buttonStack.js.map