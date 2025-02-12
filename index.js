const express = require('express');
const http = require('http');
const websocketStream = require('websocket-stream');
const aedes = require('aedes')();
const mqtt = require('mqtt');
const net = require('net');

const app = express();
const server = http.createServer(app);

// Configurar o servidor MQTT na porta 1883 para aceitar conexões de todos os hosts
const mqttServer = net.createServer(aedes.handle);
mqttServer.listen(1883, '0.0.0.0', () => {
  console.log('MQTT Broker rodando na porta 1883');
});

// Configurar o servidor WebSocket para MQTT sobre WebSocket
websocketStream.createServer({ server: server }, aedes.handle);

// Rota do servidor Express
app.get('/', (req, res) => {
  res.send('Servidor Express com MQTT Broker');
});

// Configuração do servidor Express para escutar em todas as interfaces (0.0.0.0)
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
});

// Conectar o cliente MQTT após o servidor MQTT estar pronto
setTimeout(() => {
  const client = mqtt.connect('mqtt://192.168.0.6:1883'); // Use o IP do seu PC, não 'localhost'

  client.on('connect', () => {
    console.log('Cliente MQTT conectado ao broker');
    client.subscribe('test/topic', (err) => {
      if (!err) {
        client.publish('test/topic', 'Hello MQTT');
      }
    });
  });

  client.on('message', (topic, message) => {
    console.log(`Mensagem recebida no tópico ${topic}: ${message.toString()}`);
  });

  client.on('error', (err) => {
    console.error('Erro no cliente MQTT:', err);
  });

  client.on('close', () => {
    console.log('Conexão MQTT fechada');
  });
}, 1000); // Aguarda 1 segundo para garantir que o servidor MQTT esteja pronto

// Eventos do broker Aedes
aedes.on('client', (client) => {
  console.log(`Cliente MQTT conectado: ${client.id}`);
});

aedes.on('clientDisconnect', (client) => {
  console.log(`Cliente MQTT desconectado: ${client.id}`);
});

aedes.on('publish', (packet, client) => {
  if (client) {
    console.log(`Mensagem publicada por ${client.id} no tópico ${packet.topic}`);
  }
});
