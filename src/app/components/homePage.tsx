import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DropDown from "./dropDown";

interface IHomepageProps {
    versions: string[]
}

function callbackFunction(index: number) {
    window.electronAPI.send("launchInstalledVersion", index);
}

export default function HomePage(props: IHomepageProps) {
    return (
        <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <Typography sx={{ color: "white" }}>Minecraft</Typography>
            <DropDown versions={props.versions} callback={callbackFunction} />
        </Box>
    );
}
