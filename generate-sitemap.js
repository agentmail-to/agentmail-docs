#!/usr/bin/env node
/**
 * Dynamic sitemap generator for AgentMail Documentation
 * Automatically parses docs.yml and generates sitemap.xml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BASE_URL = 'https://docs.agentmail.to';

/**
 * Recursively extract all page paths from the navigation structure
 */
function extractPagesFromNavigation(navItem, pagesList) {
  if (typeof navItem === 'object' && navItem !== null) {
    // Handle page with path
    if (navItem.page && navItem.path) {
      let pagePath = navItem.path;
      
      // Convert path to URL (remove pages/ prefix and .mdx extension)
      if (pagePath.startsWith('pages/')) {
        pagePath = pagePath.substring(6);
      }
      if (pagePath.endsWith('.mdx')) {
        pagePath = pagePath.substring(0, pagePath.length - 4);
      }
      
      // Convert path to URL slug (remove directory structure, keep filename)
      const urlSlug = pagePath.split('/').pop();
      pagesList.push(urlSlug);
    }
    
    // Handle sections with contents
    if (navItem.section && navItem.contents) {
      navItem.contents.forEach(content => extractPagesFromNavigation(content, pagesList));
    }
    
    // Handle API reference
    if (navItem.api) {
      pagesList.push('api-reference');
    }
    
    // Recursively process object properties
    Object.keys(navItem).forEach(key => {
      if (!['page', 'path', 'icon', 'section', 'api', 'summary', 'snippets'].includes(key)) {
        const value = navItem[key];
        if (Array.isArray(value) || typeof value === 'object') {
          extractPagesFromNavigation(value, pagesList);
        }
      }
    });
  } else if (Array.isArray(navItem)) {
    navItem.forEach(item => extractPagesFromNavigation(item, pagesList));
  }
}

/**
 * Determine priority based on page importance
 */
function determinePriority(pageName) {
  const highPriorityPages = ['welcome', 'introduction', 'quickstart', 'api-reference'];
  const coreConceptPages = ['inboxes', 'messages', 'threads', 'drafts', 'labels', 'attachments', 'pods'];
  const importantPages = [
    'webhooks-overview', 'webhooks-events', 'webhook-setup', 'websockets',
    'sending-receiving-email', 'custom-domains', 'email-deliverability',
    'faq', 'support'
  ];
  
  if (highPriorityPages.includes(pageName)) return '0.9';
  if (coreConceptPages.includes(pageName)) return '0.8';
  if (importantPages.includes(pageName)) return '0.8';
  return '0.7';
}

/**
 * Determine change frequency based on page type
 */
function determineChangefreq(pageName) {
  const frequentPages = ['welcome', 'quickstart', 'faq', 'community'];
  const weeklyPages = [
    'introduction', 'inboxes', 'messages', 'threads', 'webhooks-overview',
    'api-reference', 'support', 'sending-receiving-email'
  ];
  
  if (frequentPages.includes(pageName)) return 'weekly';
  if (weeklyPages.includes(pageName)) return 'weekly';
  return 'monthly';
}

/**
 * Generate sitemap.xml from docs.yml
 */
function generateSitemap(docsYmlPath, outputPath, baseUrl) {
  // Read docs.yml
  const docsYmlContent = fs.readFileSync(docsYmlPath, 'utf8');
  const docsConfig = yaml.load(docsYmlContent);
  
  // Extract pages from navigation
  const pages = [];
  if (docsConfig.navigation) {
    extractPagesFromNavigation(docsConfig.navigation, pages);
  }
  
  // Remove duplicates while preserving order
  const uniquePages = [...new Set(pages)];
  
  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';
  
  // Add homepage
  xml += '  <!-- Homepage -->\n';
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += '    <priority>1.0</priority>\n';
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '  </url>\n\n';
  
  // Add all pages
  uniquePages.forEach(page => {
    const pageUrl = `${baseUrl}/${page}`;
    const priority = determinePriority(page);
    const changefreq = determineChangefreq(page);
    
    xml += '  <url>\n';
    xml += `    <loc>${pageUrl}</loc>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += '  </url>\n';
  });
  
  xml += '\n</urlset>\n';
  
  // Write to file
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  console.log(`✅ Sitemap generated successfully at ${outputPath}`);
  console.log(`📄 Total URLs: ${uniquePages.length + 1}`); // +1 for homepage
}

/**
 * Main function
 */
function main() {
  const scriptDir = __dirname;
  const docsYmlPath = path.join(scriptDir, 'fern', 'docs.yml');
  const outputPath = path.join(scriptDir, 'sitemap.xml');
  
  if (!fs.existsSync(docsYmlPath)) {
    console.error(`❌ Error: docs.yml not found at ${docsYmlPath}`);
    process.exit(1);
  }
  
  try {
    generateSitemap(docsYmlPath, outputPath, BASE_URL);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSitemap };
