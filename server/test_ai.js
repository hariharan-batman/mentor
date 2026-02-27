import { generateMentorResponse } from './services/aiService.js';

const companyProfile = {
  companyName: 'TestCo',
  industry: 'Technology',
  stage: 'Idea',
  location: 'Bangalore',
  revenue: 0,
  teamSize: 1,
  primaryGoal: 'Growth',
  isRegistered: false
};

async function test() {
  console.log('Testing AI response...');
  try {
    const response = await generateMentorResponse(companyProfile, 'Hello', 'chat');
    console.log('Response received:');
    console.log(response);
  } catch (error) {
    console.error('Test failed with error:');
    console.error(error);
  }
}

test();
