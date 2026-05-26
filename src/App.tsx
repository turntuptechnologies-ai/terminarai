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

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tutorial" element={<TutorialIndexPage />} />
        <Route path="/tutorial/:chapterId" element={<ChapterIndexPage />} />
        <Route path="/tutorial/:chapterId/:lessonId" element={<LessonPage />} />
        <Route path="/practice" element={<PracticeIndexPage />} />
        <Route path="/practice/:problemId" element={<PracticePage />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/reference" element={<ReferencePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
