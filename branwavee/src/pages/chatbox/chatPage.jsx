import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

const ChatPage = ({ senderId, receiverId }) => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    const socket = new SockJS("http://localhost:8081/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/user/${senderId}/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
    });
    client.activate();
    setStompClient(client);

    loadOldMessages();

    return () => client.deactivate();
  }, []);

  const loadOldMessages = async () => {
    const res = await axios.get(
      `http://localhost:8081/api/messages/chat/${senderId}/${receiverId}`
    );
    setMessages(res.data);
  };

  const sendMessage = async () => {
    const messageDto = { senderId, receiverId, content };
    await axios.post("http://localhost:8081/api/messages/send", messageDto);
    setContent("");
  };

  return (
    <div>
      <h2>Chat with {receiverId}</h2>
      <div
        style={{
          maxHeight: 400,
          overflowY: "scroll",
          border: "1px solid black",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            <b>{msg.senderId === senderId ? "You" : "Friend"}:</b> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatPage;
