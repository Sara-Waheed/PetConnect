import React, { useState } from "react";
import VideoCall from "../components/VideoCall";

export default function TestVideo() {
  const [room, setRoom] = useState("");
  const [mode, setMode] = useState(null);
  const [inCall, setInCall] = useState(false);

  const generateRoomID = () => {
    const id = Math.random().toString(36).substring(2, 8); // 6 random characters
    setRoom(id);
  };

  if (inCall) {
    return (
      <VideoCall
        roomID={room}
        mode={mode}
        onEnd={() => setInCall(false)}
      />
    );
  }

  return (
    <div className="p-8 space-y-4">
      <div className="space-x-2">
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter or generate room ID"
          className="border p-2 mr-2"
        />
        <button
          onClick={generateRoomID}
          className="px-3 py-2 bg-purple-500 text-white rounded"
        >
          Generate ID
        </button>
      </div>

      <div className="space-x-2">
        <button
          onClick={() => { setMode("start"); setInCall(true); }}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Start Call
        </button>
        <button
          onClick={() => { setMode("join"); setInCall(true); }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Join Call
        </button>
      </div>
    </div>
  );
}
