import { useState } from 'react'
import { MapaScreen } from './screens/MapaScreen.jsx'
import { CadastroScreen } from './screens/CadastroScreen.jsx'
import { DetalheScreen } from './screens/DetalheScreen.jsx'
import { ListaScreen } from './screens/ListaScreen.jsx'
import { getHgu } from './utils/storage.js'

const SCREENS = {
  MAPA: 'mapa',
  CADASTRO: 'cadastro',
  DETALHE: 'detalhe',
  LISTA: 'lista'
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.MAPA)
  const [selectedHguId, setSelectedHguId] = useState(null)
  // Posição atual mantida em App pra compartilhar entre Mapa e Lista
  const [userPosition, setUserPosition] = useState(null)

  // Lê do storage a cada render — barato e sempre fresco
  const selectedHgu = selectedHguId ? getHgu(selectedHguId) : null

  function openDetalhe(hgu) {
    setSelectedHguId(hgu.id)
    setScreen(SCREENS.DETALHE)
  }

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

  if (screen === SCREENS.LISTA) {
    return (
      <ListaScreen
        userPosition={userPosition}
        onBack={() => setScreen(SCREENS.MAPA)}
        onSelectHgu={openDetalhe}
      />
    )
  }

  return (
    <MapaScreen
      onNewHgu={() => setScreen(SCREENS.CADASTRO)}
      onSelectHgu={openDetalhe}
      onOpenList={() => setScreen(SCREENS.LISTA)}
      userPosition={userPosition}
      onUserPositionChange={setUserPosition}
    />
  )
}
