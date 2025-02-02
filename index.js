const express = require('express');
const http = require('http');
const websocketStream = require('websocket-stream');
const aedes = require('aedes')();
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);

websocketStream.createServer({ server: server }, aedes.handle);

app.get('/', (req, res) => {
  res.send('Servidor Express com MQTT Broker');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor Express e MQTT Broker na porta ${PORT}`);
});

const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
  console.log('Cliente MQTT conectado');
  client.subscribe('test/topic', (err) => {
    if (!err) {
      client.publish('test/topic', 'Hello MQTT');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Mensagem recebida no tópico ${topic}: ${message.toString()}`);
});

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