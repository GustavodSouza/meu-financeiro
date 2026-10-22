<h1 align="center">💰 Meu Financeiro</h1>

<p align="center">
  Controle financeiro pessoal simples e direto: registre despesas, acompanhe o orçamento do mês e persiga suas metas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-telas">Telas</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-como-rodar">Como rodar</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

<!-- Coloque aqui um GIF ou print da tela principal (dashboard ou despesas) -->
<p align="center">
  <img src="docs/preview.gif" alt="Preview do Meu Financeiro" width="800" />
</p>

---

## 📌 Sobre

O **Meu Financeiro** nasceu da necessidade de ter um lugar só meu para organizar as finanças pessoais, sem planilhas espalhadas e sem apps cheios de anúncios.

A ideia é simples: definir um orçamento mensal por categoria, registrar os gastos do dia a dia e ver rapidamente se o mês está dentro do planejado.

🔗 **Acesse a aplicação:** [Acesse Aqui - Meu Financeiro Web](https://meu-financeiro-web.vercel.app/)

---

## ✨ Funcionalidades

- [x] Cadastro e login de usuário
- [x] Registro de despesas por categoria
- [x] Listagem de despesas com filtros
- [x] Card de totais do mês
- [x] Orçamento padrão com ajustes por mês
- [ ] Dashboard com gráficos e resumo do mês
- [ ] Metas financeiras
- [ ] Tela de configurações

---

## 🖼️ Telas

| Dashboard |
|:---:|
| Visão geral do mês: total gasto, saldo do orçamento e distribuição das despesas por categoria. |
| <img width="1899" height="909" alt="image" src="https://github.com/user-attachments/assets/3b97df17-522f-438a-9b83-60740e5e3168" /> |

| Despesas |
|:---:|
| Lista de despesas com filtros e card com os totais do mês, comparação com mês anterior. |
| <img width="1896" height="913" alt="image" src="https://github.com/user-attachments/assets/bd0de39f-8ff6-46d0-82c6-35136ef7f0e5" /> |

| Configurações |
|:---:|
| Definição do orçamento padrão e gerenciamento das categorias de despesas. |
| <img width="1904" height="888" alt="image" src="https://github.com/user-attachments/assets/a5b84ec2-d565-4463-8d49-ad67a9b4e113" /> |

---

## 🛠️ Tecnologias

- **[Angular](https://angular.dev/)** — front-end
- **[Firebase Authentication](https://firebase.google.com/docs/auth)** — autenticação
- **[Cloud Firestore](https://firebase.google.com/docs/firestore)** — banco de dados NoSQL
- **TypeScript**

### 🗂️ Estrutura dos dados

Os dados são isolados por usuário (`uid`):

```
users/{uid}
 ├── orcamento padrão (no próprio documento)
 └── orcamento/{mes}   → ajustes específicos de cada mês
categories/            → categorias de despesas
```

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão X ou superior)
- [Angular CLI](https://angular.dev/tools/cli)
- Um projeto criado no [Firebase Console](https://console.firebase.google.com/)

### Passo a passo

```bash
# Clone o repositório
git clone https://github.com/GustavodSouza/meu-financeiro.git

# Entre na pasta
cd meu-financeiro

# Instale as dependências
npm install
```

Configure as credenciais do Firebase em `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'SUA_API_KEY',
    authDomain: 'SEU_PROJETO.firebaseapp.com',
    projectId: 'SEU_PROJETO',
    storageBucket: 'SEU_PROJETO.appspot.com',
    messagingSenderId: 'SEU_SENDER_ID',
    appId: 'SEU_APP_ID',
  },
};
```

```bash
# Rode o projeto
ng serve
```

Acesse `http://localhost:4200` 🎉

---

## 🗺️ Roadmap

- [ ] Finalizar o dashboard com gráficos
- [ ] Implementar metas financeiras
- [ ] Registro de receitas
- [ ] Exportação de relatórios
- [ ] Tema escuro

---

## 👨‍💻 Autor

Feito por **Gustavo de Souza de Lima**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/SEU-LINKEDIN)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GustavodSouza)
