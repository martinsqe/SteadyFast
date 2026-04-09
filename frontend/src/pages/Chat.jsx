import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./Chat.css";

const API = import.meta.env.VITE_API_URL;
const API_BASE = API.replace("/api", "");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

function Chat() {
  const socketCtx = useSocket();
  const socket = socketCtx?.socket || null;
  const { user } = useContext(AuthContext);

  const [activeJob, setActiveJob]         = useState(null);
  const [loadingJob, setLoadingJob]       = useState(true);
  const [messages, setMessages]           = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [input, setInput]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [typingPeer, setTypingPeer]       = useState(null); // name of person typing
  const [imagePreview, setImagePreview]   = useState(null); // { file, dataUrl }
  const [lightboxUrl, setLightboxUrl]     = useState(null); // full-screen image
  const [imageError, setImageError]       = useState("");

  const messagesEndRef  = useRef(null);
  const joinedRoom      = useRef(null);
  const typingTimer     = useRef(null);
  const fileInputRef    = useRef(null);
  const inputRef        = useRef(null);

  const token = () => localStorage.getItem("token");
  const myId  = user?._id || user?.id;

  // ── 1. Fetch active job ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const url = user.role === "mechanic"
      ? `${API}/services/my-active`
      : `${API}/services/my-active-job`;

    axios.get(url, { headers: { Authorization: `Bearer ${token()}` } })
      .then(res => {
        if (user.role === "mechanic") {
          const jobs = Array.isArray(res.data.data) ? res.data.data : [];
          setActiveJob(jobs[0] || null);
        } else {
          setActiveJob(res.data.data || null);
        }
      })
      .catch(() => setActiveJob(null))
      .finally(() => setLoadingJob(false));
  }, [user]);

  // ── 2. Load history + join room ───────────────────────────────────────────
  useEffect(() => {
    if (!activeJob) return;
    const jobId = activeJob._id;

    // Load history
    setLoadingHistory(true);
    axios.get(`${API}/chat/${jobId}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(res => {
        if (res.data.success) setMessages(res.data.messages || []);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));

    // Join socket room
    if (socket && joinedRoom.current !== jobId) {
      socket.emit("job:track", jobId);
      joinedRoom.current = jobId;
    }
  }, [activeJob, socket]);

  // ── 3. Live message listener ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleMsg = (data) => {
      setMessages(prev => [...prev, { ...data, fromServer: true }]);
      setTypingPeer(null);
    };

    const handleTyping = ({ senderName, isTyping }) => {
      setTypingPeer(isTyping ? senderName : null);
    };

    socket.on("chat:message", handleMsg);
    socket.on("chat:typing",  handleTyping);
    return () => {
      socket.off("chat:message", handleMsg);
      socket.off("chat:typing",  handleTyping);
    };
  }, [socket]);

  // ── 4. Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingPeer]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const emitTyping = useCallback(() => {
    if (!socket || !activeJob) return;
    socket.emit("chat:typing", { jobId: activeJob._id, senderName: user?.name, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("chat:typing", { jobId: activeJob._id, senderName: user?.name, isTyping: false });
    }, 2000);
  }, [socket, activeJob, user]);

  // ── Send text message ─────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (imagePreview) { sendImage(); return; }
    if (!input.trim() || !socket || !activeJob) return;

    const payload = {
      jobId: activeJob._id,
      message: input.trim(),
      senderName: user?.name || "You",
      senderId: myId,
      type: "text",
    };

    socket.emit("chat:send", payload);
    setMessages(prev => [...prev, { ...payload, timestamp: new Date().toISOString(), self: true }]);
    setInput("");
    clearTimeout(typingTimer.current);
    socket.emit("chat:typing", { jobId: activeJob._id, senderName: user?.name, isTyping: false });
  };

  // ── Image picker ──────────────────────────────────────────────────────────
  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview({ file, dataUrl: ev.target.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Upload + send image ───────────────────────────────────────────────────
  const sendImage = async () => {
    if (!imagePreview || !socket || !activeJob) return;
    setSending(true);
    setImageError("");

    try {
      const form = new FormData();
      form.append("image", imagePreview.file);

      const res = await axios.post(`${API}/chat/upload-image`, form, {
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" },
      });

      if (!res.data.success) throw new Error(res.data.message);

      const imageUrl = res.data.imageUrl;
      const payload = {
        jobId: activeJob._id,
        message: input.trim(),   // optional caption
        senderName: user?.name || "You",
        senderId: myId,
        type: "image",
        imageUrl,
      };

      socket.emit("chat:send", payload);
      setMessages(prev => [...prev, { ...payload, timestamp: new Date().toISOString(), self: true }]);
      setImagePreview(null);
      setInput("");
    } catch (err) {
      setImageError(err.response?.data?.message || "Image upload failed. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const otherName = user?.role === "mechanic"
    ? (activeJob?.client?.name || "Client")
    : (activeJob?.mechanic?.name || "Mechanic");

  const resolveImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="chat-page">
      <div className="chat-container">

        {/* ── Header ── */}
        <header className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">
              {loadingJob ? "…" : otherName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="chat-header-name">
                {loadingJob ? "Loading…" : activeJob ? otherName : "No Active Job"}
              </div>
              <div className="chat-header-sub">
                {activeJob
                  ? `${activeJob.vehicleType} · ${activeJob.problem}`
                  : "Chat is available during an active service"}
              </div>
            </div>
          </div>
          {activeJob && (
            <div className="chat-live-badge">
              <span className="chat-live-dot" />
              Live
            </div>
          )}
        </header>

        {/* ── Messages ── */}
        <div className="chat-messages">
          {loadingJob && (
            <div className="chat-system-msg">Finding your active job…</div>
          )}

          {!loadingJob && !activeJob && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p className="chat-empty-title">No active service request</p>
              <p className="chat-empty-sub">
                Chat is available once a mechanic has accepted your request.
              </p>
            </div>
          )}

          {!loadingJob && activeJob && loadingHistory && (
            <div className="chat-system-msg">Loading message history…</div>
          )}

          {!loadingJob && activeJob && !loadingHistory && messages.length === 0 && (
            <div className="chat-system-msg">
              Chat started — {activeJob.vehicleType} · {activeJob.problem}. Say hello!
            </div>
          )}

          {messages.map((msg, i) => {
            const isSelf = msg.self || msg.senderId?.toString() === myId?.toString();
            const isImage = msg.type === "image";

            return (
              <div key={i} className={`chat-bubble-row ${isSelf ? "chat-row-right" : "chat-row-left"}`}>
                {!isSelf && (
                  <div className="chat-bubble-avatar">
                    {(msg.senderName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`chat-bubble ${isSelf ? "chat-bubble-self" : "chat-bubble-other"}`}>
                  {!isSelf && <div className="chat-bubble-sender">{msg.senderName}</div>}

                  {isImage ? (
                    <div className="chat-image-wrap">
                      <img
                        src={resolveImageUrl(msg.imageUrl)}
                        alt="shared"
                        className="chat-image"
                        onClick={() => setLightboxUrl(resolveImageUrl(msg.imageUrl))}
                      />
                      {msg.message && <div className="chat-image-caption">{msg.message}</div>}
                    </div>
                  ) : (
                    <div className="chat-bubble-text">{msg.message}</div>
                  )}

                  <div className="chat-bubble-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingPeer && (
            <div className="chat-bubble-row chat-row-left">
              <div className="chat-bubble-avatar">{typingPeer.charAt(0).toUpperCase()}</div>
              <div className="chat-bubble chat-bubble-other chat-typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Image preview bar ── */}
        {imagePreview && (
          <div className="chat-image-preview-bar">
            <img src={imagePreview.dataUrl} alt="preview" className="preview-thumb" />
            <div className="preview-info">
              <span className="preview-name">{imagePreview.file.name}</span>
              <span className="preview-size">{(imagePreview.file.size / 1024).toFixed(0)} KB</span>
            </div>
            <button className="preview-remove" onClick={() => { setImagePreview(null); setImageError(""); }}>✕</button>
          </div>
        )}

        {imageError && <div className="chat-image-error">{imageError}</div>}

        {/* ── Input area ── */}
        <div className="chat-input-area">
          {/* Image picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImagePick}
          />
          <button
            className="chat-icon-btn"
            title="Share image"
            onClick={() => fileInputRef.current?.click()}
            disabled={!activeJob || !socket}
          >
            {/* Image / photo icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder={
              imagePreview
                ? "Add a caption (optional)…"
                : activeJob
                ? "Type a message…"
                : "No active job"
            }
            value={input}
            onChange={e => { setInput(e.target.value); emitTyping(); }}
            onKeyDown={handleKeyDown}
            disabled={!activeJob || !socket}
          />

          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!activeJob || !socket || sending || (!input.trim() && !imagePreview)}
          >
            {sending ? (
              <span className="chat-send-spinner" />
            ) : (
              /* Send / paper-plane icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxUrl && (
        <div className="chat-lightbox" onClick={() => setLightboxUrl(null)}>
          <button className="lightbox-close">✕</button>
          <img src={lightboxUrl} alt="full size" className="lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default Chat;
