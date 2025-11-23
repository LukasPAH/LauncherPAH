import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DropDown from "./dropDown";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface IOpenFileProps {
    open: boolean;
    profiles: IProfiles;
    selectedProfile?: IProfile;
    callback: (profile: IProfile) => void;
    closeCallback: () => void;
    fileName: string;
}

export default function ScrollDialog(props: IOpenFileProps) {
    const { open, profiles } = props;

    const [selectedProfile, setSelectedProfile] = React.useState(props.selectedProfile as IProfile);

    React.useEffect(() => {
        setSelectedProfile(props.selectedProfile);
    }, [props.selectedProfile]);

    function updateSelectedProfile(profile: IProfile) {
        setSelectedProfile(profile);
        console.log(profile);
    }

    return (
        <React.Fragment>
            <Dialog
                transitionDuration={0}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    "& .MuiDialog-paper": {
                        backgroundColor: "#242424ff",
                        width: 400,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    },
                }}
                open={open}
                onClose={() => {
                    props.closeCallback();
                }}
                scroll={"paper"}
                disableRestoreFocus={true}
            >
                <Box sx={{ height: "1rem" }}></Box>
                <DialogTitle sx={{ color: "white", padding: 0 }} id="scroll-dialog-title">
                    Select Profile to Import Content
                </DialogTitle>
                <Box sx={{ height: "1rem" }}></Box>
                <Typography sx={{ textTransform: "none", fontSize: 16, color: "white", textAlign: "center" }}>{props.fileName}</Typography>
                <Box sx={{ height: "1rem" }}></Box>
                <DropDown profiles={profiles} selectedProfle={selectedProfile} callback={updateSelectedProfile} width={350}></DropDown>
                <Box sx={{ height: "1rem" }}></Box>
                <DialogActions>
                    <Button
                        onClick={() => {
                            props.closeCallback();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            props.callback(selectedProfile);
                        }}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
