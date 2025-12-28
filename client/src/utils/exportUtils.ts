// Agent Status interface
interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
  phone?: string;
  timezone?: string;
  languages?: string[];
  profileImage?: string;
  experience?: number;
  rating?: number;
  projects?: number;
  customFields?: Record<string, any>;
}
import jsPDF from 'jspdf';

// Performance metrics type for export functions
export interface AgentPerformanceData {
  responseTime: number;
  satisfaction: number;
  projectsCompleted: number;
  avgResponseTime: number;
  totalProjects: number;
  rating: number;
  onTimeDelivery: number;
  clientRetention: number;
  projectTypes?: { name: string; value: number }[];
}

/**
 * Converts an array of agent status objects to a CSV string
 * @param data Array of agent status objects
 * @returns CSV formatted string
 */
export const agentStatusesToCSV = (data: AgentStatus[]): string => {
  if (!data || data.length === 0) return '';
  
  // Define the CSV headers
  const headers = [
    'Agent ID',
    'Name',
    'Status',
    'Country',
    'Region',
    'Role',
    'Connection Quality',
    'Network Availability',
    'Response Time (ms)',
    'Last Updated',
    'Last Active',
    'Specialty'
  ];
  
  // Create CSV header row
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = [
      item.id,
      item.name || 'Unknown',
      item.status || 'Unknown',
      item.country || 'Unknown',
      item.region || 'Global',
      item.role || 'Agent',
      item.connectionQuality || '0',
      item.networkAvailability || '0',
      item.responseTime || '0',
      item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : 'Unknown',
      new Date(item.lastActive).toLocaleString(),
      item.specialty ? item.specialty.join('; ') : 'Unknown'
    ];
    
    // Escape any commas in the data
    const escapedRow = row.map(cell => {
      // If the cell contains a comma, quote, or newline, wrap it in quotes
      if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        // Replace any quotes with double quotes (CSV standard)
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    });
    
    csvContent += escapedRow.join(',') + '\n';
  });
  
  return csvContent;
};

/**
 * Exports data as a CSV file
 * @param data Data to export as CSV
 * @param filename Filename for the download
 */
