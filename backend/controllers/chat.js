// controllers/botChat.js
import BotChat from '../models/chat.js';
import Item from '../models/item.js';

// Get or initialize user's bot chat session
export const getBotChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find existing chat or create new one
    let botChat = await BotChat.findOne({ user: userId });
    
    if (!botChat) {
      // Create new chat with welcome message
      botChat = new BotChat({
        user: userId,
        messages: [{
          isBot: true,
          content: "Hello! I'm your Khuje Dei assistant. I can help you report lost or found items, search for items, and provide guidance on what to do next. How can I assist you today?",
          timestamp: new Date()
        }]
      });
      
      await botChat.save();
    }
    
    res.status(200).json({
      success: true,
      botChat
    });
  } catch (error) {
    console.error('Error getting bot chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bot chat',
      error: error.message
    });
  }
};

// Send message to bot and get response
export const sendBotMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }
    
    // Find user's bot chat
    let botChat = await BotChat.findOne({ user: userId });
    
    if (!botChat) {
      // Create new chat if it doesn't exist
      botChat = new BotChat({
        user: userId,
        messages: []
      });
    }
    
    // Add user message
    botChat.messages.push({
      isBot: false,
      content: message,
      timestamp: new Date()
    });
    
    // Process the message and generate bot response
    const botResponse = await generateBotResponse(message, userId);
    
    // Add bot response
    botChat.messages.push({
      isBot: true,
      content: botResponse,
      timestamp: new Date()
    });
    
    // Update last activity
    botChat.lastActivity = new Date();
    
    await botChat.save();
    
    res.status(200).json({
      success: true,
      newMessages: botChat.messages.slice(-2) // Return the user message and bot response
    });
  } catch (error) {
    console.error('Error sending bot message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bot message',
      error: error.message
    });
  }
};

// Clear chat history
export const clearBotChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user's bot chat
    const botChat = await BotChat.findOne({ user: userId });
    
    if (!botChat) {
      return res.status(404).json({
        success: false,
        message: 'Bot chat not found'
      });
    }
    
    // Clear messages except for a new welcome message
    botChat.messages = [{
      isBot: true,
      content: "Chat history cleared. I'm your Khuje Dei assistant. How can I help you today?",
      timestamp: new Date()
    }];
    
    botChat.lastActivity = new Date();
    
    await botChat.save();
    
    res.status(200).json({
      success: true,
      message: 'Bot chat cleared successfully',
      botChat
    });
  } catch (error) {
    console.error('Error clearing bot chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear bot chat',
      error: error.message
    });
  }
};

