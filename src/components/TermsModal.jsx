import { acceptTerms } from '../utils/terms.js'

/**
 * Modal de Termos de Uso.
 * mode = 'initial' → primeiro acesso, exige aceite
 * mode = 'view'    → só leitura, com botão Fechar
 */
export function TermsModal({ open, mode = 'initial', onAccept, onClose }) {
  if (!open) return null

  function handleAccept() {
    acceptTerms()
    onAccept?.()
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4 pb-32">
        <header className="text-center pb-3 border-b border-slate-800">
          <h1 className="text-xl font-bold brand-text inline-flex items-center gap-2">
            <span className="brand-dot"></span>Well HGU
          </h1>
          <h2 className="text-slate-300 text-lg font-semibold mt-3">
            Termos de Uso e Isenção de Responsabilidade
          </h2>
        </header>

        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Bem-vindo. Este aplicativo foi desenvolvido como ferramenta pessoal e é
            disponibilizado <strong>"como está"</strong>, sem garantias de qualquer
            natureza. Ao continuar usando, você declara concordar com os termos abaixo.
          </p>

          <Section title="1. Armazenamento local">
            Todos os dados cadastrados (HGUs, SSIDs, senhas, endereços, fotos, coordenadas
            GPS) ficam armazenados <strong>exclusivamente no seu próprio dispositivo</strong>,
            usando o armazenamento local do navegador (localStorage). Nenhum dado é enviado,
            coletado ou acessado pelo desenvolvedor.
          </Section>

          <Section title="2. Responsabilidade do usuário">
            Você é integralmente responsável por:
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>O conteúdo que cadastra no aplicativo</li>
              <li>Garantir que possui autorização para coletar, armazenar e utilizar os dados inseridos</li>
              <li>Cumprir as políticas da sua empresa e a legislação aplicável, em especial a LGPD (Lei nº 13.709/2018)</li>
              <li>Proteger o acesso ao seu dispositivo (PIN, biometria, senha)</li>
              <li>O uso responsável e consciente da funcionalidade de compartilhamento</li>
            </ul>
          </Section>

          <Section title="3. Isenção do desenvolvedor">
            O desenvolvedor (Wellerson Tavares) disponibiliza este aplicativo
            gratuitamente como projeto pessoal e:
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li><strong>NÃO</strong> possui vínculo com a Vivo, ICOMON ou qualquer outra empresa de telecomunicações</li>
              <li><strong>NÃO</strong> coleta, recebe ou tem acesso a nenhum dado dos usuários</li>
              <li><strong>NÃO</strong> se responsabiliza por uso indevido, vazamentos, perdas de dados ou quaisquer consequências decorrentes do uso do aplicativo</li>
              <li><strong>NÃO</strong> garante disponibilidade contínua, ausência de erros ou compatibilidade com qualquer dispositivo específico</li>
            </ul>
          </Section>

          <Section title="4. Sem vínculo contratual">
            O uso deste aplicativo <strong>não cria</strong> qualquer relação contratual,
            empregatícia, de prestação de serviço ou de qualquer outra natureza entre o
            usuário e o desenvolvedor.
          </Section>

          <Section title="5. Ciência dos riscos">
            Ao aceitar estes termos, você declara estar ciente de que:
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Dados sensíveis (incluindo senhas) ficam apenas no seu dispositivo</li>
              <li>O compartilhamento via link transmite os dados de texto (sem foto) codificados, e a responsabilidade pelo destino do link é exclusivamente sua</li>
              <li>A perda, formatação ou substituição do dispositivo resulta na perda dos dados (não há backup automático em nuvem)</li>
              <li>Você é responsável legal pelo uso adequado das informações cadastradas e compartilhadas</li>
            </ul>
          </Section>

          <p className="text-slate-400 text-xs pt-3 border-t border-slate-800">
            Última atualização destes termos: 2026.
          </p>
        </div>

        <div className="sticky bottom-0 -mx-4 px-4 py-4 bg-slate-950/95 backdrop-blur border-t border-slate-800 space-y-2">
          {mode === 'initial' ? (
            <>
              <button onClick={handleAccept} className="btn-primary">
                Li e aceito os termos
              </button>
              <p className="text-center text-slate-500 text-xs">
                Se você não concorda, basta fechar o aplicativo.
              </p>
            </>
          ) : (
            <button onClick={onClose} className="btn-secondary">
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-emerald-400 font-semibold mb-1">{title}</h3>
      <div>{children}</div>
    </div>
  )
}
