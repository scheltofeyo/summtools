import { Route } from 'react-router-dom'
import FrameworkList from './index'
import CreateFramework from './CreateFramework'
import FrameworkEditor from './FrameworkEditor'
import CompanySetup from './components/setup/CompanySetup'
import JobsOverview from './components/jobs/JobsOverview'
import GrowthPathEditor from './components/growth-paths/GrowthPathEditor'
import CulturalValues from './components/values/CulturalValues'
import PeopleTable from './components/people/PeopleTable'
import ExportView from './components/export/ExportView'

export const careerFrameworkRoutes = (
  <>
    <Route path="/tools/career-framework" element={<FrameworkList />} />
    <Route path="/tools/career-framework/nieuw" element={<CreateFramework />} />
    <Route path="/tools/career-framework/:frameworkId" element={<FrameworkEditor />}>
      <Route path="setup" element={<CompanySetup />} />
      <Route path="jobs" element={<JobsOverview />} />
      <Route path="gp/:gpId" element={<GrowthPathEditor />} />
      <Route path="values" element={<CulturalValues />} />
      <Route path="people" element={<PeopleTable />} />
      <Route path="export" element={<ExportView />} />
    </Route>
  </>
)
