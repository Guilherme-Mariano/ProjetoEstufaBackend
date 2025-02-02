const mqtt = require('mqtt');

const client = mqtt.connect('ws://localhost:3000');

client.on('connect', () => {
  console.log('Conectado ao broker MQTT via WebSocket');
  
  client.subscribe('test/topic', (err) => {
    if (!err) {
      console.log('Inscrito no tópico test/topic');
      
      client.publish('test/topic', 'Olá, MQTT teste');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Mensagem recebida no tópico ${topic} ${message.toString()}`);
});

client.on('error', (err) => {
  console.error('Erro no cliente MQTT:', err);
});