import * as React from "react";
import Tabs from "./tabs";
import DownloadProgress from "./progress";
import "../styles.css";

window.addEventListener("load", () => {
    window.electronAPI.send("UILoaded", undefined);
});

export default function MainWindow() {
    const [selectedVersion, setSelectedVersion] = React.useState("");

    window.electronAPI.on("selectedVersion", (state: string | false) => {
        if (state === false) setSelectedVersion("");
        else setSelectedVersion(state);
    });
    return (
        <div className="main-style">
            <Tabs selectedVersion={selectedVersion} />
            <DownloadProgress />
        </div>
    );
}
