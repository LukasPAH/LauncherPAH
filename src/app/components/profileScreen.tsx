import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import Modal from "@mui/material/Modal";
import { SxProps } from "@mui/material";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import AddVerionModal from "./addVersion";

interface IButtonStackProps {
    versions: string[];
    profiles: IProfiles;
    availableVersions: string[];
}

function removeProfile(name: string) {
    window.electronAPI.send("removeProfile", name);
}

function openProfileLocation(profile: IProfile) {
    window.electronAPI.send("openProfileLocation", profile);
}

export default function ProfileScreen(props: IButtonStackProps) {
    const profiles = Object.entries(props.profiles);

    const [versionModal, setVersionModal] = React.useState(false);

    function addProfile(index: number, profileName: string) {
        setVersionModal(false);
        if (index !== -1) window.electronAPI.send("addProfile", { name: profileName, index: index });
    }

    return (
        <div>
            <Stack spacing={1}>
                <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                    <Button
                        sx={{
                            fontSize: 14,
                            backgroundColor: "rgb(55, 65, 81)",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "rgba(65, 86, 120, 1)",
                            },
                            "&.Mui-selected": {
                                backgroundColor: "rgba(65, 86, 120, 1)",
                                color: "white",
                            },
                        }}
                        disableRipple
                        onClick={() => {
                            setVersionModal(true);
                        }}
                    >
                        <AddIcon></AddIcon>
                        <div style={{ width: "4px", height: 0 }}></div>
                        {"Add New Profile"}
                    </Button>
                </Box>

                <Box>
                    <div style={{ width: "1rem", height: "100%" }}></div>
                    <Divider sx={{ bgcolor: "#535353ff", width: "85%", justifySelf: "center" }}></Divider>
                </Box>
                {profiles.map(([profileName, profile], index) => (
                    <Box key={`div${index}`} alignItems="center">
                        <Typography sx={{ color: "white", textAlign: "center" }} key={index} variant="body1">
                            {`${profile.name} - ${profile.version}`}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                            {" "}
                            <Button
                                startIcon={<FolderIcon></FolderIcon>}
                                sx={{
                                    color: "rgba(156, 170, 201, 1)",
                                }}
                                key={`open${index}`}
                                onClick={() => {
                                    openProfileLocation(profile);
                                }}
                            >
                                {"Open Profile Location"}
                            </Button>
                            <Box>{profile.name !== "Default" && profile.name !== "Preview" && <div style={{ width: "1rem", height: "100%" }}></div>}</Box>
                            <Box>{profile.name !== "Default" && profile.name !== "Preview" && <RemoveModal profiles={props.profiles} index={index}></RemoveModal>}</Box>
                        </Box>
                        <div style={{ width: "1rem", height: "100%" }}></div>
                        <Divider sx={{ bgcolor: "#535353ff", width: "85%", justifySelf: "center" }}></Divider>
                    </Box>
                ))}
            </Stack>
            <div style={{ width: 0, height: "1rem" }}></div>
            <Box sx={{ position: "fixed", bottom: "50%", left: 0, width: "100%", zIndex: 10 }}>
                <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                    <AddVerionModal open={versionModal} callback={addProfile} availableVersions={props.availableVersions} profiles={props.profiles}></AddVerionModal>
                </Box>
            </Box>
        </div>
    );
}

interface IRemoveModalProps {
    profiles: IProfiles;
    index: number;
}

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 300,
    bgcolor: "#212322",
    p: 4,
};

const removeButtonStyle = {
    color: "rgba(159, 75, 75, 1)",
};

const removeButtonBoxStyle: SxProps = {
    position: "absolute",
    bottom: "0%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "row",
};

function RemoveModal(props: IRemoveModalProps) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const profiles = Object.entries(props.profiles);

    const removeModalText = `Are you sure you want to permanently remove the following profile?${profiles[props.index][0]}`;

    return (
        <div>
            <Button sx={removeButtonStyle} key={`removeStack${props.index}`} onClick={handleOpen} startIcon={<DeleteIcon></DeleteIcon>}>
                Remove
            </Button>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={modalStyle}>
                    <Typography variant="h6" sx={{ color: "white", textAlign: "center" }}>
                        {removeModalText}
                    </Typography>
                    <Box sx={{ height: 60 }}></Box>
                    <Box sx={removeButtonBoxStyle}>
                        <Button
                            key={`close${props.index}`}
                            onClick={() => {
                                handleClose();
                            }}
                        >
                            {"Cancel"}
                        </Button>
                        <Box sx={{ width: "1rem" }}></Box>
                        <Button
                            key={`remove${props.index}`}
                            sx={removeButtonStyle}
                            startIcon={<DeleteIcon></DeleteIcon>}
                            onClick={() => {
                                handleClose();
                                removeProfile(profiles[props.index][1].name);
                            }}
                        >
                            {"Remove"}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
