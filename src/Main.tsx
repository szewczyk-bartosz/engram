import {createRoot} from "react-dom/client"
import { createContext, useContext, useState } from "react";
import App from './App'

interface LogRow {
  time: string,
  text: string
  id: number
}

interface ActivityLogContextType {
    rows: LogRow[];
    activityLogFunc: (msg: string) => void;
}

export function useActivityLog() {
  return useContext(ActivityLogContext)
}

const ActivityLogContext = createContext<ActivityLogContextType>({ rows: [], activityLogFunc: () => {} });

function ActivityLogProvider({children}: {children: React.ReactNode}) {
  const [rows, setRows] = useState<LogRow[]>([]);
  const activityLogFunc = (msg: string) => setRows(prev => [...prev, {time: new Date().toLocaleTimeString("en-GB"), text: msg, id: Date.now()}])

  return (
  <ActivityLogContext.Provider value={{rows, activityLogFunc}}>
    {children}
  </ActivityLogContext.Provider>
  );

}

const root = createRoot(document.getElementById("root")!);
root.render(<ActivityLogProvider> <App /> </ActivityLogProvider>);
