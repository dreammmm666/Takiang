import { BrowserRouter as Router, Routes, Route ,Link } from 'react-router-dom';
import './App.css'
import React from 'react'
import './App.css'
import Login from './pages/Login';
import Admin from './pages/Admin';
import WorkForm from './pages/WorkForm';

import GraphicWorkTable from './pages/GraphicWorkTable';
import MarketingWorkTable from './pages/MarketingWorkTable';
import GraphicWorkTable_U from './pages/GraphicWorkTable_U';
import MarketingWorkTable_U from './pages/MarketingWorkTable_U';
import Create_user from './pages/Create_user';
import AdminWorkTable from './pages/AdminWorkTable';
import ProjectTable from './pages/ProjectTable';
import FormTask_works from './pages/FormTask_works';
import Formsub_Task from './pages/Formsub_Task';
import Mywork from './pages/Mywork';
import ActivityLog from './pages/ActivityLog';
import Mywork_G from './pages/Mywork_G';
import Mywork_M from './pages/Mywork_M';
import Submit_Work from './pages/Submit_Work';
import ReviewStatusPage from './pages/ReviewStatusPage';
import Check_work from './pages/Check_work';
import Submit_Work_M from './pages/Submit_Work_M';
import ReviewStatusPage_M  from './pages/ReviewStatusPage_M';
import Submit_Work_A from './pages/Submit_Work_A';
import ReviewStatusPage_A from './pages/ReviewStatusPage_A';
import Add_customer from './pages/Add_customer';

function App() {
  return (
    <>
    

<Router>
      
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="Submit_Work" element={<Submit_Work />} />
        <Route path="admin" element={<Admin />} />
        <Route path="workform" element={<WorkForm />} />
         <Route path="Mywork" element={<Mywork />} />
        <Route path="GraphicWorkTable" element={<GraphicWorkTable />} />
        <Route path="MarketingWorkTable" element={<MarketingWorkTable />} />
       <Route path="GraphicWorkTable_U" element={<GraphicWorkTable_U />} />
        <Route path="MarketingWorkTable_U" element={<MarketingWorkTable_U />} />
         <Route path="Create_user" element={<Create_user />} />
         <Route path="AdminWorkTable" element={<AdminWorkTable />} />
          <Route path="ProjectTable" element={<ProjectTable />} />
          <Route path="FormTask_works" element={<FormTask_works />} />
           <Route path="Formsub_Task" element={<Formsub_Task />} />
           <Route path="ActivityLog" element={<ActivityLog />} />
            <Route path="Mywork_G" element={<Mywork_G />} />
             <Route path="Mywork_M" element={<Mywork_M />} />
             <Route path="ReviewStatusPage" element={<ReviewStatusPage />} />
               <Route path="Check_work" element={<Check_work />} />
              <Route path="Submit_Work_M" element={<Submit_Work_M />} />
               <Route path="ReviewStatusPage_M" element={<ReviewStatusPage_M />} />
               <Route path="Submit_Work_A" element={<Submit_Work_A />} />
               <Route path="ReviewStatusPage_A" element={<ReviewStatusPage_A />} />
               <Route path="Add_customer" element={<Add_customer />} />
                  

      </Routes>
    </Router>

    </>
  )
}

export default App