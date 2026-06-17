import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";

interface ISplitButtonProps {
    buttonText: string;
    isEditor?: boolean;
}

const options = ["Normal Mode", "Editor Mode"];

export default function SplitButton({ buttonText, isEditor }: ISplitButtonProps) {
    const [text, setText] = React.useState(buttonText);
    const [editor, setEditor] = React.useState(isEditor ?? false);
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    React.useEffect(() => {
        setText(buttonText);
    }, [buttonText]);

    React.useEffect(() => {
        setEditor(isEditor ?? false);
        const index = isEditor ? 1 : 0;
        setSelectedIndex(index);
    }, [isEditor]);

    const launchVersion = () => {
        window.electronAPI.send("launchVersion", undefined);
    };

    const handleMenuItemClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
        const isEditor = index === 0 ? false : true;
        window.electronAPI.send("isEditor", isEditor);
        setEditor(isEditor);
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <ButtonGroup variant="contained" ref={anchorRef} aria-label="Button group with a nested menu">
                <Button
                    sx={{
                        fontSize: 20,
                        backgroundColor: `${editor ? "#288ed7" : "#0A964F"}`,
                        color: "white",
                        textShadow: "1px 1px 2px black",
                        maxWidth: "360px",
                    }}
                    onClick={launchVersion}
                >
                    {`${text}${editor ? " Editor" : ""}`}
                </Button>
                <Button
                    sx={{ backgroundColor: `${editor ? "#288ed7" : "#0A964F"}` }}
                    size="small"
                    aria-controls={open ? "split-button-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: "30%",
                    "& .MuiPaper-root": {
                        backgroundColor: "#09753f",
                        minWidth: 180,
                    },
                }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === "bottom" ? "center top" : "center bottom",
                        }}
                    >
                        <Paper sx={{ display: "flex", flexDirection: "column" }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {options.map((option, index) => (
                                        <MenuItem
                                            sx={{
                                                textShadow: "1px 1px 2px black",
                                                justifyContent: "center",
                                                color: "white",
                                                "&:hover": {
                                                    backgroundColor: "rgb(31, 188, 131)",
                                                },
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgb(52, 159, 120)",
                                                },
                                                "&.Mui-selected:hover": {
                                                    backgroundColor: "rgb(31, 188, 131)",
                                                },
                                            }}
                                            key={option}
                                            disabled={index === 2}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
}
