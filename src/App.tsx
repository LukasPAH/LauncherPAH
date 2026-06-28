//import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import MainWindow from "./components/mainWindow";

function App() {
    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    //     setGreetMsg(await invoke("foo", { name }));
    // }

    return <MainWindow></MainWindow>;
}

export default App;
