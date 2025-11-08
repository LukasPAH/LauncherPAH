import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import RadioGroup from "@mui/material/RadioGroup";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import TextBox from "./textBox";

interface IAddVersionProps {
    open: boolean;
    callback: (index: number, profileName: string) => void;
    availableVersions: string[];
}

export default function ScrollDialog(props: IAddVersionProps) {
    const { open } = props;

    const [selectedVersionIndex, setSelectedVersionIndex] = React.useState(-1);
    const [canSubmit, setCanSubmit] = React.useState(false);
    const [text, setText] = React.useState("");

    function textChangeCallback(isAllowed: boolean) {
        setCanSubmit(isAllowed);
    }

    function textCallback(name: string) {
        setText(name);
    }

    function resetStates() {
        setSelectedVersionIndex(-1);
        setCanSubmit(false);
    }

    return (
        <React.Fragment>
            <Dialog
                sx={{ "& .MuiDialog-paper": { backgroundColor: "#242424ff" } }}
                open={open}
                onClose={() => {
                    props.callback(-1, "");
                    resetStates();
                }}
                scroll={"paper"}
                disableRestoreFocus={true}
            >
                <TextBox disallowedValues={["test"]} nameAllowedCallback={textChangeCallback} nameCallback={textCallback}></TextBox>
                <DialogTitle sx={{ color: "white" }} id="scroll-dialog-title">
                    Select Version
                </DialogTitle>
                <DialogContent>
                    <RadioGroup>
                        {props.availableVersions.map((option, index) => (
                            <FormControlLabel
                                sx={{ width: "300px", color: "white" }}
                                value={option}
                                key={option}
                                control={<Radio />}
                                label={option}
                                onClick={() => {
                                    setSelectedVersionIndex(index);
                                }}
                            ></FormControlLabel>
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            props.callback(-1, "");
                            resetStates();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (canSubmit && selectedVersionIndex !== -1) {
                                props.callback(selectedVersionIndex, text);
                                resetStates();
                            }
                        }}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
