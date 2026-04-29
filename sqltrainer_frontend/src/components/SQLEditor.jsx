import React from "react";
import ReactDOM from "react-dom";
import Editor from "@monaco-editor/react";
import { LanguageIdEnum } from "monaco-sql-languages";

const SQLEditor = () => {
  return (
    <Editor
      height="90vh"
      defaultLanguage={LanguageIdEnum.MYSQL}
      defaultValue="-- SELECT * FROM table1;"
    />
  );
};
export default SQLEditor;
