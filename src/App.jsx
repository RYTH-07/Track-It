import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'

import { useAuth }        from './hooks/useAuth.js'
import { useProblems }    from './hooks/useProblems.js'
import { useStats }       from './hooks/useStats.js'
import { useNotebooks }   from './hooks/useNotebooks.js'
import { useActivityLog } from './hooks/useActivityLog.js'
import { useAssignments } from './hooks/useAssignments.js'

import Navbar        from './components/Navbar.jsx'
import Landing       from './pages/Landing.jsx'
import Onboarding    from './pages/Onboarding.jsx'
import Dashboard     from './pages/Dashboard.jsx'
import ReviewSession from './pages/ReviewSession.jsx'
import LogProblem    from './pages/LogProblem.jsx'
import Problems      from './pages/Problems.jsx'
import Archive       from './pages/Archive.jsx'
import Topics        from './pages/Topics.jsx'
import Stats         from './pages/Stats.jsx'
import Achievements  from './pages/Achievements.jsx'
import Leaderboard   from './pages/Leaderboard.jsx'
import ImportExport  from './pages/ImportExport.jsx'
import Profile       from './pages/Profile.jsx'
import About         from './pages/About.jsx'
import Contact       from './pages/Contact.jsx'
import Assignments   from './pages/Assignments.jsx'
import TeacherAssign from './pages/TeacherAssign.jsx'
import Modal         from './components/Modal.jsx'
import AppFooter      from './components/AppFooter.jsx'
import ResetPassword from './pages/ResetPassword'
import PrivacyPolicy  from './pages/PrivacyPolicy.jsx'
import TermsOfService from './pages/TermsOfService.jsx'

// ─── Dark mode util ───────────────────────────────────────────────────────────
function getInitialDark() {
  try {
    const stored = localStorage.getItem('trackit-theme')
    if (stored === 'light') return false
    if (stored === 'dark') return true
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
  } catch {
    return true
  }
}

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

