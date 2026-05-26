export function TutorialIndexPage() {
  return (
    <div className="overflow-y-auto px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-semibold text-2xl">チュートリアル</h2>
        <p className="mt-3 text-zinc-400">
          順を追って Linux
          の基本コマンドを学べます。各レッスンには課題があり、クリアすると次に進めます。
        </p>
        <div
          aria-live="polite"
          className="mt-8 rounded-md border border-zinc-800 border-dashed p-6 text-zinc-500 text-sm"
        >
          現在準備中です。第1章はこの後の作業で公開されます (Issue #7)。
        </div>
      </div>
    </div>
  )
}
