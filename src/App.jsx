import { useState, useEffect, useCallback } from "react";

const DARK = {
  bg:"#0D0D0D", surface:"#1A1A1A", card:"#202020", hover:"#2A2A2A",
  border:"#2C2C2C", text:"#F0F0F0", muted:"#A0A0A0", subtle:"#555",
  accent:"#00D4AA", warn:"#F5A623", danger:"#FF4D4D",
  purple:"#9B8BFF", mono:"'JetBrains Mono','Fira Code',monospace", r:8, rLg:14,
};
const LIGHT = {
  bg:"#F5F5F5", surface:"#FFFFFF", card:"#FAFAFA", hover:"#F0F0F0",
  border:"#E0E0E0", text:"#111111", muted:"#444444", subtle:"#999",
  accent:"#009E80", warn:"#D4890A", danger:"#CC3333",
  purple:"#6B5BE6", mono:"'JetBrains Mono','Fira Code',monospace", r:8, rLg:14,
};

const SK = {
  favs:"alttab_favorites", progress:"alttab_progress",
  last:"alttab_last_flow", theme:"alttab_theme", universe:"alttab_universe",
};
const load = k => { try { return JSON.parse(localStorage.getItem(k)||"null"); } catch { return null; } };
const save = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };

// ─── UNIVERSOS ───────────────────────────────────────────────────────────────
const UNIVERSES = {
  vibe: {
    id:"vibe", label:"🚀 Vibe Coding",
    desc:"GitHub · Vercel · Supabase · React",
    accent:"#00D4AA",
    cats:["Deploy","Supabase","Git","Ambiente","Arquitetura"],
  },
  power: {
    id:"power", label:"⚡ Power Platform",
    desc:"Power Automate · Apps · BI · Teams · Excel",
    accent:"#9B8BFF",
    cats:["Power Automate","Power Apps","Excel / Power Query","Teams & Outlook"],
  },
};

