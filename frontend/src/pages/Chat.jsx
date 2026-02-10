import "./Chat.css";

function Chat() {
  return (
    <div className="chat-page">
      <div className="chat-container">
        <header className="chat-header">
          <h1>SteadyFast Support</h1>
          <p>Online | Typical response time: 2 mins</p>
        </header>

        <div className="chat-messages">
          <div className="message other">
            <span className="sender">MECHANIC</span>
            Hello! I see you're having trouble with your engine. I’m on my way to your location now.
          </div>

          <div className="message me">
            <span className="sender">YOU</span>
            Thank you so much! Please hurry, the car is in the middle of a busy road.
          </div>

          <div className="message other">
            <span className="sender">SUPPORT</span>
            Your safety is our priority. Please stay inside the vehicle if possible or stand well away from traffic. Your assigned mechanic is 2 miles away.
          </div>
        </div>

        <div className="chat-input-area">
          <input type="text" placeholder="Type a message..." />
          <button className="send-btn">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
