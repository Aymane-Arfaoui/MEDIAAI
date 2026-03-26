import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api-client/client";

interface AppContextType {
  creatorId: string;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [creatorId, setCreatorId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCreators()
      .then((data) => {
        const id = data?.creators?.[0]?.id ?? "";
        setCreatorId(id);
      })
      .catch(() => setCreatorId(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppContext.Provider value={{ creatorId, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
