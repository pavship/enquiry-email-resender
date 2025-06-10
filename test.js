import { sendEnquiryEmail } from './server.js';

// Test data
const testData = {
  name: "Test User",
  email: "test@example.com",
  tel: "+1234567890",
  message: "This is a test message",
  attachments: [] // Optional: Add attachments if needed
};

// Call the function
sendEnquiryEmail(testData)
  .then(() => console.log('Email sent successfully'))
  .catch(err => console.error('Error sending email:', err));
