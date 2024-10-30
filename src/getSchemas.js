const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

// Read schema_config.json
let schemaList;

// Base directory for schemas
const baseDir = path.join(__dirname, '../schemas');

// Function to download a schema and save it to a specified directory
async function downloadSchema(url, dir) {
    try {
        let schema;
        let fileName;
        let filePath;

        if (url.startsWith('http')) {
            const response = await axios.get(url);
            if (response.status === 200) {
                schema = JSON.stringify(response.data, null, 2); // Ensure schema is a string
                fileName = path.basename(url);
                filePath = path.join(dir, fileName);
            } else {
                console.log(`Failed to fetch ${url}: status code ${response.status}`);
                return;
            }
        } else {
            const absolutePath = path.join(__dirname, url);
            console.log(`Resolved path: ${absolutePath}`);
            schema = await fs.promises.readFile(absolutePath, 'utf8');
            fileName = path.basename(absolutePath);
            filePath = path.join(dir, fileName);
        }

        // Create the directory if it doesn't exist
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

        // Write the schema to the file
        await fs.promises.writeFile(filePath, schema);
        console.log(`Downloaded and saved: ${filePath}`);
    } catch (error) {
        console.error(`Error downloading schema from ${url}: ${error.message}`);
    }
}

// Function to create a directory and download schemas
async function createAndDownloadSchemas(schemas, subDir) {
    const dir = path.join(baseDir, subDir);
    try {
        await fs.promises.mkdir(dir, { recursive: true });
        for (const url of Object.values(schemas)) {
            await downloadSchema(url, dir);
        }
    } catch (error) {
        console.error(`Error creating directory ${dir}: ${error.message}`);
    }
}

// Function to process paths from admin.yml
async function processPaths(paths) {
    for (const filePath of paths) {
        if (typeof filePath === 'string') {
            await processPath(filePath);
        } else if (filePath.import) {
            await fetchSchemaList(filePath.import);
            await downloadAllSchemas();
        }
    }
}

async function processPath(filePath) {
    const absolutePath = path.resolve(__dirname, '../', filePath);
    console.log(`Processing path: ${absolutePath}`);
    const stats = await fs.promises.stat(absolutePath).catch(() => null);

    if (stats && stats.isDirectory()) {
        const files = glob.sync(`${absolutePath}/**/*.schema.json`);
        for (const file of files) {
            await downloadSchema(file, path.dirname(file));
        }
    } else if (stats && stats.isFile()) {
        if (filePath.endsWith('.schema.json')) {
            await downloadSchema(filePath, path.dirname(filePath));
        } else {
            const content = await fs.promises.readFile(absolutePath, 'utf8');
            const fileArray = JSON.parse(content);
            for (const file of fileArray) {
                if (file.endsWith('.schema.json')) {
                    await downloadSchema(file, path.dirname(file));
                }
            }
        }
    } else if (filePath.startsWith('http')) {
        await fetchSchemaList(filePath);
        await downloadAllSchemas();
    } else {
        const files = glob.sync(`${absolutePath}/*.schema.json`);
        for (const file of files) {
            await downloadSchema(file, path.dirname(file));
        }
    }
}

// Function to read and process admin.yml
async function processAdminYml() {
    const adminYmlPath = path.join(__dirname, '../admin.yml');
    try {
        const fileContent = await fs.promises.readFile(adminYmlPath, 'utf8');
        const adminConfig = yaml.load(fileContent);
        await processPaths(adminConfig.schemas);
    } catch (error) {
        console.error(`Error processing admin.yml: ${error.message}`);
    }
}

// Download schemas based on schema_config.json
async function downloadAllSchemas() {
    if (!schemaList) {
        console.error('Schema list is not available. Aborting download.');
        return;
    }
    await createAndDownloadSchemas(schemaList.definitions, '');
    await createAndDownloadSchemas(schemaList.extensions, 'extensions');
    await createAndDownloadSchemas(schemaList.partials, 'partials');
    await createAndDownloadSchemas(schemaList.relational, 'relational');
}

// Function to fetch schema list
async function fetchSchemaList(url) {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            schemaList = response.data;
        } else {
            console.error(`Failed to fetch schema list: status code ${response.status}`);
        }
    } catch (error) {
        console.error(`Error fetching schema list: ${error.message}`);
    }
}

// Main function to run the script
async function main() {
    await fetchSchemaList();
    await downloadAllSchemas();
    await processAdminYml();
}

main();