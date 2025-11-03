import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";

interface IButtonStackProps {
    versions: string[];
    installedVersions: string[];
}

function removeVersion(index: number) {
    window.electronAPI.send("removeVersion", index);
}

function openInstallLocation(index: number) {
    window.electronAPI.send("openInstallLocation", index);
}

export default function ButtonStack(props: IButtonStackProps) {
    return (
        <div>
            <Stack spacing={2}>
                {props.installedVersions.map((version, index) => (
                    <Box key={`div${index}`} sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }} alignItems="center">
                        <Typography sx={{ color: "white", textAlign: "center" }} key={index} variant="body1">
                            {`Minecraft ${version}`}
                        </Typography>
                        <div style={{ width: "1rem", height: "100%" }}></div>
                        <Button
                            startIcon={<FolderIcon></FolderIcon>}
                            sx={{
                                backgroundColor: "rgb(55, 65, 81)",
                                color: "rgba(156, 170, 201, 1)",
                                "&:hover": {
                                    backgroundColor: "rgba(65, 86, 120, 1)",
                                },
                            }}
                            key={`open${index}`}
                            onClick={() => {
                                openInstallLocation(index);
                            }}
                        >
                            {"Open Install Location"}
                        </Button>

                        <div style={{ width: "1rem", height: "100%" }}></div>
                        <Button
                            key={`remove${index}`}
                            sx={{
                                backgroundColor: "rgb(55, 65, 81)",
                                color: "rgba(159, 75, 75, 1)",
                                "&:hover": {
                                    backgroundColor: "rgba(65, 86, 120, 1)",
                                },
                            }}
                            startIcon={<DeleteIcon></DeleteIcon>}
                            onClick={() => {
                                removeVersion(index);
                            }}
                        >
                            {"Remove"}
                        </Button>
                    </Box>
                ))}
                <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                    <Button
                        key="custom"
                        variant="outlined"
                        onClick={() => {
                            window.electronAPI.send("filePick", {});
                        }}
                        sx={{ width: "fit-content" }}
                    >
                        {"Pick and Sideload Custom Build"}
                    </Button>
                </Box>
            </Stack>
            <div style={{ width: 0, height: "1rem" }}></div>
        </div>
    );
}
