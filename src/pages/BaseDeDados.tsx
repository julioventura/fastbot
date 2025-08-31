import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Upload, FileText } from "lucide-react";
import DocumentUpload from "@/components/chatbot/DocumentUpload";
import ConfigurationForm from "@/components/chatbot/ConfigurationForm";

const BaseDeDados: React.FC = () => {
  // Rolar para o topo da página quando o componente for montado
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto border border-green-700 rounded-lg bg-green-900/30 p-6">

          {/* Header da página */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white/90">
              Configuração do Sistema
            </h1>
            <p className="text-white/60 mt-2">
              Configure seu chatbot e gerencie a base de dados
            </p>
          </div>

          {/* Tabs Container */}
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-green-800/30 border border-green-500/30 h-12">
              <TabsTrigger
                value="configuration"
                className="flex items-center gap-2 text-white/80 data-[state=active]:bg-green-600/50 data-[state=active]:text-white data-[state=active]:border-green-400"
              >
                <Settings className="h-4 w-4" />
                Configuração do Chatbot
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2 text-white/80 data-[state=active]:bg-green-600/50 data-[state=active]:text-white data-[state=active]:border-green-400"
              >
                <FileText className="h-4 w-4" />
                Base de Dados
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - Configuração */}
            <TabsContent value="configuration" className="mt-6">
              <Card className="bg-green-900/20 border border-green-400/30 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white/90 flex items-center justify-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações do Chatbot
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Configure o nome e as características do seu chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConfigurationForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Content - Documentos */}
            <TabsContent value="documents" className="mt-6">
              <Card className="bg-green-900/20 border border-green-400/30 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white/90 flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5" />
                    Gerenciar Base de Dados
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Adicione arquivos à base de conhecimento do seu chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
};

export default BaseDeDados;
