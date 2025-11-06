import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import Modal from "@mui/material/Modal";
import { SxProps } from "@mui/material";

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
                                color: "rgba(156, 170, 201, 1)",
                            }}
                            key={`open${index}`}
                            onClick={() => {
                                openInstallLocation(index);
                            }}
                        >
                            {"Open Install Location"}
                        </Button>
                        <div style={{ width: "1rem", height: "100%" }}></div>
                        <RemoveModal index={index} versions={props.installedVersions}></RemoveModal>
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

interface IRemoveModalProps {
    index: number;
    versions: string[];
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

    const removeModalText = `Are you sure you want to permanently delete ${props.versions[props.index].toLowerCase()}?`

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
                                removeVersion(props.index);
                                handleClose();
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
