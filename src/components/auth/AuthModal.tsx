import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Import DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup" | "reset";
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onOpenChange,
  defaultTab = "login",
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border border-[#2a4980]/50 bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] text-white shadow-[0_0_15px_rgba(0,99,247,0.3)] overflow-hidden">
        {/* Wireframe grid overlay */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="h-full w-full grid">
            {/* Horizontal lines */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={`h-${index}`}
                className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
                style={{ top: `${(index * 100) / 9}%` }}
              />
            ))}

            {/* Vertical lines */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={`v-${index}`}
                className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
                style={{ left: `${(index * 100) / 9}%` }}
              />
            ))}
          </div>
        </div>

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-center text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(79,155,255,0.5)]">
            {activeTab === "login"
              ? "Acesse sua conta"
              : activeTab === "signup"
              ? "Criar nova conta"
              : "Recuperar senha"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-300 mt-2">
            Acesse sua conta ou crie uma nova para continuar.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full relative z-10"
        >
          <TabsList className="grid w-full grid-cols-3 bg-[#0a1629]/70 border border-[#2a4980]/50">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(79,155,255,0.5)] text-gray-300"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(79,155,255,0.5)] text-gray-300"
            >
              Cadastro
            </TabsTrigger>
            <TabsTrigger 
              value="reset"
              className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(79,155,255,0.5)] text-gray-300"
            >
              Recuperar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <SignUpForm
              onSuccess={() => {
                setActiveTab("login");
              }}
            />
          </TabsContent>

          <TabsContent value="reset" className="mt-6">
            <ResetPasswordForm
              onSuccess={() => {
                setActiveTab("login");
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
