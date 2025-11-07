/**
 * Utility functions to fetch and parse CSV/JSON data from remote URLs
 * including Google Cloud Storage buckets
 */

/**
 * Fetches data from a remote URL
 * @param {string} url - The URL to fetch data from
 * @returns {Promise<string>} The raw text content
 */
export async function fetchRemoteData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

/**
 * Parses CSV text into an array of objects
 * @param {string} csvText - The CSV text to parse
 * @param {string} delimiter - The delimiter used in CSV (default: ',')
 * @returns {Array<Object>} Array of objects representing CSV rows
 */
export function parseCSV(csvText, delimiter = ',') {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  // Parse headers
  const headers = lines[0].split(delimiter).map(header => header.trim().replace(/^"|"$/g, ''));

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(value => value.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Parses JSON text into an object or array
 * @param {string} jsonText - The JSON text to parse
 * @returns {Object|Array} Parsed JSON data
 */
export function parseJSON(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw error;
  }
}

/**
 * Loads and parses data from a remote CSV or JSON file
 * @param {string} url - The URL of the file to load
 * @param {string} type - The type of file ('csv' or 'json')
 * @returns {Promise<Array<Object>|Object>} The parsed data
 */
export async function loadRemoteData(url, type = 'csv') {
  const rawData = await fetchRemoteData(url);

  if (type === 'csv') {
    return parseCSV(rawData);
  } else if (type === 'json') {
    return parseJSON(rawData);
  } else {
    throw new Error(`Unsupported data type: ${type}`);
  }
}

/**
 * Converts data array into a formatted text for AI context
 * @param {Array<Object>} data - The data array to format
 * @param {number} maxRows - Maximum number of rows to include (default: 50)
 * @returns {string} Formatted text representation of the data
 */
export function formatDataForAI(data, maxRows = 50) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available.';
  }

  const limitedData = data.slice(0, maxRows);
  const headers = Object.keys(limitedData[0]);

  let formatted = `Data Summary (${data.length} total rows, showing ${limitedData.length}):\n\n`;
  formatted += `Columns: ${headers.join(', ')}\n\n`;
  formatted += 'Sample Data:\n';

  limitedData.forEach((row, index) => {
    formatted += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
  });

  return formatted;
}

/**
 * Creates a system prompt that includes data context
 * @param {Array<Object>|Object} data - The data to include in context
 * @param {string} basePrompt - The base system prompt
 * @param {number} maxRows - Maximum number of rows to include
 * @returns {string} The complete system prompt with data context
 */
export function createDataContextPrompt(data, basePrompt = '', maxRows = 50) {
  const dataContext = Array.isArray(data)
    ? formatDataForAI(data, maxRows)
    : JSON.stringify(data, null, 2);

  return `${basePrompt}

You have access to the following dataset:

${dataContext}

When answering questions, use this data to provide accurate and relevant responses. You can analyze trends, provide statistics, and answer specific questions about the data.`;
}
