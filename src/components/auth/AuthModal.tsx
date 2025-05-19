
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
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
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
            <TabsTrigger value="reset">Recuperar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm
              onSuccess={() => {
                setActiveTab("login");
              }}
            />
          </TabsContent>

          <TabsContent value="reset">
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
