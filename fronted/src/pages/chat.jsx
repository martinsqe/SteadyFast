function Chat() {
  return (
    <div style={styles.page}>
      <h1>Support Chat</h1>

      <div style={styles.chatBox}>
        <p>👨‍🔧 Mechanic: I’m on my way.</p>
        <p>🧑 You: Thank you!</p>
      </div>

      <input style={styles.input} placeholder="Type a message..." />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", padding: "20px", textAlign: "center" },
  chatBox: { maxWidth: "400px", margin: "20px auto", background: "#f1f5f9", padding: "15px", borderRadius: "10px" },
  input: { width: "300px", padding: "10px" }
};

export default Chat;
