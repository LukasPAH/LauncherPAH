import * as React from "react";
import Tabs from "./tabs";
import Box from "@mui/material/Box";
import DownloadProgress from "./progress";
import "../styles.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
    const [selectedVersion, setSelectedVersion] = React.useState("");

    window.electronAPI.on("selectedVersion", (state: string | false) => {
        if (state === false) setSelectedVersion("");
        else setSelectedVersion(state);
    });
    return (
        <ThemeProvider theme={theme}>
            <div className="main-style">
                <Tabs selectedVersion={selectedVersion} />
                <Box sx={{ padding: "1rem", position: "fixed", bottom: 0, left: 0, width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", width: "calc(100% - 2rem)" }}>
                        <DownloadProgress />
                    </Box>
                </Box>
            </div>
        </ThemeProvider>
    );
}
