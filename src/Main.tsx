import {createRoot} from "react-dom/client"
import App from './App'
import { ActivityLogProvider } from "./ActivityLogContext";

const root = createRoot(document.getElementById("root")!);
root.render(<ActivityLogProvider> <App /> </ActivityLogProvider>);
