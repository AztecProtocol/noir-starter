import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Component from './components/index';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Component />
    <ToastContainer />
  </>,
);
