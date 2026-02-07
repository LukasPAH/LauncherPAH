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
    error: [boolean, string];
}

export default function ErrorModal(props: IModalProps) {
    const [open, setOpen] = React.useState(false);
    const [error, setError] = React.useState("");
    const handleClose = () => setOpen(false);

    React.useEffect(() => {
        if (props.error[0]) {
            setOpen(true);
            setError(props.error[1]);
        }
    }, [props.error]);

    return (
        <div>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" style={{}}>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" color="white" sx={{ maxWidth: "90%" }}>
                        Error
                    </Typography>
                    <Typography id="modal-modal-description" color="white" sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {error}
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}
