import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api/v1';
const WS_URL = BASE_URL.replace('/api/v1', '/ws');

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = {};
        this.userId = null;
        this.messageHandlers = new Map();
    }

    connect(userId, onConnected, onError) {
        this.userId = userId;
        
        // Lưu trữ callback để sử dụng sau này
        if (onConnected && typeof onConnected === 'function') {
            this.registerMessageHandler("NEW_FRIEND_REQUEST", onConnected);
        }
        
        if (this.connected && this.client) {
            console.log("WebSocket already connected");
            return;
        }
        
        console.log(`Connecting to WebSocket at ${WS_URL} for user ${userId}`);

        // Lấy token từ localStorage
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error("No access token available");
            if (onError) onError("No access token available");
            return;
        }

        // Tạo client STOMP
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                'X-Authorization': token
            },
            debug: function(str) {
                console.debug('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        // Khi kết nối thành công
        this.client.onConnect = (frame) => {
            this.connected = true;
            console.log('Connected to WebSocket server');
            
            // Subscribe to debug topic (để kiểm tra)
            this.subscribeToTopic('/topic/debug', (message) => {
                console.log("Debug message:", message);
                
                // Nếu đây là thông báo NEW_FRIEND_REQUEST, cũng thông báo cho handler
                if (message?.type === "NEW_FRIEND_REQUEST") {
                    this._notifyMessageHandlers("NEW_FRIEND_REQUEST", message);
                }
            });
            
            // Subscribe to global notifications
            this.subscribeToTopic('/topic/global-notifications', (message) => {
                console.log("Global notification:", message);
                
                // Thông báo cho handler tương ứng với loại thông báo
                if (message?.type) {
                    this._notifyMessageHandlers(message.type, message);
                }
            });
            
            // Subscribe to user-specific notifications
            this.subscribeToPrivateNotifications(userId);
        };

        // Khi mất kết nối
        this.client.onDisconnect = () => {
            console.log('Disconnected from WebSocket server');
            this.connected = false;
        };

        // Khi có lỗi kết nối
        this.client.onStompError = (frame) => {
            console.error('WebSocket error:', frame);
            if (onError && typeof onError === 'function') {
                onError(frame);
            }
        };

        // Bắt đầu kết nối
        this.client.activate();
    }

    // Đăng ký xử lý thông báo theo loại
    registerMessageHandler(messageType, callback) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(callback);
        console.log(`Registered handler for message type: ${messageType}`);
    }
    
    // Gọi các handler cho loại thông báo cụ thể
    _notifyMessageHandlers(messageType, message) {
        if (this.messageHandlers.has(messageType)) {
            console.log(`Notifying handlers for message type: ${messageType}`);
            this.messageHandlers.get(messageType).forEach(callback => {
                try {
                    callback(message);
                } catch (error) {
                    console.error(`Error in message handler for ${messageType}:`, error);
                }
            });
        }
    }

    disconnect() {
        console.log("Disconnecting WebSocket");
        if (this.client) {
            this.client.deactivate();
        }
        this.connected = false;
        this.subscriptions = {};
        this.userId = null;
        this.messageHandlers.clear();
    }

    // Subscribe to a general topic
    subscribeToTopic(topic, callback) {
        if (!this.client || !this.connected) {
            console.error('WebSocket is not connected');
            return;
        }

        if (!this.subscriptions[topic]) {
            console.log(`Subscribing to ${topic}`);
            const subscription = this.client.subscribe(topic, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    console.log(`Received message on ${topic}:`, payload);
                    callback(payload);
                } catch (e) {
                    console.log(`Received raw message on ${topic}:`, message.body);
                    callback(message.body);
                }
            });

            this.subscriptions[topic] = subscription;
        }
    }

    // Subscribe to private notifications (friend requests, etc.)
    subscribeToPrivateNotifications(userId) {
        if (!this.client || !this.connected) {
            console.error('WebSocket is not connected');
            return;
        }

        const userTopic = `/user/${userId}/queue/notifications`;
        console.log(`Subscribing to private notifications for user ${userId} at ${userTopic}`);
        
        if (!this.subscriptions[userTopic]) {
            const subscription = this.client.subscribe(userTopic, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    console.log(`Received notification for user ${userId}:`, payload);
                    
                    // Thông báo cho tất cả handler tương ứng với loại thông báo
                    if (payload?.type) {
                        this._notifyMessageHandlers(payload.type, payload);
                    }
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e);
                    console.log("Raw message:", message.body);
                }
            });

            this.subscriptions[userTopic] = subscription;
            console.log(`Subscribed to ${userTopic}`);
        }
    }

    // Unsubscribe from a specific topic
    unsubscribe(topic) {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].unsubscribe();
            delete this.subscriptions[topic];
        }
    }
}

// Export singleton instance
export default new WebSocketService();