// ─── FLUXOS: VIBE CODING ─────────────────────────────────────────────────────
const FLOWS_VIBE = [
  {
    id:"deploy-vercel", nome:"Deploy: GitHub → Vercel",
    universo:"vibe", categoria:"Deploy", icone:"▲", tempo:"10 min",
    prereqs:["Conta GitHub com repositório criado","Conta Vercel (gratuita)"],
    passos:[
      {acao:"Acesse vercel.com e faça login", onde:"vercel.com", cmd:null},
      {acao:"Clique em Add New → Project", onde:"Dashboard Vercel", cmd:null},
      {acao:"Selecione o repositório GitHub", onde:"Import Git Repository", cmd:null},
      {acao:"Configure o Framework Preset", onde:"Configure Project", cmd:"Vite · Create React App · Next.js"},
      {acao:"Configure o Output Directory", onde:"Build & Output Settings", cmd:"dist"},
      {acao:"Adicione variáveis de ambiente", onde:"Environment Variables", cmd:"VITE_API_URL=https://..."},
      {acao:"Clique em Deploy e aguarde", onde:"Vercel", cmd:null},
    ],
    avisos:[
      {nivel:"warn", texto:"Variáveis de ambiente NÃO seguem o deploy automaticamente — adicione antes de clicar em Deploy."},
      {nivel:"warn", texto:"Output directory: Vite usa 'dist', CRA usa 'build'. Confundir gera 404 no deploy."},
      {nivel:"danger", texto:"Após adicionar variáveis na Vercel, sempre clique em Redeploy — o build atual ainda usa as antigas."},
    ],
    links:[
      {nome:"Vercel Dashboard", url:"https://vercel.com/dashboard"},
      {nome:"Vercel Docs — Build Output", url:"https://vercel.com/docs/build-output-api"},
    ],
  },
  {
    id:"deploy-ghpages", nome:"Deploy: GitHub Pages",
    universo:"vibe", categoria:"Deploy", icone:"▲", tempo:"15 min",
    prereqs:["Repositório GitHub com projeto Vite ou CRA","Node.js instalado"],
    passos:[
      {acao:"Instale o pacote gh-pages", onde:"Terminal", cmd:"npm install --save-dev gh-pages"},
      {acao:"Configure o base no vite.config.js", onde:"vite.config.js", cmd:"base: '/nome-do-repo/',"},
      {acao:"Adicione os scripts no package.json", onde:"package.json", cmd:'"predeploy": "npm run build",\n"deploy": "gh-pages -d dist"'},
      {acao:"Execute o deploy", onde:"Terminal", cmd:"npm run deploy"},
      {acao:"Ative o GitHub Pages na branch gh-pages", onde:"GitHub → Settings → Pages", cmd:"Branch: gh-pages / root"},
      {acao:"Aguarde ~2 min e acesse a URL gerada", onde:"GitHub → Settings → Pages", cmd:null},
    ],
    avisos:[
      {nivel:"danger", texto:"Esquecer o 'base' no vite.config.js gera 404 em TODOS os assets — a página abre em branco sem erro óbvio."},
      {nivel:"warn", texto:"Para CRA, o output é 'build', não 'dist'. Ajuste o script: gh-pages -d build."},
    ],
    links:[
      {nome:"GitHub Pages Docs", url:"https://docs.github.com/en/pages"},
      {nome:"gh-pages npm", url:"https://www.npmjs.com/package/gh-pages"},
    ],
  },
  {
    id:"github-editar-browser", nome:"Editar arquivo direto no GitHub",
    universo:"vibe", categoria:"Deploy", icone:"▲", tempo:"5 min",
    prereqs:["Conta GitHub com repositório","Chrome com tradução automática desativada"],
    passos:[
      {acao:"ANTES: desative tradução automática do Chrome", onde:"Chrome → ícone de tradução na barra", cmd:"⋮ → Nunca traduzir esta página"},
      {acao:"Navegue até o arquivo no repositório", onde:"github.com → seu repo", cmd:null},
      {acao:"Clique no ícone de lápis (Edit this file)", onde:"Canto superior direito do arquivo", cmd:null},
      {acao:"Selecione tudo e substitua", onde:"Editor do GitHub", cmd:"Ctrl+A → Delete → Cole o novo conteúdo"},
      {acao:"Clique em Commit changes", onde:"Botão verde inferior", cmd:null},
    ],
    avisos:[
      {nivel:"danger", texto:"O Chrome traduz tags HTML como <head> para <cabeça> silenciosamente. Desative a tradução ANTES — o código quebra sem erro visível."},
      {nivel:"warn", texto:"Para arquivos grandes, prefira editar localmente e fazer push — o editor do GitHub não tem undo robusto."},
    ],
    links:[
      {nome:"GitHub — Editing Files", url:"https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files"},
    ],
  },
  {
    id:"supabase-zero", nome:"Supabase: projeto do zero",
    universo:"vibe", categoria:"Supabase", icone:"⚡", tempo:"20 min",
    prereqs:["Conta Supabase (gratuita)","Nome e colunas da tabela em mãos"],
    passos:[
      {acao:"Crie um novo projeto no Supabase", onde:"supabase.com → New Project", cmd:null},
      {acao:"Aguarde o provisionamento (~2 min)", onde:"Dashboard Supabase", cmd:null},
      {acao:"Crie a tabela no SQL Editor", onde:"SQL Editor", cmd:"CREATE TABLE tarefas (\n  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n  titulo text NOT NULL,\n  criado_em timestamptz DEFAULT now()\n);"},
      {acao:"Ative RLS na tabela", onde:"Table Editor → sua tabela → RLS", cmd:"Enable Row Level Security"},
      {acao:"Crie uma policy de acesso", onde:"Authentication → Policies → New Policy", cmd:"CREATE POLICY leitura_publica ON tarefas\nFOR SELECT USING (true);"},
      {acao:"⚠️ PASSO OCULTO: ative a tabela na Data API", onde:"Project Settings → Data API → Exposed Tables", cmd:"Marque a tabela individualmente"},
      {acao:"Copie as credenciais", onde:"Project Settings → API", cmd:"Project URL + anon key"},
    ],
    avisos:[
      {nivel:"danger", texto:"PASSO OCULTO: mesmo com o schema 'public' exposto, cada tabela precisa ser ativada individualmente em Settings → Data API → Exposed Tables. Sem isso: erro 'API DISABLED'."},
      {nivel:"warn", texto:"RLS ativado SEM nenhuma policy bloqueia tudo silenciosamente — nenhum erro, zero dados retornados."},
    ],
    links:[
      {nome:"Supabase Dashboard", url:"https://supabase.com/dashboard"},
      {nome:"Supabase Docs — RLS", url:"https://supabase.com/docs/guides/auth/row-level-security"},
    ],
  },
  {
    id:"supabase-react", nome:"Supabase: conectar no React",
    universo:"vibe", categoria:"Supabase", icone:"⚡", tempo:"10 min",
    prereqs:["Projeto Supabase criado e funcional","Projeto React existente","Project URL e anon key em mãos"],
    passos:[
      {acao:"Instale o cliente Supabase via npm", onde:"Terminal", cmd:"# Pesquise 'supabase js' no npmjs.com\n# Instale o pacote oficial da Supabase"},
      {acao:"Crie o arquivo de cliente (src/db.js)", onde:"src/db.js", cmd:"// Crie o cliente com createClient(URL, ANON_KEY)\n// Consulte: supabase.com/docs/reference/javascript"},
      {acao:"Crie o arquivo .env na raiz", onde:".env", cmd:"VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJh..."},
      {acao:"Adicione .env ao .gitignore", onde:".gitignore", cmd:".env\n.env.local"},
      {acao:"Use o cliente nos seus componentes", onde:"src/App.jsx", cmd:"// Importe supabase de src/db.js\n// Use: supabase.from('tabela').select('*')"},
    ],
    avisos:[
      {nivel:"danger", texto:"NUNCA use a service_role key no frontend — ela bypassa o RLS e expõe o banco inteiro."},
      {nivel:"warn", texto:"Variáveis Vite precisam do prefixo VITE_. Sem ele, import.meta.env retorna undefined silenciosamente."},
      {nivel:"warn", texto:"Adicione .env ao .gitignore ANTES do primeiro commit."},
    ],
    links:[
      {nome:"Supabase JS Docs", url:"https://supabase.com/docs/reference/javascript"},
    ],
  },
  {
    id:"supabase-auth", nome:"Supabase Auth: autenticação completa",
    universo:"vibe", categoria:"Supabase", icone:"⚡", tempo:"25 min",
    prereqs:["Supabase conectado no React","Tabela de usuários ou uso do auth embutido"],
    passos:[
      {acao:"Habilite o provider de email", onde:"Authentication → Providers → Email", cmd:"Enable Email Provider: ON"},
      {acao:"Desative confirmação de email (só em dev)", onde:"Authentication → Email Templates", cmd:"Desmarque 'Enable email confirmations'"},
      {acao:"Implemente o cadastro", onde:"seu componente", cmd:"supabase.auth.signUp({ email, password })"},
      {acao:"Implemente o login", onde:"seu componente", cmd:"supabase.auth.signInWithPassword({ email, password })"},
      {acao:"Escute mudanças de sessão — CRÍTICO", onde:"App.jsx — useEffect", cmd:"supabase.auth.onAuthStateChange((event, session) => {\n  setUser(session?.user ?? null)\n})"},
      {acao:"Implemente o logout", onde:"seu componente", cmd:"supabase.auth.signOut()"},
    ],
    avisos:[
      {nivel:"danger", texto:"Sem onAuthStateChange, o usuário desaparece ao recarregar — o estado de auth não persiste sem esse listener."},
      {nivel:"warn", texto:"Em produção, reative a confirmação de email."},
    ],
    links:[
      {nome:"Supabase Auth Docs", url:"https://supabase.com/docs/guides/auth"},
    ],
  },
  {
    id:"supabase-debug", nome:"Supabase: depurar 'API DISABLED'",
    universo:"vibe", categoria:"Supabase", icone:"⚡", tempo:"5 min",
    prereqs:["Projeto Supabase com tabela criada","App salvando localmente mas não gravando no banco"],
    passos:[
      {acao:"Confirme o sintoma: dados não aparecem no Supabase", onde:"seu app + Supabase Table Editor", cmd:null},
      {acao:"Acesse as configurações da Data API", onde:"Project Settings → Integrations → Data API", cmd:null},
      {acao:"Clique em Settings dentro de Data API", onde:"Data API → Settings", cmd:null},
      {acao:"Verifique 'Exposed Tables'", onde:"Exposed Tables", cmd:"Deve mostrar '0 of N tables exposed'"},
      {acao:"Marque a tabela individualmente", onde:"checkbox ao lado do nome da tabela", cmd:"Marque e salve"},
      {acao:"Teste novamente no app", onde:"seu app", cmd:null},
    ],
    avisos:[
      {nivel:"danger", texto:"Este passo NÃO está claro na documentação oficial — expor o schema 'public' não é suficiente. Cada tabela precisa ser ativada individualmente."},
    ],
    links:[
      {nome:"Supabase — Data API Settings", url:"https://supabase.com/dashboard/project/_/settings/api"},
    ],
  },
  {
    id:"git-essencial", nome:"Git essencial: clone, commit, push, branch",
    universo:"vibe", categoria:"Git", icone:">_", tempo:"10 min",
    prereqs:["Git instalado (git --version)","Conta GitHub","Repositório criado no GitHub"],
    passos:[
      {acao:"Clone um repositório existente", onde:"Terminal", cmd:"git clone https://github.com/usuario/repo.git"},
      {acao:"Prepare e commite suas alterações", onde:"Terminal", cmd:"git add .\ngit commit -m 'descricao clara do que mudou'"},
      {acao:"Envie para o GitHub", onde:"Terminal", cmd:"git push origin main"},
      {acao:"Crie uma nova branch", onde:"Terminal", cmd:"git checkout -b minha-feature"},
      {acao:"Troque de branch", onde:"Terminal", cmd:"git checkout main"},
      {acao:"Merge de uma branch para main", onde:"Terminal", cmd:"git checkout main\ngit merge minha-feature"},
      {acao:"Verifique o status", onde:"Terminal", cmd:"git status"},
    ],
    avisos:[
      {nivel:"warn", texto:"Pré-requisito silencioso de todos os outros fluxos — sem Git funcionando, deploy e colaboração travam."},
      {nivel:"warn", texto:"Mensagens de commit vagas ('update', 'fix') impossibilitam debugar o histórico. Seja específico."},
    ],
    links:[
      {nome:"Git — Documentação Oficial", url:"https://git-scm.com/doc"},
    ],
  },
  {
    id:"variaveis-ambiente", nome:"Variáveis de ambiente: local → produção",
    universo:"vibe", categoria:"Ambiente", icone:"⚙", tempo:"10 min",
    prereqs:["Projeto React/Vite ou CRA","Deploy no Vercel ou GitHub Pages"],
    passos:[
      {acao:"Crie o arquivo .env na raiz do projeto", onde:"raiz do projeto", cmd:"VITE_MINHA_CHAVE=valor_aqui\n# Para CRA: REACT_APP_MINHA_CHAVE=valor"},
      {acao:"Adicione ao .gitignore IMEDIATAMENTE", onde:".gitignore", cmd:".env\n.env.local\n.env.production.local"},
      {acao:"Use a variável no código", onde:"qualquer .js/.jsx", cmd:"// Vite:\nimport.meta.env.VITE_MINHA_CHAVE\n\n// CRA:\nprocess.env.REACT_APP_MINHA_CHAVE"},
      {acao:"Configure na Vercel", onde:"Vercel → Settings → Environment Variables", cmd:"Nome: VITE_MINHA_CHAVE | Valor: valor_aqui"},
      {acao:"Faça Redeploy após adicionar", onde:"Vercel → Deployments → ⋮ → Redeploy", cmd:null},
    ],
    avisos:[
      {nivel:"danger", texto:"Adicionar variáveis na Vercel NÃO afeta o deploy atual — é obrigatório fazer Redeploy."},
      {nivel:"warn", texto:"Vite usa VITE_ como prefixo. CRA usa REACT_APP_. Misturar prefixos retorna undefined sem erro."},
    ],
    links:[
      {nome:"Vite — Env Variables", url:"https://vitejs.dev/guide/env-and-mode"},
      {nome:"Vercel — Environment Variables", url:"https://vercel.com/docs/concepts/projects/environment-variables"},
    ],
  },
  {
    id:"mcp-claude", nome:"MCP: conectar Claude com ferramentas externas",
    universo:"vibe", categoria:"Ambiente", icone:"⚙", tempo:"10 min",
    prereqs:["Claude Desktop instalado","Servidor MCP a configurar"],
    passos:[
      {acao:"Abra as configurações do Claude Desktop", onde:"Claude Desktop → Settings → Developer", cmd:null},
      {acao:"Clique em 'Edit Config'", onde:"Settings → Developer", cmd:null},
      {acao:"Localize o arquivo de configuração", onde:"claude_desktop_config.json", cmd:"macOS: ~/Library/Application Support/Claude/\nWindows: %APPDATA%\\Claude\\"},
      {acao:"Adicione o servidor MCP ao JSON", onde:"claude_desktop_config.json", cmd:'{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/caminho"]\n    }\n  }\n}'},
      {acao:"Salve e reinicie o Claude Desktop completamente", onde:"Claude Desktop", cmd:"Feche completamente e reabra"},
      {acao:"Confirme que o servidor aparece nas ferramentas", onde:"Claude Desktop → novo chat → Tools", cmd:null},
    ],
    avisos:[
      {nivel:"danger", texto:"JSON com vírgula extra após o último item gera erro silencioso — o servidor simplesmente não aparece."},
      {nivel:"danger", texto:"Não reiniciar o Claude Desktop após editar o config = mudança não aplicada."},
    ],
    links:[
      {nome:"MCP Servers — Lista oficial", url:"https://github.com/modelcontextprotocol/servers"},
    ],
  },
  {
    id:"app-arquivo-unico", nome:"App arquivo único: HTML + CSS + JS",
    universo:"vibe", categoria:"Arquitetura", icone:"◈", tempo:"15 min",
    prereqs:["Editor de código","Caso de uso: protótipo, ferramenta interna, app corporativo simples"],
    passos:[
      {acao:"Crie um único arquivo index.html", onde:"Pasta do projeto", cmd:"touch index.html"},
      {acao:"Estruture com HTML + style + script no mesmo arquivo", onde:"index.html", cmd:"<!DOCTYPE html>\n<html lang='pt-BR'>\n<head>\n  <style>/* CSS aqui */</style>\n</head>\n<body>\n  <!-- HTML aqui -->\n  <script>\n    // JS aqui\n    const DADOS = [];\n  </script>\n</body>\n</html>"},
      {acao:"Use CDNs no lugar de imports/npm", onde:"dentro do head", cmd:"<script src='https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js'></script>"},
      {acao:"Use localStorage para persistência", onde:"seu script", cmd:"localStorage.setItem('dados', JSON.stringify(arr))\nconst dados = JSON.parse(localStorage.getItem('dados') || '[]')"},
      {acao:"Publique no GitHub Pages sem build step", onde:"GitHub → Settings → Pages", cmd:"Branch: main / root"},
    ],
    avisos:[
      {nivel:"warn", texto:"Sem hot reload — edite, salve e recarregue manualmente (F5)."},
      {nivel:"warn", texto:"Sem modularização — escala mal acima de ~500 linhas. Migre para React quando isso acontecer."},
    ],
    links:[
      {nome:"jsDelivr — CDN para npm packages", url:"https://www.jsdelivr.com/"},
    ],
  },
  {
    id:"localstorage", nome:"localStorage vs sessionStorage",
    universo:"vibe", categoria:"Arquitetura", icone:"◈", tempo:"8 min",
    prereqs:["Projeto web (qualquer stack)"],
    passos:[
      {acao:"localStorage: persiste entre sessões", onde:"JavaScript", cmd:"localStorage.setItem('chave', JSON.stringify(dados))\nconst dados = JSON.parse(localStorage.getItem('chave') || 'null')"},
      {acao:"sessionStorage: apaga ao fechar a aba", onde:"JavaScript", cmd:"sessionStorage.setItem('chave', JSON.stringify(dados))\nconst dados = JSON.parse(sessionStorage.getItem('chave') || 'null')"},
      {acao:"Verifique o que está salvo", onde:"DevTools → Application → Storage", cmd:"F12 → Application → Local Storage"},
      {acao:"Limpe os dados quando necessário", onde:"JavaScript", cmd:"localStorage.removeItem('chave')\nlocalStorage.clear()"},
    ],
    avisos:[
      {nivel:"danger", texto:"sessionStorage apaga ao FECHAR A ABA — dados somem sem erro e parecem bug. Use localStorage para persistência real."},
      {nivel:"warn", texto:"Limite de ~5MB por origem. Sempre use JSON.parse/stringify — localStorage só armazena strings."},
    ],
    links:[
      {nome:"MDN — localStorage", url:"https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage"},
    ],
  },
];