// Helper function to generate bot responses based on user input
// Helper function to generate bot responses based on user input
async function generateBotResponse(message, userId) {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Check for lost item related queries
  if (lowerMessage.includes('lost') || lowerMessage.includes('report lost')) {
    return "I'm sorry to hear you've lost something. To report a lost item on Khuje Dei:\n\n1. Click the 'Report Lost Item' button on the homepage\n2. Select the category of your lost item (electronics, documents, accessories, etc.)\n3. Fill out the form with detailed information about your item\n4. Upload clear photos if available\n5. Include when and where you last saw the item\n6. Add your contact information\n\nWould you like me to explain any specific part of this process?";
  }
  
  // Check for found item related queries
  if (lowerMessage.includes('found') || lowerMessage.includes('report found')) {
    return "Thank you for wanting to report a found item! To do this on Khuje Dei:\n\n1. Click the 'Report Found Item' button\n2. Select the appropriate category for the item\n3. Provide details about where and when you found it\n4. Upload clear photos (but avoid showing identifying information for IDs/documents)\n5. Describe any identifying features that the owner would recognize\n6. Specify how you prefer to be contacted\n\nYour kindness in reporting found items helps reunite people with their belongings!";
  }
  
  // Check for search related queries
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
    return "To search for items on Khuje Dei:\n\n1. Use the search bar at the top of the page\n2. Filter results by:\n   - Category (electronics, documents, accessories, etc.)\n   - Location/area\n   - Date reported\n   - Item characteristics\n3. Browse through the listings and click on any that match what you're looking for\n4. Contact the person who posted the listing if you find a match\n\nYou can also create an alert to be notified when items matching your description are posted.";
  }
  
  // Check for category related queries
  if (lowerMessage.includes('category') || lowerMessage.includes('categories') || lowerMessage.includes('type of items')) {
    return "Khuje Dei supports various categories of lost and found items including:\n\n• Electronics (phones, laptops, cameras, etc.)\n• Personal documents (IDs, passports, certificates)\n• Accessories (jewelry, watches, bags)\n• Keys and keychains\n• Wallets and purses\n• Clothing items\n• Books and stationery\n• Pets\n• Vehicles\n• Other miscellaneous items\n\nWhen reporting, please select the most appropriate category to help others find your listing.";
  }
  
  // Check for contact related queries
  if (lowerMessage.includes('contact') || lowerMessage.includes('message') || lowerMessage.includes('reach')) {
    return "To contact someone about a lost or found item on Khuje Dei:\n\n1. Navigate to the item's listing page\n2. Click the 'Contact' button\n3. You can send a message through our secure messaging system\n4. The person will receive a notification and can respond to you\n\nFor safety reasons, we recommend initially communicating through our platform before sharing direct contact information.";
  }
  
  // Check for reward related queries
  if (lowerMessage.includes('reward') || lowerMessage.includes('offer') || lowerMessage.includes('payment')) {
    return "You can offer a reward for your lost item by:\n\n1. Mentioning it in your item description when creating a listing\n2. Editing your existing listing to add reward information\n3. Discussing it privately with the finder through our messaging system\n\nWhile offering rewards is optional, it can sometimes increase the chances of having your item returned. Always exercise caution when arranging to meet someone to retrieve your item.";
  }
  
  // Check for profile related queries
  if (lowerMessage.includes('profile') || lowerMessage.includes('account') || lowerMessage.includes('my listings')) {
    return "To manage your profile and listings on Khuje Dei:\n\n1. Click on your username in the top right corner\n2. Select 'My Profile' to update your personal information\n3. Choose 'My Listings' to view, edit or delete your reported items\n4. Under 'Settings', you can update your notification preferences\n5. You can also view your message history with other users\n\nKeeping your profile information up-to-date helps others contact you about your lost or found items.";
  }
  
  // Check for verification or trust related queries
  if (lowerMessage.includes('verify') || lowerMessage.includes('trust') || lowerMessage.includes('fake') || lowerMessage.includes('scam')) {
    return "At Khuje Dei, we take trust and safety seriously:\n\n• Users can verify their accounts with email and phone verification\n• Listings with clear photos and detailed descriptions tend to be more trustworthy\n• Check user profiles for verification badges and previous activity\n• Use our in-app messaging system for initial communications\n• Meet in safe, public places when exchanging items\n• Report suspicious behavior through the 'Report' button on listings or profiles\n\nIf you have concerns about a specific listing or user, please contact our support team.";
  }
  
  // Check for location related queries
  if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('where')) {
    return "When reporting lost or found items, providing accurate location information is crucial:\n\n1. Be as specific as possible about where the item was lost or found\n2. You can use our map feature to pin the exact location\n3. Include nearby landmarks or notable places in your description\n4. For lost items, mention all places you visited before noticing the item was missing\n5. For found items, specify exactly where you found it\n\nPrecise location details significantly increase the chances of successful item recovery.";
  }
  
  // Check for success stories or statistics
  if (lowerMessage.includes('success') || lowerMessage.includes('statistics') || lowerMessage.includes('chances')) {
    return "Many users have successfully recovered their lost items through Khuje Dei! Here are some tips to increase your chances:\n\n• Report as soon as possible - the sooner you report, the better the chances\n• Provide detailed descriptions and clear photos\n• Include unique identifying features that only the true owner would know\n• Share your listing on social media to reach more people\n• Check the platform regularly for updates and new listings\n• Consider offering a reward for valuable items\n\nStay positive - items are found and returned every day through our platform!";
  }
  
  // Check for help or general information
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('guide')) {
    return "I'm here to help you navigate Khuje Dei! Here are some things I can assist with:\n\n• Explaining how to report lost or found items\n• Guiding you through the search process\n• Providing tips for item recovery\n• Explaining how to contact other users\n• Information about categories and item types\n• Account and profile management\n• Safety and verification information\n\nFeel free to ask me about any specific aspect you need help with!";
  }
  
  // Default response
  return "I'm here to help with any questions about finding lost items or reporting found ones on Khuje Dei. Could you please provide more details about what you need assistance with? You can ask about reporting items, searching, contacting others, or any other features of our platform.";
}

