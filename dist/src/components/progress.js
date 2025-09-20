"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadProgressVisibility = void 0;
const react_1 = __importDefault(require("react"));
const LinearProgress_1 = __importDefault(require("@mui/material/LinearProgress"));
const Typography_1 = __importDefault(require("@mui/material/Typography"));
const Box_1 = __importDefault(require("@mui/material/Box"));
function LinearProgressWithLabel(props) {
    return (react_1.default.createElement(Box_1.default, { sx: { display: "flex", alignItems: "center" } },
        react_1.default.createElement(Box_1.default, { sx: { width: "100%", mr: 1 } },
            react_1.default.createElement(LinearProgress_1.default, { variant: "determinate", ...props })),
        react_1.default.createElement(Box_1.default, { sx: { minWidth: 35 } },
            react_1.default.createElement(Typography_1.default, { variant: "body2", sx: { color: "white" } }, `${Math.round(props.value)}%`))));
}
exports.downloadProgressVisibility = false;
function LinearWithValueLabel() {
    const [progress, setProgress] = react_1.default.useState(0);
    react_1.default.useEffect(() => {
        window.electronAPI.on("downloadProgress", (progress) => {
            exports.downloadProgressVisibility = true;
            setProgress(progress.percent * 100);
        });
        window.electronAPI.on("downloadCompleted", (_) => {
            exports.downloadProgressVisibility = false;
            setProgress(progress);
        });
    }, []);
    if (exports.downloadProgressVisibility) {
        return (react_1.default.createElement(Box_1.default, { sx: { width: "100%" } },
            react_1.default.createElement(LinearProgressWithLabel, { value: progress })));
    }
    return react_1.default.createElement(Box_1.default, { sx: { width: "100%" } });
}
exports.default = LinearWithValueLabel;
//# sourceMappingURL=progress.js.map