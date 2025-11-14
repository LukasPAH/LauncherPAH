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
import DefaultTextBox from "./defaultTextBox";
import CustomRadioGroup from "./radioGroup";
import Box from "@mui/material/Box";

interface IAddVersionProps {
    open: boolean;
    callback: (index: number, profileName: string, beforeProfileName?: string) => void;
    availableVersions: string[];
    profiles: IProfiles;
    selectedProfile?: IProfile;
    canSubmit: boolean;
}

enum FilterEnum {
    release = 0,
    preview,
    sideloaded,
}

export default function ScrollDialog(props: IAddVersionProps) {
    const { open, profiles, selectedProfile } = props;

    const profileValues = Object.values(profiles);
    const disallowedValues = [];
    for (const profileValue of profileValues) {
        disallowedValues.push(profileValue.name);
    }

    const [selectedVersionIndex, setSelectedVersionIndex] = React.useState(-1);
    const [canSubmit, setCanSubmit] = React.useState(props.canSubmit);
    const [text, setText] = React.useState("");
    const [filterText, setFilterText] = React.useState("");
    const [selectedVersionName, setSelectedVersionName] = React.useState("");

    React.useEffect(() => {
        setCanSubmit(props.canSubmit);
        if (props.canSubmit && props.selectedProfile !== undefined) {
            const index = props.availableVersions.indexOf(props.selectedProfile.version);
            setSelectedVersionIndex(index);
            setText(props.selectedProfile.name);
        }
    }, [props.canSubmit]);

    function textChangeCallback(isAllowed: boolean) {
        setCanSubmit(isAllowed);
    }

    function textCallback(name: string) {
        setText(name);
    }

    function resetStates() {
        setSelectedVersionIndex(-1);
        setCanSubmit(false);
        setFilterText("");
        setSelectedVersionName("");
    }

    function filter(index: number) {
        setFilterText(FilterEnum[index]);
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
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    },
                }}
                open={open}
                onClose={() => {
                    props.callback(-1, "");
                    resetStates();
                }}
                scroll={"paper"}
                disableRestoreFocus={true}
            >
                <Box>
                    {selectedProfile === undefined && <TextBox disallowedValues={disallowedValues} nameAllowedCallback={textChangeCallback} nameCallback={textCallback}></TextBox>}
                    {selectedProfile !== undefined && (
                        <DefaultTextBox defaultValue={selectedProfile.name} disallowedValues={disallowedValues} nameAllowedCallback={textChangeCallback} nameCallback={textCallback}></DefaultTextBox>
                    )}
                </Box>
                <DialogTitle sx={{ color: "white", padding: 0 }} id="scroll-dialog-title">
                    Select Version
                </DialogTitle>
                <Box sx={{ height: "1rem" }}></Box>
                <CustomRadioGroup callback={filter} options={["Release", "Preview", "Sideloaded"]} title="Filter by:"></CustomRadioGroup>
                <DialogContent>
                    <RadioGroup
                        value={selectedVersionName === "" ? (selectedProfile?.version ?? "") : selectedVersionName}
                        onChange={(event) => {
                            setSelectedVersionName(event.target.value);
                        }}
                    >
                        {props.availableVersions.map((option, index) => (
                            <Box key={`box${index}`}>
                                {(((option.toLowerCase().includes(filterText) || filterText === "") && !option.toLowerCase().includes("sideloaded")) ||
                                    (option.toLowerCase().includes("sideloaded") && filterText === "sideloaded") ||
                                    filterText === "") && (
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
                                )}
                            </Box>
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            props.callback(-1, "");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            console.log(canSubmit, selectedVersionIndex);
                            if (canSubmit && selectedVersionIndex !== -1) {
                                props.callback(selectedVersionIndex, text, props.selectedProfile?.name);
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
