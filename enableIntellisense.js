const fs = require('fs');
const path = require('path');
const glob = require('glob');
const https = require('https');
const minimatch = require('minimatch'); // Ensure minimatch is imported correctly
const readline = require('readline');

console.log(typeof minimatch); // Log the type of minimatch to ensure it is a function

// URL to fetch schema_config.json
const schemaListUrl = 'https://learn.microsoft.com/static/ui/latest/schemas/schema_config.json';

// Base directory for content repositories (current working directory)
let baseDir = process.cwd();

// Function to ask for input
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

// Function to check if a file exists
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// Function to get the first line of a file
function getFirstLine(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent.split('\n')[0];
}

// Function to analyze YAML files and construct glob patterns
function analyzeYamlFiles(schemaList, repoPath) {
    const schemaFilePaths = {};

    const yamlFiles = glob.sync(`${repoPath}/**/*.yml`);

    yamlFiles.forEach(filePath => {
        const firstLine = getFirstLine(filePath);
        const schemaNameMatch = firstLine.match(/^###\s*YamlMime:\s*(\S+)/);

        if (schemaNameMatch) {
            const schemaName = schemaNameMatch[1];
            const relativeFilePath = path.relative(repoPath, filePath); // Make path relative to repo root

            // Check if the schema name is in the definitions key of schema_config.json
            if (schemaList.definitions && schemaList.definitions[schemaName]) {
                const schemaUrl = schemaList.definitions[schemaName];

                if (!schemaFilePaths[schemaUrl]) {
                    schemaFilePaths[schemaUrl] = [];
                }

                schemaFilePaths[schemaUrl].push(relativeFilePath);
            }
        }
    });

    return schemaFilePaths;
}

// Function to find common glob patterns from file paths using minimatch
function findCommonPatterns(filePaths) {
    const patterns = new Set();
    const groupedPaths = {};

    // Group file paths by their directory structure
    filePaths.forEach(filePath => {
        const parts = filePath.split(path.sep);
        const key = parts.slice(0, -1).join(path.sep);
        if (!groupedPaths[key]) {
            groupedPaths[key] = [];
        }
        groupedPaths[key].push(filePath);
    });

    // Create initial patterns based on grouped paths
    Object.keys(groupedPaths).forEach(key => {
        const files = groupedPaths[key];
        if (files.length > 1) {
            patterns.add(`${key}/*.yml`);
        } else {
            patterns.add(files[0]);
        }
    });

    // Further minimize patterns by finding common prefixes
    const finalPatterns = new Set();
    patterns.forEach(pattern => {
        const parts = pattern.split(path.sep);
        let commonPrefix = parts[0];
        for (let i = 1; i < parts.length; i++) {
            const prefix = parts.slice(0, i + 1).join(path.sep);
            if (filePaths.every(filePath => filePath.startsWith(prefix))) {
                commonPrefix = prefix;
            } else {
                break;
            }
        }
        finalPatterns.add(`${commonPrefix}/*.yml`);
    });

    // Ensure patterns are specific enough by including subdirectories
    const specificPatterns = new Set();
    finalPatterns.forEach(pattern => {
        const parts = pattern.split(path.sep);
        if (parts.length > 2) {
            specificPatterns.add(pattern);
        } else {
            specificPatterns.add(`${parts.join(path.sep)}/**/*.yml`);
        }
    });

    return Array.from(specificPatterns);
}

// Function to fetch schema_config.json from the URL
function fetchSchemaList(callback) {
    https.get(schemaListUrl, (res) => {
        let data = '';

        // A chunk of data has been received.
        res.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received.
        res.on('end', () => {
            const schemaList = JSON.parse(data);
            callback(schemaList);
        });

    }).on('error', (err) => {
        console.error(`Error fetching schemaList: ${err.message}`);
    });
}

// Function to process a single repository
async function processRepository(repoPath, schemaList) {
    const gitPath = path.join(repoPath, '.git');
    const configPath = path.join(repoPath, '.openpublishing.publish.config.json');

    if (fileExists(gitPath) && fileExists(configPath)) {
        const schemaFilePaths = analyzeYamlFiles(schemaList, repoPath);

        const yamlSchemas = {};

        Object.keys(schemaFilePaths).forEach(schemaUrl => {
            yamlSchemas[schemaUrl] = findCommonPatterns(schemaFilePaths[schemaUrl]);
        });

        // Create the settings.json content
        const settingsContent = {
            "yaml.schemas": yamlSchemas
        };

        // Ensure the .vscode directory exists in the root of the repository
        const vscodeDir = path.join(repoPath, '.vscode');
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(vscodeDir, { recursive: true });
        }

        // Write the settings.json file in the root of the repository
        const settingsFilePath = path.join(vscodeDir, 'settings.json');
        fs.writeFileSync(settingsFilePath, JSON.stringify(settingsContent, null, 2));

        console.log(`Generated ${settingsFilePath}`);
    } else {
        console.log(`Skipping repository: ${repoPath} (missing .git or .openpublishing.publish.config.json)`);
    }
}

