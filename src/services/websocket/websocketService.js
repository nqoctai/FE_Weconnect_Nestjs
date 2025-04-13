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
        this.connectPromise = null;
    }

    connect(userId) {
        // Trả về promise hiện tại nếu đang kết nối
        if (this.connectPromise) {
            return this.connectPromise;
        }
        
        // Nếu đã kết nối, xử lý các subscription đang chờ và trả về promise đã resolve
        if (this.connected && this.client) {
            this._processPendingSubscriptions();
            return Promise.resolve();
        }
        
        console.log(`Connecting to WebSocket at ${WS_URL}`);
        
        // Tạo promise mới cho kết nối
        this.connectPromise = new Promise((resolve, reject) => {
            try {
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
                    
                    // Resolve promise khi kết nối thành công
                    resolve();
                    this.connectPromise = null;
                };
                
                this.client.onStompError = (error) => {
                    console.error('STOMP error:', error);
                    reject(error);
                    this.connectPromise = null;
                };
                
                this.client.onWebSocketClose = () => {
                    console.log('WebSocket connection closed');
                    this.connected = false;
                    this.connectPromise = null;
                };
                
                this.client.activate();
            } catch (error) {
                console.error('Error activating STOMP client:', error);
                this.connected = false;
                reject(error);
                this.connectPromise = null;
            }
        });
        
        return this.connectPromise;
    }

    // Xử lý các subscription đang chờ
    _processPendingSubscriptions() {
        if (!this.connected || !this.client || this.pendingSubscriptions.length === 0) {
            return;
        }
        
        console.log(`Processing ${this.pendingSubscriptions.length} pending subscriptions`);
        
        // Sao chép mảng để tránh vấn đề khi xử lý các items
        const pendingsToProcess = [...this.pendingSubscriptions];
        this.pendingSubscriptions = [];
        
        pendingsToProcess.forEach(sub => {
            try {
                this._subscribeToTopic(sub.topic, sub.callback);
            } catch (e) {
                console.error(`Error processing subscription to ${sub.topic}:`, e);
                // Đưa lại vào hàng đợi nếu gặp lỗi
                this.pendingSubscriptions.push(sub);
            }
        });
    }
    
    // Đăng ký subscribe vào một topic
    _subscribeToTopic(topic, callback) {
        if (!this.client || !this.connected) {
            console.log(`Connection not ready. Adding ${topic} to pending subscriptions from _subscribeToTopic`);
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
        
        if (!this.subscriptions[topic]) {
            console.log(`Subscribing to ${topic}`);
            
            try {
                if (!this.client.connected) {
                    throw new Error('STOMP client not connected yet');
                }
                
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
                
                // Thêm lại vào pending nếu kết nối chưa sẵn sàng
                this.pendingSubscriptions.push({
                    topic,
                    callback
                });
                
                return false;
            }
        }
        
        return true;
    }

    disconnect() {
        console.log("Disconnecting WebSocket");
        if (this.client) {
            try {
                this.client.deactivate();
            } catch (e) {
                console.error("Error disconnecting WebSocket:", e);
            }
        }
        this.connected = false;
        this.connectPromise = null;
        this.subscriptions = {};
        this.pendingSubscriptions = [];
    }

    // Đăng ký nhận thông báo lời mời kết bạn mới
    async subscribeFriendRequests(userId, callback) {
        const topic = `/topic/friend-requests/${userId}`;
        
        try {
            // Đảm bảo kết nối được thiết lập trước
            if (!this.connected || !this.client) {
                await this.connect();
            }
            
            return this._subscribeToTopic(topic, callback);
        } catch (error) {
            console.error(`Error subscribing to friend requests for user ${userId}:`, error);
            
            // Lưu lại đăng ký này để xử lý sau khi kết nối được thiết lập
            this.pendingSubscriptions.push({
                topic,
                callback
            });
            
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