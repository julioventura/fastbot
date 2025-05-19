
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";

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
      <DialogContent className="sm:max-w-[425px] border-[#2a4980]/50 bg-[#0a1629]/80 backdrop-blur-sm text-white overflow-hidden relative">
        {/* Background decorations */}
        <BackgroundDecoration />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-center text-xl font-bold text-white">
            {activeTab === "login"
              ? "Acesse sua conta"
              : activeTab === "signup"
              ? "Criar nova conta"
              : "Recuperar senha"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full relative z-10"
        >
          <TabsList className="grid w-full grid-cols-3 bg-[#0a1629]/60 border border-[#2a4980]/30">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-[#0766FF]/20 data-[state=active]:text-white text-gray-300"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-[#0766FF]/20 data-[state=active]:text-white text-gray-300"
            >
              Cadastro
            </TabsTrigger>
            <TabsTrigger 
              value="reset" 
              className="data-[state=active]:bg-[#0766FF]/20 data-[state=active]:text-white text-gray-300"
            >
              Recuperar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="relative z-10">
            <LoginForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="signup" className="relative z-10">
            <SignUpForm
              onSuccess={() => {
                setActiveTab("login");
              }}
            />
          </TabsContent>

          <TabsContent value="reset" className="relative z-10">
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
