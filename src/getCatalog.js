const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchCatalog() {
    const catalogURL = 'https://learn.microsoft.com/api/catalog/?locale=en-us';
    try {
        const response = await axios.get(catalogURL);
        if (response.status === 200) {
            const filePath = path.join('../data', 'catalog-en-us.json');
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, JSON.stringify(response.data, null, 2));
            console.log(`Catalog data saved to ${filePath}`);
        } else if (response.status === 404) {
            console.log(`404 Not Found: ${catalogURL}`);
        } else {
            console.log(`Failed to fetch ${catalogURL}: status code ${response.status}`);
        }
    } catch (error) {
        console.error(`Failed to fetch ${catalogURL}: ${error.message}`);
    }
}

fetchCatalog();