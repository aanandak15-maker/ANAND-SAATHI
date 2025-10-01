/**
 * Real-time Notifications System for Anand Saathi
 * WebSocket-based notifications for field alerts, weather updates, and market changes
 */

import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// WebSocket server for real-time notifications
const wss = new WebSocket.Server({ port: 3001 });

interface NotificationData {
  id: string;
  user_id: string;
  type: 'weather' | 'field' | 'market' | 'system' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  read: boolean;
  created_at: string;
}

interface ConnectedUser {
  userId: string;
  ws: WebSocket;
  subscriptions: Set<string>; // field IDs they're subscribed to
}

const connectedUsers = new Map<string, ConnectedUser>();

// WebSocket connection handler
wss.on('connection', (ws, request) => {
  console.log('New WebSocket connection established');

  let currentUser: ConnectedUser | null = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'authenticate':
          // Authenticate user
          const { token } = data;
          if (token) {
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (!error && user) {
              currentUser = {
                userId: user.id,
                ws,
                subscriptions: new Set()
              };
              connectedUsers.set(user.id, currentUser);

              // Send existing notifications
              await sendExistingNotifications(user.id, ws);

              ws.send(JSON.stringify({
                type: 'authenticated',
                userId: user.id,
                message: 'Successfully authenticated'
              }));

              console.log(`User ${user.id} authenticated for real-time notifications`);
            } else {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Authentication failed'
              }));
            }
          }
          break;

        case 'subscribe_field':
          if (currentUser && data.fieldId) {
            currentUser.subscriptions.add(data.fieldId);
            ws.send(JSON.stringify({
              type: 'subscribed',
              fieldId: data.fieldId,
              message: `Subscribed to field ${data.fieldId}`
            }));
          }
          break;

        case 'unsubscribe_field':
          if (currentUser && data.fieldId) {
            currentUser.subscriptions.delete(data.fieldId);
            ws.send(JSON.stringify({
              type: 'unsubscribed',
              fieldId: data.fieldId,
              message: `Unsubscribed from field ${data.fieldId}`
            }));
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    if (currentUser) {
      connectedUsers.delete(currentUser.userId);
      console.log(`User ${currentUser.userId} disconnected`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Send existing notifications to newly connected user
async function sendExistingNotifications(userId: string, ws: WebSocket) {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && notifications) {
      ws.send(JSON.stringify({
        type: 'existing_notifications',
        notifications: notifications
      }));
    }
  } catch (error) {
    console.error('Error sending existing notifications:', error);
  }
}

// Send notification to specific user
export async function sendNotificationToUser(
  userId: string,
  notification: Omit<NotificationData, 'id' | 'user_id' | 'read' | 'created_at'>
) {
  try {
    // Store in database
    const { data: dbNotification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing notification:', error);
      return;
    }

    // Send via WebSocket if user is connected
    const connectedUser = connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.ws.send(JSON.stringify({
        type: 'notification',
        notification: dbNotification
      }));
    }

    console.log(`Notification sent to user ${userId}: ${notification.title}`);

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Send notification to all users subscribed to a field
export async function sendFieldNotification(
  fieldId: string,
  notification: Omit<NotificationData, 'id' | 'user_id' | 'read' | 'created_at'>
) {
  try {
    // Get all users subscribed to this field
    const { data: subscriptions, error } = await supabase
      .from('field_subscriptions')
      .select('user_id')
      .eq('field_id', fieldId);

    if (error) {
      console.error('Error getting field subscriptions:', error);
      return;
    }

    // Send to all subscribed users
    if (subscriptions) {
      for (const subscription of subscriptions) {
        await sendNotificationToUser(subscription.user_id, {
          ...notification,
          type: 'field'
        });
      }
    }

  } catch (error) {
    console.error('Error sending field notification:', error);
  }
}

// Broadcast system notification to all connected users
export async function broadcastSystemNotification(
  notification: Omit<NotificationData, 'id' | 'user_id' | 'read' | 'created_at'>
) {
  try {
    // Get all connected user IDs
    const userIds = Array.from(connectedUsers.keys());

    // Send to all connected users via WebSocket
    for (const userId of userIds) {
      const connectedUser = connectedUsers.get(userId);
      if (connectedUser) {
        connectedUser.ws.send(JSON.stringify({
          type: 'notification',
          notification: {
            ...notification,
            user_id: userId,
            type: 'system'
          }
        }));
      }
    }

    console.log(`System notification broadcasted to ${userIds.length} users`);

  } catch (error) {
    console.error('Error broadcasting system notification:', error);
  }
}

// Weather alert notification
export async function sendWeatherAlert(fieldId: string, weatherData: any) {
  await sendFieldNotification(fieldId, {
    type: 'weather',
    title: 'Weather Alert',
    message: `Weather alert for your field: ${weatherData.alert}`,
    priority: weatherData.severity === 'high' ? 'high' : 'medium',
    data: weatherData
  });
}

// Market price alert notification
export async function sendMarketAlert(commodity: string, priceChange: any) {
  // Get all users who have fields with this crop type
  const { data: users, error } = await supabase
    .from('fields')
    .select('user_id')
    .eq('crop_type', commodity)
    .neq('user_id', null);

  if (!error && users) {
    const uniqueUserIds = [...new Set(users.map(u => u.user_id))];

    for (const userId of uniqueUserIds) {
      await sendNotificationToUser(userId, {
        type: 'market',
        title: 'Market Price Alert',
        message: `${commodity} prices ${priceChange.direction}: ${priceChange.message}`,
        priority: priceChange.impact === 'high' ? 'high' : 'medium',
        data: { commodity, priceChange }
      });
    }
  }
}

// Field health alert notification
export async function sendFieldHealthAlert(fieldId: string, healthData: any) {
  await sendFieldNotification(fieldId, {
    type: 'field',
    title: 'Field Health Alert',
    message: `Field health issue detected: ${healthData.issue}`,
    priority: healthData.severity === 'critical' ? 'critical' : 'high',
    data: healthData
  });
}

// Cleanup inactive connections (run every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [userId, user] of connectedUsers.entries()) {
    // Check if connection is still alive (ping every 30 seconds)
    if (now - (user as any).lastPing > 60000) { // 1 minute timeout
      user.ws.close();
      connectedUsers.delete(userId);
      console.log(`Cleaned up inactive connection for user ${userId}`);
    }
  }
}, 300000); // 5 minutes

console.log('🚀 Real-time notifications WebSocket server started on port 3001');
console.log('📡 Features: User authentication, field subscriptions, system broadcasts');

export { wss, sendNotificationToUser, sendFieldNotification, broadcastSystemNotification };
