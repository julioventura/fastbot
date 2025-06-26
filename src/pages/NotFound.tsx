// Componente: NotFound
// Funcionalidade:
// Exibe uma página de erro 404 estilizada quando o usuário tenta acessar uma rota inexistente.
// A página inclui uma mensagem de erro, uma imagem ilustrativa de um chatbot confuso,
// e um link para retornar à página inicial.
// A página também se ajusta dinamicamente para compensar a altura do header fixo,
// garantindo que o conteúdo seja centralizado verticalmente na viewport visível.

// Funções e Constantes Principais:
// - NotFound (Componente): Componente principal da página 404.
// - location (const): Obtida de `useLocation()`, contém informações sobre a URL atual, usada para logar a rota não encontrada.
// - headerHeight (estado): Armazena a altura calculada do componente Header.
// - setHeaderHeight (função de estado): Atualiza o estado `headerHeight`.
// - useEffect (hook):
//   - Primeiro useEffect: Responsável por calcular a altura do header na montagem do componente e
//     adicionar/remover um event listener para recalcular em redimensionamentos da janela.
//     - calculateHeaderHeight (função interna): Calcula a altura do elemento header e atualiza o estado `headerHeight`.
//   - Segundo useEffect: Responsável por logar no console a rota que o usuário tentou acessar.

import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";
import chatbotConfusoImg from "@/assets/images/chatbot-confuso.svg";

// --- Componente NotFound ---
// Renderiza a página de erro 404.
const NotFound = () => {

  // --- Constante location ---
  // Obtém informações sobre a rota atual usando o hook useLocation do react-router-dom.
  const location = useLocation();

  // --- Estado headerHeight ---
  // Armazena a altura do componente Header para ajustar o layout da página.
  // Inicializado com 0.
  const [headerHeight, setHeaderHeight] = useState(0);

  // --- useEffect para Cálculo da Altura do Header ---
  // Este efeito é executado após a montagem do componente e limpo na desmontagem.
  // Ele calcula a altura do header e adiciona um listener para o evento de redimensionamento da janela.
  useEffect(() => {

    // --- Função calculateHeaderHeight ---
    // Seleciona o elemento do header no DOM e atualiza o estado `headerHeight` com sua altura.
    // Utiliza a classe '.sticky' para identificar o header, conforme definido em Header.tsx.
    const calculateHeaderHeight = () => {
      const headerElement = document.querySelector('header.sticky') as HTMLElement;
      if (headerElement) {
        setHeaderHeight(headerElement.offsetHeight);
      } else {
        // Fallback caso o header não seja encontrado imediatamente ou para SSR.
        setHeaderHeight(0); 
      }
    };

    calculateHeaderHeight(); // Calcula na montagem inicial

    // Adiciona um listener para recalcular se a janela for redimensionada,
    // pois a altura do header pode mudar (ex: em layouts responsivos).
    window.addEventListener('resize', calculateHeaderHeight);

    // --- Limpeza do useEffect ---
    // Remove o event listener quando o componente é desmontado para evitar memory leaks.
    return () => {
      window.removeEventListener('resize', calculateHeaderHeight);
    };
  }, []); // Array de dependências vazio para executar apenas na montagem e desmontagem.

  // --- useEffect para Log de Rota Não Encontrada ---
  // Este efeito é executado sempre que o `location.pathname` (a rota atual) muda.
  // Registra no console a tentativa de acesso a uma rota inexistente.
  useEffect(() => {
    console.log(
      "404 Info: Tentativa de acesso a endereço inexistente: ",
      location.pathname
    );
  }, [location.pathname]); // Array de dependências com `location.pathname`.

  // --- Retorno do JSX do Componente ---
  // Renderiza a estrutura visual da página 404.
  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] flex flex-col items-center justify-center text-white text-center py-0 px-4"
      style={{ 
        // Aplica uma margem superior negativa igual à altura do header.
        // Isso "puxa" o contêiner da página para cima, fazendo com que seu topo
        // se alinhe com o topo da viewport (y=0), por baixo do header fixo.
        marginTop: `-${headerHeight}px`,
        // Ajusta a altura mínima do contêiner para ser 100% da altura da viewport mais a altura do header.
        // Isso compensa a margem negativa, permitindo que `justify-center` centralize
        // o conteúdo corretamente na área visível da tela, abaixo do header.
        minHeight: `calc(100vh + ${headerHeight}px)`,
      }}
    >
      <BackgroundDecoration />
      
      <div 
        className="relative z-10 flex flex-col items-center"
        // Adiciona um padding-top igual à altura do header ao contêiner do conteúdo.
        // Isso garante que o conteúdo visual (imagem, texto, botão) comece
        // abaixo do header, mesmo que o contêiner pai tenha sido deslocado para cima.
        // Comentado pois a centralização geral já deve cuidar disso se o conteúdo for menor que a tela.
        // Descomente se o conteúdo estiver sendo cortado pelo header.
        style={{ paddingTop: `${headerHeight}px` }} 
      >
        <img 
          src={chatbotConfusoImg} 
          alt="Chatbot confuso coçando a cabeça" 
          className="w-48 h-48 md:w-64 md:h-64 mb-8 opacity-90"
        />

        <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-gray-200 mb-6">
          Ooops! Página não encontrada!
        </p>

        <Link
          to="/"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg text-lg
                     drop-shadow-[0_0_10px_rgba(79,155,255,0.4)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.6)] 
                     transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Ir para a Página Inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
