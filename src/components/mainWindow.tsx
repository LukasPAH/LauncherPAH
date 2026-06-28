import Tabs from "./tabs";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#14a15bff",
        },
        secondary: {
            main: "#95d9aaff",
        },
    },
});

export default function MainWindow() {
    return (
        <ThemeProvider theme={theme}>
            <div className="main-style">
                <Tabs />
                <Box sx={{ padding: "1rem", position: "fixed", bottom: 0, left: 0, width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", width: "calc(100% - 2rem)" }}></Box>
                </Box>
            </div>
        </ThemeProvider>
    );
}
