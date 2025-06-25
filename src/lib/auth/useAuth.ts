import { useContext } from "react";
import { AuthContext } from "./context";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    console.error("AuthContext é undefined! AuthProvider não está funcionando.");
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure AuthProvider is a parent component."
    );
  }

  return context;
};