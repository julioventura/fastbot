import { useContext } from "react";
// Importa o contexto e o tipo do novo arquivo de definição
import { AuthContext, AuthContextType } from "./authContextDefinition";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider. Make sure AuthProvider is a parent component.");
  }
  return context;
};