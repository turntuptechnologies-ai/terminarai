import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ChapterIndexPage } from './pages/ChapterIndexPage'
import { HomePage } from './pages/HomePage'
import { LessonPage } from './pages/LessonPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PracticeIndexPage } from './pages/PracticeIndexPage'
import { PracticePage } from './pages/PracticePage'
import { ReferencePage } from './pages/ReferencePage'
import { SandboxPage } from './pages/SandboxPage'
import { TutorialIndexPage } from './pages/TutorialIndexPage'
import { PATHS } from './routes'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.tutorial} element={<TutorialIndexPage />} />
        <Route path={PATHS.chapter} element={<ChapterIndexPage />} />
        <Route path={PATHS.lesson} element={<LessonPage />} />
        <Route path={PATHS.practice} element={<PracticeIndexPage />} />
        <Route path={PATHS.problem} element={<PracticePage />} />
        <Route path={PATHS.sandbox} element={<SandboxPage />} />
        <Route path={PATHS.reference} element={<ReferencePage />} />
        <Route path={PATHS.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
