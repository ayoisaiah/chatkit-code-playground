import React from "react";
import Proptypes from "prop-types";

import "./ChatWidget.css";

const ChatWidget = props => {
  const { newMessage, sendMessage, handleInput, messages, isChatOpen } = props;

  const ChatSession = messages.map(message => (
    <div class="message">
      <span className="user-name">{message.senderId}</span>
      <span className="message-text">{message.text}</span>
    </div>
  ));

  return (
    <section className={`chat ${!isChatOpen ? "hidden" : ""}`}>
      <div className="chat-widget">
        <header className="chat-header">
          <h2>Chat</h2>
        </header>
        <section className="chat-body">{ChatSession}</section>

        <form onSubmit={sendMessage} className="message-form">
          <input
            className="message-input"
            autoFocus
            name="newMessage"
            placeholder="Compose your message and hit ENTER to send"
            onChange={handleInput}
            value={newMessage}
          />
        </form>
      </div>
    </section>
  );
};

ChatWidget.proptypes = {
  newMessage: Proptypes.string.isRequired,
  handleInput: Proptypes.func.isRequired,
  sendMessage: Proptypes.func.isRequired,
  messages: Proptypes.arrayOf(Proptypes.object).isRequired,
  isChatOpen: Proptypes.bool.isRequired
};

export default ChatWidget;
