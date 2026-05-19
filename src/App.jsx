import { useState } from 'react'
import { MapaScreen } from './screens/MapaScreen.jsx'
import { CadastroScreen } from './screens/CadastroScreen.jsx'
import { DetalheScreen } from './screens/DetalheScreen.jsx'
import { getHgu } from './utils/storage.js'

// Navegação simples por estado. Quando crescer (rotas com URL), trocar por react-router.
const SCREENS = {
  MAPA: 'mapa',
  CADASTRO: 'cadastro',
  DETALHE: 'detalhe'
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.MAPA)
  const [selectedHguId, setSelectedHguId] = useState(null)

  // Lê do storage a cada render — barato e sempre fresco
  const selectedHgu = selectedHguId ? getHgu(selectedHguId) : null

  if (screen === SCREENS.CADASTRO) {
    return (
      <CadastroScreen
        onBack={() => setScreen(SCREENS.MAPA)}
        onSaved={() => setScreen(SCREENS.MAPA)}
      />
    )
  }

  if (screen === SCREENS.DETALHE) {
    return (
      <DetalheScreen
        hgu={selectedHgu}
        onBack={() => {
          setSelectedHguId(null)
          setScreen(SCREENS.MAPA)
        }}
        onDeleted={() => {
          setSelectedHguId(null)
          setScreen(SCREENS.MAPA)
        }}
      />
    )
  }

  return (
    <MapaScreen
      onNewHgu={() => setScreen(SCREENS.CADASTRO)}
      onSelectHgu={(hgu) => {
        setSelectedHguId(hgu.id)
        setScreen(SCREENS.DETALHE)
      }}
    />
  )
}
