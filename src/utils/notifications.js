export const notifyRepairComplete = (jobCard, customer, vehicle) => {
  const title = 'Repair Complete';
  const body = `Job #${jobCard.id} for ${customer?.name || 'Customer'} - ${vehicle?.manufacturer} ${vehicle?.model} is ready for pickup.`;

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      });
    }
  }

  return { title, body };
};

export const notifyJobCardUpdate = (jobCard, status) => {
  const title = 'Job Card Updated';
  const body = `Job #${jobCard.id} status changed to: ${status}`;

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      });
    }
  }

  return { title, body };
};

export const requestNotificationPermission = () => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};
