// Conteúdo atual capturado em 18/10/2026. Edições salvas no painel têm prioridade.
export const defaultContent = {
  "profile": {
    "name": "Davi de Mattos Vieira",
    "role": "Desenvolvedor(a) júnior",
    "bio": "Gosto de entender problemas, testar ideias e construir soluções com código. Estou desenvolvendo minhas habilidades e buscando uma oportunidade para aprender e contribuir em equipe.",
    "location": "Santa Catarina · Brasil",
    "availability": "Em busca de uma oportunidade",
    "isExample": true
  },
  "skills": [
    {
      "title": "Linguagens",
      "description": "A base para transformar lógica em soluções.",
      "items": [
        "Java",
        "Python",
        "JavaScript"
      ],
      "isExample": true
    },
    {
      "title": "Web & dados",
      "description": "Interfaces, aplicações e dados organizados.",
      "items": [
        "HTML",
        "CSS",
        "MySQL",
        "SQL"
      ],
      "isExample": true
    },
    {
      "title": "Ferramentas & práticas",
      "description": "Organização e aprendizado no dia a dia.",
      "items": [
        "Git",
        "GitHub",
        "VS Code",
        "Lógica de programação"
      ],
      "isExample": true
    }
  ],
  "projects": [
    {
      "id": "project-0",
      "title": "Nexo Store — E-commerce",
      "category": "Loja virtual interativa",
      "description": "E-commerce com catálogo filtrável, carrinho persistente, checkout simulado e painel do lojista protegido.",
      "technologies": [
        "TypeScript",
        "React",
        "CSS",
        "SQL",
        "Cloudflare"
      ],
      "details": "Aplicação hospedada com catálogo, busca, filtros, carrinho salvo no navegador e checkout demonstrativo. O servidor calcula preços e frete, verifica estoque e registra pedidos no Cloudflare D1. A administração é exclusiva do proprietário autenticado. O pagamento é uma simulação própria, sem conexão com a API Stripe e sem cobranças reais.",
      "learning": "Integração entre interface React e API, persistência SQL, validação no servidor e controle de acesso por identidade autenticada.",
      "features": [
        "Catálogo com busca e filtros",
        "Carrinho persistente no navegador",
        "Pagamento simulado aprovado ou recusado",
        "Validação e baixa de estoque",
        "Painel administrativo protegido"
      ],
      "repository": "https://github.com/DavideMattos-dotcom/nexo-store",
      "demo": "https://nexo-store.nexo-store.workers.dev/",
      "isExample": false,
      "visual": "shop"
    },
    {
      "id": "project-1",
      "title": "Estoque em ordem",
      "category": "Aplicação de gestão",
      "description": "Um sistema para cadastrar produtos, registrar movimentações e acompanhar o estoque em um só lugar.",
      "technologies": [
        "Java",
        "MySQL"
      ],
      "details": "Exemplo de projeto: um CRUD de produtos com cadastro, edição, exclusão e consulta. A proposta inclui histórico de entradas e saídas e validação das quantidades.",
      "learning": "Praticar orientação a objetos, persistência de dados e regras de negócio.",
      "features": [
        "Cadastro e busca de produtos",
        "Registro de entradas e saídas",
        "Validação de estoque disponível"
      ],
      "repository": "",
      "demo": "",
      "isExample": true,
      "visual": "stock"
    },
    {
      "id": "project-2",
      "title": "Entre livros",
      "category": "Organização de biblioteca",
      "description": "Catálogo de livros com busca por título e uma visão da coleção por gênero.",
      "technologies": [
        "Python",
        "Matplotlib"
      ],
      "details": "Exemplo de projeto: um catálogo que utiliza uma classe Livro e uma lista para armazenar os registros. Permite cadastrar, listar e buscar títulos, além de visualizar a quantidade de livros por gênero.",
      "learning": "Aplicar classes, funções, listas e visualização de dados em Python.",
      "features": [
        "Cadastro de livros",
        "Busca por título",
        "Gráfico da coleção por gênero"
      ],
      "repository": "",
      "demo": "",
      "isExample": true,
      "visual": "books"
    },
    {
      "id": "project-3",
      "title": "Um dia de cada vez",
      "category": "Produtividade pessoal",
      "description": "Uma lista de tarefas leve, com prioridades, filtros e progresso salvo no navegador.",
      "technologies": [
        "JavaScript",
        "HTML",
        "CSS"
      ],
      "details": "Exemplo de projeto: uma aplicação web de tarefas com criação, edição e conclusão de itens. O armazenamento local mantém a lista entre visitas no mesmo navegador.",
      "learning": "Praticar manipulação do DOM, eventos, acessibilidade e localStorage.",
      "features": [
        "Adicionar e concluir tarefas",
        "Filtrar por situação",
        "Salvar no navegador"
      ],
      "repository": "",
      "demo": "",
      "isExample": true,
      "visual": "tasks"
    },
    {
      "id": "project-4",
      "title": "Notas na ponta do lápis",
      "category": "Ferramenta de estudos",
      "description": "Cadastro de notas, cálculo de média e um relatório com a situação de cada aluno.",
      "technologies": [
        "Python"
      ],
      "details": "Exemplo de projeto: um sistema de notas que armazena valores em uma lista, calcula a média e informa aprovação a partir de 7. O relatório reúne notas, média e situação.",
      "learning": "Combinar estruturas condicionais, repetição, funções e validação de entradas.",
      "features": [
        "Inserir notas de 0 a 10",
        "Calcular a média",
        "Gerar relatório de situação"
      ],
      "repository": "",
      "demo": "",
      "isExample": true,
      "visual": "grades"
    }
  ],
  "contact": {
    "email": "davidemattosvieira@gmail.com",
    "github": "https://github.com/DavideMattos-dotcom",
    "linkedin": "https://www.linkedin.com/in/davi-de-mattos-vieira",
    "message": "Vamos conversar sobre projetos, aprendizado e oportunidades?"
  }
};
