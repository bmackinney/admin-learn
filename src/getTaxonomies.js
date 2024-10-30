const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://taxonomy.learn.microsoft.com/taxonomies/simplified/enumSchema/';
// List of enumSchemas for select widgets options
const values = [
    'ms.devlang', 'ms.topic', 'allowedDomain', 'allowedHTML', 'azure.category', 'certification', 'devlang', 'event-group', 'level', 'microsoft.domain', 'offering', 'product-uri', 'product', 'qualifier', 'role', 'subject', 'version', 'productDevlang', 'productQualifier', 'productSubject', 'contributor-type', 'ai-usage',
];

async function fetchTaxonomies() {
    for (const value of values) {
        const url = `${baseURL}${value}`;
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                const filePath = path.join('../schemas', 'taxonomies', `${value}.json`);
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                await fs.promises.writeFile(filePath, JSON.stringify(response.data, null, 2));
                console.log(`Fetched and saved: ${url}`);
            } else if (response.status === 404) {
                console.log(`404 Not Found: ${url}`);
            } else {
                console.log(`Failed to fetch ${url}: status code ${response.status}`);
            }
        } catch (error) {
            console.error(`Failed to fetch ${url}: ${error.message}`);
        }
    }
}

fetchTaxonomies();