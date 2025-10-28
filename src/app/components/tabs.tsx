import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ButtonStack from "./buttonStack";
import HomePage from "./homePage";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

window.addEventListener("load", () => {
    window.electronAPI.send("readVersions", undefined);
});

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const [versions, setVersions] = React.useState([]) as [string[], React.Dispatch<React.SetStateAction<any[]>>];

    window.electronAPI.on("installedVersions", (versionsList: string[]) => {
        setVersions(versionsList);
    });

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Home" sx={{ color: "white" }} />
                    <Tab label="Manage Versions" sx={{ color: "white" }} />
                    <Tab label="Manage Profiles" sx={{ color: "white" }} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <HomePage versions={versions} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ButtonStack />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                Item Three
            </CustomTabPanel>
        </Box>
    );
}
