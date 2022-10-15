import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import logo from "./logo.svg";
import "./App.css";
import { Recognition } from "./modules/Recognition";
import { robot_speak } from "./modules/Speech";

function App() {
  console.log("Component: App");
  const [speech, setSpeech] = useState("");

  useEffect(() => {
    const recognition = new Recognition();
    recognition.onResult = (result) => {
      setSpeech(result);
    };
    recognition.start();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Solo-Talk</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Your speech was..</p>
        <p>{speech}</p>

        <Button variant="contained" onClick={() => robot_speak("hello, an apple a day keeps the doctor away.")}>
          Test Speak
        </Button>
      </header>
    </div>
  );
}

export default App;
