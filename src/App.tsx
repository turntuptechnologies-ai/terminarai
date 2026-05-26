import { useState } from 'react'
import { Terminal } from './components/Terminal'
import { createShell, defaultContext } from './shell'
import { registerAllCommands } from './shell/commands'
import { createDefaultVfs } from './vfs'

const BANNER =
  'terminarai へようこそ。\n' +
  'Linux CLI の基本コマンドをここで練習できます。\n' +
  '試しに `ls` や `cat README.txt` を打ってみてください。\n\n'

function App() {
  // useState の lazy init で「一度だけ生成」を契約レベルで担保する
  const [shell] = useState(() => {
    const vfs = createDefaultVfs()
    const sh = createShell(vfs)
    registerAllCommands(sh)
    return sh
  })

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-zinc-800 border-b px-6 py-3">
        <h1 className="font-semibold text-lg text-zinc-100">terminarai</h1>
        <p className="text-xs text-zinc-500">Linux CLI 見習い道場</p>
      </header>
      <main className="flex flex-1 flex-col">
        <Terminal shell={shell} initialCtx={defaultContext('/home/user')} banner={BANNER} />
      </main>
    </div>
  )
}

export default App
