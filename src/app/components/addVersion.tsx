import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import RadioGroup from "@mui/material/RadioGroup";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

interface IAddVersionProps {
    open: boolean;
    callback: (selectedVersion: boolean, index: number) => void;
    availableVersions: string[];
}

export default function ScrollDialog(props: IAddVersionProps) {
    const { open } = props;

    const [selectedVersionIndex, setSelectedVersionIndex] = React.useState(0);

    return (
        <React.Fragment>
            <Dialog open={open} onClose={() => props.callback(false, 0)} scroll={"paper"} disableRestoreFocus={true}>
                <DialogTitle id="scroll-dialog-title">Select Version to Download</DialogTitle>
                <DialogContent dividers={true}>
                    <RadioGroup>
                        {props.availableVersions.map((option, index) => (
                            <FormControlLabel
                                sx={{width: "300px"}}
                                value={option}
                                key={option}
                                control={<Radio />}
                                label={option}
                                onClick={() => {
                                    {
                                        setSelectedVersionIndex(index);
                                    }
                                }}
                            ></FormControlLabel>
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            props.callback(false, 0);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            props.callback(true, selectedVersionIndex);
                        }}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
