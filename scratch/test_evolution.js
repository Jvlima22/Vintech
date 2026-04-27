const EVOLUTION_API_URL = "https://evolution.tglsolutions.com.br";
const EVOLUTION_API_KEY = "6F825299263B-4ECA-9145-769EC6CA581D";
const EVOLUTION_INSTANCE_NAME = "CaptuComercial";

async function testConnection() {
  console.log("--- Testando Conexão com Evolution API ---");
  console.log(`URL: ${EVOLUTION_API_URL}`);
  console.log(`Instância: ${EVOLUTION_INSTANCE_NAME}`);
  
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("\n✅ SUCESSO!");
      console.log("Status da Conexão:", data.instance?.state || "Desconhecido");
      console.log("Detalhes:", JSON.stringify(data, null, 2));
    } else {
      console.log("\n❌ ERRO NA API!");
      console.log("Status Code:", response.status);
      console.log("Mensagem:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log("\n❌ ERRO DE REDE/CONEXÃO!");
    console.log(error.message);
  }
}

testConnection();
