const url = 'wss://' + document.location.hostname + ':' + 5000;

let socket: WebSocket;

export function connect(onConnect: () => void, onReconnect: () => void) {
	socket = new WebSocket(url as string);
	console.log('Connecting to server...', url);
	socket.onopen = () => {
		console.log('Connected!');
		onConnect();
	};
	socket.onclose = () => {
		console.log('Disconnected!');
		setTimeout(function () {
			connect(onReconnect, onReconnect);
		}, 1000);
	};

	// socket.onmessage = event => {
	// 	try {
	// 		const message = JSON.parse(event.data) as ServerMessage;
	// 		const listeners = messageListeners.get(message.kind);
	// 		console.log('Got message', message.kind, message);
	// 		if (listeners) {
	// 			listeners.forEach(listener => listener(message));
	// 		}
	// 	} catch (e) {
	// 		console.warn('Bad message', e);
	// 	}
	// };

	if (socket.readyState == socket.OPEN) {
		console.log('Connected');
		onConnect();
	}
}

type Listener<T> = (message: T) => void;
const messageListeners = new Map<string, Listener<any>[]>();

export function send<Request extends { kind: string }>(request: Request) {
	socket.send(JSON.stringify(request));
}

// export function listen<K extends ServerMessage['kind'], T extends ServerMessage & { kind: K }>(
// 	kind: K,
// 	listener: Listener<T>,
// ) {
// 	if (!messageListeners.get(kind)) {
// 		messageListeners.set(kind, []);
// 	}
// 	const listeners = messageListeners.get(kind)!;
// 	listeners.push(listener);
// }
