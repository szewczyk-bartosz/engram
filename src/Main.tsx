import {createRoot} from "react-dom/client"
import App from './App'
import "./styles/styles.css";
import "./styles/prism-styling.css";
import { ActivityLogProvider } from "./ActivityLogContext";

const root = createRoot(document.getElementById("root")!);
root.render(<ActivityLogProvider> <App /> </ActivityLogProvider>);
