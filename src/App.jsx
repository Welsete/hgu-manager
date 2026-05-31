import { useEffect, useState } from 'react'
import { MapaScreen } from './screens/MapaScreen.jsx'
import { CadastroScreen } from './screens/CadastroScreen.jsx'
import { DetalheScreen } from './screens/DetalheScreen.jsx'
import { ListaScreen } from './screens/ListaScreen.jsx'
import { ImportScreen } from './screens/ImportScreen.jsx'
import { TermsModal } from './components/TermsModal.jsx'
import { getHgu } from './utils/storage.js'
import { readImportFromUrl, clearImportFromUrl } from './utils/share.js'
import { isTermsAccepted } from './utils/terms.js'

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

  // Termos: 'hidden' | 'initial' (precisa aceitar) | 'view' (consulta)
  const [termsMode, setTermsMode] = useState(() => (isTermsAccepted() ? 'hidden' : 'initial'))

  const selectedHgu = selectedHguId ? getHgu(selectedHguId) : null

  // Empilha history pra import-ativo
  useEffect(() => {
    if (importItems !== null) {
      window.history.pushState({ screen: IMPORT_SCREEN }, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Botão Voltar do navegador / Android
  useEffect(() => {
    function onPop(e) {
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
        setScreen(SCREENS.MAPA)
        setSelectedHguId(null)
        setEditingHguId(null)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Listener pro link "Termos" reabrir o modal em modo consulta
  useEffect(() => {
    function onShow() {
      setTermsMode((prev) => (prev === 'hidden' ? 'view' : prev))
    }
    window.addEventListener('show-terms', onShow)
    return () => window.removeEventListener('show-terms', onShow)
  }, [])

  function pushScreen(extraState) {
    window.history.pushState({ ...extraState }, '')
  }

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
    if (window.history.state?.screen === IMPORT_SCREEN) {
      window.history.back()
    } else {
      setImportItems(null)
      setScreen(SCREENS.MAPA)
    }
  }

  // Termos obrigatórios bloqueiam o app na primeira vez
  if (termsMode === 'initial') {
    return (
      <TermsModal
        open
        mode="initial"
        onAccept={() => setTermsMode('hidden')}
      />
    )
  }

  // Renderiza a tela atual; o modal de consulta aparece sobreposto
  const mainScreen = (() => {
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
  })()

  return (
    <>
      {mainScreen}
      <TermsModal
        open={termsMode === 'view'}
        mode="view"
        onClose={() => setTermsMode('hidden')}
      />
    </>
  )
}
