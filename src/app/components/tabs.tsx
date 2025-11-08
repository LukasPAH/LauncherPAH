import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ButtonStack from "./buttonStack";
import HomePage from "./homePage";
import Profile from "./profileScreen"

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface ITabProps {
    selectedVersion: string;
    createdProfiles: IProfiles;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    );
}

export default function BasicTabs(props: ITabProps) {
    const [value, setValue] = React.useState(0);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const [versions, setVersions] = React.useState([]) as [string[], React.Dispatch<React.SetStateAction<any[]>>];
    const [availableVersions, setAvailableVersions] = React.useState([]) as [string[], React.Dispatch<React.SetStateAction<any[]>>];

    window.electronAPI.on("installedVersions", (versionsList: string[]) => {
        setVersions(versionsList);
    });
    window.electronAPI.on("availableVersions", (versionsList: string[]) => {
        setAvailableVersions(versionsList);
    });

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", height: "52px" }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Home" sx={{ color: "white" }} />
                    <Tab label="Manage Versions" sx={{ color: "white" }} />
                    <Tab label="Manage Profiles" sx={{ color: "white" }} />
                    <Tab label="Launcher Settings" sx={{ color: "white" }} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <HomePage versions={versions} availableVersions={availableVersions} selectedVersion={props.selectedVersion} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ButtonStack versions={availableVersions} installedVersions={versions} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <Profile versions={availableVersions} profiles={props.createdProfiles} availableVersions={availableVersions}></Profile>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                Coming Soon
            </CustomTabPanel>
        </Box>
    );
}
