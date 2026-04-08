import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation strings for all supported languages
const translations = {
  en: {
    // Common
    appName: 'FarmHelp',
    welcome: 'Welcome',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    submit: 'Submit',
    search: 'Search',
    
    // Navigation
    home: 'Home',
    services: 'Services',
    community: 'Community',
    profile: 'Profile',
    
    // Home Screen
    topNotchPlatform: 'Top Notch Farming Platform',
    heroTitle: 'Regenerating The Earth\nWith AI-Powered Farming',
    getStarted: 'Get Started',
    exploreFeatures: 'Explore Features',
    plantAnalyzer: 'Plant Analyzer',
    plantAnalyzerDesc: 'Upload plant photos and get an instant, accurate health diagnosis.',
    cropSuggestions: 'Crop Suggestions',
    cropSuggestionsDesc: 'Personalized crop recommendations based on your soil and climate data.',
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: 'Chat with our AI farming expert for instant guidance and personalized advice.',
    tryNow: 'Try Now',
    
    // Weather
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    
    // Community
    communityFeed: 'Community Feed',
    createPost: 'Create Post',
    whatsOnMind: "What's on your mind?",
    noPosts: 'No posts yet',
    comments: 'Comments',
    
    // Profile
    settings: 'Settings',
    helpSupport: 'Help & Support',
    aboutApp: 'About FarmHelp',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    
    // Settings
    pushNotifications: 'Push Notifications',
    darkMode: 'Dark Mode',
    language: 'Language',
    clearCache: 'Clear Cache',
    
    // Help & Support
    faq1: 'How do I analyze my plant?',
    faq1Answer: 'Go to Plant Analyzer, take or upload a photo of your plant, and our AI will diagnose any diseases.',
    faq2: 'How do I post in the community?',
    faq2Answer: 'Navigate to Community tab and tap the + button to create a new post.',
    faq3: 'How can I get crop recommendations?',
    faq3Answer: 'Use the Crop Suggestions feature and enter your soil and climate data.',
    contactEmail: 'Email: support@farmhelp.com',
    contactPhone: 'Phone: +91 8660179391',
    
    // Footer
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contact: 'Contact',
    allRightsReserved: 'All Rights Reserved',
    
    // Services
    allServices: 'All Services',
    findJobs: 'Find Jobs',
    postService: 'Post Service',
    postJob: 'Post Job',
    
    // Misc
    version: 'Version',
    developer: 'Developer',
    lastUpdated: 'Last Updated',
    
    // Chatbot
    chatbotTitle: 'FarmBot AI Assistant',
    chatbotSubtitle: 'Powered by GROQ & LangChain 🚀',
    chatbotWelcome: '🤖 Hello! I\'m your FarmHelp AI assistant powered by GROQ AI & LangChain. I can provide detailed guidance on:\n\n• Crop recommendations (rice, wheat, cotton, vegetables)\n• Soil management (loamy, clay, sandy, red, black soil)\n• Pest & disease control\n• Irrigation methods\n• Fertilizer application\n• Seasonal farming (Kharif, Rabi, Zaid)\n• Organic farming techniques\n• Government schemes & subsidies\n\nPlease ask me a specific question like:\n"What crops grow best in monsoon season?"\n"How to manage pests in cotton?"\n"What fertilizer for wheat crop?"\n\nWhat would you like to know?',
    chatbotTyping: 'FarmBot is thinking...',
    chatbotPlaceholder: 'Ask me anything about farming...',
    chatbotQuickTitle: '✨ Quick Questions:',
    chatbotQ1: '🌾 Best crops for loamy soil?',
    chatbotQ2: '🐛 How to control pests?',
    chatbotQ3: '💧 Irrigation tips',
    chatbotQ4: '🌡️ Weather advice',
    chatbotError: '⚠️ Connection error. Please check your internet and try again.',
    chatbotRetry: 'Sorry, I couldn\'t process that. Please try again.',
  },
  
  hi: {
    // Common
    appName: 'फार्महेल्प',
    welcome: 'स्वागत है',
    loading: 'लोड हो रहा है...',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    submit: 'जमा करें',
    search: 'खोजें',
    
    // Navigation
    home: 'होम',
    services: 'सेवाएं',
    community: 'समुदाय',
    profile: 'प्रोफ़ाइल',
    
    // Home Screen
    topNotchPlatform: 'शीर्ष खेती मंच',
    heroTitle: 'AI-संचालित खेती के साथ\nपृथ्वी का पुनर्जनन',
    getStarted: 'शुरू करें',
    exploreFeatures: 'सुविधाएं देखें',
    plantAnalyzer: 'पौधा विश्लेषक',
    plantAnalyzerDesc: 'पौधों की फोटो अपलोड करें और तुरंत स्वास्थ्य निदान प्राप्त करें।',
    cropSuggestions: 'फसल सुझाव',
    cropSuggestionsDesc: 'आपकी मिट्टी और जलवायु के आधार पर व्यक्तिगत फसल अनुशंसाएं।',
    aiAssistant: 'AI सहायक',
    aiAssistantDesc: 'तत्काल मार्गदर्शन के लिए हमारे AI खेती विशेषज्ञ से चैट करें।',
    tryNow: 'अभी आज़माएं',
    
    // Weather
    humidity: 'आर्द्रता',
    windSpeed: 'हवा की गति',
    
    // Community
    communityFeed: 'समुदाय फ़ीड',
    createPost: 'पोस्ट बनाएं',
    whatsOnMind: 'आपके मन में क्या है?',
    noPosts: 'अभी कोई पोस्ट नहीं',
    comments: 'टिप्पणियां',
    
    // Profile
    settings: 'सेटिंग्स',
    helpSupport: 'सहायता और समर्थन',
    aboutApp: 'फार्महेल्प के बारे में',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    register: 'रजिस्टर',
    
    // Settings
    pushNotifications: 'पुश सूचनाएं',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    clearCache: 'कैश साफ़ करें',
    
    // Help & Support
    faq1: 'मैं अपने पौधे का विश्लेषण कैसे करूं?',
    faq1Answer: 'पौधा विश्लेषक पर जाएं, अपने पौधे की फोटो लें या अपलोड करें, और हमारा AI किसी भी बीमारी का निदान करेगा।',
    faq2: 'मैं समुदाय में कैसे पोस्ट करूं?',
    faq2Answer: 'समुदाय टैब पर जाएं और नई पोस्ट बनाने के लिए + बटन दबाएं।',
    faq3: 'मुझे फसल की सिफारिशें कैसे मिलेंगी?',
    faq3Answer: 'फसल सुझाव सुविधा का उपयोग करें और अपनी मिट्टी और जलवायु डेटा दर्ज करें।',
    contactEmail: 'ईमेल: support@farmhelp.com',
    contactPhone: 'फ़ोन: +91 8660179391',
    
    // Footer
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    contact: 'संपर्क करें',
    allRightsReserved: 'सर्वाधिकार सुरक्षित',
    
    // Services
    allServices: 'सभी सेवाएं',
    findJobs: 'नौकरियां खोजें',
    postService: 'सेवा पोस्ट करें',
    postJob: 'नौकरी पोस्ट करें',
    
    // Misc
    version: 'संस्करण',
    developer: 'डेवलपर',
    lastUpdated: 'अंतिम अपडेट',
    
    // Chatbot
    chatbotTitle: 'फार्मबॉट AI सहायक',
    chatbotSubtitle: 'GROQ और LangChain द्वारा संचालित 🚀',
    chatbotWelcome: '🤖 नमस्ते! मैं आपका फार्महेल्प AI सहायक हूं जो GROQ AI और LangChain द्वारा संचालित है। मैं विस्तृत मार्गदर्शन प्रदान कर सकता हूं:\n\n• फसल सिफारिशें (चावल, गेहूं, कपास, सब्जियां)\n• मिट्टी प्रबंधन (दोमट, चिकनी, रेतीली, लाल, काली मिट्टी)\n• कीट और रोग नियंत्रण\n• सिंचाई विधियां\n• उर्वरक अनुप्रयोग\n• मौसमी खेती (खरीफ, रबी, जायद)\n• जैविक खेती तकनीक\n• सरकारी योजनाएं और सब्सिडी\n\nकृपया मुझसे एक विशिष्ट प्रश्न पूछें जैसे:\n"मानसून के मौसम में कौन सी फसलें सबसे अच्छी हैं?"\n"कपास में कीटों को कैसे नियंत्रित करें?"\n"गेहूं की फसल के लिए कौन सा उर्वरक?"\n\nआप क्या जानना चाहेंगे?',
    chatbotTyping: 'फार्मबॉट सोच रहा है...',
    chatbotPlaceholder: 'खेती के बारे में कुछ भी पूछें...',
    chatbotQuickTitle: '✨ त्वरित प्रश्न:',
    chatbotQ1: '🌾 दोमट मिट्टी के लिए सर्वोत्तम फसलें?',
    chatbotQ2: '🐛 कीटों को कैसे नियंत्रित करें?',
    chatbotQ3: '💧 सिंचाई टिप्स',
    chatbotQ4: '🌡️ मौसम सलाह',
    chatbotError: '⚠️ कनेक्शन त्रुटि। कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।',
    chatbotRetry: 'क्षमा करें, मैं इसे प्रोसेस नहीं कर सका। कृपया पुनः प्रयास करें।',
  },
  
  kn: {
    // Common
    appName: 'ಫಾರ್ಮ್‌ಹೆಲ್ಪ್',
    welcome: 'ಸ್ವಾಗತ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    save: 'ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    delete: 'ಅಳಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    submit: 'ಸಲ್ಲಿಸಿ',
    search: 'ಹುಡುಕಿ',
    
    // Navigation
    home: 'ಮುಖಪುಟ',
    services: 'ಸೇವೆಗಳು',
    community: 'ಸಮುದಾಯ',
    profile: 'ಪ್ರೊಫೈಲ್',
    
    // Home Screen
    topNotchPlatform: 'ಅತ್ಯುತ್ತಮ ಕೃಷಿ ವೇದಿಕೆ',
    heroTitle: 'AI-ಚಾಲಿತ ಕೃಷಿಯೊಂದಿಗೆ\nಭೂಮಿಯ ಪುನರುಜ್ಜೀವನ',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    exploreFeatures: 'ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಅన್ವೇಷಿಸಿ',
    plantAnalyzer: 'ಸಸ್ಯ ವಿಶ್ಲೇಷಕ',
    plantAnalyzerDesc: 'ಸಸ್ಯದ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ತ್ವರಿತ ಆರೋಗ್ಯ ರೋಗನಿರ್ಣಯ ಪಡೆಯಿರಿ.',
    cropSuggestions: 'ಬೆಳೆ ಸಲಹೆಗಳು',
    cropSuggestionsDesc: 'ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನ ಆಧಾರಿತ ವೈಯಕ್ತಿಕ ಬೆಳೆ ಶಿಫಾರಸುಗಳು.',
    aiAssistant: 'AI ಸಹಾಯಕ',
    aiAssistantDesc: 'ತ್ವರಿತ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ನಮ್ಮ AI ಕೃಷಿ ತಜ್ಞರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ.',
    tryNow: 'ಈಗ ಪ್ರಯತ್ನಿಸಿ',
    
    // Weather
    humidity: 'ಆರ್ದ್ರತೆ',
    windSpeed: 'ಗಾಳಿಯ ವೇಗ',
    
    // Community
    communityFeed: 'ಸಮುದಾಯ ಫೀಡ್',
    createPost: 'ಪೋಸ್ಟ್ ರಚಿಸಿ',
    whatsOnMind: 'ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?',
    noPosts: 'ಇನ್ನೂ ಯಾವುದೇ ಪೋಸ್ಟ್‌ಗಳಿಲ್ಲ',
    comments: 'ಕಾಮೆಂಟ್‌ಗಳು',
    
    // Profile
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    helpSupport: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
    aboutApp: 'ಫಾರ್ಮ್‌ಹೆಲ್ಪ್ ಬಗ್ಗೆ',
    logout: 'ಲಾಗ್ ಔಟ್',
    login: 'ಲಾಗಿನ್',
    register: 'ನೋಂದಣಿ',
    
    // Settings
    pushNotifications: 'ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು',
    darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    language: 'ಭಾಷೆ',
    clearCache: 'ಕ್ಯಾಶ್ ತೆರವುಗೊಳಿಸಿ',
    
    // Help & Support
    faq1: 'ನನ್ನ ಸಸ್ಯವನ್ನು ಹೇಗೆ ವಿಶ್ಲೇಷಿಸುವುದು?',
    faq1Answer: 'ಸಸ್ಯ ವಿಶ್ಲೇಷಕಕ್ಕೆ ಹೋಗಿ, ನಿಮ್ಮ ಸಸ್ಯದ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ನಮ್ಮ AI ಯಾವುದೇ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುತ್ತದೆ.',
    faq2: 'ಸಮುದಾಯದಲ್ಲಿ ಹೇಗೆ ಪೋಸ್ಟ್ ಮಾಡುವುದು?',
    faq2Answer: 'ಸಮುದಾಯ ಟ್ಯಾಬ್‌ಗೆ ಹೋಗಿ ಮತ್ತು ಹೊಸ ಪೋಸ್ಟ್ ರಚಿಸಲು + ಬಟನ್ ಒತ್ತಿ.',
    faq3: 'ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಹೇಗೆ ಪಡೆಯುವುದು?',
    faq3Answer: 'ಬೆಳೆ ಸಲಹೆಗಳ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಬಳಸಿ ಮತ್ತು ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನ ಡೇಟಾವನ್ನು ನಮೂದಿಸಿ.',
    contactEmail: 'ಇಮೇಲ್: support@farmhelp.com',
    contactPhone: 'ಫೋನ್: +91 8660179391',
    
    // Footer
    privacyPolicy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    termsOfService: 'ಸೇವಾ ನಿಯಮಗಳು',
    contact: 'ಸಂಪರ್ಕಿಸಿ',
    allRightsReserved: 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
    
    // Services
    allServices: 'ಎಲ್ಲಾ ಸೇವೆಗಳು',
    findJobs: 'ಕೆಲಸ ಹುಡುಕಿ',
    postService: 'ಸೇವೆ ಪೋಸ್ಟ್ ಮಾಡಿ',
    postJob: 'ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ',
    
    // Misc
    version: 'ಆವೃತ್ತಿ',
    developer: 'ಡೆವಲಪರ್',
    lastUpdated: 'ಕೊನೆಯ ನವೀಕರಣ',
    
    // Chatbot
    chatbotTitle: 'ಫಾರ್ಮ್‌ಬಾಟ್ AI ಸಹಾಯಕ',
    chatbotSubtitle: 'GROQ ಮತ್ತು LangChain ನಿಂದ ಚಾಲಿತ 🚀',
    chatbotWelcome: '🤖 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫಾರ್ಮ್‌ಹೆಲ್ಪ್ AI ಸಹಾಯಕ, GROQ AI ಮತ್ತು LangChain ನಿಂದ ಚಾಲಿತ. ನಾನು ವಿವರವಾದ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ:\n\n• ಬೆಳೆ ಶಿಫಾರಸುಗಳು (ಅಕ್ಕಿ, ಗೋಧಿ, ಹತ್ತಿ, ತರಕಾರಿಗಳು)\n• ಮಣ್ಣಿನ ನಿರ್ವಹಣೆ (ಲೋಮಿ, ಜೇಡಿಮಣ್ಣು, ಮರಳು, ಕೆಂಪು, ಕಪ್ಪು ಮಣ್ಣು)\n• ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ\n• ನೀರಾವರಿ ವಿಧಾನಗಳು\n• ರಸಗೊಬ್ಬರ ಅನ್ವಯ\n• ಋತುಮಾನದ ಕೃಷಿ (ಖರೀಫ್, ರಬೀ, ಜಾಯದ್)\n• ಸಾವಯವ ಕೃಷಿ ತಂತ್ರಗಳು\n• ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳು\n\nದಯವಿಟ್ಟು ನನಗೆ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ ಕೇಳಿ:\n"ಮುಂಗಾರು ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆಗಳು ಉತ್ತಮ?"\n"ಹತ್ತಿಯಲ್ಲಿ ಕೀಟಗಳನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸುವುದು?"\n"ಗೋಧಿ ಬೆಳೆಗೆ ಯಾವ ರಸಗೊಬ್ಬರ?"\n\nನೀವು ಏನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?',
    chatbotTyping: 'ಫಾರ್ಮ್‌ಬಾಟ್ ಯೋಚಿಸುತ್ತಿದೆ...',
    chatbotPlaceholder: 'ಕೃಷಿಯ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...',
    chatbotQuickTitle: '✨ ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು:',
    chatbotQ1: '🌾 ಲೋಮಿ ಮಣ್ಣಿಗೆ ಉತ್ತಮ ಬೆಳೆಗಳು?',
    chatbotQ2: '🐛 ಕೀಟಗಳನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸುವುದು?',
    chatbotQ3: '💧 ನೀರಾವರಿ ಸಲಹೆಗಳು',
    chatbotQ4: '🌡️ ಹವಾಮಾನ ಸಲಹೆ',
    chatbotError: '⚠️ ಸಂಪರ್ಕ ದೋಷ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    chatbotRetry: 'ಕ್ಷಮಿಸಿ, ನಾನು ಅದನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
};

export type Language = 'en' | 'hi' | 'kn';

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  kn: 'ಕನ್ನಡ (Kannada)',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi' || savedLanguage === 'kn')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    const langTranslations = translations[language];
    return (langTranslations as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
