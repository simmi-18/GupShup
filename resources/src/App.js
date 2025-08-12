import React from "react";
import JoinRoom from "./JoinRoom";
import ChatPage from "./Chat";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SocketContext, socket } from "./context/SocketContext";

function App() {
  return (
    <>
      <SocketContext.Provider value={socket}>
        <Router>
          <Routes>
            <Route path="/" element={<JoinRoom />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </SocketContext.Provider>
    </>
  );
}
export default App;