// Function to process repositories from a content base directory
async function processContentBaseDir(contentBaseDir) {
    baseDir = contentBaseDir;
    fetchSchemaList(async (schemaList) => {
        const contentRepos = fs.readdirSync(baseDir).filter(repo => fs.statSync(path.join(baseDir, repo)).isDirectory());

        for (const repo of contentRepos) {
            const repoPath = path.join(baseDir, repo);
            await processRepository(repoPath, schemaList);
        }
    });
}

// Function to process repositories from a code-workspace.json file
async function processWorkspaceFile(workspaceFilePath) {
    const workspaceContent = JSON.parse(fs.readFileSync(workspaceFilePath, 'utf8'));
    const folders = workspaceContent.folders.map(folder => folder.path);

    const aggregatedSchemaFilePaths = {};

    fetchSchemaList(async (schemaList) => {
        for (const folder of folders) {
            const repoPath = path.resolve(path.dirname(workspaceFilePath), folder);
            await processRepository(repoPath, schemaList);

            const schemaFilePaths = analyzeYamlFiles(schemaList, repoPath);

            Object.keys(schemaFilePaths).forEach(schemaUrl => {
                if (!aggregatedSchemaFilePaths[schemaUrl]) {
                    aggregatedSchemaFilePaths[schemaUrl] = [];
                }
                aggregatedSchemaFilePaths[schemaUrl].push(...schemaFilePaths[schemaUrl]);
            });
        }

        // Create the yaml.schemas array in the code-workspace file
        const yamlSchemas = {};

        Object.keys(aggregatedSchemaFilePaths).forEach(schemaUrl => {
            yamlSchemas[schemaUrl] = findCommonPatterns(aggregatedSchemaFilePaths[schemaUrl]);
        });

        // Adjust paths to be relative to the code-workspace file
        Object.keys(yamlSchemas).forEach(schemaUrl => {
            yamlSchemas[schemaUrl] = yamlSchemas[schemaUrl].map(pattern => path.relative(path.dirname(workspaceFilePath), path.resolve(path.dirname(workspaceFilePath), pattern)));
        });

        workspaceContent.settings = workspaceContent.settings || {};
        workspaceContent.settings["yaml.schemas"] = yamlSchemas;

        fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaceContent, null, 2));
        console.log(`Updated ${workspaceFilePath} with yaml.schemas`);
    });
}

// Main function to run the script
async function main() {
    const args = process.argv.slice(2);
    let input = args[0];

    if (!input) {
        input = await askQuestion('Enter the content base directory or path to .code-workspace: ');
    }

    if (input.endsWith('.code-workspace')) {
        await processWorkspaceFile(input);
    } else {
        await processContentBaseDir(input);
    }
}

// Run the main function
main().catch(err => console.error(err));