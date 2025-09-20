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

export let downloadProgressVisibility = false;

export default function LinearWithValueLabel() {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        window.electronAPI.on("downloadProgress", (progress: Progress) => {
            downloadProgressVisibility = true;
            setProgress(progress.percent * 100);
        });
        window.electronAPI.on("downloadCompleted", (_) => {
            downloadProgressVisibility = false;
            setProgress(progress);
        });
    }, []);

    if (downloadProgressVisibility) {
        return (
            <Box sx={{ width: "100%" }}>
                <LinearProgressWithLabel value={progress} />
            </Box>
        );
    }

    return <Box sx={{ width: "100%" }}></Box>;
}
