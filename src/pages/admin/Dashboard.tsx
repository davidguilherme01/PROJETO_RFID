import { motion } from 'framer-motion'
import { HeartPulse, Radio, Trophy, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { AlertasCardiacos } from '@/components/dashboard/AlertasCardiacos'
import { AtividadeChart } from '@/components/dashboard/AtividadeChart'
import { DistribuicaoPercurso } from '@/components/dashboard/DistribuicaoPercurso'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { StatusEquipamentos } from '@/components/dashboard/StatusEquipamentos'
import { Top3Podio } from '@/components/dashboard/Top3Podio'
import { UltimasLeituras } from '@/components/dashboard/UltimasLeituras'
import { Skeleton } from '@/components/ui/skeleton'
import { mockCheckpoints, mockCorredores, mockCronometragem } from '@/data'
import { useAlertasCardiacos } from '@/hooks/useAlertasCardiacos'
import { useLeiturasRecentes } from '@/hooks/useLeiturasRecentes'
import { useRankingLive } from '@/hooks/useRankingLive'
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics'

// Deriva status do corredor cruzando dados de cronometragem.
// "finalizado" = passou pela Chegada (CP-05). "em_prova" = ativo e não finalizou.
function deriveContagens() {
  const cpChegada = mockCheckpoints.find((cp) => cp.nome === 'Chegada')
  const finalizadosIds = new Set(
    mockCronometragem
      .filter((c) => c.checkpoint === cpChegada?.id)
      .map((c) => c.corredorId),
  )
  const ativos = mockCorredores.filter((c) => c.status === 'ativo')
  return {
    emProva: ativos.filter((c) => !finalizadosIds.has(c.id)).length,
    finalizaram: finalizadosIds.size,
  }
}

// Wrapper para entrada animada escalonada (slide-up + fade) por "linha".
function Row({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Skeletons agrupados — 600ms inicial para parecer "carregando dados ao vivo".
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[360px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[360px] rounded-xl" />
        <Skeleton className="h-[360px] rounded-xl lg:col-span-2" />
      </div>
    </div>
  )
}

export default function DashboardAdminPage() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600)
    return () => window.clearTimeout(t)
  }, [])

  const metrics = useRealTimeMetrics()
  const ranking = useRankingLive()
  const leituras = useLeiturasRecentes()
  const { alertas, resolverAlerta } = useAlertasCardiacos()

  const contagens = useMemo(() => deriveContagens(), [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral em tempo real da prova — corredores, leituras, saúde dos atletas e dos equipamentos."
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* LINHA 1 — KPIs */}
          <Row delay={0}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Corredores em prova"
                value={contagens.emProva}
                variacao={-2.4}
                tom="verde"
                icon={Users}
                comparativoLabel="vs 1h atrás"
              />
              <KpiCard
                label="Finalizaram"
                value={contagens.finalizaram}
                variacao={50}
                tom="amarelo"
                icon={Trophy}
                comparativoLabel="vs 1h atrás"
              />
              <KpiCard
                label="BPM médio geral"
                value={Math.round(metrics.bpmMedio.current)}
                variacao={metrics.bpmMedio.variacao}
                tom="vermelho"
                icon={HeartPulse}
                iconAnimado
                comparativoLabel="vs 30 min atrás"
              />
              <KpiCard
                label="Leituras RFID / min"
                value={metrics.leiturasMin.current.toFixed(1)}
                variacao={metrics.leiturasMin.variacao}
                tom="azul"
                icon={Radio}
                comparativoLabel="vs 30 min atrás"
              />
            </div>
          </Row>

          {/* LINHA 2 — Gráfico + Status Equipamentos */}
          <Row delay={0.1}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AtividadeChart metrics={metrics} />
              </div>
              <div>
                <StatusEquipamentos />
              </div>
            </div>
          </Row>

          {/* LINHA 3 — Top 3 + Últimas Leituras */}
          <Row delay={0.2}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <Top3Podio ranking={ranking} />
              </div>
              <div className="lg:col-span-2">
                <UltimasLeituras data={leituras} />
              </div>
            </div>
          </Row>

          {/* LINHA 4 — Distribuição no percurso */}
          <Row delay={0.3}>
            <DistribuicaoPercurso />
          </Row>

          {/* LINHA 5 — Alertas */}
          <Row delay={0.4}>
            <AlertasCardiacos
              alertas={alertas}
              onResolver={resolverAlerta}
            />
          </Row>
        </div>
      )}
    </div>
  )
}
