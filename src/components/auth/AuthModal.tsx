
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
      <DialogContent className="sm:max-w-[425px] border-[#2a4980]/50 bg-[#0a1629]/80 backdrop-blur-sm text-white overflow-hidden relative">
        {/* SVG Glow Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <g opacity="0.4" filter="url(#filter0_f_101_3)">
              <circle cx="1079" cy="540" r="359" fill="#0063F7" />
            </g>
            <g opacity="0.3" filter="url(#filter1_f_101_3)">
              <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
            </g>
            <defs>
              <filter id="filter0_f_101_3" x="520" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
              </filter>
              <filter id="filter1_f_101_3" x="-18" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
              </filter>
            </defs>
          </svg>
        </div>
        
        {/* Grid overlay pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div
            className="h-full w-full grid"
            style={{
              gridTemplateRows: 'repeat(20, 1fr)',
              gridTemplateColumns: 'repeat(20, 1fr)',
            }}
          >
            {/* Horizontal lines */}
            {Array.from({ length: 21 }).map((_, index) => (
              <div
                key={`h-${index}`}
                className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
                style={{ top: `${(index * 100) / 20}%` }}
              />
            ))}

            {/* Vertical lines */}
            {Array.from({ length: 21 }).map((_, index) => (
              <div
                key={`v-${index}`}
                className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
                style={{ left: `${(index * 100) / 20}%` }}
              />
            ))}
          </div>
        </div>

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
