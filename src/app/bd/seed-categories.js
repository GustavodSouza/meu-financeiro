// seed-categories.js
// Popula a coleção "categories" do Firestore de uma vez só.
//
// Como usar:
// 1) npm init -y
// 2) npm install firebase-admin
// 3) No Firebase Console: Configurações do projeto (⚙️) > Contas de serviço
//    > "Gerar nova chave privada" -> baixa um JSON.
//    Salve esse arquivo na mesma pasta como "serviceAccountKey.json"
//    (e adicione ele ao .gitignore, NUNCA suba pro git).
// 4) node seed-categories.js

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Ajuste a lista como quiser. O "id" vira o ID do documento
// e também o valor que você vai salvar em id_categoria nas despesas.
const categorias = [
  { id: "1", nome: "Alimentação", icone: "🍔", cor: "#FF6B6B", ordem: 1 },
  { id: "2", nome: "Transporte", icone: "🚗", cor: "#4ECDC4", ordem: 2 },
  { id: "3", nome: "Moradia", icone: "🏠", cor: "#45B7D1", ordem: 3 },
  { id: "4", nome: "Saúde", icone: "💊", cor: "#96CEB4", ordem: 4 },
  { id: "5", nome: "Educação", icone: "📚", cor: "#FFEAA7", ordem: 5 },
  { id: "6", nome: "Lazer", icone: "🎮", cor: "#DFE6E9", ordem: 6 },
  { id: "7", nome: "Vestuário", icone: "👕", cor: "#74B9FF", ordem: 7 },
  { id: "8", nome: "Contas e Serviços", icone: "🧾", cor: "#A29BFE", ordem: 8 },
  { id: "9", nome: "Mercado", icone: "🛒", cor: "#FD79A8", ordem: 9 },
  { id: "10", nome: "Assinaturas", icone: "📱", cor: "#00B894", ordem: 10 },
  { id: "11", nome: "Cuidados Pessoais", icone: "💇", cor: "#E17055", ordem: 11 },
  { id: "12", nome: "Viagem", icone: "✈️", cor: "#0984E3", ordem: 12 },
  { id: "13", nome: "Presentes e Doações", icone: "🎁", cor: "#FAB1A0", ordem: 13 },
  { id: "14", nome: "Pets", icone: "🐶", cor: "#FDCB6E", ordem: 14 },
  { id: "15", nome: "Outros", icone: "📦", cor: "#B2BEC3", ordem: 15 },
];

async function seed() {
  const batch = db.batch();

  categorias.forEach((cat) => {
    // Doc ID = cat.id -> facilita buscar direto: categories.doc(id_categoria)
    const ref = db.collection("categories").doc(cat.id);
    batch.set(ref, { ...cat, ativa: true }, { merge: true });
  });

  await batch.commit();
  console.log(`${categorias.length} categorias criadas/atualizadas com sucesso!`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro ao popular categorias:", err);
    process.exit(1);
  });
