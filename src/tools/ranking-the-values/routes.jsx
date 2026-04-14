import { Route } from 'react-router-dom'
import SessionList from './index'
import CreateSession from './CreateSession'
import SessionDetail from './SessionDetail'
import EditSession from './EditSession'
import PublicRankingForm from './PublicRankingForm'

export const rankingTheValuesRoutes = (
  <>
    <Route path="/tools/ranking-the-values" element={<SessionList />} />
    <Route path="/tools/ranking-the-values/nieuw" element={<CreateSession />} />
    <Route path="/tools/ranking-the-values/:sessionId" element={<SessionDetail />} />
    <Route path="/tools/ranking-the-values/:sessionId/bewerken" element={<EditSession />} />
  </>
)

export const rankingTheValuesPublicRoutes = (
  <Route path="/publiek/ranking-the-values/:shareCode" element={<PublicRankingForm />} />
)
