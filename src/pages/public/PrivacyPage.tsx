import { LegalLayout } from "@/components/layout/LegalLayout";

export const PrivacyPage = () => {
  return (
    <LegalLayout title="Política de Privacidade" lastUpdated="10 de maio de 2026">
      <section className="space-y-4">
        <h2 className="text-foreground">1. Coleta de Informações</h2>
        <p>
          Coletamos informações que você fornece diretamente ao criar uma conta, como <strong>nome, e-mail, dados da vinícola</strong> e informações de contato. Também coletamos dados de uso automaticamente para melhorar sua experiência na plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">2. Uso dos Dados</h2>
        <p>
          Seus dados são utilizados para <strong>prover e manter as funcionalidades</strong> do sistema, processar pagamentos via Stripe, gerenciar assinaturas e enviar comunicações de suporte essenciais.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">3. Compartilhamento de Dados</h2>
        <p>
          <strong>Não vendemos seus dados para terceiros.</strong> Compartilhamos informações apenas com parceiros essenciais para a operação, como o Stripe (pagamentos) e o Supabase (armazenamento de dados), sempre seguindo padrões rigorosos de segurança.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">4. Segurança da Informação</h2>
        <p>
          Implementamos medidas de segurança técnicas para proteger seus dados. Utilizamos <strong>criptografia SSL</strong> e autenticação segura via Supabase Auth para garantir que suas informações estejam sempre protegidas.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">5. Seus Direitos (LGPD)</h2>
        <p>
          Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações do seu perfil.
        </p>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>
          Utilizamos cookies para manter sua sessão ativa e entender como você interage com nossa plataforma. Você pode gerenciar as preferências de cookies através das configurações do seu navegador.
        </p>
      </section>

      <section>
        <h2>7. Contato</h2>
        <p>
          Se tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através do e-mail: suporte@vintech.com.br
        </p>
      </section>
    </LegalLayout>
  );
};
