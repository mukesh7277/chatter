import React, { useEffect, useContext, useState, useCallback } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';

const ME = 'me';
const BOT = 'bot';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

function BottomScroll() {
  document.getElementById('message-list').scrollTop = document.documentElement.scrollHeight;
}

function Messages() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{
    message: "Hii!   Welcome to SOLULAB",
    user: BOT}]);
  const [botTyping, setBotTyping] = useState(false);
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  useEffect(() => {
    socket.off('bot-message');
    socket.on('bot-message', (message) => {
      setBotTyping(false);

      setMessages([...messages, { message, user: BOT }]);

      setLatestMessage(BOT, message);

      playReceive();

      BottomScroll();
    });

  }, [messages]);

  useEffect(() => {
    document.getElementById('user-message-input').focus()

    socket.on('bot-typing', () => {
      setBotTyping(true);

      BottomScroll();
    });
  }, []);

  const sendMessage = useCallback(() => {
    if (!message) { return; }

    setMessages([...messages, { message, user: ME }]);

    playSend();

    BottomScroll();

    socket.emit('user-message', message);

    setMessage('');

    document.getElementById('user-message-input').value = '';
  }, [messages, message]);

  const onChangeMessage = (e) => {
    setMessage(e.target.value)
  };

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messages.map((message, index) => (
          <Message message={message} nextMessage={messages[index + 1]} botTyping={botTyping} />
        ))}
        {botTyping ? <TypingMessage /> : null}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;