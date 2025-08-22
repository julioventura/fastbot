import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DocumentUpload from "@/components/chatbot/DocumentUpload";

const BaseDeDados: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header da página */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Base de Dados
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl">
              Gerencie os arquivos de texto que seu chatbot usará para responder perguntas.
              Adicione documentos, PDFs, e outras informações relevantes para criar uma base
              de conhecimento personalizada.
            </p>
          </div>

          {/* Card principal da Base de Dados */}
          <div className="border border-gray-600 rounded-lg bg-blue-950">
            <Card className="bg-transparent border border-border backdrop-blur-sm">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="flex items-center text-lg md:text-xl text-white">
                  Base de Dados do Chatbot
                </CardTitle>
                <CardDescription className="text-sm md:text-base text-slate-300">
                  Adicione arquivos de texto com informações para seu chatbot usar nas conversas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-6 p-3 md:p-6">

                {/* Upload de Documentos */}
                <div className="space-y-3 md:space-y-6 lg p-2 md:p-6">
                  <DocumentUpload />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card de dicas */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  💡 Dicas para sua Base de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Use arquivos PDF, DOC, TXT ou MD</li>
                  <li>• Inclua informações relevantes sobre seu negócio</li>
                  <li>• Mantenha os textos organizados e claros</li>
                  <li>• Atualize regularmente o conteúdo</li>
                </ul>
              </CardContent>
            </Card>

            {/* Card de formatos suportados */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  📁 Formatos Suportados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• <strong>PDF:</strong> Documentos e manuais</li>
                  <li>• <strong>DOC/DOCX:</strong> Textos do Word</li>
                  <li>• <strong>TXT:</strong> Arquivos de texto simples</li>
                  <li>• <strong>MD:</strong> Arquivos Markdown</li>
                </ul>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
};

export default BaseDeDados;
