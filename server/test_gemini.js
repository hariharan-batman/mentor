import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAGXVqUxadCgzhZVQDq3ym9k9ft3gjyh10';

console.log('\n🔑 Testing Gemini API Connection...');
console.log('API Key:', API_KEY.substring(0, 20) + '...\n');

async function listAvailableModels() {
  try {
    console.log('📋 Attempting to list available models via API...\n');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log('✅ Available models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name} (${model.displayName})`);
      });
      return data.models;
    } else {
      console.log('⚠️  No models found or API key may not have access');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    if (error.message.includes('403')) {
      console.error('\n⚠️  API key may be invalid or restricted. Please verify:');
      console.error('   1. Your API key is correct');
      console.error('   2. Generative Language API is enabled in Google Cloud Console');
      console.error('   3. The API key has the necessary permissions');
    }
    return null;
  }
}

async function testGeminiConnection() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('📋 Listing available models...\n');
    
    // Try different model names based on what's available
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-pro-latest'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`\n🔍 Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Working!" if you can read this.');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}!`);
        console.log('Response:', text);
        console.log('\n✨ This model works! Using it for the app.\n');
        return modelName;
        
      } catch (err) {
        console.log(`❌ ${modelName} failed:`, err.message.split('\n')[0]);
      }
    }
    
    console.log('\n\n⚠️  No working models found!');
    console.log('This may indicate:');
    console.log('  - API key is invalid');
    console.log('  - Generative Language API not enabled');
    console.log('  - Key restrictions prevent access\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n⚠️  The API key appears to be invalid. Please check your Gemini API key.');
    } else if (error.message.includes('quota')) {
      console.error('\n⚠️  API quota exceeded. You may need to wait or upgrade your plan.');
    }
  }
}

async function main() {
  const models = await listAvailableModels();
  if (models && models.length > 0) {
    console.log('\n\n🔬 Testing first available model...\n');
    await testGeminiConnection();
  } else {
    console.log('\n❌ Cannot proceed without available models');
  }
}

main();
