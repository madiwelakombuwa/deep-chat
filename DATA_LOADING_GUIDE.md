# Data Loading with OpenAI - Implementation Guide

This guide explains how to integrate CSV/JSON data loading from Google Cloud Storage (or any public URL) with Deep Chat and OpenAI API.

## Overview

The data loading feature allows you to:
- Fetch CSV or JSON files from remote URLs (including Google Cloud Storage buckets)
- Parse and format the data for AI context
- Automatically include data context in OpenAI conversations
- Enable users to ask questions about the loaded data

## Files Created

### 1. Data Loader Utility (`website/src/utils/dataLoader.js`)

Core utility functions for fetching and parsing data:

- `fetchRemoteData(url)` - Fetches data from remote URL
- `parseCSV(csvText, delimiter)` - Parses CSV into array of objects
- `parseJSON(jsonText)` - Parses JSON data
- `loadRemoteData(url, type)` - Main function to load and parse data
- `formatDataForAI(data, maxRows)` - Formats data for AI context
- `createDataContextPrompt(data, basePrompt, maxRows)` - Creates system prompt with data context

### 2. Documentation (`website/docs/docs/directConnection/OpenAI/OpenAIWithData.mdx`)

Comprehensive documentation including:
- Usage examples for HTML, React, and Vue
- API reference
- Best practices
- Troubleshooting guide
- Interactive example

### 3. Interactive Example Component (`website/src/components/examples/DataLoaderExample.js`)

React component that demonstrates:
- Loading data from user-provided URL
- Secure API key input
- Real-time chat with data context
- Error handling

## How It Works

### 1. Data Loading Flow

```
User provides URL → Fetch data → Parse (CSV/JSON) → Format for AI → Create system prompt → Initialize chat
```

### 2. Data Context Integration

The data is included in the OpenAI system prompt, which gives the AI access to the dataset without requiring it to be sent with every message.

### 3. Example Usage

```javascript
import { loadRemoteData, createDataContextPrompt } from './utils/dataLoader';

// Load CSV from Google Cloud Storage
const data = await loadRemoteData(
  'https://storage.googleapis.com/gdsshopify/MonteCarlo.csv',
  'csv'
);

// Create system prompt with data
const systemPrompt = createDataContextPrompt(
  data,
  'You are a helpful data analysis assistant.',
  50 // Include first 50 rows
);

// Configure Deep Chat with OpenAI
const directConnection = {
  openAI: {
    key: 'YOUR_API_KEY',
    chat: {
      system_prompt: systemPrompt,
      model: 'gpt-4o',
      max_tokens: 2000,
    },
  },
};
```

## Configuration Options

### Data Loading

```javascript
// Load CSV
const csvData = await loadRemoteData(url, 'csv');

// Load JSON
const jsonData = await loadRemoteData(url, 'json');

// Custom CSV delimiter
const tsvData = parseCSV(rawText, '\t');
```

### Context Configuration

```javascript
// Limit rows to avoid token limits
const prompt = createDataContextPrompt(data, basePrompt, 50);

// Custom formatting
const formatted = formatDataForAI(data, 100);
```

### OpenAI Settings

```javascript
{
  openAI: {
    key: apiKey,
    chat: {
      system_prompt: systemPrompt,
      model: 'gpt-4o',          // Use latest model
      max_tokens: 2000,          // Adjust based on data size
      temperature: 0.7,          // Balance creativity/accuracy
    },
  },
}
```

## Google Cloud Storage Setup

### Making Files Public

1. **Via Google Cloud Console:**
   - Go to Cloud Storage → Buckets
   - Select your bucket
   - Click on the file
   - Go to Permissions → Add Member
   - Add `allUsers` with role `Storage Object Viewer`

2. **Via gsutil command:**
   ```bash
   gsutil iam ch allUsers:objectViewer gs://your-bucket/your-file.csv
   ```

### Setting CORS Headers

Create a `cors.json` file:
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS configuration:
```bash
gsutil cors set cors.json gs://your-bucket
```

## Token Limits and Best Practices

### Understanding Token Limits

- GPT-4o: 128K context tokens
- System prompt + data context + conversation must fit within limit
- Each row of data uses approximately 50-200 tokens (varies by content)

### Optimization Strategies

1. **Limit Data Rows:**
   ```javascript
   createDataContextPrompt(data, basePrompt, 50); // Only 50 rows
   ```

2. **Pre-filter Data:**
   ```javascript
   const relevantData = data.filter(row => row.important === 'yes');
   const prompt = createDataContextPrompt(relevantData, basePrompt);
   ```

3. **Summarize Large Datasets:**
   ```javascript
   const summary = {
     totalRows: data.length,
     columns: Object.keys(data[0]),
     samples: data.slice(0, 10),
     statistics: calculateStats(data),
   };
   const prompt = createDataContextPrompt(summary, basePrompt);
   ```

4. **Use Pagination:**
   ```javascript
   // Load data in chunks as needed
   let currentPage = 0;
   const pageSize = 50;
   const chunk = data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
   ```

## Error Handling

### Common Errors and Solutions