// ─── FLUXOS: POWER PLATFORM ──────────────────────────────────────────────────
const FLOWS_POWER = [
  {
    id:"pcm-os-sem-inicio", nome:"Alerta: OS aberta sem início há +48h",
    universo:"power", categoria:"Power Automate", icone:"⚡", tempo:"20 min",
    prereqs:["Planilha de OSs no SharePoint ou OneDrive (Excel Online)","Acesso ao Power Automate"],
    passos:[
      {acao:"Abra o Power Automate e crie um fluxo Agendado", onde:"power.automate.com → Criar → Agendado", cmd:"Frequência: a cada 1 hora (ou 8h e 14h)"},
      {acao:"Adicione ação: Obter linhas de uma tabela", onde:"Excel Online (Business) → Obter linhas presentes em uma tabela", cmd:"Arquivo: planilha_OSs.xlsx\nTabela: Tabela_OS"},
      {acao:"Adicione ação: Filtrar matriz", onde:"Dados → Filtrar matriz", cmd:"Filtro: Status eq 'Aberta' AND Data_Abertura lt addHours(utcNow(), -48)"},
      {acao:"Adicione condição: há OSs no resultado?", onde:"Controle → Condição", cmd:"length(body('Filtrar_matriz')) greater than 0"},
      {acao:"Se SIM: poste mensagem no Teams", onde:"Microsoft Teams → Postar mensagem em um canal", cmd:"Canal: PCM - Manutenção\nMensagem: ⚠️ OSs sem início há mais de 48h:\n@{body('Filtrar_matriz')}"},
      {acao:"Salve e teste o fluxo", onde:"Power Automate → Testar", cmd:"Testar manualmente primeiro"},
    ],
    avisos:[
      {nivel:"danger", texto:"A coluna de data na planilha precisa estar formatada como Data/Hora — texto puro não funciona na comparação."},
      {nivel:"warn", texto:"O filtro usa UTC. Ajuste subtraindo 3h se suas datas estão em horário de Brasília: addHours(utcNow(), -51)."},
      {nivel:"warn", texto:"Teste com uma OS de data antiga antes de ativar — garante que o filtro está funcionando corretamente."},
    ],
    links:[
      {nome:"Power Automate — Filtrar matriz", url:"https://learn.microsoft.com/pt-br/power-automate/data-operations"},
      {nome:"Excel Online — Connector", url:"https://learn.microsoft.com/pt-br/connectors/excelonlinebusiness/"},
    ],
  },
  {
    id:"pcm-arquivo-morto", nome:"Atualização do arquivo morto (PCM)",
    universo:"power", categoria:"Excel / Power Query", icone:"📊", tempo:"25 min",
    prereqs:["Arquivo morto em Excel com histórico de OSs/manutenções","Exportação do sistema (PIMS/ERP) em .xlsx ou .csv"],
    passos:[
      {acao:"Exporte os dados do sistema de manutenção", onde:"PIMS/ERP → Exportar → Excel ou CSV", cmd:"Período: mês atual\nColunas: OS, Equipamento, Data, Status, Responsável"},
      {acao:"Abra o Excel e acesse o Power Query", onde:"Dados → Obter Dados → De Arquivo → De Pasta de Trabalho", cmd:null},
      {acao:"Trate as colunas: remova nulos, ajuste tipos", onde:"Power Query → Transformar", cmd:"Tipo de dado: Data, Número, Texto\nRemover linhas em branco: Início → Remover Linhas → Remover Linhas em Branco"},
      {acao:"Separe campos concatenados (ex: Cód+Descrição)", onde:"Power Query → Transformar → Dividir Coluna", cmd:"Por delimitador: - ou espaço"},
      {acao:"Carregue na aba 'Histórico' do arquivo morto", onde:"Power Query → Fechar e Carregar em...", cmd:"Carregue em: Tabela existente → aba Histórico"},
      {acao:"Atualize o arquivo todo mês com Atualizar Tudo", onde:"Dados → Atualizar Tudo", cmd:null},
    ],
    avisos:[
      {nivel:"danger", texto:"Campos que concatenam código + texto (ex: '001 - Compressor') podem acionar falso positivo de DLP corporativo — verifique com o TI antes de exportar."},
      {nivel:"warn", texto:"Sempre salve uma cópia do arquivo morto antes de carregar novos dados — uma query errada pode sobrescrever o histórico."},
      {nivel:"warn", texto:"Se a estrutura da exportação mudar (nova coluna, ordem diferente), o Power Query vai quebrar. Revise após atualizações do sistema."},
    ],
    links:[
      {nome:"Power Query — Dividir Coluna", url:"https://learn.microsoft.com/pt-br/power-query/split-columns-delimiter"},
      {nome:"Power Query — Tipos de dados", url:"https://learn.microsoft.com/pt-br/power-query/data-types"},
    ],
  },
  {
    id:"pcm-contratos", nome:"Acompanhamento de contratos e vencimentos",
    universo:"power", categoria:"Power Automate", icone:"⚡", tempo:"30 min",
    prereqs:["Planilha de contratos no SharePoint (com colunas: Contrato, Fornecedor, Vencimento, Status, Responsável)","Acesso ao Power Automate e Outlook"],
    passos:[
      {acao:"Monte a planilha de contratos no Excel Online", onde:"SharePoint → nova planilha", cmd:"Colunas obrigatórias:\nContrato | Fornecedor | Data_Vencimento | Status | Responsável | E-mail_Responsável"},
      {acao:"Crie fluxo agendado: roda todo dia às 07h", onde:"Power Automate → Agendado", cmd:"Recorrência: Diária às 07:00"},
      {acao:"Obtenha as linhas da planilha de contratos", onde:"Excel Online → Obter linhas", cmd:"Tabela: Tabela_Contratos"},
      {acao:"Filtre contratos vencendo em 30 dias", onde:"Dados → Filtrar matriz", cmd:"Data_Vencimento lt addDays(utcNow(), 30)\nAND Status eq 'Ativo'"},
      {acao:"Para cada contrato: envie e-mail ao responsável", onde:"Aplicar a cada um → Outlook → Enviar e-mail", cmd:"Para: E-mail_Responsável\nAssunto: ⚠️ Contrato vencendo: @{items('Aplicar_a_cada_um')?['Contrato']}\nCorpo: Vencimento em @{items('Aplicar_a_cada_um')?['Data_Vencimento']}"},
      {acao:"Adicione alerta de 7 dias (crítico) no Teams", onde:"Se Data_Vencimento lt addDays(utcNow(), 7) → Teams", cmd:"Canal: PCM - Contratos\n🔴 URGENTE: contrato vence em menos de 7 dias"},
    ],
    avisos:[
      {nivel:"danger", texto:"Se o campo de e-mail estiver vazio na planilha, o fluxo falha. Valide que todos os contratos têm responsável preenchido."},
      {nivel:"warn", texto:"Datas no Excel precisam estar em formato ISO (AAAA-MM-DD) para o Power Automate comparar corretamente. Datas como 'Jan/2025' não funcionam."},
    ],
    links:[
      {nome:"Power Automate — addDays", url:"https://learn.microsoft.com/pt-br/azure/logic-apps/workflow-definition-language-functions-reference#adddays"},
      {nome:"Outlook — Connector", url:"https://learn.microsoft.com/pt-br/connectors/office365/"},
    ],
  },
  {
    id:"pcm-notas-fiscais", nome:"Controle de NFs e autorização de faturamento",
    universo:"power", categoria:"Power Automate", icone:"⚡", tempo:"35 min",
    prereqs:["Fluxo de NFs definido (quem envia, quem aprova)","Acesso ao Power Automate, Outlook e Teams"],
    passos:[
      {acao:"Crie um Forms para entrada da NF", onde:"forms.microsoft.com → Novo formulário", cmd:"Campos: Fornecedor | Número NF | Valor | OS Vinculada | Anexo (PDF)"},
      {acao:"Crie fluxo acionado pelo Forms", onde:"Power Automate → Automatizado → Ao enviar resposta do Forms", cmd:null},
      {acao:"Salve o anexo no SharePoint", onde:"SharePoint → Criar arquivo", cmd:"Pasta: NFs/[Ano]/[Mês]\nNome: NF_@{body('Obter_resposta')?['Numero_NF']}.pdf"},
      {acao:"Envie aprovação formal ao gestor financeiro", onde:"Power Automate → Aprovações → Iniciar e aguardar aprovação", cmd:"Tipo: Aprovação básica\nAtribuída a: email_gestor@empresa.com\nDetalhes: Fornecedor | Valor | OS Vinculada | Link do arquivo"},
      {acao:"Se aprovado: atualize status na planilha e notifique", onde:"Condição → Excel Online → Atualizar linha", cmd:"Status: Aprovada para Faturamento\nData_Aprovação: utcNow()"},
      {acao:"Se rejeitado: notifique o solicitante com o motivo", onde:"Outlook → Enviar e-mail", cmd:"Assunto: NF @{numero} — Reprovada\nCorpo: Motivo: @{outputs('Iniciar_aprovacao')?['body/comments']}"},
    ],
    avisos:[
      {nivel:"warn", texto:"O Forms não aceita anexos acima de 10MB por padrão — NFs com muitas páginas podem exceder. Oriente os usuários a compactarem o PDF."},
      {nivel:"warn", texto:"O fluxo de aprovação expira após 30 dias sem resposta — configure um lembrete automático em 5 dias."},
    ],
    links:[
      {nome:"Power Automate — Aprovações", url:"https://learn.microsoft.com/pt-br/power-automate/get-started-approvals"},
      {nome:"MS Forms — Connector", url:"https://learn.microsoft.com/pt-br/connectors/microsoftforms/"},
    ],
  },
  {
    id:"pcm-requisicao-materiais", nome:"Requisição de materiais e serviços",
    universo:"power", categoria:"Power Apps", icone:"📱", tempo:"40 min",
    prereqs:["Licença Power Apps (M365 Business inclui versão básica)","Planilha de estoque no SharePoint"],
    passos:[
      {acao:"Crie o app no Power Apps (tela em branco)", onde:"make.powerapps.com → Criar → Aplicativo de tela", cmd:"Layout: Telefone (uso mobile na fábrica)"},
      {acao:"Conecte à planilha de estoque como fonte de dados", onde:"Exibir → Fontes de dados → Excel Online", cmd:"Conecte o arquivo de estoque do SharePoint"},
      {acao:"Monte tela de seleção de itens (tipo carrinho)", onde:"Power Apps → inserir Gallery", cmd:"Gallery vertical com: Nome do item | Saldo atual | campo de quantidade"},
      {acao:"Adicione botão 'Requisitar' com validação de saldo", onde:"Botão → OnSelect", cmd:"If(QuantidadeSolicitada > SaldoAtual,\n  Notify('Saldo insuficiente', NotificationType.Error),\n  Patch(Estoque, {Saldo: SaldoAtual - QuantidadeSolicitada})\n)"},
      {acao:"Dispare fluxo no Power Automate ao requisitar", onde:"Power Apps → Power Automate → Adicionar fluxo", cmd:"Fluxo: registra requisição e notifica o almoxarife no Teams"},
      {acao:"Publique e compartilhe o app com a equipe", onde:"Arquivo → Publicar → Compartilhar", cmd:null},
    ],
    avisos:[
      {nivel:"warn", texto:"Power Apps com Excel como fonte de dados tem limitação de ~500 linhas sem delegação. Para estoques maiores, use SharePoint List ou Dataverse."},
      {nivel:"warn", texto:"A função Patch() atualiza diretamente — sem confirmação. Adicione um popup de confirmação antes de executar."},
    ],
    links:[
      {nome:"Power Apps — Patch function", url:"https://learn.microsoft.com/pt-br/power-apps/maker/canvas-apps/functions/function-patch"},
      {nome:"Power Apps — Gallery control", url:"https://learn.microsoft.com/pt-br/power-apps/maker/canvas-apps/controls/control-gallery"},
    ],
  },
  {
    id:"pcm-agenda-carro", nome:"Controle de agenda de veículos",
    universo:"power", categoria:"Power Apps", icone:"📱", tempo:"30 min",
    prereqs:["Licença Power Apps","Lista no SharePoint para registrar agendamentos"],
    passos:[
      {acao:"Crie uma Lista no SharePoint para agendamentos", onde:"SharePoint → + Novo → Lista", cmd:"Colunas: Veículo | Solicitante | Data_Saída | Data_Retorno | Destino | OS_Vinculada | Status"},
      {acao:"Crie app no Power Apps conectado à lista", onde:"make.powerapps.com → Criar a partir do SharePoint", cmd:"Selecione a lista criada — o Power Apps gera as telas automaticamente"},
      {acao:"Ajuste a tela de novo agendamento", onde:"Tela EditScreen", cmd:"Adicione validação: impedir datas sobrepostas para o mesmo veículo"},
      {acao:"Configure aprovação pelo gestor via Power Automate", onde:"Power Automate → acionado por novo item na lista", cmd:"Status inicial: Pendente → gestor aprova → Status: Aprovado"},
      {acao:"Adicione visualização de calendário", onde:"Power Apps → inserir controle Calendar", cmd:"Conecte ao campo Data_Saída para visualizar conflitos"},
      {acao:"Publique e envie link para a equipe", onde:"Arquivo → Publicar → Compartilhar link", cmd:null},
    ],
    avisos:[
      {nivel:"warn", texto:"O controle de calendário nativo do Power Apps é limitado — para visualização rica, considere integrar com o calendário do Outlook via Power Automate."},
      {nivel:"warn", texto:"Defina quem pode aprovar no fluxo — sem aprovação configurada, qualquer solicitação fica com status 'Pendente' indefinidamente."},
    ],
    links:[
      {nome:"Power Apps — SharePoint Integration", url:"https://learn.microsoft.com/pt-br/power-apps/maker/canvas-apps/connections/connection-sharepoint-online"},
    ],
  },
  {
    id:"pcm-radios", nome:"Controle de rádios (empréstimo e devolução)",
    universo:"power", categoria:"Power Apps", icone:"📱", tempo:"25 min",
    prereqs:["Lista no SharePoint com inventário de rádios","Power Apps com licença básica"],
    passos:[
      {acao:"Crie lista de inventário de rádios no SharePoint", onde:"SharePoint → Nova Lista", cmd:"Colunas: ID_Radio | Patrimônio | Status | Responsável_Atual | Data_Emprestimo | OS_Vinculada"},
      {acao:"Crie app de empréstimo/devolução", onde:"Power Apps → tela em branco", cmd:"2 telas: Emprestar rádio | Devolver rádio"},
      {acao:"Tela Emprestar: buscar rádio disponível e registrar", onde:"Power Apps", cmd:"Filter(Radios, Status = 'Disponível')\nPatch(Radios, {Status:'Em uso', Responsável: User().FullName, Data: Now()})"},
      {acao:"Tela Devolver: buscar rádios com responsável logado", onde:"Power Apps", cmd:"Filter(Radios, Responsável_Atual = User().FullName)\nPatch(Radios, {Status:'Disponível', Responsável:'', Data_Retorno: Now()})"},
      {acao:"Envie notificação no Teams ao emprestar/devolver", onde:"Power Automate acionado pelo Patch", cmd:"Canal: PCM - Equipamentos\nMensagem: Rádio @{ID} — @{ação} por @{usuario}"},
      {acao:"Publique e coloque QR Code de acesso rápido na sala", onde:"Power Apps → Compartilhar → link do app", cmd:"Gere QR Code do link em qr-code-generator.com"},
    ],
    avisos:[
      {nivel:"warn", texto:"User().FullName retorna o nome do usuário logado no M365 — garanta que todos os usuários do app têm conta no tenant."},
      {nivel:"warn", texto:"Sem validação, o mesmo rádio pode ser emprestado duas vezes. Adicione verificação de Status antes do Patch."},
    ],
    links:[
      {nome:"Power Apps — User() function", url:"https://learn.microsoft.com/pt-br/power-apps/maker/canvas-apps/functions/function-user"},
    ],
  },
  {
    id:"pcm-materiais-os", nome:"Materiais a aplicar por OS (analista)",
    universo:"power", categoria:"Excel / Power Query", icone:"📊", tempo:"20 min",
    prereqs:["Planilha de OSs com coluna de materiais necessários","Estoque atualizado em Excel Online"],
    passos:[
      {acao:"Monte a planilha com OSs abertas e materiais necessários", onde:"Excel Online no SharePoint", cmd:"Colunas: OS | Equipamento | Material_Necessário | Qtd_Necessária | Disponível_Estoque | Status_Material"},
      {acao:"Abra o Power Query e conecte ao estoque atual", onde:"Dados → Obter Dados → Do SharePoint Online", cmd:"Selecione a planilha de estoque"},
      {acao:"Faça o cruzamento entre OSs e estoque", onde:"Power Query → Mesclar Consultas", cmd:"Chave de cruzamento: código do material\nTipo: Junção Externa Esquerda (mantém todas as OSs)"},
      {acao:"Adicione coluna: 'Disponível_Estoque'", onde:"Power Query → Adicionar Coluna → Coluna Personalizada", cmd:"if [Saldo_Estoque] >= [Qtd_Necessária] then 'Sim' else 'Não'"},
      {acao:"Destaque em vermelho os materiais indisponíveis", onde:"Excel → Formatação Condicional", cmd:"Regra: se Disponível_Estoque = 'Não' → preenchimento vermelho"},
      {acao:"Atualize diariamente antes da reunião de manutenção", onde:"Dados → Atualizar Tudo", cmd:null},
    ],
    avisos:[
      {nivel:"warn", texto:"O código do material precisa ser idêntico nas duas planilhas — um espaço a mais ou maiúscula diferente faz o cruzamento falhar silenciosamente."},
      {nivel:"warn", texto:"Salve o arquivo como .xlsx — .xls não suporta Power Query completo."},
    ],
    links:[
      {nome:"Power Query — Mesclar Consultas", url:"https://learn.microsoft.com/pt-br/power-query/merge-queries-overview"},
    ],
  },
  {
    id:"pcm-digest-pendencias", nome:"Digest diário de pendências por e-mail",
    universo:"power", categoria:"Power Automate", icone:"⚡", tempo:"25 min",
    prereqs:["Planilha de controle de pendências no SharePoint","Acesso ao Power Automate e Outlook"],
    passos:[
      {acao:"Certifique-se que a planilha tem coluna Status e Vencimento", onde:"Excel Online → SharePoint", cmd:"Colunas: Tarefa | Responsável | E-mail | Status | Data_Vencimento"},
      {acao:"Crie fluxo agendado para 07h de segunda a sexta", onde:"Power Automate → Agendado", cmd:"Recorrência: Semanal\nDias: Seg, Ter, Qua, Qui, Sex\nHorário: 07:00"},
      {acao:"Obtenha linhas da planilha", onde:"Excel Online → Obter linhas", cmd:"Tabela: Tabela_Pendencias"},
      {acao:"Filtre pendências dos próximos 3 dias", onde:"Dados → Filtrar matriz", cmd:"Status eq 'Pendente'\nAND Data_Vencimento lt addDays(utcNow(), 3)"},
      {acao:"Monte tabela HTML com as pendências", onde:"Dados → Criar tabela HTML", cmd:"Colunas: Tarefa, Responsável, Data_Vencimento"},
      {acao:"Envie por Outlook com a tabela no corpo", onde:"Outlook → Enviar e-mail", cmd:"Para: lista_gestores@empresa.com\nAssunto: 📋 Pendências do dia — PCM\nCorpo: [tabela HTML gerada]"},
    ],
    avisos:[
      {nivel:"warn", texto:"A ação 'Criar tabela HTML' gera formatação básica. Para layout estilizado, construa o HTML manualmente com variáveis do fluxo."},
      {nivel:"warn", texto:"Se a planilha tiver mais de 256 linhas, use 'Obter linhas' com paginação ativada ou filtre antes no Power Query."},
    ],
    links:[
      {nome:"Power Automate — Criar tabela HTML", url:"https://learn.microsoft.com/pt-br/power-automate/data-operations#use-the-create-html-table-action"},
    ],
  },
  {
    id:"pcm-chamados-teams", nome:"Abertura de chamados de manutenção via Teams",
    universo:"power", categoria:"Teams & Outlook", icone:"💬", tempo:"30 min",
    prereqs:["Canal do Teams para a equipe de manutenção","Power Automate com acesso ao Teams e Excel/SharePoint"],
    passos:[
      {acao:"Crie um Forms para abertura de chamados", onde:"forms.microsoft.com", cmd:"Campos: Setor | Equipamento | Descrição do problema | Prioridade (Alta/Média/Baixa) | Foto"},
      {acao:"Crie fluxo acionado pelo Forms", onde:"Power Automate → Automatizado → Forms", cmd:"Gatilho: Ao enviar nova resposta"},
      {acao:"Poste cartão no canal do Teams da manutenção", onde:"Teams → Postar mensagem em canal", cmd:"Mensagem adaptativa com:\n📍 Setor: @{setor}\n🔧 Equipamento: @{equipamento}\n🚨 Prioridade: @{prioridade}\n📝 @{descricao}"},
      {acao:"Salve o chamado na planilha de OSs", onde:"Excel Online → Adicionar linha", cmd:"OS | Data_Abertura | Setor | Equipamento | Status: Aberto | Responsável: (vazio)"},
      {acao:"Envie e-mail de confirmação ao solicitante", onde:"Outlook → Enviar e-mail", cmd:"Para: e-mail do solicitante (campo no Forms)\nAssunto: Chamado registrado — @{equipamento}\nNúmero: @{ID gerado}"},
      {acao:"Configure a atribuição de responsável no Teams", onde:"Teams → resposta no cartão do chamado", cmd:"Equipe responde no canal — defina SLA de resposta: 2h úteis"},
    ],
    avisos:[
      {nivel:"warn", texto:"O Forms não envia automaticamente o e-mail do respondente — adicione um campo de e-mail obrigatório no formulário."},
      {nivel:"warn", texto:"Cartões de mensagem no Teams sem formatação adaptativa ficam como texto puro — use Markdown básico: **negrito**, - listas."},
    ],
    links:[
      {nome:"Power Automate — Teams Connector", url:"https://learn.microsoft.com/pt-br/connectors/teams/"},
      {nome:"MS Forms — Connector", url:"https://learn.microsoft.com/pt-br/connectors/microsoftforms/"},
    ],
  },
  {
    id:"pcm-kpis-alerta", nome:"Alertas de KPIs no Power BI → Teams",
    universo:"power", categoria:"Teams & Outlook", icone:"💬", tempo:"20 min",
    prereqs:["Relatório publicado no Power BI Service","Acesso ao Power Automate","Canal do Teams configurado"],
    passos:[
      {acao:"No Power BI Service, abra o relatório", onde:"app.powerbi.com", cmd:null},
      {acao:"Fixe o cartão de KPI no Dashboard", onde:"Relatório → Fixar visual → Dashboard", cmd:"Ex: cartão com total de OSs abertas ou % de refugo"},
      {acao:"Configure alerta no cartão do Dashboard", onde:"Dashboard → ... no cartão → Gerenciar alertas", cmd:"Condição: Maior que [valor crítico]\nFrequência: No máximo uma vez por hora"},
      {acao:"Conecte o alerta ao Power Automate", onde:"Power Automate → Novo fluxo → Automatizado → Power BI", cmd:"Gatilho: Quando um alerta de dados é disparado"},
      {acao:"Poste alerta no canal do Teams", onde:"Teams → Postar mensagem", cmd:"Canal: PCM - Indicadores\n🔴 ALERTA: @{gatilho} atingiu @{valor}\nVer dashboard: [link direto]"},
      {acao:"Adicione link direto para o relatório na mensagem", onde:"Power Automate → variável URL", cmd:"URL do relatório no Power BI Service"},
    ],
    avisos:[
      {nivel:"warn", texto:"Alertas do Power BI só funcionam em cartões (cards) no Dashboard — não em visuais de relatório diretamente."},
      {nivel:"warn", texto:"O gatilho de alerta pode demorar até 1h para disparar dependendo da frequência de atualização do dataset."},
    ],
    links:[
      {nome:"Power BI — Data Alerts", url:"https://learn.microsoft.com/pt-br/power-bi/create-reports/service-set-data-alerts"},
      {nome:"Power Automate — Power BI Connector", url:"https://learn.microsoft.com/pt-br/connectors/powerbi/"},
    ],
  },
  {
    id:"pcm-consolidacao-planilhas", nome:"Consolidar planilhas e enviar relatório em PDF",
    universo:"power", categoria:"Excel / Power Query", icone:"📊", tempo:"30 min",
    prereqs:["Planilhas de diferentes setores com mesma estrutura no SharePoint","Power BI com relatório publicado"],
    passos:[
      {acao:"Organize os arquivos numa mesma pasta do SharePoint", onde:"SharePoint → pasta Relatórios/Setores", cmd:"Todos os arquivos devem ter a mesma estrutura de colunas"},
      {acao:"Abra Excel e conecte à pasta inteira via Power Query", onde:"Dados → Obter Dados → Do SharePoint Online → Pasta", cmd:"URL: https://empresa.sharepoint.com/sites/pcm/Shared%20Documents/Setores"},
      {acao:"Expanda e trate os dados de todos os arquivos", onde:"Power Query", cmd:"Clique em 'Combinar' na coluna Content\nRemova coluna 'Source.Name' se não precisar da origem"},
      {acao:"Carregue a base consolidada no Excel ou Power BI", onde:"Fechar e Carregar", cmd:"Se Power BI: configure atualização agendada no Service"},
      {acao:"Crie fluxo no Power Automate para exportar PDF", onde:"Power Automate → Power BI → Exportar para arquivo", cmd:"Formato: PDF\nRelatório: [seu relatório]\nPáginas: todas"},
      {acao:"Envie o PDF por Outlook semanalmente", onde:"Outlook → Enviar e-mail com anexo", cmd:"Para: diretoria@empresa.com\nAssunto: Relatório Semanal PCM — @{formatDateTime(utcNow(), 'dd/MM/yyyy')}\nAnexo: [PDF exportado]"},
    ],
    avisos:[
      {nivel:"danger", texto:"A exportação de PDF do Power BI via Power Automate exige licença Power BI Pro ou Premium — não funciona na versão gratuita."},
      {nivel:"warn", texto:"Se um arquivo da pasta tiver estrutura diferente (coluna renomeada, nova aba), a query de consolidação vai quebrar."},
    ],
    links:[
      {nome:"Power Query — Combinar arquivos de pasta", url:"https://learn.microsoft.com/pt-br/power-query/combine-files-overview"},
      {nome:"Power BI — Exportar relatório API", url:"https://learn.microsoft.com/pt-br/power-bi/developer/embedded/export-to"},
    ],
  },
];