export const exportAsCSV = (data: AgentStatus[], filename: string = 'agent-status-report'): void => {
  // Generate CSV content
  const csvContent = agentStatusesToCSV(data);
  
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set the link's attributes
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  // Add the link to the DOM
  document.body.appendChild(link);
  
  // Click the link to start the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports agent status data as a PDF file
 * @param data Array of agent status objects
 * @param companyName Company name for the header
 * @param filename Filename for the download
 */
export const exportAsPDF = (
  data: AgentStatus[], 
  companyName: string = 'Molo Logistics',
  filename: string = 'agent-status-report'
): void => {
  if (!data || data.length === 0) return;
  
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  const currentDate = new Date().toLocaleString();
  const title = 'Agent Status Report';
  
  // Add company name and title
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204); // Blue color for company name
  doc.text(companyName, 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 25, { align: 'center' });
  
  // Add generated date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${currentDate}`, 105, 32, { align: 'center' });
  
  // Add summary section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary', 14, 45);
  
  const availableCount = data.filter(a => a.status === 'online').length;
  const busyCount = data.filter(a => a.status === 'busy').length;
  const offlineCount = data.filter(a => a.status === 'offline').length;
  const totalCount = data.length;
  
  doc.setFontSize(10);
  doc.text(`Total Agents: ${totalCount}`, 20, 55);
  doc.text(`Available: ${availableCount}`, 20, 62);
  doc.text(`Busy: ${busyCount}`, 20, 69);
  doc.text(`Offline: ${offlineCount}`, 20, 76);
  
  // Calculate availability percentage
  const availabilityPercentage = Math.round((availableCount / totalCount) * 100);
  doc.text(`Availability Rate: ${availabilityPercentage}%`, 20, 83);
  
  // Add table header
  const tableColumns = ['Name', 'Status', 'Region', 'Connection', 'Response Time', 'Last Updated'];
  const tableTop = 95;
  const cellPadding = 5;
  const colWidths = [40, 25, 35, 25, 30, 40];
  const tableWidth = colWidths.reduce((acc, width) => acc + width, 0);
  
  // Draw header background
  doc.setFillColor(240, 240, 240);
  doc.rect(10, tableTop - 10, tableWidth, 10, 'F');
  
  // Draw header text
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  let xPos = 10 + cellPadding;
  
  tableColumns.forEach((col, index) => {
    doc.text(col, xPos, tableTop - 3);
    xPos += colWidths[index];
  });
  
  // Draw table content
  let yPos = tableTop + 5;
  let itemsPerPage = 20;
  let count = 0;
  
  // Function to get status color
  const getStatusColor = (status: string | undefined) => {
    if (status === 'online') return [0, 170, 0]; // Green
    if (status === 'busy') return [255, 165, 0]; // Orange
    return [150, 150, 150]; // Grey for offline or undefined
  };
  
  // Draw rows
  data.forEach((item, index) => {
    if (count === itemsPerPage) {
      // Add new page
      doc.addPage();
      yPos = 20;
      count = 0;
      
      // Add continued header
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${companyName} - Agent Status Report (Continued)`, 105, 10, { align: 'center' });
      
      // Draw header background
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos - 5, tableWidth, 10, 'F');
      
      // Draw header text
      doc.setTextColor(0, 0, 0);
      let headerXPos = 10 + cellPadding;
      
      tableColumns.forEach((col, i) => {
        doc.text(col, headerXPos, yPos);
        headerXPos += colWidths[i];
      });
      
      yPos += 15;
    }
    
    // Alternate row background for readability
    if (index % 2 === 0) {
      doc.setFillColor(249, 249, 249);
      doc.rect(10, yPos - 5, tableWidth, 10, 'F');
    }
    
    // Set text to default color
    doc.setTextColor(0, 0, 0);
    
    // Draw row data
    xPos = 10 + cellPadding;
    
    // Name
    doc.text(item.name || 'Unknown', xPos, yPos);
    xPos += colWidths[0];
    
    // Status (with color)
    const statusColor = getStatusColor(item.status);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(item.status.charAt(0).toUpperCase() + item.status.slice(1) || 'Unknown', xPos, yPos);
    doc.setTextColor(0, 0, 0); // Reset text color
    xPos += colWidths[1];
    
    // Region
    doc.text(item.region || 'Global', xPos, yPos);
    xPos += colWidths[2];
    
    // Connection Quality - Only show for online/busy agents
    if (item.status !== 'offline') {
      doc.text(`${item.connectionQuality || '0'}%`, xPos, yPos);
    } else {
      doc.text('—', xPos, yPos);
    }
    xPos += colWidths[3];
    
    // Response Time - Only show for online/busy agents
    if (item.status !== 'offline') {
      doc.text(`${item.responseTime || '0'} ms`, xPos, yPos);
    } else {
      doc.text('—', xPos, yPos);
    }
    xPos += colWidths[4];
    
    // Last Updated
    const lastUpdated = item.lastUpdated 
      ? new Date(item.lastUpdated).toLocaleString() 
      : new Date(item.lastActive).toLocaleString();
    doc.text(lastUpdated, xPos, yPos);
    
    // Move to next row
    yPos += 10;
    count++;
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Confidential - For Internal Use Only`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Convert agent performance metrics to CSV string
 * @param agent Agent status object
 * @param performance Performance metrics data
 * @returns CSV formatted string
 */
export const agentPerformanceToCSV = (
  agent: AgentStatus,
  performance: AgentPerformanceData
): string => {
  // Define the CSV headers for the overview section
  const overviewHeaders = [
    'Agent Name',
    'Agent ID',
    'Role',
    'Country',
    'Region',
    'Response Time (min)',
    'Satisfaction (%)',
    'Projects Completed',
    'Total Projects',
    'Average Response Time (min)',
    'On-Time Delivery (%)',
    'Client Retention (%)',
    'Rating (out of 5)'
  ];
  
  // Create CSV header row
  let csvContent = overviewHeaders.join(',') + '\n';
  
  // Add agent performance data row
  const overviewRow = [
    agent.name || 'Unknown',
    agent.id,
    agent.role || 'Agent',
    agent.country || 'Unknown',
    agent.region || 'Global',
    performance.responseTime,
    performance.satisfaction,
    performance.projectsCompleted,
    performance.totalProjects,
    performance.avgResponseTime.toFixed(1),
    performance.onTimeDelivery,
    performance.clientRetention,
    performance.rating
  ];
  
  // Escape any commas in the data
  const escapedRow = overviewRow.map(cell => {
    // Convert to string if not already
    const cellStr = String(cell);
    // If the cell contains a comma, quote, or newline, wrap it in quotes
    if (cellStr && (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n'))) {
      // Replace any quotes with double quotes (CSV standard)
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  });
  
  csvContent += escapedRow.join(',') + '\n\n';
  
  // Add project types if available
  if (performance.projectTypes && performance.projectTypes.length > 0) {
    csvContent += 'Project Type,Percentage (%)\n';
    
    performance.projectTypes.forEach(project => {
      csvContent += `${project.name},${project.value}\n`;
    });
  }
  
  // Add skills and languages if available
  if (agent.specialty && agent.specialty.length > 0) {
    csvContent += '\nSpecialties\n';
    agent.specialty.forEach(skill => {
      csvContent += `${skill}\n`;
    });
  }
  
  if (agent.languages && agent.languages.length > 0) {
    csvContent += '\nLanguages\n';
    agent.languages.forEach(language => {
      csvContent += `${language}\n`;
    });
  }
  
  return csvContent;
};

/**
 * Export agent performance metrics as a CSV file
 * @param agent Agent status object
 * @param performance Performance metrics data
 * @param filename Filename for the download
 */
export const exportPerformanceAsCSV = (
  agent: AgentStatus,
  performance: AgentPerformanceData,
  filename: string = 'agent-performance-report'
): void => {
  // Generate CSV content
  const csvContent = agentPerformanceToCSV(agent, performance);
  
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set the link's attributes
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${agent.id}-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  // Add the link to the DOM
  document.body.appendChild(link);
  
  // Click the link to start the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export agent performance metrics as a PDF file
 * @param agent Agent status object
 * @param performance Performance metrics data
 * @param companyName Company name for the header
 * @param filename Filename for the download
 */
export const exportPerformanceAsPDF = (
  agent: AgentStatus,
  performance: AgentPerformanceData,
  companyName: string = 'Molo Logistics',
  filename: string = 'agent-performance-report'
): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  const currentDate = new Date().toLocaleString();
  const title = 'Agent Performance Report';
  
  // Add company name and title
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204); // Blue color for company name
  doc.text(companyName, 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(agent.name, 105, 32, { align: 'center' });
  
  // Add generated date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${currentDate}`, 105, 40, { align: 'center' });
  
  // Agent info section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Agent Information', 14, 55);
  
  doc.setFontSize(10);
  doc.text(`ID: ${agent.id}`, 20, 65);
  doc.text(`Role: ${agent.role || 'Agent'}`, 20, 72);
  doc.text(`Region: ${agent.region || 'Global'}`, 20, 79);
  doc.text(`Country: ${agent.country || 'Unknown'}`, 20, 86);
  doc.text(`Status: ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}`, 20, 93);
  
  // Performance Metrics section
  doc.setFontSize(12);
  doc.text('Performance Metrics', 14, 110);
  
  // Create key metrics table
  const metricData = [
    { label: 'Response Time', value: `${performance.responseTime} min` },
    { label: 'Customer Satisfaction', value: `${performance.satisfaction}%` },
    { label: 'Current Projects', value: `${performance.projectsCompleted}` },
    { label: 'Total Projects (7 days)', value: `${performance.totalProjects}` },
    { label: 'Avg. Response Time', value: `${performance.avgResponseTime.toFixed(1)} min` },
    { label: 'On-Time Delivery', value: `${performance.onTimeDelivery}%` },
    { label: 'Client Retention', value: `${performance.clientRetention}%` },
    { label: 'Rating', value: `${performance.rating}/5.0` }
  ];
  
  // Draw metrics table
  let yPos = 120;
  const colWidth = 80;
  
  // Create two columns of metrics
  metricData.forEach((metric, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xPos = 20 + (col * colWidth);
    const rowYPos = yPos + (row * 10);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label + ':', xPos, rowYPos);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(metric.value, xPos + 40, rowYPos);
  });
  
  // Project types section with bar chart (if available)
  if (performance.projectTypes && performance.projectTypes.length > 0) {
    yPos = 170;
    doc.setFontSize(12);
    doc.text('Project Distribution', 14, yPos);
    
    yPos += 10;
    
    // Draw bar chart for project types
    const barChartX = 20;
    const barChartY = yPos + 5;
    const barWidth = 140;
    const barHeight = 8;
    const barSpacing = 12;
    const maxValue = Math.max(...performance.projectTypes.map(p => p.value));
    
    // Draw the bars
    performance.projectTypes.forEach((project, index) => {
      const yPosition = barChartY + (index * barSpacing);
      
      // Draw bar label
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(project.name, barChartX, yPosition + 5);
      
      // Draw background bar (gray)
      doc.setFillColor(230, 230, 230);
      doc.rect(barChartX + 60, yPosition, barWidth, barHeight, 'F');
      
      // Calculate the width of the colored bar based on value percentage
      const valueBarWidth = (project.value / 100) * barWidth;
      
      // Determine color based on value (gradient from blue to green)
      const blueComponent = Math.max(0, 200 - (project.value * 2));
      const greenComponent = Math.min(200, 50 + (project.value * 2));
      doc.setFillColor(41, greenComponent, blueComponent);
      
      // Draw value bar
      doc.rect(barChartX + 60, yPosition, valueBarWidth, barHeight, 'F');
      
      // Add value label
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`${project.value}%`, barChartX + 60 + valueBarWidth + 5, yPosition + 5);
    });
    
    // Update yPos to account for the bar chart height
    yPos = barChartY + (performance.projectTypes.length * barSpacing) + 10;
  }
  
  // Skills and languages section
  yPos = 210;
  doc.setFontSize(12);
  doc.text('Skills & Expertise', 14, yPos);
  
  yPos += 10;
  
  // Add specialties
  if (agent.specialty && agent.specialty.length > 0) {
    doc.setFontSize(10);
    doc.text('Specialties:', 20, yPos);
    
    let specialtyText = agent.specialty.join(', ');
    
    // Handle text wrapping for long specialty lists
    const textLines = doc.splitTextToSize(specialtyText, 170);
    doc.text(textLines, 20, yPos + 7);
    
    yPos += 7 + (textLines.length * 5);
  }
  
  // Add languages
  if (agent.languages && agent.languages.length > 0) {
    doc.setFontSize(10);
    doc.text('Languages:', 20, yPos + 5);
    doc.text(agent.languages.join(', '), 20, yPos + 12);
  }
  
  // Add performance visualizations
  // Create a performance chart using basic PDF drawing
  const chartY = agent.languages && agent.languages.length > 0 ? yPos + 30 : yPos + 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Performance Visualization', 14, chartY);
  
  // Create a radar/spider chart effect with key metrics
  // Using basic PDF shapes, draw octagon with metrics
  const centerX = 105;
  const centerY = chartY + 65;
  const radius = 40;
  
  // Draw the background grid (3 levels)
  for (let level = 1; level <= 3; level++) {
    const levelRadius = (radius / 3) * level;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    
    // Draw level circle
    doc.circle(centerX, centerY, levelRadius, 'S');
  }
  
  // Draw axis lines
  const metrics = [
    { name: 'Response Time', value: performance.responseTime / 200 },
    { name: 'Satisfaction', value: performance.satisfaction / 100 },
    { name: 'Projects', value: performance.projectsCompleted / performance.totalProjects },
    { name: 'Delivery', value: performance.onTimeDelivery / 100 },
    { name: 'Retention', value: performance.clientRetention / 100 },
    { name: 'Rating', value: performance.rating / 5 }
  ];
  
  // Draw axis lines and labels
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  
  metrics.forEach((metric, i) => {
    const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
    const x1 = centerX;
    const y1 = centerY;
    const x2 = centerX + radius * Math.cos(angle);
    const y2 = centerY + radius * Math.sin(angle);
    
    // Draw axis line
    doc.line(x1, y1, x2, y2);
    
    // Draw axis label
    doc.setFontSize(8);
    doc.text(
      metric.name,
      centerX + (radius + 10) * Math.cos(angle),
      centerY + (radius + 10) * Math.sin(angle),
      { align: angle > Math.PI / 2 && angle < Math.PI * 3 / 2 ? 'right' : 'left' }
    );
  });
  
  // Draw data points and connect them
  doc.setDrawColor(41, 128, 185); // Blue
  doc.setFillColor(41, 128, 185, 0.5); // Semi-transparent blue
  doc.setLineWidth(1.5);
  
  const dataPoints: [number, number][] = [];
  
  metrics.forEach((metric, i) => {
    const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
    const dataRadius = Math.min(0.9, Math.max(0.1, metric.value)) * radius;
    const x = centerX + dataRadius * Math.cos(angle);
    const y = centerY + dataRadius * Math.sin(angle);
    
    dataPoints.push([x, y]);
  });
  
  // Draw filled polygon for data area
  doc.setFillColor(41, 128, 185, 0.3); // Light blue with transparency
  
  // Start path at first point
  doc.setDrawColor(52, 152, 219); // Lighter blue for outline
  doc.setLineWidth(1);
  
  // Draw filled polygon - using lines instead of polygon method for compatibility
  doc.setFillColor(41, 128, 185, 0.3);
  
  // Draw the polygon as a series of lines
  for (let i = 0; i < dataPoints.length; i++) {
    const current = dataPoints[i];
    const next = dataPoints[(i + 1) % dataPoints.length];
    
    // Draw line between points
    doc.line(current[0], current[1], next[0], next[1]);
  }
  
  // We can't easily fill the polygon with basic jsPDF, so we'll just use lines for now
  // In a production app, a more advanced library like PDFKit could be used
  
  // Draw data points
  doc.setFillColor(52, 152, 219);
  dataPoints.forEach(point => {
    doc.circle(point[0], point[1], 2, 'F');
  });
  
  // Add legend
  const legendY = centerY + radius + 25;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Radar chart shows performance across key metrics (scale: closer to edge is better)', centerX, legendY, { align: 'center' });
  
  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Confidential - For Internal Use Only | ${agent.name} - Performance Report`,
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  
  // Save the PDF
  doc.save(`${filename}-${agent.id}-${new Date().toISOString().slice(0, 10)}.pdf`);
};