1. **403 Forbidden:**
   - File is not public
   - Solution: Make file publicly accessible

2. **CORS Error:**
   - CORS headers not set
   - Solution: Configure CORS on bucket

3. **Token Limit Exceeded:**
   - Too much data in context
   - Solution: Reduce `maxRows` or pre-filter data

4. **Parse Error:**
   - Invalid CSV/JSON format
   - Solution: Validate file format

### Implementing Error Handling

```javascript
try {
  const data = await loadRemoteData(url, 'csv');
  if (!data || data.length === 0) {
    throw new Error('No data found in file');
  }
  // Use data...
} catch (error) {
  if (error.message.includes('403')) {
    console.error('File is not publicly accessible');
  } else if (error.message.includes('CORS')) {
    console.error('CORS not configured properly');
  } else {
    console.error('Failed to load data:', error.message);
  }
  // Show user-friendly error message
}
```

## Security Considerations

### API Key Security

**Never expose OpenAI API keys in client-side code for production!**

Development approach:
```javascript
// OK for local development only
directConnection: {
  openAI: { key: 'sk-...' }
}
```

Production approach:
```javascript
// Use environment variables
directConnection: {
  openAI: { key: process.env.OPENAI_KEY }
}

// Or implement a backend proxy
```

### Data Privacy

- Only load data you have permission to access
- Consider data sensitivity when making buckets public
- Use signed URLs for sensitive data
- Implement authentication if needed

## Testing

### Testing Data Loading

```javascript
// Test CSV parsing
const testCSV = 'name,age\nJohn,30\nJane,25';
const parsed = parseCSV(testCSV);
console.assert(parsed.length === 2, 'Should parse 2 rows');
console.assert(parsed[0].name === 'John', 'Should parse names correctly');

// Test JSON parsing
const testJSON = '{"data": [1, 2, 3]}';
const jsonParsed = parseJSON(testJSON);
console.assert(Array.isArray(jsonParsed.data), 'Should parse JSON correctly');
```

### Testing with Mock Data

```javascript
const mockData = [
  { id: 1, name: 'Item 1', value: 100 },
  { id: 2, name: 'Item 2', value: 200 },
];

const prompt = createDataContextPrompt(mockData, 'Test prompt');
console.log('Generated prompt:', prompt);
```

## Performance Considerations

### Caching

Implement caching to avoid repeated fetches:

```javascript
const dataCache = new Map();

async function getCachedData(url, type) {
  const cacheKey = `${url}_${type}`;

  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }

  const data = await loadRemoteData(url, type);
  dataCache.set(cacheKey, data);

  return data;
}
```

### Lazy Loading

Load data only when needed:

```javascript
let dataPromise = null;

function getData() {
  if (!dataPromise) {
    dataPromise = loadRemoteData(url, 'csv');
  }
  return dataPromise;
}
```

## Advanced Use Cases

### 1. Multiple Data Sources

```javascript
const [salesData, customerData] = await Promise.all([
  loadRemoteData('gs://bucket/sales.csv', 'csv'),
  loadRemoteData('gs://bucket/customers.json', 'json'),
]);

const combinedContext = `
Sales Data: ${formatDataForAI(salesData, 30)}

Customer Data: ${JSON.stringify(customerData.slice(0, 20))}
`;
```

### 2. Real-time Data Updates

```javascript
setInterval(async () => {
  const freshData = await loadRemoteData(url, 'csv');
  updateChatContext(freshData);
}, 300000); // Update every 5 minutes
```

### 3. Data Transformation

```javascript
const rawData = await loadRemoteData(url, 'csv');

// Transform data before using
const transformed = rawData.map(row => ({
  ...row,
  processedDate: new Date(row.date).toISOString(),
  category: categorizeData(row),
}));

const prompt = createDataContextPrompt(transformed, basePrompt);
```

## Deployment Checklist

- [ ] Data files are publicly accessible or properly authenticated
- [ ] CORS is configured on data source
- [ ] API keys are secured (not in client code for production)
- [ ] Error handling is implemented
- [ ] Token limits are considered and data is limited appropriately
- [ ] Data caching is implemented for performance
- [ ] User feedback is provided during loading
- [ ] Fallback behavior is defined for errors

## Troubleshooting Guide

### Data Not Loading

1. Check browser console for errors
2. Verify URL is correct
3. Test URL directly in browser
4. Check CORS configuration
5. Verify file is publicly accessible

### Poor AI Responses

1. Check if data is being included in prompt
2. Verify data format is correct
3. Ensure data is relevant to questions
4. Consider increasing `maxRows` if data seems incomplete
5. Adjust temperature setting in OpenAI config

### Token Limit Errors

1. Reduce `maxRows` parameter
2. Filter data before creating context
3. Use data summaries instead of full data
4. Consider switching to a model with larger context window

## Resources

- [Deep Chat Documentation](https://deepchat.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Google Cloud Storage CORS](https://cloud.google.com/storage/docs/configuring-cors)
- [Token Counting](https://platform.openai.com/tokenizer)

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review the documentation
3. Check browser console for errors
4. Open an issue on GitHub with detailed information
