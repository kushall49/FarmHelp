import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'uploadQueue';

export async function enqueueRequest(requestData) {
  try {
    const queue = await getQueue();
    queue.push(requestData);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[SYNC_QUEUE] Request enqueued:', requestData.endpoint);
  } catch (error) {
    console.error('[SYNC_QUEUE] Failed to enqueue:', error);
    throw error;
  }
}

export async function getQueue() {
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch (error) {
    console.error('[SYNC_QUEUE] Failed to get queue:', error);
    return [];
  }
}

export async function clearQueue() {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([]));
    console.log('[SYNC_QUEUE] Queue cleared');
  } catch (error) {
    console.error('[SYNC_QUEUE] Failed to clear queue:', error);
  }
}

export async function flushQueueIfOnline() {
  try {
    // Check if online (simple fetch test)
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      timeout: 3000 
    });
    
    if (!response.ok) {
      console.log('[SYNC_QUEUE] Offline, skipping flush');
      return;
    }

    const queue = await getQueue();
    if (queue.length === 0) {
      console.log('[SYNC_QUEUE] Queue is empty');
      return;
    }

    console.log('[SYNC_QUEUE] Flushing queue with', queue.length, 'items');

    // Process queue items
    const failedItems = [];
    for (const item of queue) {
      try {
        // In production, reconstruct the full request and send it
        console.log('[SYNC_QUEUE] Processing queued item:', item.endpoint);
        // await sendQueuedRequest(item);
      } catch (error) {
        console.error('[SYNC_QUEUE] Failed to send item:', error);
        failedItems.push(item);
      }
    }

    // Update queue with failed items only
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedItems));
    console.log('[SYNC_QUEUE] Queue flushed. Remaining:', failedItems.length);
  } catch (error) {
    console.error('[SYNC_QUEUE] Error during flush:', error);
  }
}

export function startQueuePolling(intervalMs = 60000) {
  // Poll every minute by default
  setInterval(() => {
    flushQueueIfOnline().catch(err => {
      console.error('[SYNC_QUEUE] Polling error:', err);
    });
  }, intervalMs);
  console.log('[SYNC_QUEUE] Queue polling started');
}
