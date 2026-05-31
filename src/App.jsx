import { useEffect, useState } from 'react'
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
const IMPORT_SCREEN = 'import-active'

export default function App() {
  const [screen, setScreen] = useState(SCREENS.MAPA)
  const [selectedHguId, setSelectedHguId] = useState(null)
  const [editingHguId, setEditingHguId] = useState(null)
  const [userPosition, setUserPosition] = useState(null)
  const [focusRequest, setFocusRequest] = useState(null)
  const [importItems, setImportItems] = useState(() => readImportFromUrl())

  const selectedHgu = selectedHguId ? getHgu(selectedHguId) : null

  // Se chegou com link de import, empilha um estado pra que o botão Voltar
  // dispense o import e volte pro mapa em vez de sair do app.
  useEffect(() => {
    if (importItems !== null) {
      window.history.pushState({ screen: IMPORT_SCREEN }, '')
    }
    // executa só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Botão Voltar do navegador / Android: restaura o estado a partir do history
  useEffect(() => {
    function onPop(e) {
      // Qualquer back limpa import ativo
      setImportItems(null)
      const s = e.state
      if (s?.screen && s.screen !== IMPORT_SCREEN) {
        setScreen(s.screen)
        setSelectedHguId(s.selectedHguId ?? null)
        setEditingHguId(s.editingHguId ?? null)
        if (s.focusHguId) {
          setFocusRequest({ hguId: s.focusHguId, ts: Date.now() })
        }
      } else {
        // Sem estado: voltou pra raiz (Mapa)
        setScreen(SCREENS.MAPA)
        setSelectedHguId(null)
        setEditingHguId(null)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Empilha uma entrada de histórico ao navegar pra qualquer tela não-raiz.
  function pushScreen(extraState) {
    window.history.pushState({ ...extraState }, '')
  }

  // UI Voltar: simplesmente usa o histórico — o popstate restaura
  function goBack() {
    window.history.back()
  }

  function openDetalhe(hgu) {
    pushScreen({ screen: SCREENS.DETALHE, selectedHguId: hgu.id })
    setSelectedHguId(hgu.id)
    setScreen(SCREENS.DETALHE)
  }

  function showOnMap(hgu) {
    pushScreen({ screen: SCREENS.MAPA, focusHguId: hgu.id })
    setFocusRequest({ hguId: hgu.id, ts: Date.now() })
    setScreen(SCREENS.MAPA)
    setSelectedHguId(null)
  }

  function openCadastroNew() {
    pushScreen({ screen: SCREENS.CADASTRO })
    setEditingHguId(null)
    setScreen(SCREENS.CADASTRO)
  }

  function openCadastroEdit(hgu) {
    pushScreen({ screen: SCREENS.CADASTRO, editingHguId: hgu.id, selectedHguId: hgu.id })
    setEditingHguId(hgu.id)
    setScreen(SCREENS.CADASTRO)
  }

  function openLista() {
    pushScreen({ screen: SCREENS.LISTA })
    setScreen(SCREENS.LISTA)
  }

  function dismissImport() {
    clearImportFromUrl()
    // Tenta voltar via histórico (caso tenha sido empilhado na montagem).
    // Se não houver entrada (carregamento fresco sem empilhar), faz fallback.
    if (window.history.state?.screen === IMPORT_SCREEN) {
      window.history.back()
    } else {
      setImportItems(null)
      setScreen(SCREENS.MAPA)
    }
  }

  // Importação tem prioridade sobre tudo
  if (importItems !== null) {
    return <ImportScreen incoming={importItems} onDone={dismissImport} />
  }

  if (screen === SCREENS.CADASTRO) {
    const editing = editingHguId ? getHgu(editingHguId) : null
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
        onBack={goBack}
        onDeleted={goBack}
        onShowOnMap={showOnMap}
        onEdit={openCadastroEdit}
      />
    )
  }

  if (screen === SCREENS.LISTA) {
    return (
      <ListaScreen
        userPosition={userPosition}
        onBack={goBack}
        onSelectHgu={openDetalhe}
      />
    )
  }

  return (
    <MapaScreen
      onNewHgu={openCadastroNew}
      onSelectHgu={openDetalhe}
      onOpenList={openLista}
      userPosition={userPosition}
      onUserPositionChange={setUserPosition}
      focusRequest={focusRequest}
    />
  )
}
