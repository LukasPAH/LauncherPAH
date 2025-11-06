import React from "react";
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Progress } from "electron-dl";

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" sx={{ color: "white" }}>{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

export default function LinearWithValueLabel() {
    const [progress, setProgress] = React.useState(0);
    const [stage, setStage] = React.useState("idle");
    const [downloadProgressVisibility, setDownloadProgressVisibility] = React.useState(false);
    const [appxExtractProgressVisibility, setAppxExtractProgressVisibility] = React.useState(false);
    const [versionName, setVersionName] = React.useState("");

    React.useEffect(() => {
        window.electronAPI.on("downloadProgress", (progress: Progress, versionName: string) => {
            setProgress(progress.percent * 100);
            setVersionName(versionName);
            setDownloadProgressVisibility(true);
        });
        window.electronAPI.on("downloadCompleted", (versionName: string) => {
            setProgress(progress);
            setDownloadProgressVisibility(false);
            setVersionName(versionName);
            setAppxExtractProgressVisibility(true);
        });
        window.electronAPI.on("progressStage", (state: string) => {
            if (state === "idle") setAppxExtractProgressVisibility(false);
            setStage(state);
        });
    }, []);

    if (downloadProgressVisibility) {
        return (
            <Box sx={{ width: "100%" }}>
                <Typography sx={{ color: "white", textAlign: "center" }}>{`Downloading ${versionName}.`}</Typography>
                <LinearProgressWithLabel value={progress} />
            </Box>
        );
    } else if (appxExtractProgressVisibility && stage === "idle") {
        return (
            <Box sx={{ width: "100%" }}>
                <Typography sx={{ color: "white", textAlign: "center" }}>{`Extracting ${versionName}. This will take several minutes.`}</Typography>
                <LinearProgress />
            </Box>
        );
    } else if (appxExtractProgressVisibility && stage !== "idle") {
        return (
            <Box sx={{ width: "100%" }}>
                <Typography sx={{ color: "white", textAlign: "center" }}>{`${versionName}: ${stage}`}</Typography>
                <LinearProgress />
            </Box>
        );
    }
    return <Box sx={{ width: "100%" }}></Box>;
}
