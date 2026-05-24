// Metadata estática da prova exibida no header. Computado uma vez no boot
// do módulo — assim o cronômetro tem um T0 fixo durante toda a sessão.
const HORAS_DESDE_INICIO = 2.5

export const RACE_INICIO = new Date(
  Date.now() - HORAS_DESDE_INICIO * 60 * 60 * 1000,
)

export const RACE_NOME = '21K São Paulo Marathon'
