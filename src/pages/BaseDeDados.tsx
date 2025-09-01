import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText } from "lucide-react";
import DocumentUpload from "@/components/chatbot/DocumentUpload";
import ConfigurationForm from "@/components/chatbot/ConfigurationForm";

const BaseDeDados: React.FC = () => {
  // Rolar para o topo da página quando o componente for montado
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto border border-slate-700 rounded-lg bg-slate-900/40 p-6">

          {/* Header da página */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white/90">
              Configuração do Assistente Online
            </h1>
            <p className="text-white/60 mt-2">
              Configure seu chatbot pelo formulário e adicione arquivos para as respostas
            </p>
          </div>

          {/* Tabs Container */}
          <Tabs defaultValue="configuration">
            <TabsList className="grid w-full grid-cols-2 bg-transparent border-0 h-16 p-0 m-0 gap-0">

              <TabsTrigger
                value="configuration"
                className="relative bg-green-900 text-white/80 text-sm md:text-lg font-semibold px-6 py-4 data-[state=active]:bg-green-800 data-[state=active]:text-white data-[state=active]:border-green-900 data-[state=active]:border-b-transparent data-[state=active]:z-10 hover:bg-green-600 transition-all duration-200"
                style={{
                  clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 100%, 0% 100%)'
                }}
              >
                Formulário
              </TabsTrigger>

              <TabsTrigger
                value="documents"
                className="relative bg-violet-900 text-white/80 text-sm md:text-lg font-semibold px-6 py-4 data-[state=active]:bg-violet-800 data-[state=active]:text-white data-[state=active]:border-violet-400 data-[state=active]:border-b-transparent data-[state=active]:z-10 hover:bg-violet-600 transition-all duration-200"
                style={{
                  clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 100%, 0% 100%)'
                }}
              >
                Adicione Arquivos
              </TabsTrigger>

            </TabsList>

            {/* Tab Content - Configuração */}
            <TabsContent value="configuration" className="mt-0">
              <Card className="bg-green-900 border border-green-800 backdrop-blur-sm rounded-t-none border-t-0">
                <CardHeader className="text-center">
                </CardHeader>
                <CardContent>
                  <ConfigurationForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Content - Documentos */}
            <TabsContent value="documents" className="mt-0">
              <Card className="bg-violet-900 border border-violet-800 backdrop-blur-sm rounded-t-none border-t-0">
                <CardHeader className="text-center">
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
