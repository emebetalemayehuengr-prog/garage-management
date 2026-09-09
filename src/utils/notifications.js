export const notifyRepairComplete = (jobCard, customer, vehicle) => {
  const title = 'Job Complete - Awaiting Approval';
  const body = `Job #${jobCard.id} for ${customer?.name || 'the customer'} - ${vehicle?.manufacturer || ''} ${vehicle?.model || ''} is complete. Owner approval required before invoicing.`;

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

export const notifyOwnerApproval = (jobCard, customer, vehicle) => {
  const title = 'Job Approved for Invoicing';
  const body = `Job #${jobCard.id} for ${customer?.name || 'the customer'} - ${vehicle?.manufacturer || ''} ${vehicle?.model || ''} has been approved and moved to invoicing.`;

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
