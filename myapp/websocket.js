const WebSocket = require('ws');

// Map of convo_id → Set of connected WebSocket clients in that room
const rooms = new Map();

let wss;

function init(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.user_id = null;
    ws.convos  = new Set(); // track which convos this socket joined

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);

        // Client sends auth first so we know who they are
        if (msg.type === 'auth') {
          ws.user_id = msg.user_id;
        }

        // Client joins a conversation room
        if (msg.type === 'join_convo') {
          const { convo_id } = msg;
          if (!rooms.has(convo_id)) rooms.set(convo_id, new Set());
          rooms.get(convo_id).add(ws);
          ws.convos.add(convo_id);
        }

        // Client leaves a conversation room
        if (msg.type === 'leave_convo') {
          const { convo_id } = msg;
          if (rooms.has(convo_id)) rooms.get(convo_id).delete(ws);
          ws.convos.delete(convo_id);
        }

      } catch (err) {
        console.error('[ws] message parse error:', err);
      }
    });

    // Clean up all rooms when socket disconnects
    ws.on('close', () => {
      ws.convos.forEach((convo_id) => {
        if (rooms.has(convo_id)) rooms.get(convo_id).delete(ws);
      });
    });

    ws.on('error', (err) => {
      console.error('[ws] socket error:', err);
    });
  });

  console.log('WebSocket server ready at /ws');
}

// Broadcast a message to all clients in a conversation room
function broadcastToConvo(convo_id, message) {
  const room = rooms.get(convo_id);
  if (!room) return;
  const data = JSON.stringify(message);
  room.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

// Broadcast to all clients in a room EXCEPT the specified user
function broadcastToConvoExcept(convo_id, message, except_user_id) {
  const room = rooms.get(convo_id);
  if (!room) return;
  const data = JSON.stringify(message);
  room.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN && ws.user_id !== except_user_id) {
      ws.send(data);
    }
  });
}

// Send directly to all sockets authenticated as a specific user (for notifications)
function notifyUser(user_id, message) {
  if (!wss) return;
  const data = JSON.stringify(message);
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN && ws.user_id === user_id) {
      ws.send(data);
    }
  });
}

module.exports = { init, broadcastToConvo, broadcastToConvoExcept, notifyUser };
