export const notifyRepairComplete = (jobCard, customer, vehicle) => {
  const title = 'Completion sent';
  const body = `Job #${jobCard.id} for ${customer?.name || 'the customer'} - ${vehicle?.manufacturer || ''} ${vehicle?.model || ''} was sent to the garage owner for quality check.`;

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
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'default'
  ) {
    Notification.requestPermission();
  }
};
