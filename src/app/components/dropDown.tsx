import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export interface IDropdownProps {
    versions: string[];
    callback: (index: number) => any;
}

const StyledMenu = styled((props: MenuProps) => <Menu {...props} />)(({ theme }) => ({
    "& .MuiPaper-root": {
        backgroundColor: "rgb(55, 65, 81)",
        minWidth: 180,
    },
}));

export default function Dropdown(props: IDropdownProps) {
    const { versions } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                sx={{ backgroundColor: "rgb(55, 65, 81)" }}
                id="demo-customized-button"
                aria-controls={open ? "demo-customized-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                variant="contained"
                disableElevation
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
            >
                Select Version
            </Button>
            <StyledMenu
                id="demo-customized-menu"
                slotProps={{
                    list: {
                        "aria-labelledby": "demo-customized-button",
                    },
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {versions.map((version, index) => (
                    <MenuItem
                        sx={{
                            padding: "12px 16px",
                            backgroundColor: "rgb(55, 65, 81)",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "rgba(65, 86, 120, 1)",
                            },
                            "&.Mui-selected": {
                                backgroundColor: "rgba(65, 86, 120, 1)",
                                color: "white",
                            },
                        }}
                        key={index}
                        onClick={() => {
                            handleClose();
                            props.callback(index);
                        }}
                        disableRipple
                    >
                        {version}
                    </MenuItem>
                ))}
            </StyledMenu>
        </div>
    );
}
