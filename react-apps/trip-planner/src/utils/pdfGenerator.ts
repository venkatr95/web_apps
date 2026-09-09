import { TravelItinerary, Conversation, Expense, User } from '../types';

// Mock implementation of PDF generation
// In a real app, this would use a library like jsPDF or generate a PDF on the server
export const generatePDF = async (
  content: TravelItinerary | Conversation | Expense[],
  contentType: 'itinerary' | 'conversation' | 'expenses'
): Promise<string> => {
  return new Promise((resolve) => {
    // Simulating PDF generation delay
    setTimeout(() => {
      console.log(`Generating PDF for ${contentType}:`, content);
      
      // In a real implementation, this would return a blob URL or download the PDF
      // For this demo, we're just returning a mock file URL
      resolve(`data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvWE9iamVjdCAvU3VidHlwZSAvSW1hZ2UgL1dpZHRoIDIxMCAvSGVpZ2h0IDIxMCAvQ29sb3JTcGFjZSAvRGV2aWNlUkdCIC9CaXRzUGVyQ29tcG9uZW50IDggL0ZpbHRlciAvRENURGVjb2RlIC9MZW5ndGggMTExMDEgPj4Kc3RyZWFtCg==`);
    }, 1000);
  });
};

export const downloadPDF = async (
  content: TravelItinerary | Conversation | Expense[],
  contentType: 'itinerary' | 'conversation' | 'expenses'
): Promise<void> => {
  try {
    const pdfUrl = await generatePDF(content, contentType);
    
    // Create a title for the PDF
    let title = '';
    if (contentType === 'itinerary') {
      const itinerary = content as TravelItinerary;
      title = `${itinerary.title}_Itinerary`;
    } else if (contentType === 'conversation') {
      const conversation = content as Conversation;
      title = conversation.isGroup 
        ? `${conversation.groupName}_Chat` 
        : 'Chat_Conversation';
    } else {
      title = 'Expense_Report';
    }
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
};

export const formatItineraryForPDF = (itinerary: TravelItinerary): string => {
  // This would format the itinerary data in a way that's suitable for PDF generation
  // For now, we're just returning a string representation
  return JSON.stringify(itinerary, null, 2);
};

export const formatConversationForPDF = (conversation: Conversation, users: User[]): string => {
  // This would format the conversation data in a way that's suitable for PDF generation
  return JSON.stringify(conversation, null, 2);
};

export const formatExpensesForPDF = (expenses: Expense[], users: User[]): string => {
  // This would format the expenses data in a way that's suitable for PDF generation
  return JSON.stringify(expenses, null, 2);
};