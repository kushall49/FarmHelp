import React from 'react';
import ServicesHome from './ServicesHome';
import SearchingScreen from './SearchingScreen';
import OperatorFoundScreen from './OperatorFoundScreen';
import JobActiveScreen from './JobActiveScreen';
import JobCompleteScreen from './JobCompleteScreen';
import NavigateToFarmerScreen from './NavigateToFarmerScreen';
import OperatorJobActiveScreen from './OperatorJobActiveScreen';

export const serviceRoutes = [
  { path: '/services', element: <ServicesHome /> },
  { path: '/services/searching', element: <SearchingScreen /> },
  { path: '/services/operator-found', element: <OperatorFoundScreen /> },
  { path: '/services/job-active', element: <JobActiveScreen /> },
  { path: '/services/job-complete', element: <JobCompleteScreen /> },
  { path: '/services/navigate-to-farmer', element: <NavigateToFarmerScreen /> },
  { path: '/services/operator-job-active', element: <OperatorJobActiveScreen /> }
];
