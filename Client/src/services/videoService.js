// src/services/videoService.js
import { io } from "socket.io-client";


class VideoService {
  constructor() {
    this.socket      = null;
    this.pc          = null;
    this.roomID      = null;
    this.localStream = null;
  }

  // 1️⃣ Create socket only when needed (no auto-connect)
  initSocket() {
    if (!this.socket) {
      this.socket = io("http://localhost:5000", {
        autoConnect: false,
        reconnection: false,
        transports: ["websocket"],
      });
      this.socket.on("connect", () => console.log("🔌 Socket connected:", this.socket.id));
      this.socket.on("disconnect", reason => console.log("🔌 Socket disconnected:", reason));
    }
  }

  // 2️⃣ Grab camera + mic
  async initLocalStream(videoEl) {
    console.log("🚀 Getting user media");
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoEl) videoEl.srcObject = this.localStream;
  }



  async createPeerConnection(onRemoteStream) {
    console.log("🚀 Creating RTCPeerConnection");
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
  
    // Debugging hooks
    this.pc.oniceconnectionstatechange = () =>
      console.log("🛰 ICE state:", this.pc.iceConnectionState);
    this.pc.onconnectionstatechange = () =>
      console.log("🔗 Connection state:", this.pc.connectionState);
  
    // send our tracks
    this.localStream.getTracks().forEach((track) =>
      this.pc.addTrack(track, this.localStream)
    );
  
    // receive remote tracks
    this.pc.ontrack = (e) => {
      console.log("🎥 ontrack – remote stream arrived:", e.streams[0]);
      onRemoteStream(e.streams[0]);
    };

    // when ICE goes disconnected/closed/failed, clear the remote video
    this.pc.addEventListener('iceconnectionstatechange', () => {
         const state = this.pc.iceConnectionState;
         console.log("🛰 ICE state changed:", state);
         if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          console.log("🛑 Peer left – notifying UI to clear remote video");
           onRemoteStream(null);
         }
       });
  
    // ICE candidates from us → over socket (de-dup’d)
    this.sentCandidates = new Set();
    this.pc.onicecandidate = ({ candidate }) => {
      if (
        candidate &&
        !this.sentCandidates.has(candidate.candidate)
      ) {
        this.sentCandidates.add(candidate.candidate);
        console.log("📡 onicecandidate – sending candidate", candidate);
        this.socket.emit("ice-candidate", {
          roomID: this.roomID,
          candidate,
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log("📡 Connection state:", this.pc.connectionState);
    };
    this.pc.onsignalingstatechange = () => {
      console.log("🛎️ Signaling state:", this.pc.signalingState);
    };
    
  }
  

  // 4️⃣ Connect socket, join room, wire SDP/ICE handlers
  async joinRoom(roomID) {
    this.roomID = roomID;
    this.initSocket();
  

    this.socket.on("offer", async ({ sdp }) => {
      console.log("📩 Received OFFER");
    
      if (this.pc.signalingState !== "stable") {
        console.warn("⚠️ Skipping offer: not in stable state, current state:", this.pc.signalingState);
        return;
      }
    
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
    
      this.socket.emit("answer", { roomID: this.roomID, sdp: answer });
      console.log("📤 Sent ANSWER");
    });


    
  
    // ✅ 2. Listen when you receive an answer
    this.socket.on("answer", async ({ sdp }) => {
      console.log("📩 Received ANSWER");
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });
  
    // ✅ 3. Listen when you receive ICE candidate
    this.socket.on("ice-candidate", async ({ candidate }) => {
      console.log("📩 Received ICE candidate", candidate);
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("❌ ICE add failed", err);
      }
    });
  
    // 🆕 ✅ 4. Listen when someone is ready (NEW CODE you asked about)
    this.socket.on('ready-for-offer', async ({ socketID }) => {
      console.log("📩 New peer ready, creating offer for", socketID);
  
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
  
      this.socket.emit('offer', { roomID: this.roomID, sdp: offer, to: socketID });
    });
  
    // ✅ 5. Finally connect the socket and join
    console.log("🚀 Connecting socket");
    this.socket.connect();
    console.log("🚀 Joining room", roomID);
    this.socket.emit("join-room", { roomID: this.roomID }); // ✅ correct structure
  }
  

  // 5️⃣ Vet creates & sends the offer
  async startCall() {
    console.log("📤 Creating OFFER");
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    this.socket.emit("offer", { roomID: this.roomID, sdp: offer });
    console.log("📤 Sending OFFER", offer);
  }

  // 6️⃣ Tear everything down
  endCall() {
    console.log("🛑 Ending call");
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new VideoService();
