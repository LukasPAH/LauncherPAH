import * as React from "react";
import Tabs from "./tabs";
import Box from "@mui/material/Box";
import DownloadProgress from "./progress";
import "../styles.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import OpenFile from "./openFile";

window.addEventListener("load", () => {
    window.electronAPI.send("UILoaded", undefined);
});

const theme = createTheme({
    palette: {
        primary: {
            main: "#14a15bff",
        },
        secondary: {
            main: "#95d9aaff",
        },
    },
});

export default function MainWindow() {
    const [selectedProfile, setSelectedProfile] = React.useState({} as IProfile);
    const [installedProfiles, setInstalledProfiles] = React.useState({} as IProfiles);
    const [openedFile, setOpenedFile] = React.useState(false);
    const [openFileName, setOpenFileName] = React.useState("");

    window.electronAPI.on("selectedProfile", (profile: IProfile) => {
        setSelectedProfile(profile);
    });

    window.electronAPI.on("createdProfiles", (profiles: IProfiles) => {
        setInstalledProfiles(profiles);
    });

    window.electronAPI.on("launchedFile", (file: string) => {
        setOpenedFile(true);
        setOpenFileName(file);
    });

    function openFileCallback(profile: IProfile) {
        setOpenedFile(false);
        window.electronAPI.send("launchFile", profile);
    }

    function closeFileModal() {
        setOpenedFile(false);
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="main-style">
                <OpenFile
                    open={openedFile}
                    profiles={installedProfiles}
                    selectedProfile={selectedProfile}
                    callback={openFileCallback}
                    closeCallback={closeFileModal}
                    fileName={openFileName}
                ></OpenFile>
                <Tabs selectedProfile={selectedProfile} createdProfiles={installedProfiles} />
                <Box sx={{ padding: "1rem", position: "fixed", bottom: 0, left: 0, width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", width: "calc(100% - 2rem)" }}>
                        <DownloadProgress />
                    </Box>
                </Box>
            </div>
        </ThemeProvider>
    );
}
