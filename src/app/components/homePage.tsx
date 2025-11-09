import * as React from "react";
import Box from "@mui/material/Box";
import DropDown from "./dropDown";
import { Button } from "@mui/material";

interface IHomepageProps {
    profiles: IProfiles;
    availableVersions: string[];
    selectedProfile: IProfile;
}

export default function HomePage(props: IHomepageProps) {
    function selectVersion(profile: IProfile) {
        window.electronAPI.send("setSelectedProfile", profile);
    }

    function launchVersion() {
        window.electronAPI.send("launchVersion", undefined);
    }

    return (
        <Box>
            <Box sx={{ width: "100%", height: "100%" }}>
                <div style={{ height: "calc(100vh - 2rem - 54px)", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box component="img" sx={{ height: "100%", width: "100%", align: "center", aspectRatio: 1, objectFit: "cover" }} draggable={false} src="../../../images/bedrock_master.jpg"></Box>
                </div>
            </Box>
            <Box sx={{ position: "fixed", top: "7rem", left: 0, width: "100%", zIndex: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                    <Box component="img" sx={{ height: "130px", width: "397.333px", align: "" }} draggable={false} src="../../../images/edition_logo.png"></Box>
                </Box>
            </Box>
            <Box sx={{ position: "fixed", bottom: "4rem", left: "1rem", width: "40%", zIndex: 2 }}>
                <DropDown profiles={props.profiles} callback={selectVersion} enableNewButton={false} />
            </Box>
            {props.selectedProfile !== undefined && (
                <Box sx={{ position: "fixed", bottom: "4rem", left: 0, width: "100%", zIndex: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                        <Button variant="outlined" sx={{ fontSize: 20, backgroundColor: "#0A964F", color: "white", textShadow: "1px 1px 2px black", maxWidth: "360px" }} onClick={launchVersion}>
                            {`Play ${props.selectedProfile.version}`}
                        </Button>
                    </Box>
                </Box>
            )}
            <Box sx={{ position: "fixed", bottom: "50%", left: 0, width: "100%", zIndex: 10 }}>
                <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}></Box>
            </Box>
            <Box
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    flexDirection: "column-reverse",
                    width: "100%",
                    height: "8rem",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "1rem",
                        width: "calc(100% - 2rem)",
                        height: "calc(100% - 1rem)",
                        backgroundColor: "rgba(0, 0, 0, 0.75)", // Black with 50% opacity
                        zIndex: -1,
                    },
                }}
            ></Box>
        </Box>
    );
}
