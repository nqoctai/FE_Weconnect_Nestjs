import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api/v1';
const WS_URL = BASE_URL.replace('/api/v1', '/ws');

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = {};
        this.pendingSubscriptions = [];
    }

    connect(userId) {
        if (this.connected && this.client) {
            // Nếu đã kết nối, xử lý các subscription đang chờ
            this._processPendingSubscriptions();
            return;
        }
        
        console.log(`Connecting to WebSocket at ${WS_URL}`);

        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            debug: function(str) {
                console.debug('STOMP: ' + str);
            },
            reconnectDelay: 5000
        });

        this.client.onConnect = () => {
            this.connected = true;
            console.log('Connected to WebSocket server');
            
            // Xử lý các subscription đang chờ sau khi đã kết nối
            this._processPendingSubscriptions();
        };
        
        this.client.onStompError = (error) => {
            console.error('STOMP error:', error);
        };

        this.client.activate();
    }

    // Xử lý các subscription đang chờ
    _processPendingSubscriptions() {
        if (this.pendingSubscriptions.length > 0) {
            console.log(`Processing ${this.pendingSubscriptions.length} pending subscriptions`);
            
            this.pendingSubscriptions.forEach(sub => {
                this._subscribeToTopic(sub.topic, sub.callback);
            });
            
            this.pendingSubscriptions = [];
        }
    }
    
    // Đăng ký subscribe vào một topic
    _subscribeToTopic(topic, callback) {
        if (!this.client || !this.connected) {
            console.error('Cannot subscribe - WebSocket not connected');
            return false;
        }
        
        if (!this.subscriptions[topic]) {
            console.log(`Subscribing to ${topic}`);
            
            try {
                const subscription = this.client.subscribe(topic, (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        console.log(`Received message on ${topic}:`, data);
                        callback(data);
                    } catch (e) {
                        console.error(`Error processing WebSocket message:`, e);
                        console.log(`Raw message:`, message.body);
                    }
                });
                
                this.subscriptions[topic] = subscription;
                console.log(`Successfully subscribed to ${topic}`);
                return true;
            } catch (error) {
                console.error(`Failed to subscribe to ${topic}:`, error);
                return false;
            }
        }
        
        return true;
    }

    disconnect() {
        console.log("Disconnecting WebSocket");
        if (this.client) {
            this.client.deactivate();
        }
        this.connected = false;
        this.subscriptions = {};
        this.pendingSubscriptions = [];
    }

    // Đăng ký nhận thông báo lời mời kết bạn mới
    subscribeFriendRequests(userId, callback) {
        const topic = `/topic/friend-requests/${userId}`;
        
        if (this.connected && this.client) {
            return this._subscribeToTopic(topic, callback);
        } else {
            console.log(`Connection not ready. Adding ${topic} to pending subscriptions`);
            // Lưu lại đăng ký này để xử lý sau khi kết nối được thiết lập
            this.pendingSubscriptions.push({
                topic,
                callback
            });
            
            // Khởi tạo kết nối nếu chưa được kết nối
            if (!this.client) {
                this.connect();
            }
            
            return false;
        }
    }

    unsubscribe(topic) {
        if (this.subscriptions[topic]) {
            console.log(`Unsubscribing from ${topic}`);
            try {
                this.subscriptions[topic].unsubscribe();
                delete this.subscriptions[topic];
                return true;
            } catch (error) {
                console.error(`Error unsubscribing from ${topic}:`, error);
                return false;
            }
        }
        return false;
    }
}

// Export singleton instance
export default new WebSocketService();