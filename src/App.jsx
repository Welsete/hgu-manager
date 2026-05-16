import { useEffect, useState } from 'react'
import { HomeScreen } from './screens/HomeScreen.jsx'
import { CadastroScreen } from './screens/CadastroScreen.jsx'
import { countHgus } from './utils/storage.js'

// Navegação simples por estado. Quando crescer (Módulos 2+) trocar por react-router.
const SCREENS = {
  HOME: 'home',
  CADASTRO: 'cadastro'
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME)
  const [count, setCount] = useState(0)
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    setCount(countHgus())
  }, [screen])

  function handleSaved(hgu) {
    setLastSaved(hgu)
    setCount(countHgus())
    setScreen(SCREENS.HOME)
  }

  if (screen === SCREENS.CADASTRO) {
    return (
      <CadastroScreen
        onBack={() => setScreen(SCREENS.HOME)}
        onSaved={handleSaved}
      />
    )
  }

  return (
    <HomeScreen
      count={count}
      lastSaved={lastSaved}
      onNewHgu={() => {
        setLastSaved(null)
        setScreen(SCREENS.CADASTRO)
      }}
    />
  )
}
