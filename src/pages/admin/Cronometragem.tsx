import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { CronometragemPorCheckpoint } from '@/components/cronometragem/CronometragemPorCheckpoint'
import { CronometragemPorCorredor } from '@/components/cronometragem/CronometragemPorCorredor'
import { CronometragemTabelaGeral } from '@/components/cronometragem/CronometragemTabelaGeral'

export default function CronometragemPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cronometragem"
        description="Tempos parciais e totais por checkpoint, em 3 visualizações."
      />

      <Tabs defaultValue="por-corredor">
        <TabsList>
          <TabsTrigger value="por-corredor">Por corredor</TabsTrigger>
          <TabsTrigger value="por-checkpoint">Por checkpoint</TabsTrigger>
          <TabsTrigger value="tabela-geral">Tabela geral</TabsTrigger>
        </TabsList>
        <TabsContent value="por-corredor" className="mt-4">
          <CronometragemPorCorredor />
        </TabsContent>
        <TabsContent value="por-checkpoint" className="mt-4">
          <CronometragemPorCheckpoint />
        </TabsContent>
        <TabsContent value="tabela-geral" className="mt-4">
          <CronometragemTabelaGeral />
        </TabsContent>
      </Tabs>
    </div>
  )
}
