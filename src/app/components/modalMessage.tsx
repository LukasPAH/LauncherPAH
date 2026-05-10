import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "rgb(50, 53, 50)",
    maxHeight: "100%",
    p: 2,
    overflowY: "auto",
    borderRadius: 1,
    border: 2,
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

interface IModalProps {
    title?: string;
    message: [boolean, string, string | undefined];
}

export default function ModalMessage(props: IModalProps) {
    const [open, setOpen] = React.useState(false);
    const [modalMessage, setMessage] = React.useState("");
    const [modalTitle, setTitle] = React.useState("Error");
    const handleClose = () => setOpen(false);

    window.electronAPI.on("hideModalMessage", () => {
        handleClose();
    });

    React.useEffect(() => {
        if (props.message[0]) {
            setOpen(true);
            setMessage(props.message[1]);
            setTitle(props.message[2] ?? "Error");
        }
    }, [props.message]);

    return (
        <div>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" style={{}}>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" color="white" sx={{ maxWidth: "90%" }}>
                        {modalTitle}
                    </Typography>
                    <Typography id="modal-modal-description" color="white" sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {modalMessage}
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}
