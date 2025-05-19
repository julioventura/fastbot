
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface SecurityCardProps {
  onSignOut: () => Promise<void>;
}

const SecurityCard = ({ onSignOut }: SecurityCardProps) => {
  return (
    <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-white">Segurança</CardTitle>
        <CardDescription className="text-gray-300">Gerencie sua senha e segurança da conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-300">
          <Lock size={16} className="text-[#4f9bff]" />
          <span className="text-sm">Senha</span>
        </div>
        <Button 
          variant="outline" 
          className="w-full border-[#2a4980]/50 text-[#4f9bff] hover:bg-[#2a4980]/30"
        >
          Alterar senha
        </Button>
        
        <div className="border-t border-[#2a4980]/50 pt-4">
          <Button
            variant="destructive"
            className="w-full bg-red-500/80 hover:bg-red-600/80"
            onClick={onSignOut}
          >
            Sair da conta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityCard;
