import TextField from "@mui/material/TextField";
import React from "react";
import Box from "@mui/material/Box";

interface ITextFieldProps {
    disallowedValues: string[];
    nameAllowedCallback: (isAllowed: boolean) => void;
    nameCallback: (name: string) => void;
}

export default function TextBox(props: ITextFieldProps) {
    const defaultTextValue = "";

    const [text, setText] = React.useState(defaultTextValue);
    const [disallowed, setDisallowed] = React.useState(true);

    function updateText(value: string) {
        setText(value);
        if (value === "") {
            setDisallowed(true);
            return true;
        }
        for (const disallowedValue of props.disallowedValues) {
            if (disallowedValue === value) {
                setDisallowed(true);
                return true;
            }
        }
        setDisallowed(false);
        return false;
    }

    if (disallowed) {
        return (
            <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "38ch", color: "white" } }} noValidate autoComplete="off">
                <div>
                    <TextField
                        sx={{ input: { color: "white" } }}
                        error
                        id="outlined-error"
                        label="Profile Name"
                        value={text}
                        onChange={(event) => {
                            const isDisallowed = updateText(event.target.value);
                            props.nameAllowedCallback(!isDisallowed);
                            props.nameCallback(event.target.value);
                        }}
                    />
                </div>
            </Box>
        );
    }

    return (
        <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "38ch", color: "#14a15bff" } }} noValidate autoComplete="off">
            <div>
                <TextField
                    sx={{
                        input: { color: "white" },
                        fieldset: { borderColor: "#14a15bff" },
                        "& label": {
                            color: "#14a15bff",
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "#14a15bff",
                            },
                            "&:hover fieldset": {
                                borderColor: "#14a15bff",
                            },
                        },
                    }}
                    id="outlined"
                    label="Profile Name"
                    value={text}
                    onChange={(event) => {
                        const isDisallowed = updateText(event.target.value);
                        props.nameAllowedCallback(!isDisallowed);
                        props.nameCallback(event.target.value);
                    }}
                />
            </div>
        </Box>
    );
}
