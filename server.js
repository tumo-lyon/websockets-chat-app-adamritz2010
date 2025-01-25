import {createServer} from 'node:http';
import express from 'express';
import { Server } from 'socket.io';

const app = express(); // <-- Création d'une application Express
const server = createServer(app); // <-- Utilisation de l'application Express
const io = new Server(server);
// Configuration de l'application Express
app.use(express.static('public')); // <-- Serveur de fichiers statiques

app.get('/', (req, res) => {
	res.redirect('/index.html'); // <-- Redirection vers la page d'accueil
});

server.listen(3000, () => { // <-- Démarrage du serveur
	console.log('Server is running on port 3000');
});

// Exemple de serveur Express avec un serveur HTTP
const typingUser = new Set();
io.on('connection', (socket) => {
    console.log(`${socket.id} s'est connecté`);

    io.emit('system_message', {
        content: `Welcome ${socket.id}! 👋​👋​`
    })

    socket.on('user_message_send', (data) => {
        console.log(data.content);

        io.emit('user_message', {
            content: data.content,
            author: socket.id,
            time: new Date().toLocaleTimeString(),
            isMe: false,
        })
    });

    socket.on('typing_start', () => {
        typingUser.add(socket.id);
        io.emit('typing', Array.from(typingUser));
    });

    socket.on('typing_stop', () => {
        typingUser.delete(socket.id);
        io.emit('typing', Array.from(typingUser));
    });

    socket.on('disconnect', () => {
        typingUser.delete(socket.id);
        console.log(`${socket.id} disconnected`)

        io.emit('system_message', {
            content: `Goodbye ${socket.id}! 🥲👋`
        });
    });
});

