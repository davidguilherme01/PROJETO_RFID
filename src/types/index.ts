// Domínio do Sistema de Gerenciamento de Corrida RFID.
// Todos os timestamps são strings em formato ISO-8601 (UTC).
// Todas as durações de tempo (tempoParcial, tempoTotal, tempoAtual) estão em SEGUNDOS.

export type StatusCorredor = 'ativo' | 'inativo'

export type StatusTag = 'ativa' | 'inativa' | 'manutencao'

export type StatusDispositivo = 'online' | 'offline' | 'alerta'

export type TipoDispositivo = 'AP' | 'Switch' | 'Leitor' | 'Servidor'

export type CategoriaCorredor =
  | 'M Geral'
  | 'M 30-39'
  | 'M 40-49'
  | 'M 50+'
  | 'F Geral'
  | 'F 30-39'
  | 'F 40-49'
  | 'F 50+'

export type Sexo = 'M' | 'F' | 'O'

export interface ContatoEmergencia {
  nome: string
  telefone: string
  parentesco: string
}

export interface Corredor {
  id: string
  nome: string
  cpf: string
  idade: number
  numeroCamisa: number
  tagRFID: string
  categoria: CategoriaCorredor
  status: StatusCorredor
  dataInscricao: string
  foto?: string

  // Campos opcionais — adicionados pelo formulário de cadastro/edição.
  // Mocks pré-existentes não os têm preenchidos.
  email?: string
  telefone?: string
  sexo?: Sexo
  cintaCardiacaId?: string
  contatoEmergencia?: ContatoEmergencia
}

export interface Espectador {
  id: string
  nome: string
  email: string
  telefone: string
  corredorVinculadoId: string
}

export interface TagRFID {
  id: string
  codigo: string
  corredorId: string
  ultimaLeitura: string
  antenaId: string
  status: StatusTag
}

export interface LeituraRFID {
  id: string
  tagId: string
  antenaId: string
  timestamp: string
  checkpoint: string
}

export interface Checkpoint {
  id: string
  nome: string
  posicaoKm: number
  antenaId: string
}

export interface FrequenciaCardiaca {
  id: string
  corredorId: string
  bpm: number
  timestamp: string
}

export interface Cronometragem {
  id: string
  corredorId: string
  checkpoint: string
  tempoParcial: number
  tempoTotal: number
  posicao: number
}

export interface DispositivoHardware {
  id: string
  nome: string
  tipo: TipoDispositivo
  status: StatusDispositivo
  ip: string
  ultimaConexao: string
}

export interface RankingItem {
  posicao: number
  corredor: Corredor
  tempoAtual: number
  ultimoCheckpoint: string
  bpmAtual: number
}

// ---------- Autenticação ----------

export type PerfilUsuario = 'administrador' | 'corredor' | 'espectador'

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  avatar?: string
  // Preenchido apenas quando perfil === 'corredor'; aponta para Corredor.id.
  corredorId?: string
}

export interface SessaoAuth {
  usuario: Usuario | null
  isAuthenticated: boolean
}
