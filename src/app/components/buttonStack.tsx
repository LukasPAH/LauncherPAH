import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import React from "react";
import DownloadProgress from "./progress";

interface IButtonStackProps {
    versions: string[]
}

function buttonClick(index: number) {
    window.electronAPI.send("download", index);
}

export default function ButtonStack(props: IButtonStackProps) {
    return (
        <div>
            <Stack spacing={2}>
                {props.versions.map((version, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        onClick={() => {
                            buttonClick(index);
                        }}
                    >
                        {version}
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
