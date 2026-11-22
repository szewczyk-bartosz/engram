import { createContext, useContext, useState } from "react";

interface LogRow {
  time: string,
  text: string
  id: number
}

interface ActivityLogContextType {
    rows: LogRow[];
    activityLogFunc: (msg: string) => void;
}

const ActivityLogContext = createContext<ActivityLogContextType>({ rows: [], activityLogFunc: () => {} });

export function useActivityLog() {
  return useContext(ActivityLogContext)
}

export function ActivityLogProvider({children}: {children: React.ReactNode}) {
  const [rows, setRows] = useState<LogRow[]>([]);
  const activityLogFunc = (msg: string) => setRows(prev => [...prev, {time: new Date().toLocaleTimeString("en-GB"), text: msg, id: Date.now()}])

  return (
  <ActivityLogContext.Provider value={{rows, activityLogFunc}}>
    {children}
  </ActivityLogContext.Provider>
  );

}
