
// Simple newsletter subscription handler
// This would typically be handled by a backend service
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { subscriberEmail, notificationEmail } = req.body;

  // In a real implementation, you would:
  // 1. Validate the email
  // 2. Store it in a database
  // 3. Send notification email using a service like SendGrid, Mailgun, etc.
  
  console.log(`New newsletter subscription: ${subscriberEmail}`);
  console.log(`Notification should be sent to: ${notificationEmail}`);

  // Simulate success response
  res.status(200).json({ 
    message: 'Subscription successful',
    subscriber: subscriberEmail 
  });
}
