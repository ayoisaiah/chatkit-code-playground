import React, { Component } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import Pusher from "pusher-js";
import axios from "axios";
import ChatWidget from "./ChatWidget";
import Dialog from "./Dialog";
import {
  handleInput,
  sendMessage,
  connectToRoom,
  launchChat,
  toggleChat
} from "./chat-methods";

import "./App.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";

class App extends Component {
  constructor() {
    super();
    this.state = {
      id: "",
      html: "",
      css: "",
      js: "",
      isChatOpen: false,
      isDialogOpen: true,
      messages: [],
      newMessage: "",
      currentUser: "",
      currentRoom: "",
      roomUsers: []
    };

    this.pusher = new Pusher("<your channels app key>", {
      cluster: "<your channels cluster>",
      forceTLS: true
    });

    this.channel = this.pusher.subscribe("editor");

    this.handleInput = handleInput.bind(this);
    this.launchChat = launchChat.bind(this);
    this.sendMessage = sendMessage.bind(this);
    this.connectToRoom = connectToRoom.bind(this);
    this.toggleChat = toggleChat.bind(this);
  }

  componentDidUpdate() {
    this.runCode();
  }

  componentDidMount() {
    this.channel.bind("text-update", data => {
      const { id } = this.state;
      if (data.id === id) return;

      this.setState({
        html: data.html,
        css: data.css,
        js: data.js
      });
    });
  }

  syncUpdates = () => {
    const data = {
      id: this.state.id,
      html: this.state.html,
      css: this.state.css,
      js: this.state.js
    };

    axios
      .post("http://localhost:5000/update-editor", data)
      .catch(console.error);
  };

  runCode = () => {
    const { html, css, js } = this.state;

    const iframe = this.refs.iframe;
    const document = iframe.contentDocument;
    const documentContents = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}

        <script type="text/javascript">
          ${js}
        </script>
      </body>
      </html>
    `;

    document.open();
    document.write(documentContents);
    document.close();
  };

  render() {
    const {
      html,
      js,
      css,
      isChatOpen,
      newMessage,
      messages,
      isDialogOpen,
      id,
      roomUsers
    } = this.state;

    const codeMirrorOptions = {
      theme: "material",
      lineNumbers: true,
      scrollbarStyle: null,
      lineWrapping: true
    };

    const onlineUsers = roomUsers.filter(
      user => user.presence.state === "online"
    );
    const users = onlineUsers.map(user => (
      <span key={user.id}>{user.name}</span>
    ));

    return (
      <div className="App">
        <section className="playground">
          <div className="code-editor html-code">
            <div className="editor-header">HTML</div>
            <CodeMirror
              value={html}
              options={{
                mode: "htmlmixed",
                ...codeMirrorOptions
              }}
              onBeforeChange={(editor, data, html) => {
                this.setState({ html }, () => this.syncUpdates());
              }}
            />
          </div>
          <div className="code-editor css-code">
            <div className="editor-header">CSS</div>
            <CodeMirror
              value={css}
              options={{
                mode: "css",
                ...codeMirrorOptions
              }}
              onBeforeChange={(editor, data, css) => {
                this.setState({ css }, () => this.syncUpdates());
              }}
            />
          </div>
          <div className="code-editor js-code">
            <div className="editor-header">JavaScript</div>
            <CodeMirror
              value={js}
              options={{
                mode: "javascript",
                ...codeMirrorOptions
              }}
              onBeforeChange={(editor, data, js) => {
                this.setState({ js }, () => this.syncUpdates());
              }}
            />
          </div>
        </section>
        <section className="result">
          <iframe title="result" className="iframe" ref="iframe" />
        </section>

        <ChatWidget
          newMessage={newMessage}
          sendMessage={this.sendMessage}
          handleInput={this.handleInput}
          messages={messages}
          isChatOpen={isChatOpen}
        />

        <footer className="footer">
          {roomUsers.length > 0 ? (
            <div className="footer-content">
              <div className="users-online">{users}</div>
              <button onClick={this.toggleChat} className="toggle-chat">
                {isChatOpen ? "Close Chat" : "Open Chat"}
              </button>
            </div>
          ) : null}
        </footer>

        {isDialogOpen ? (
          <Dialog
            username={id}
            handleInput={this.handleInput}
            launchChat={this.launchChat}
          />
        ) : null}
      </div>
    );
  }
}

export default App;
