import { useState } from 'react'
import { MapaScreen } from './screens/MapaScreen.jsx'
import { CadastroScreen } from './screens/CadastroScreen.jsx'
import { DetalheScreen } from './screens/DetalheScreen.jsx'
import { ListaScreen } from './screens/ListaScreen.jsx'
import { ImportScreen } from './screens/ImportScreen.jsx'
import { getHgu } from './utils/storage.js'
import { readImportFromUrl, clearImportFromUrl } from './utils/share.js'

const SCREENS = {
  MAPA: 'mapa',
  CADASTRO: 'cadastro',
  DETALHE: 'detalhe',
  LISTA: 'lista'
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.MAPA)
  const [selectedHguId, setSelectedHguId] = useState(null)
  // Quando setado, o Cadastro entra em modo edição
  const [editingHguId, setEditingHguId] = useState(null)
  // Posição atual mantida em App pra compartilhar entre Mapa, Lista e Cadastro
  const [userPosition, setUserPosition] = useState(null)
  // Pedido de foco em um HGU no mapa (ts garante refire pro mesmo HGU)
  const [focusRequest, setFocusRequest] = useState(null)
  // HGUs recebidos por link (#import=...) — se houver, mostra a tela de importação
  const [importItems, setImportItems] = useState(() => readImportFromUrl())

  // Lê do storage a cada render — barato e sempre fresco
  const selectedHgu = selectedHguId ? getHgu(selectedHguId) : null

  function openDetalhe(hgu) {
    setSelectedHguId(hgu.id)
    setScreen(SCREENS.DETALHE)
  }

  function showOnMap(hgu) {
    setFocusRequest({ hguId: hgu.id, ts: Date.now() })
    setScreen(SCREENS.MAPA)
  }

  function openCadastroNew() {
    setEditingHguId(null)
    setScreen(SCREENS.CADASTRO)
  }

  function openCadastroEdit(hgu) {
    setEditingHguId(hgu.id)
    setScreen(SCREENS.CADASTRO)
  }

  // Importação tem prioridade sobre tudo
  if (importItems !== null) {
    return (
      <ImportScreen
        incoming={importItems}
        onDone={() => {
          clearImportFromUrl()
          setImportItems(null)
          setScreen(SCREENS.MAPA)
        }}
      />
    )
  }

  if (screen === SCREENS.CADASTRO) {
    const editing = editingHguId ? getHgu(editingHguId) : null
    const goBack = () => {
      if (editingHguId) {
        setEditingHguId(null)
        setScreen(SCREENS.DETALHE)
      } else {
        setScreen(SCREENS.MAPA)
      }
    }
    return (
      <CadastroScreen
        editingHgu={editing}
        onBack={goBack}
        onSaved={goBack}
        userPosition={userPosition}
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
        onShowOnMap={showOnMap}
        onEdit={openCadastroEdit}
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
      onNewHgu={openCadastroNew}
      onSelectHgu={openDetalhe}
      onOpenList={() => setScreen(SCREENS.LISTA)}
      userPosition={userPosition}
      onUserPositionChange={setUserPosition}
      focusRequest={focusRequest}
    />
  )
}
