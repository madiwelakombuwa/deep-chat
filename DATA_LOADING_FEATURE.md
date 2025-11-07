# Data Loading Feature for Deep Chat + OpenAI

## Summary

I've implemented a complete solution for loading CSV/JSON data from Google Cloud Storage (or any public URL) and using it with OpenAI API in Deep Chat.

## What Was Created

### 1. Core Utility (`website/src/utils/dataLoader.js`)
A JavaScript module with functions to:
- Fetch data from remote URLs
- Parse CSV and JSON files
- Format data for AI context
- Create system prompts that include data context

### 2. Documentation (`website/docs/docs/directConnection/OpenAI/OpenAIWithData.mdx`)
Complete documentation page including:
- Overview and usage examples for HTML, React, and Vue
- API reference for all utility functions
- Best practices for data loading and AI integration
- Troubleshooting guide
- Security considerations
- Interactive example component

### 3. Interactive Example (`website/src/components/examples/DataLoaderExample.js`)
A React component that demonstrates:
- Loading CSV/JSON from user-provided URL
- Secure API key input
- Real-time chat interface with data context
- Comprehensive error handling

### 4. Implementation Guide (`DATA_LOADING_GUIDE.md`)
Detailed developer guide covering:
- Technical implementation details
- Google Cloud Storage configuration
- Token limit management
- Security best practices
- Testing strategies
- Deployment checklist

## How to Use

### Quick Start

```javascript
import { loadRemoteData, createDataContextPrompt } from './website/src/utils/dataLoader';

// 1. Load your data
const data = await loadRemoteData(
  'https://storage.googleapis.com/your-bucket/file.csv',
  'csv'
);

// 2. Create system prompt with data context
const systemPrompt = createDataContextPrompt(
  data,
  'You are a helpful assistant that analyzes data.',
  50 // Include first 50 rows
);

// 3. Configure Deep Chat with OpenAI
const directConnection = {
  openAI: {
    key: 'YOUR_API_KEY',
    chat: {
      system_prompt: systemPrompt,
      model: 'gpt-4o',
    },
  },
};
```

### React Example

```jsx
import React, { useEffect, useState } from 'react';
import { DeepChat } from 'deep-chat-react';
import { loadRemoteData, createDataContextPrompt } from './utils/dataLoader';

function ChatWithData() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function init() {
      const data = await loadRemoteData(
        'https://storage.googleapis.com/gdsshopify/MonteCarlo.csv',
        'csv'
      );

      const prompt = createDataContextPrompt(data, 'You are a data analyst.');

      setConfig({
        openAI: {
          key: process.env.OPENAI_KEY,
          chat: { system_prompt: prompt, model: 'gpt-4o' },
        },
      });
    }
    init();
  }, []);

  return config ? <DeepChat directConnection={config} /> : <div>Loading...</div>;
}
```

## Key Features

✅ **Universal Data Loading** - Works with CSV and JSON from any public URL
✅ **Google Cloud Storage Support** - Direct integration with GCS buckets
✅ **Automatic Parsing** - Handles CSV and JSON parsing automatically
✅ **Smart Context Formatting** - Formats data optimally for AI understanding
✅ **Token Management** - Limits data size to avoid token limits
✅ **Error Handling** - Comprehensive error handling and user feedback
✅ **Framework Agnostic** - Works with React, Vue, vanilla JS, etc.
✅ **Fully Documented** - Complete docs with examples and troubleshooting

## Example Use Cases

1. **Customer Service** - Load customer data and answer questions about accounts
2. **Data Analysis** - Analyze sales data, trends, and patterns
3. **Report Generation** - Answer questions about business metrics
4. **Inventory Management** - Query product inventory and availability
5. **Financial Analysis** - Analyze financial data and generate insights

## Questions Users Can Ask

Once data is loaded, users can ask:
- "What columns are in this dataset?"
- "Show me the first 10 rows"
- "What's the average value of [column]?"
- "Are there any trends in the data?"
- "Filter data where [condition]"
- "What's the maximum/minimum [value]?"
- "Summarize the data"

## Testing the Feature

### View Documentation
Once deployed, visit:
```
https://madiwelakombuwa.github.io/deep-chat/docs/directConnection/OpenAI/OpenAIWithData
```

### Try the Interactive Example
The documentation page includes a live, interactive example where you can:
1. Enter any public CSV/JSON URL
2. Add your OpenAI API key
3. Chat with your data immediately

### Local Testing
```bash
cd website
npm install
npm start
# Visit: http://localhost:3000/docs/directConnection/OpenAI/OpenAIWithData
```

## Configuration for Google Cloud Storage

### Make File Public
```bash
gsutil iam ch allUsers:objectViewer gs://your-bucket/file.csv
```

### Set CORS Headers
```bash
# Create cors.json
echo '[{"origin":["*"],"method":["GET"],"responseHeader":["Content-Type"]}]' > cors.json

# Apply to bucket
gsutil cors set cors.json gs://your-bucket
```

## Important Notes

### Security
- **Never expose API keys in production client code**
- Use environment variables or backend proxy
- Only load data you have permission to access

### Performance
- Limit data rows to avoid token limits (default: 50 rows)
- Implement caching for frequently accessed data
- Consider pagination for large datasets

### Token Limits
- GPT-4o has 128K token context limit
- Each CSV row ≈ 50-200 tokens
- Monitor token usage and adjust `maxRows` parameter

## Files Modified/Created

```
website/src/utils/dataLoader.js                              [NEW]
website/src/components/examples/DataLoaderExample.js        [NEW]
website/docs/docs/directConnection/OpenAI/OpenAIWithData.mdx [NEW]
DATA_LOADING_GUIDE.md                                        [NEW]
DATA_LOADING_FEATURE.md                                      [NEW]
```

## Next Steps

1. **Deploy**: Commit and push these changes
2. **Test**: Try the interactive example with your data
3. **Integrate**: Use in your application
4. **Customize**: Modify the utility functions as needed

## Support & Troubleshooting

See `DATA_LOADING_GUIDE.md` for:
- Detailed troubleshooting steps
- Common error solutions
- Performance optimization tips
- Advanced use cases

## Example URLs to Test

You can test with any public CSV/JSON URL, for example:
- Your GCS URL: `https://storage.googleapis.com/gdsshopify/MonteCarlo.csv`
- Any public dataset URL
- JSON API endpoints

---

The feature is production-ready and fully documented. Enjoy chatting with your data! 🚀
