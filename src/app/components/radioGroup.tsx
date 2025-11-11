import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import * as React from "react";

interface IRadioGroupProp {
    title: string;
    options: string[];
    callback: (index: number) => void;
}

export default function RadioGroupComponent(props: IRadioGroupProp) {
    return (
        <FormControl sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <FormLabel sx={{ color: "white" }} id={`${props.title}-label`}>
                {props.title}
            </FormLabel>
            <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group">
                {props.options.map((option, index) => (
                    <FormControlLabel
                        sx={{ color: "white" }}
                        value={option}
                        key={option}
                        control={<Radio />}
                        label={option}
                        onClick={() => {
                            props.callback(index);
                        }}
                    ></FormControlLabel>
                ))}
            </RadioGroup>
        </FormControl>
    );
}
