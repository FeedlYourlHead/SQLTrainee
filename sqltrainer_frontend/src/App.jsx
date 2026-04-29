import React from "react";
import ReactDOM from "react-dom";
import SQLEditor from "./components/SQLEditor";
import './App.css';


function App() {
  return (
    <>
    <div className="problem-condition-container">
      Условия задачи
    </div>
    <div className="editor-and-solution-container">
    <SQLEditor className="editor-container"/>
    <div className="problem-solution">
      Решение
    </div>

    </div>
    </>
  );
};
export default App;
