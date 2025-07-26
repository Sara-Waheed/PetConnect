import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');
const navigate = useNavigate(); // initialize navigation


const VideoRoom = ({ roomId }) => {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const userVideo = useRef();
    const videoGridRef = useRef();
    const peersRef = useRef([]);
    const myStream = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myStream.current = stream;
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            socket.emit('join-room', roomId);

            socket.on('user-joined', (userId) => {
                const peerConnection = createPeerConnection(userId);
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
            });

            socket.on('offer', handleReceiveOffer);
            socket.on('answer', handleAnswer);
            socket.on('ice-candidate', handleNewICECandidateMsg);
            socket.on('user-left', handleUserLeft);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId]);

    const createPeerConnection = (userId) => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    target: userId,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.ontrack = (event) => {
            const newVideo = document.createElement('video');
            newVideo.srcObject = event.streams[0];
            newVideo.autoplay = true;
            newVideo.playsInline = true;
            newVideo.className = "w-1/3 rounded-md shadow-md";
            videoGridRef.current.appendChild(newVideo);
        };

        peersRef.current.push({
            peerID: userId,
            peer: peerConnection,
        });

        return peerConnection;
    };

    const handleReceiveOffer = async (incoming) => {
        const peerConnection = createPeerConnection(incoming.caller);
        myStream.current.getTracks().forEach(track => peerConnection.addTrack(track, myStream.current));

        await peerConnection.setRemoteDescription(new RTCSessionDescription(incoming.sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', {
            target: incoming.caller,
            sdp: peerConnection.localDescription
        });
    };

    const handleAnswer = async (message) => {
        const item = peersRef.current.find(p => p.peerID === message.caller);
        if (item) {
            await item.peer.setRemoteDescription(new RTCSessionDescription(message.sdp));
        }
    };

    const handleNewICECandidateMsg = async (incoming) => {
        const item = peersRef.current.find(p => p.peerID === incoming.caller);
        if (item) {
            try {
                await item.peer.addIceCandidate(new RTCIceCandidate(incoming.candidate));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleUserLeft = (id) => {
        const peerObj = peersRef.current.find(p => p.peerID === id);
        if (peerObj) {
            peerObj.peer.close();
        }
        peersRef.current = peersRef.current.filter(p => p.peerID !== id);
    };

    const toggleMic = () => {
        const audioTrack = myStream.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    const toggleCamera = () => {
        const videoTrack = myStream.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsCameraOn(videoTrack.enabled);
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                peersRef.current.forEach(({ peer }) => {
                    const sender = peer.getSenders().find(s => s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                screenTrack.onended = () => {
                    stopScreenShare();
                };

                userVideo.current.srcObject = screenStream;
                myStream.current.removeTrack(myStream.current.getVideoTracks()[0]);
                myStream.current.addTrack(screenTrack);

                setIsScreenSharing(true);
            } catch (err) {
                console.error('Error sharing screen:', err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = async () => {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoTrack = localStream.getVideoTracks()[0];

        peersRef.current.forEach(({ peer }) => {
            const sender = peer.getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        });

        userVideo.current.srcObject = localStream;
        myStream.current = localStream;
        setIsScreenSharing(false);
    };

    const leaveMeeting = () => {
        // Stop all media tracks
        myStream.current.getTracks().forEach(track => track.stop());

        // Close all peer connections
        peersRef.current.forEach(({ peer }) => peer.close());

        // Disconnect socket
        socket.disconnect();

        // Redirect to home or goodbye page
        navigate('/');
    };



    return (
        <div className="flex flex-col items-center justify-center bg-gray-200 min-h-screen p-4">
            <div ref={videoGridRef} className="flex flex-wrap gap-4 w-full justify-center mb-4">
                <video muted ref={userVideo} autoPlay playsInline className="w-1/3 rounded-md shadow-md" />
            </div>

            {/* Control Buttons */}
            <div className="flex gap-6 bg-white p-4 rounded-md shadow-lg">
                <button
                    onClick={toggleMic}
                    className={`px-4 py-2 rounded ${isMicOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                    {isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                </button>
                <button
                    onClick={toggleCamera}
                    className={`px-4 py-2 rounded ${isCameraOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                    {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                </button>
                <button
                    onClick={toggleScreenShare}
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                    {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                </button>
                <div className="flex gap-6 bg-white p-4 rounded-md shadow-lg">
                    {/* Existing buttons */}
                    <button
                        onClick={toggleMic}
                        className={`px-4 py-2 rounded ${isMicOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
                    >
                        {isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                    </button>
                    <button
                        onClick={toggleCamera}
                        className={`px-4 py-2 rounded ${isCameraOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
                    >
                        {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                    </button>
                    <button
                        onClick={toggleScreenShare}
                        className="px-4 py-2 rounded bg-blue-600 text-white"
                    >
                        {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                    </button>

                    {/* 🚨 Leave Meeting Button */}
                    <button
                        onClick={leaveMeeting}
                        className="px-4 py-2 rounded bg-red-700 text-white"
                    >
                        Leave Meeting
                    </button>
                </div>

            </div>
        </div>
    );
};

export default VideoRoom;
