import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import React from "react";
import versionsJSON from "../../../data/historical_versions.json";
import DownloadProgress from "./progress";

function buttonClick(index: number) {
    window.electronAPI.send("download", {
        url: versionsJSON.versions[index].url,
        properties: { directory: "../../data" },
    } as IDownloadInfo);
}

export default function ButtonStack() {
    return (
        <div>
            <Stack spacing={2}>
                {versionsJSON.versions.map((version, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        onClick={() => {
                            buttonClick(index);
                        }}
                    >
                        {version.version}
                    </Button>
                ))}
                <Button
                    key="custom"
                    variant="outlined"
                    onClick={() => {
                        window.electronAPI.send("filePick", {});
                    }}
                >
                    {"Pick Custom Build"}
                </Button>
            </Stack>
            <div style={{ width: 0, height: "1rem" }}></div>
            <DownloadProgress />
        </div>
    );
}
