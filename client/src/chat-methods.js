import Chatkit from "@pusher/chatkit-client";
import axios from "axios";

function launchChat(event) {
  event.preventDefault();
  const { id } = this.state;
  if (id.trim() === "") return;

  this.setState({
    isDialogOpen: false
  });

  axios
    .post("http://localhost:5000/users", { userId: id })
    .then(() => {
      const tokenProvider = new Chatkit.TokenProvider({
        url: "http://localhost:5000/authenticate"
      });

      const chatManager = new Chatkit.ChatManager({
        instanceLocator: "<your chatkit instance locator>",
        userId: id,
        tokenProvider
      });

      return chatManager.connect().then(currentUser => {
        this.setState(
          {
            currentUser
          },
          () => this.connectToRoom()
        );
      });
    })
    .catch(console.error);
}

function connectToRoom() {
  const { currentUser } = this.state;

  return currentUser
    .subscribeToRoom({
      roomId: "<your chatkit room id>",
      messageLimit: 0,
      hooks: {
        onMessage: message => {
          this.setState({
            messages: [...this.state.messages, message]
          });
        },
        onPresenceChanged: () => {
          const { currentRoom } = this.state;
          this.setState({
            roomUsers: currentRoom.users.sort(a => {
              if (a.presence.state === "online") return -1;

              return 1;
            })
          });
        }
      }
    })
    .then(currentRoom => {
      this.setState({
        currentRoom,
        roomUsers: currentRoom.users
      });
    });
}

function handleInput(event) {
  const { value, name } = event.target;

  this.setState({
    [name]: value
  });
}

function sendMessage(event) {
  event.preventDefault();
  const { newMessage, currentUser, currentRoom } = this.state;

  if (newMessage.trim() === "") return;

  currentUser.sendMessage({
    text: newMessage,
    roomId: `${currentRoom.id}`
  });

  this.setState({
    newMessage: ""
  });
}

function toggleChat() {
  this.setState({
    isChatOpen: !this.state.isChatOpen
  });
}

export { launchChat, connectToRoom, sendMessage, handleInput, toggleChat };
