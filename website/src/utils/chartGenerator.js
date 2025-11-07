/**
 * Chart generation utilities using QuickChart API
 * Integrates with OpenAI function calling to generate charts from data
 */

/**
 * Generates a QuickChart URL from chart configuration
 * @param {Object} config - Chart.js configuration object
 * @returns {string} QuickChart URL
 */
export function generateQuickChartUrl(config) {
  const encodedConfig = encodeURIComponent(JSON.stringify(config));
  return `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=400`;
}

/**
 * Creates a line chart configuration
 * @param {Object} params - Chart parameters
 * @returns {Object} Chart.js configuration
 */
export function createLineChart({ title, labels, datasets }) {
  return {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.color || 'rgb(75, 192, 192)',
        backgroundColor: dataset.color || 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      })),
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 },
        },
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };
}

/**
 * Creates a bar chart configuration
 * @param {Object} params - Chart parameters
 * @returns {Object} Chart.js configuration
 */
export function createBarChart({ title, labels, datasets }) {
  return {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.color || 'rgba(54, 162, 235, 0.5)',
        borderColor: dataset.color || 'rgb(54, 162, 235)',
        borderWidth: 1,
      })),
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 },
        },
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };
}

/**
 * Creates a pie chart configuration
 * @param {Object} params - Chart parameters
 * @returns {Object} Chart.js configuration
 */
export function createPieChart({ title, labels, data, colors }) {
  return {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors || [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 },
        },
        legend: {
          display: true,
          position: 'right',
        },
      },
    },
  };
}

/**
 * Creates a scatter plot configuration
 * @param {Object} params - Chart parameters
 * @returns {Object} Chart.js configuration
 */
export function createScatterPlot({ title, datasets }) {
  return {
    type: 'scatter',
    data: {
      datasets: datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.color || 'rgb(255, 99, 132)',
      })),
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 },
        },
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
        },
      },
    },
  };
}

/**
 * OpenAI function definitions for chart generation
 */
export const chartFunctionDefinitions = [
  {
    name: 'create_line_chart',
    description:
      'Creates a line chart to visualize trends over time or ordered categories. Use this when the user asks to see trends, time series, or progression.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the chart',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'The x-axis labels (e.g., dates, categories)',
        },
        datasets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Dataset name' },
              data: {
                type: 'array',
                items: { type: 'number' },
                description: 'Data points',
              },
              color: {
                type: 'string',
                description: 'Line color (optional, e.g., "rgb(255, 99, 132)")',
              },
            },
            required: ['label', 'data'],
          },
        },
      },
      required: ['title', 'labels', 'datasets'],
    },
  },
  {
    name: 'create_bar_chart',
    description:
      'Creates a bar chart to compare values across categories. Use this for comparisons, rankings, or categorical data.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the chart' },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Category labels',
        },
        datasets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Dataset name' },
              data: {
                type: 'array',
                items: { type: 'number' },
                description: 'Values for each category',
              },
              color: { type: 'string', description: 'Bar color (optional)' },
            },
            required: ['label', 'data'],
          },
        },
      },
      required: ['title', 'labels', 'datasets'],
    },
  },
  {
    name: 'create_pie_chart',
    description:
      'Creates a pie chart to show proportions or percentages. Use this when the user wants to see the composition or distribution of a whole.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the chart' },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Slice labels',
        },
        data: {
          type: 'array',
          items: { type: 'number' },
          description: 'Values for each slice',
        },
        colors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Colors for each slice (optional)',
        },
      },
      required: ['title', 'labels', 'data'],
    },
  },
  {
    name: 'create_scatter_plot',
    description:
      'Creates a scatter plot to show the relationship between two variables. Use this for correlation analysis.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the chart' },
        datasets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Dataset name' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                  },
                },
                description: 'Array of {x, y} coordinates',
              },
              color: { type: 'string', description: 'Point color (optional)' },
            },
            required: ['label', 'data'],
          },
        },
      },
      required: ['title', 'datasets'],
    },
  },
];

/**
 * Handles OpenAI function calls for chart generation
 * @param {string} functionName - Name of the function called
 * @param {Object} args - Function arguments
 * @returns {string} HTML string with chart image
 */
export function handleChartFunction(functionName, args) {
  let config;

  switch (functionName) {
    case 'create_line_chart':
      config = createLineChart(args);
      break;
    case 'create_bar_chart':
      config = createBarChart(args);
      break;
    case 'create_pie_chart':
      config = createPieChart(args);
      break;
    case 'create_scatter_plot':
      config = createScatterPlot(args);
      break;
    default:
      return `Error: Unknown function ${functionName}`;
  }

  const chartUrl = generateQuickChartUrl(config);

  // Return as a message with the chart image
  return {
    html: `<div style="margin: 10px 0;">
      <img src="${chartUrl}" alt="${args.title}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
    </div>`,
    text: `Here's your ${args.title}`,
  };
}
