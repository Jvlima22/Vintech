import { LegalLayout } from "@/components/layout/LegalLayout";

export const TermsPage = () => {
  return (
    <LegalLayout title="Termos de Uso" lastUpdated="10 de maio de 2026">
      <section className="space-y-4">
        <h2 className="text-foreground">1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar a plataforma <strong>Vintech</strong>, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">2. Descrição do Serviço</h2>
        <p>
          A Vintech fornece um <strong>sistema integrado de gestão</strong> para vinícolas, incluindo controle de estoque, gestão de vendas, enoturismo e ferramentas de marketing. O acesso a determinados módulos depende do plano de assinatura contratado.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">3. Cadastro e Segurança</h2>
        <p>
          Para utilizar a plataforma, é necessário criar uma conta. Você é <strong>responsável por manter a confidencialidade</strong> de suas credenciais de acesso e por todas as atividades que ocorrem em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">4. Assinaturas e Pagamentos</h2>
        <p>
          Nossos serviços são oferecidos mediante assinatura mensal ou anual. Os pagamentos são processados via <strong>Stripe</strong>. O atraso no pagamento pode resultar na suspensão temporária do acesso aos módulos premium até a regularização.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">5. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo, logotipos, códigos e designs da plataforma Vintech são de nossa <strong>propriedade exclusiva</strong> ou licenciados para nós. O uso da plataforma não concede a você nenhum direito de propriedade sobre nossos ativos intelectuais.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground">6. Limitação de Responsabilidade</h2>
        <p>
          A Vintech se esforça para manter a plataforma disponível 24/7, porém <strong>não garantimos</strong> que o serviço será ininterrupto ou livre de erros. Não somos responsáveis por perdas financeiras decorrentes de falhas técnicas ou uso inadequado do sistema.
        </p>
      </section>

      <section>
        <h2>7. Alterações nos Termos</h2>
        <p>
          Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas via e-mail ou aviso no dashboard. O uso contínuo da plataforma após as alterações constitui sua aceitação dos novos termos.
        </p>
      </section>
    </LegalLayout>
  );
};