const ALL_FLOWS = [...FLOWS_VIBE, ...FLOWS_POWER];

const CAT_COR = {
  Deploy:"#00D4AA", Supabase:"#3ECF8E", Git:"#F5A623",
  Ambiente:"#9B8BFF", Arquitetura:"#FF7B72",
  "Power Automate":"#0066FF", "Power Apps":"#742774",
  "Excel / Power Query":"#217346", "Teams & Outlook":"#6264A7",
};

// ─── COMPONENTES ─────────────────────────────────────────────────────────────
const CmdBlock = ({ cmd, T }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div style={{position:"relative", marginTop:8}}>
      <pre style={{
        fontFamily:T.mono, fontSize:11.5, background:"#0A0A0A",
        color:copied?"#00D4AA":"#E0E0E0", borderRadius:T.r,
        padding:"10px 44px 10px 12px", margin:0, overflowX:"auto",
        border:`1px solid ${copied?"#00D4AA44":"#2C2C2C"}`,
        whiteSpace:"pre-wrap", wordBreak:"break-all", lineHeight:1.6,
        transition:"border-color 0.2s, color 0.2s",
      }}>{cmd}</pre>
      <button onClick={copy} style={{
        position:"absolute", top:8, right:8,
        background:copied?"#00D4AA22":"#1A1A1A",
        border:`1px solid ${copied?"#00D4AA":"#333"}`,
        borderRadius:6, padding:"3px 8px", cursor:"pointer",
        color:copied?"#00D4AA":"#888", fontSize:10, fontWeight:700,
        fontFamily:T.mono, transition:"all 0.2s",
      }}>{copied?"✓ ok":"copiar"}</button>
    </div>
  );
};

