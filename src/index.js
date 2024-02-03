import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import reportWebVitals from "./reportWebVitals.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBA6lSZdSqK1TeFkCfQ6-IOZlyn2BipUvU",
  authDomain: "wordle-quordle-helper.firebaseapp.com",
  databaseURL: "https://wordle-quordle-helper-default-rtdb.firebaseio.com",
  projectId: "wordle-quordle-helper",
  storageBucket: "wordle-quordle-helper.appspot.com",
  messagingSenderId: "334791643548",
  appId: "1:334791643548:web:f964822b59ce1e2ae2f859",
  measurementId: "G-9YHWCZBEBW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(document.getElementById("root"));
const initWordSetType =
  window?.location.search.toLowerCase().indexOf("quordle") < 0
    ? "wordle"
    : "quordle";

root.render(
  <React.StrictMode>
    <App initWordSetType={initWordSetType} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
