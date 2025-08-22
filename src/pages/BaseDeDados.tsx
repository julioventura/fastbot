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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header da página */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Base de Dados
            </h1>
            <p className="text-lg text-green-200 max-w-3xl">
              Gerencie os arquivos de texto que seu chatbot usará para responder perguntas.
            </p>
          </div>

          {/* Card principal da Base de Dados */}
          <div className="border border-green-400/30 rounded-lg bg-green-900/20 backdrop-blur-sm">
            <Card className="bg-transparent border border-green-400/20 backdrop-blur-sm">

              <CardContent className="space-y-3 md:space-y-6 p-3 md:p-6">

                {/* Upload de Documentos */}
                <div>
                  <DocumentUpload />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card de dicas */}
            <Card className="bg-green-800/30 border-green-600/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  💡 Dicas para sua Base de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100 space-y-3">
                <ul className="space-y-2 text-sm">
                  {/* <li>• Use arquivos PDF, DOC, TXT ou MD</li> */}
                  <li>• Inclua informações relevantes para o chatbot responder</li>
                  <li>• Mantenha os textos organizados e claros</li>
                  <li>• Atualize regularmente o conteúdo</li>
                </ul>
              </CardContent>
            </Card>

            {/* Card de formatos suportados */}
            <Card className="bg-green-800/30 border-green-600/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  📁 Formatos Suportados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100 space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• <strong>TXT:</strong> Arquivos de texto simples<br /> &nbsp;</li>
                  <li>• <strong>Em breve: </strong> PDF, DOCX e imagens</li>
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