const WarnBox = ({ nivel, texto, T }) => {
  const cores = {
    warn:{bg:"#F5A62310", border:"#F5A62344", text:"#F5A623", icon:"⚠"},
    danger:{bg:"#FF4D4D12", border:"#FF4D4D44", text:"#FF4D4D", icon:"✕"},
  };
  const c = cores[nivel] || cores.warn;
  return (
    <div style={{
      background:c.bg, border:`1px solid ${c.border}`,
      borderLeft:`3px solid ${c.text}`, borderRadius:T.r,
      padding:"10px 12px", marginBottom:8,
      display:"flex", gap:8, alignItems:"flex-start",
    }}>
      <span style={{color:c.text, fontSize:13, flexShrink:0, marginTop:1}}>{c.icon}</span>
      <span style={{color:T.text, fontSize:12.5, lineHeight:1.6, fontWeight:500}}>{texto}</span>
    </div>
  );
};

// ─── TELA DETALHE ─────────────────────────────────────────────────────────────
const FlowDetail = ({ flow, T, onBack, progress, onToggleStep }) => {
  const done = progress.filter(Boolean).length;
  const total = flow.passos.length;
  const pct = total > 0 ? Math.round((done/total)*100) : 0;
  const catCor = CAT_COR[flow.categoria] || T.accent;
  const uniAccent = flow.universo === "power" ? T.purple : T.accent;

  return (
    <div style={{minHeight:"100vh", background:T.bg, paddingBottom:80}}>
      <div style={{
        background:T.surface, borderBottom:`1px solid ${T.border}`,
        padding:"14px 18px", position:"sticky", top:0, zIndex:50,
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
          <button onClick={onBack} style={{
            background:"transparent", border:`1px solid ${T.border}`,
            borderRadius:T.r, padding:"6px 12px", cursor:"pointer",
            color:T.muted, fontSize:12, fontWeight:600,
            display:"flex", alignItems:"center", gap:5,
          }}>← voltar</button>
          <span style={{
            fontFamily:T.mono, fontSize:10, color:catCor,
            background:catCor+"18", border:`1px solid ${catCor}33`,
            borderRadius:4, padding:"3px 8px", fontWeight:700,
          }}>{flow.categoria}</span>
        </div>
        <div style={{fontSize:18, fontWeight:800, color:T.text, marginBottom:4, lineHeight:1.3}}>{flow.nome}</div>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:10}}>
          <span style={{fontFamily:T.mono, fontSize:11, color:T.muted}}>⏱ {flow.tempo}</span>
          <span style={{fontFamily:T.mono, fontSize:11, color:pct===100?uniAccent:T.muted, fontWeight:700}}>
            {done}/{total} passos {pct===100?"✓ completo":""}
          </span>
        </div>
        <div style={{background:T.border, borderRadius:3, height:3, overflow:"hidden"}}>
          <div style={{
            background:pct===100?uniAccent:catCor,
            width:`${pct}%`, height:"100%", borderRadius:3, transition:"width 0.4s",
          }}/>
        </div>
      </div>

      <div style={{padding:"18px 18px 0"}}>
        {flow.prereqs.length > 0 && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10, color:T.subtle, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10}}>Pré-requisitos</div>
            {flow.prereqs.map((p,i) => (
              <div key={i} style={{display:"flex", gap:8, marginBottom:6}}>
                <span style={{color:uniAccent, fontSize:13}}>□</span>
                <span style={{fontSize:13, color:T.muted, fontWeight:500}}>{p}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{marginBottom:24}}>
          <div style={{fontSize:10, color:T.subtle, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:12}}>Passos</div>
          {flow.passos.map((step,i) => {
            const feito = !!progress[i];
            return (
              <div key={i} style={{
                background:feito?uniAccent+"08":T.surface,
                border:`1px solid ${feito?uniAccent+"33":T.border}`,
                borderRadius:T.rLg, padding:14, marginBottom:10, transition:"all 0.2s",
              }}>
                <div style={{display:"flex", alignItems:"flex-start", gap:12}}>
                  <button onClick={() => onToggleStep(i)} style={{
                    width:22, height:22, borderRadius:"50%", flexShrink:0,
                    border:`2px solid ${feito?uniAccent:T.border}`,
                    background:feito?uniAccent:"transparent",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    marginTop:2, transition:"all 0.2s",
                  }}>
                    {feito && <svg width="11" height="11" viewBox="0 0 24 24" fill="#000"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                  </button>
                  <div style={{flex:1}}>
                    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                      <span style={{fontFamily:T.mono, fontSize:10, color:catCor, fontWeight:800, minWidth:22}}>{String(i+1).padStart(2,"0")}</span>
                      <span style={{fontSize:13.5, fontWeight:700, color:feito?T.muted:T.text, textDecoration:feito?"line-through":"none", lineHeight:1.4}}>{step.acao}</span>
                    </div>
                    {step.onde && <div style={{fontFamily:T.mono, fontSize:11, color:T.subtle, marginBottom:step.cmd?4:0, marginLeft:30}}>→ {step.onde}</div>}
                    {step.cmd && <div style={{marginLeft:30}}><CmdBlock cmd={step.cmd} T={T}/></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {flow.avisos.length > 0 && (
          <div style={{marginBottom:24}}>
            <div style={{fontSize:10, color:T.subtle, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10}}>⚠ Onde as pessoas costumam errar</div>
            {flow.avisos.map((a,i) => <WarnBox key={i} nivel={a.nivel} texto={a.texto} T={T}/>)}
          </div>
        )}

        {flow.links.length > 0 && (
          <div style={{marginBottom:24}}>
            <div style={{fontSize:10, color:T.subtle, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10}}>Links úteis</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
              {flow.links.map((l,i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{
                  fontFamily:T.mono, fontSize:11, color:uniAccent,
                  background:uniAccent+"12", border:`1px solid ${uniAccent}33`,
                  borderRadius:6, padding:"6px 12px", textDecoration:"none", fontWeight:600,
                }}>↗ {l.nome}</a>
              ))}
            </div>
          </div>
        )}

        {done > 0 && (
          <button onClick={() => { if(window.confirm("Resetar progresso?")) onToggleStep(-1); }} style={{
            background:"transparent", border:`1px solid ${T.border}`,
            borderRadius:T.r, padding:"8px 16px", cursor:"pointer",
            color:T.subtle, fontSize:12, fontWeight:600,
          }}>Resetar progresso</button>
        )}
      </div>
    </div>
  );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────
const FlowCard = ({ flow, T, onOpen, isFav, onFav, progress, uniAccent }) => {
  const done = progress.filter(Boolean).length;
  const total = flow.passos.length;
  const pct = total > 0 ? Math.round((done/total)*100) : 0;
  const catCor = CAT_COR[flow.categoria] || T.accent;
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:hover?T.hover:T.card,
        border:`1px solid ${hover?catCor+"44":T.border}`,
        borderRadius:T.rLg, padding:"14px 14px 12px",
        cursor:"pointer", transition:"all 0.18s",
        transform:hover?"translateY(-2px)":"none",
        boxShadow:hover?`0 4px 20px ${catCor}18`:"none",
      }}
    >
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
        <div style={{display:"flex", alignItems:"center", gap:7}}>
          <span style={{
            fontFamily:T.mono, fontSize:12, color:catCor, fontWeight:900,
            background:catCor+"14", border:`1px solid ${catCor}28`,
            borderRadius:6, padding:"3px 8px",
          }}>{flow.icone}</span>
          <span style={{fontFamily:T.mono, fontSize:10, color:catCor, fontWeight:700}}>{flow.categoria}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onFav(); }} style={{
          background:"none", border:"none", cursor:"pointer",
          fontSize:14, color:isFav?"#F5A623":T.subtle, padding:2,
        }}>{isFav?"★":"☆"}</button>
      </div>
      <div style={{fontSize:13.5, fontWeight:800, color:T.text, lineHeight:1.35, marginBottom:8}}>{flow.nome}</div>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:pct>0?10:0}}>
        <span style={{fontFamily:T.mono, fontSize:10, color:T.subtle}}>⏱ {flow.tempo}</span>
        <span style={{fontFamily:T.mono, fontSize:10, color:T.subtle}}>{total} passos</span>
      </div>
      {pct > 0 && (
        <div>
          <div style={{background:T.border, borderRadius:2, height:3, overflow:"hidden", marginBottom:4}}>
            <div style={{background:pct===100?uniAccent:catCor, width:`${pct}%`, height:"100%", borderRadius:2}}/>
          </div>
          <div style={{fontFamily:T.mono, fontSize:10, color:pct===100?uniAccent:T.subtle, textAlign:"right"}}>
            {pct===100?"✓ completo":`${done}/${total}`}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function AltTab() {
  const [isDark, setIsDark] = useState(() => load(SK.theme) !== false);
  const T = isDark ? DARK : LIGHT;

  const [universe, setUniverse] = useState(() => load(SK.universe) || "vibe");
  const [subcat, setSubcat] = useState(null); // null = todos do universo
  const [busca, setBusca] = useState("");
  const [favs, setFavs] = useState(() => load(SK.favs) || []);
  const [progressMap, setProgressMap] = useState(() => load(SK.progress) || {});
  const [lastFlow, setLastFlow] = useState(() => load(SK.last));
  const [flowAberto, setFlowAberto] = useState(null);
  const [telaInicio, setTelaInicio] = useState(true); // tela de seleção de universo

  useEffect(() => { save(SK.theme, isDark); }, [isDark]);
  useEffect(() => { save(SK.favs, favs); }, [favs]);
  useEffect(() => { save(SK.progress, progressMap); }, [progressMap]);
  useEffect(() => { save(SK.universe, universe); }, [universe]);

  const getProgress = id => progressMap[id] || [];
  const toggleStep = useCallback((flowId, stepIdx) => {
    setProgressMap(prev => {
      const total = ALL_FLOWS.find(f => f.id === flowId)?.passos.length || 0;
      const cur = prev[flowId] || Array(total).fill(false);
      if(stepIdx === -1) return {...prev, [flowId]: cur.map(() => false)};
      const next = [...cur];
      next[stepIdx] = !next[stepIdx];
      return {...prev, [flowId]: next};
    });
  }, []);
  const toggleFav = id => setFavs(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  const openFlow = flow => { setFlowAberto(flow); save(SK.last, flow.id); };

  const uni = UNIVERSES[universe];
  const uniAccent = uni.accent;
  const uniFlows = ALL_FLOWS.filter(f => f.universo === universe);

  const flowsFiltrados = uniFlows.filter(f => {
    const catOk = !subcat || f.categoria === subcat;
    const q = busca.toLowerCase();
    const buscaOk = !q || f.nome.toLowerCase().includes(q) || f.categoria.toLowerCase().includes(q);
    return catOk && buscaOk;
  });

  const lastFlowObj = lastFlow ? ALL_FLOWS.find(f => f.id === lastFlow) : null;
  const lastProgress = lastFlowObj ? getProgress(lastFlowObj.id) : [];
  const lastDone = lastProgress.filter(Boolean).length;
  const lastTotal = lastFlowObj?.passos.length || 0;
  const lastPct = lastTotal > 0 ? Math.round((lastDone/lastTotal)*100) : 0;

  // ── Tela detalhe
  if(flowAberto) return (
    <FlowDetail
      flow={flowAberto} T={T}
      onBack={() => setFlowAberto(null)}
      progress={getProgress(flowAberto.id)}
      onToggleStep={i => toggleStep(flowAberto.id, i)}
    />
  );

  // ── Tela seleção de universo
  if(telaInicio) return (
    <div style={{
      background:T.bg, minHeight:"100vh", fontFamily:"'Inter',sans-serif",
      color:T.text, display:"flex", flexDirection:"column",
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"18px 20px", borderBottom:`1px solid ${T.border}`,
      }}>
        <div>
          <div style={{display:"flex", alignItems:"baseline", gap:5}}>
            <span style={{fontFamily:T.mono, fontSize:22, fontWeight:800, color:T.text}}>Alt</span>
            <span style={{fontFamily:T.mono, fontSize:22, fontWeight:800, color:T.accent}}>+Tab</span>
          </div>
          <div style={{fontSize:11, color:T.subtle, marginTop:1}}>execute sem memorizar</div>
        </div>
        <button onClick={() => setIsDark(!isDark)} style={{
          background:T.card, border:`1px solid ${T.border}`,
          borderRadius:T.r, padding:"7px 13px", cursor:"pointer", color:T.muted, fontSize:13,
        }}>{isDark?"☀":"◑"}</button>
      </div>

      <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"32px 20px"}}>
        <div style={{fontSize:13, color:T.subtle, fontWeight:600, textTransform:"uppercase", letterSpacing:2, textAlign:"center", marginBottom:24, fontFamily:T.mono}}>
          escolha seu universo
        </div>

        {Object.values(UNIVERSES).map(u => {
          const flows = ALL_FLOWS.filter(f => f.universo === u.id);
          const done = flows.filter(f => { const p = getProgress(f.id); return p.length > 0 && p.every(Boolean); }).length;
          return (
            <div key={u.id} onClick={() => { setUniverse(u.id); setSubcat(null); setBusca(""); setTelaInicio(false); }} style={{
              background:T.card, border:`2px solid ${universe===u.id?u.accent:T.border}`,
              borderRadius:T.rLg*1.5, padding:"22px 20px", marginBottom:16,
              cursor:"pointer", transition:"all 0.2s",
              boxShadow:universe===u.id?`0 0 24px ${u.accent}22`:"none",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = u.accent; e.currentTarget.style.boxShadow = `0 0 24px ${u.accent}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = universe===u.id?u.accent:T.border; e.currentTarget.style.boxShadow = universe===u.id?`0 0 24px ${u.accent}22`:"none"; }}
            >
              <div style={{fontSize:22, fontWeight:900, color:u.accent, marginBottom:6, fontFamily:T.mono}}>{u.label}</div>
              <div style={{fontSize:13, color:T.muted, fontWeight:500, marginBottom:12}}>{u.desc}</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:12}}>
                {u.cats.map(c => (
                  <span key={c} style={{
                    fontFamily:T.mono, fontSize:10, color:CAT_COR[c]||u.accent,
                    background:(CAT_COR[c]||u.accent)+"14",
                    border:`1px solid ${(CAT_COR[c]||u.accent)}33`,
                    borderRadius:4, padding:"2px 7px", fontWeight:700,
                  }}>{c}</span>
                ))}
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{fontFamily:T.mono, fontSize:10, color:T.subtle}}>{flows.length} fluxos</span>
                <span style={{fontFamily:T.mono, fontSize:10, color:done>0?u.accent:T.subtle}}>
                  {done > 0 ? `${done}/${flows.length} completos` : "não iniciado"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Tela principal (lista de fluxos)
  return (
    <div style={{background:T.bg, minHeight:"100vh", fontFamily:"'Inter',sans-serif", color:T.text, paddingBottom:80}}>
      {/* Header */}
      <div style={{
        background:T.surface, borderBottom:`1px solid ${T.border}`,
        padding:"14px 18px", position:"sticky", top:0, zIndex:50,
      }}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <button onClick={() => setTelaInicio(true)} style={{
              background:"transparent", border:`1px solid ${T.border}`,
              borderRadius:T.r, padding:"5px 10px", cursor:"pointer",
              color:T.subtle, fontSize:11, fontFamily:T.mono,
            }}>⊞</button>
            <div>
              <div style={{fontFamily:T.mono, fontSize:15, fontWeight:800, color:uniAccent}}>{uni.label}</div>
              <div style={{fontSize:10, color:T.subtle, fontFamily:T.mono}}>{uni.desc}</div>
            </div>
          </div>
          <button onClick={() => setIsDark(!isDark)} style={{
            background:T.card, border:`1px solid ${T.border}`,
            borderRadius:T.r, padding:"6px 11px", cursor:"pointer", color:T.muted, fontSize:12,
          }}>{isDark?"☀":"◑"}</button>
        </div>

        {/* Busca */}
        <div style={{position:"relative", marginBottom:10}}>
          <span style={{position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:T.subtle, fontFamily:T.mono, fontSize:12}}>›_</span>
          <input
            value={busca} onChange={e => setBusca(e.target.value)}
            placeholder={`buscar fluxo em ${universe === "vibe" ? "Vibe Coding" : "Power Platform"}...`}
            style={{
              width:"100%", boxSizing:"border-box",
              background:T.card, border:`1px solid ${busca?uniAccent+"66":T.border}`,
              borderRadius:T.r, padding:"9px 11px 9px 30px",
              color:T.text, fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif",
              transition:"border-color 0.2s",
            }}
          />
          {busca && <button onClick={() => setBusca("")} style={{
            position:"absolute", right:9, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", color:T.subtle, fontSize:15,
          }}>×</button>}
        </div>

        {/* Subcategorias */}
        <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:2}}>
          <button onClick={() => setSubcat(null)} style={{
            fontFamily:T.mono, fontSize:10, fontWeight:700,
            padding:"5px 11px", borderRadius:20,
            border:`1px solid ${!subcat?uniAccent:T.border}`,
            background:!subcat?uniAccent+"18":"transparent",
            color:!subcat?uniAccent:T.subtle, cursor:"pointer", whiteSpace:"nowrap",
          }}>Todos</button>
          {uni.cats.map(cat => {
            const ativa = subcat === cat;
            const cor = CAT_COR[cat] || uniAccent;
            return (
              <button key={cat} onClick={() => setSubcat(ativa?null:cat)} style={{
                fontFamily:T.mono, fontSize:10, fontWeight:700,
                padding:"5px 11px", borderRadius:20,
                border:`1px solid ${ativa?cor:T.border}`,
                background:ativa?cor+"18":"transparent",
                color:ativa?cor:T.subtle, cursor:"pointer", whiteSpace:"nowrap",
              }}>{cat}</button>
            );
          })}
        </div>
      </div>

      <div style={{padding:"16px 18px 0"}}>
        {/* Banner continuar */}
        {lastFlowObj && lastFlowObj.universo === universe && lastPct > 0 && lastPct < 100 && !busca && !subcat && (
          <div onClick={() => openFlow(lastFlowObj)} style={{
            background:uniAccent+"0E", border:`1px solid ${uniAccent}33`,
            borderLeft:`3px solid ${uniAccent}`, borderRadius:T.rLg,
            padding:"12px 14px", marginBottom:18, cursor:"pointer",
          }}>
            <div style={{fontSize:10, color:uniAccent, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4, fontFamily:T.mono}}>▶ continuar onde parou</div>
            <div style={{fontSize:14, fontWeight:700, color:T.text, marginBottom:8}}>{lastFlowObj.nome}</div>
            <div style={{background:T.border, borderRadius:2, height:3, overflow:"hidden", marginBottom:5}}>
              <div style={{background:uniAccent, width:`${lastPct}%`, height:"100%", borderRadius:2}}/>
            </div>
            <div style={{fontFamily:T.mono, fontSize:10, color:uniAccent}}>passo {lastDone} de {lastTotal} · {lastPct}%</div>
          </div>
        )}

        {/* Favoritos */}
        {favs.length > 0 && !busca && !subcat && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10, color:T.subtle, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10}}>★ favoritos</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:10}}>
              {ALL_FLOWS.filter(f => favs.includes(f.id) && f.universo === universe).map(f => (
                <FlowCard key={f.id} flow={f} T={T} uniAccent={uniAccent}
                  onOpen={() => openFlow(f)} isFav={true} onFav={() => toggleFav(f.id)}
                  progress={getProgress(f.id)}/>
              ))}
            </div>
          </div>
        )}

        {/* Grid principal */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:10}}>
            <div style={{fontSize:10, color:T.subtle, fontWeight:700, textTransform:"uppercase", letterSpacing:2}}>
              {busca ? `"${busca}"` : subcat ? subcat.toLowerCase() : "todos os fluxos"}
            </div>
            <div style={{fontFamily:T.mono, fontSize:10, color:T.subtle}}>{flowsFiltrados.length} fluxo{flowsFiltrados.length!==1?"s":""}</div>
          </div>

          {flowsFiltrados.length === 0 ? (
            <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rLg, padding:"32px 18px", textAlign:"center"}}>
              <div style={{fontFamily:T.mono, fontSize:22, color:T.subtle, marginBottom:10}}>›_</div>
              <div style={{fontSize:14, color:T.muted, fontWeight:600}}>nenhum fluxo encontrado</div>
            </div>
          ) : (
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:12}}>
              {flowsFiltrados.map(f => (
                <FlowCard key={f.id} flow={f} T={T} uniAccent={uniAccent}
                  onOpen={() => openFlow(f)} isFav={favs.includes(f.id)}
                  onFav={() => toggleFav(f.id)} progress={getProgress(f.id)}/>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          background:T.surface, border:`1px solid ${T.border}`,
          borderRadius:T.rLg, padding:"12px 16px", marginTop:8,
          display:"flex", gap:20, justifyContent:"center",
        }}>
          {[
            {label:"fluxos", val:uniFlows.length},
            {label:"completos", val:uniFlows.filter(f => { const p=getProgress(f.id); return p.length>0&&p.every(Boolean); }).length},
            {label:"favoritos", val:favs.filter(id => uniFlows.find(f => f.id===id)).length},
          ].map((s,i) => (
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontFamily:T.mono, fontSize:18, fontWeight:800, color:uniAccent}}>{s.val}</div>
              <div style={{fontFamily:T.mono, fontSize:9, color:T.subtle, fontWeight:700}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
