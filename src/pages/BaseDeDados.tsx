import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
              Meus Dados
            </h1>
          </div>

          {/* Seção de Configuração do Chatbot */}
          <div className="mb-8">
            <ConfigurationForm />
          </div>

          {/* Card principal da Base de Dados */}
          <div className="border border-green-400/30 rounded-lg bg-green-900/20 backdrop-blur-sm p-6">

            {/* Header da seção */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white/90">
                Adicione arquivos
              </h2>
              <p className="text-white/50 mt-2">
                Adicione arquivos à base de dados do seu chatbot.
              </p>
            </div>

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
            {/* <Card className="bg-green-800/30 border-green-600/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  💡 Dicas para sua Base de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100">
                <ul className="space-y-4 text-sl">
                  <li>• Inclua informações relevantes para o chatbot responder, como seus endereços, horários, telefones, emails, produtos e serviços que oferece.</li>
                  <li>• Atualize regularmente o conteúdo</li>
                </ul>
              </CardContent>
            </Card> */}

            {/* Card de formatos suportados */}
            {/* <Card className="bg-green-800/30 border-green-600/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  📁 Formatos Suportados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100">
                <ul className="space-y-4 text-sl">
                  <li>• <strong>TXT:</strong> Arquivos de texto simples. Crie no Word ou Google Drive e salve/exporte como arquivo de texto (txt).</li>
                  <li>• <strong>Em breve: </strong> PDF, .docx, áudio e imagens.</li>
                </ul>
              </CardContent>
            </Card> */}

          </div>

        </div>
      </div>
    </div>
  );
};

export default BaseDeDados;