// ─── Main App (inner, has router context) ────────────────────────────────────
function AppInner() {
  const navigate = useNavigate()
  const location = useLocation() // ✅ moved above all early returns — fixes Rules of Hooks violation
  const [darkMode, setDarkMode] = useState(true)
  const [logoutModal, setLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState([])

  // Apply theme on mount + change
  useEffect(() => { applyTheme(darkMode) }, [darkMode])

  const toggleDark = () => {
    setDarkMode(d => {
      const next = !d
      try { localStorage.setItem('trackit-theme', next ? 'dark' : 'light') } catch {}
      return next
    })
  }

  // ── Auth ──
  const { user, profile, loading: authLoading, needsOnboarding, isProfessor,
    signIn, signUp, signOut, updateDisplayName, resetPassword } = useAuth()

  // ── Data hooks (only active when logged in) ──
  const {
    problems,
    allProblems,
    archivedProblems,
    loading: probLoading,
    dueProblems,
    addProblem,
    reviewProblem,
    updateNotes,
    deleteProblem,
    archiveProblem,
    restoreProblem,
    importProblems,
    refetch
  } = useProblems(user?.id)

  const { notebooks, upsertNotebook, deleteNotebook, refetch: refetchNotebooks } = useNotebooks(user?.id)

  const { stats, awardXP, updateWeeklyGoal, recheckAchievements } = useStats(user?.id, allProblems, notebooks)

  const { activityMap, fetchActivity, logReview } = useActivityLog(user?.id)

  const {
    myAssignments,
    allAssignments,
    loading: assignmentsLoading,
    createAssignment,
    completeAssignment,
  } = useAssignments(user?.id, isProfessor)

  // ── Handlers ──
  const handleSignOut = () => {
    setLogoutModal(true)
  }

  const confirmLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
    setLogoutModal(false)
    navigate('/')
  }

  const handleAddProblem = async (fields) => {
    const { data, error, xpEarned } = await addProblem(fields)
    if (!error) {
      await refetch()
      await awardXP(xpEarned)
    }
    return { data, error }
  }

  const handleReview = async (problemId, rating, options = {}) => {
    const { data, error, xpEarned, suggestArchive } = await reviewProblem(problemId, rating, options)
    if (!error) {
      await awardXP(xpEarned)
      await logReview()
    }
    if (!error && suggestArchive) {
      toast.custom((t) => (
        <div className="rounded-2xl border px-4 py-3 shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>⭐ You mastered this 3 times. Archive it?</div>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => { toast.dismiss(t.id); archiveProblem(problemId).then(() => toast.success('Problem archived')) }}>Archive</button>
            <button className="btn btn-ghost btn-sm" onClick={() => toast.dismiss(t.id)}>Keep reviewing</button>
          </div>
        </div>
      ), { duration: 6000 })
    }
    return { data, error }
  }

  const handleUpdateGoal = async (goal) => {
    await updateWeeklyGoal(goal)
  }

  const handleCreateAssignment = async (fields) => {
    return await createAssignment(fields)
  }

  const handleCompleteAssignment = async (assignmentProgressId, problemId) => {
    return await completeAssignment(assignmentProgressId, problemId)
  }

  const handleUpsertNotebook = async (topicName, theory) => {
    const result = await upsertNotebook(topicName, theory)
    return result
  }

  const handleDeleteNotebook = async (id) => {
    await deleteNotebook(id)
  }

  const handleSelectTopic = (topic) => {
    if (!topic || topic === 'all') {
      setSelectedTopics([])
      return
    }
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])
  }

  
  

  const filteredDueProblems = useMemo(() => {
    if (!selectedTopics.length) return dueProblems
    return dueProblems.filter(problem => (problem.topics || []).some(topic => selectedTopics.includes(topic)))
  }, [dueProblems, selectedTopics])

  

  // ── Loading state ready! ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', animation: 'pulse 1.5s ease-in-out infinite' }}>T</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // ── Password reset — must render regardless of auth state. Supabase's
  //    recovery link auto-establishes a session on click, which would
  //    otherwise make `user` truthy and skip straight into the app below. ──
  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />
  }

  // ── Unauthenticated ──
  if (!user) {
    return (
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={
          <Landing
            onSignIn={signIn}
            onSignUp={signUp}
            onForgotPassword={resetPassword}
            darkMode={darkMode}
            toggleDark={toggleDark}
          />
        } />
      </Routes>
    )
  }

  // ── Onboarding ──
  if (needsOnboarding) {
    return <Onboarding onSubmit={updateDisplayName} />
  }

  // ── Authenticated app ──
  const unlockedIds = stats?.unlocked_achievements || []
  const showNavbar = location.pathname !== '/review'

  return (
    <div className="min-h-screen app-bg text-white">
      {showNavbar && (
        <Navbar
          stats={stats}
          dueCount={dueProblems.length}
          solvedCount={problems.length}
          darkMode={darkMode}
          toggleDark={toggleDark}
          onSignOut={handleSignOut}
          isProfessor={isProfessor}
        />
      )}

      <main className={showNavbar ? 'pb-12' : 'min-h-screen'}>
        <Routes>
          {isProfessor ? (
            <>
              <Route path="/teacher" element={
                <TeacherAssign
                  allAssignments={allAssignments}
                  loading={assignmentsLoading}
                  onCreate={handleCreateAssignment}
                  professorEmail={user?.email}
                />
              } />
              <Route path="/profile" element={
                <Profile
                  user={user}
                  profile={profile}
                  onUpdateDisplayName={updateDisplayName}
                  onSignOut={handleSignOut}
                />
              } />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="*" element={<Navigate to="/teacher" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <Dashboard
                  problems={problems}
                  dueProblems={filteredDueProblems}
                  stats={stats}
                  onUpdateGoal={handleUpdateGoal}
                  selectedTopics={selectedTopics}
                  onSelectTopic={handleSelectTopic}
                />
              } />
              <Route path="/review" element={
                <ReviewSession
                  dueProblems={filteredDueProblems}
                  onRate={handleReview}
                  onNotesChange={updateNotes}
                  onArchive={archiveProblem}
                />
              } />
              <Route path="/log" element={
                <LogProblem onAdd={handleAddProblem} notebooks={notebooks} onCompleteAssignment={handleCompleteAssignment} />
              } />
              <Route path="/problems" element={
                <Problems problems={allProblems} onDelete={deleteProblem} onUpdate={updateNotes} onArchive={archiveProblem} onUnarchive={restoreProblem} />
              } />
              <Route path="/archive" element={
                <Archive problems={archivedProblems} onRestore={restoreProblem} />
              } />
              <Route path="/topics" element={
                <Topics
                  problems={problems}
                  notebooks={notebooks}
                  onUpsertNotebook={handleUpsertNotebook}
                  onDeleteNotebook={handleDeleteNotebook}
                  onAchievementCheck={recheckAchievements}

                />
              } />
              
              <Route path="/stats" element={
                <Stats
                  problems={problems}
                  stats={stats}
                  activityMap={activityMap}
                  onFetchActivity={fetchActivity}
                />
              } />
              <Route path="/achievements" element={
                <Achievements unlockedIds={unlockedIds} />
              } />
              <Route path="/leaderboard" element={
                <Leaderboard currentUserId={user?.id} />
              } />
              <Route path="/import-export" element={
                <ImportExport problems={problems} onImport={importProblems} />
              } />
              <Route path="/assignments" element={
                <Assignments myAssignments={myAssignments} loading={assignmentsLoading} />
              } />
              <Route path="/profile" element={
                <Profile
                  user={user}
                  profile={profile}
                  onUpdateDisplayName={updateDisplayName}
                  onSignOut={handleSignOut}
                />
              } />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </main>
      {showNavbar && <AppFooter />}

      <Modal
        open={logoutModal}
        onClose={() => {
          if (!loggingOut) setLogoutModal(false)
        }}
        title="Sign Out"
        maxWidth={420}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)"
              }}
            >
              👋
            </div>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                Sign Out?
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                You're about to sign out of Track-It.
                <br /><br />
                Your progress has already been saved.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="btn btn-ghost"
              disabled={loggingOut}
              onClick={() => setLogoutModal(false)}
            >
              Stay Logged In
            </button>
            <button
              className="btn btn-primary"
              disabled={loggingOut}
              onClick={confirmLogout}
            >
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#4ADE80', secondary: 'transparent' } },
          error:   { iconTheme: { primary: '#F87171', secondary: 'transparent' } },
        }}
      />
    </BrowserRouter>
  )
}