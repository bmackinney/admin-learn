const readline = require('readline');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to check if a file exists
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

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

// Function to create a directory if it doesn't exist
async function createDirectory(dirPath) {
    await fs.promises.mkdir(dirPath, { recursive: true });
}

// Function to walk through a directory and collect unique YamlMime values
function collectYamlMimeValues(dir) {
    const yamlMimeValues = new Set();

    function walkDirectory(currentDir) {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                walkDirectory(filePath);
            } else if (stat.isFile() && file.endsWith('.yml')) {
                const content = fs.readFileSync(filePath, 'utf8');
                const firstLine = content.split('\n')[0];
                const match = firstLine.match(/^###\s*YamlMime:\s*(\S+)/);
                if (match) {
                    yamlMimeValues.add(match[1]);
                }
            }
        }
    }

    walkDirectory(dir);
    return Array.from(yamlMimeValues);
}

// Function to generate the index.md file with YAML frontmatter
async function generateIndexFile(repo, contentBaseDir, adminBaseDir) {
    const repoPath = path.join(contentBaseDir, repo);
    const gitPath = path.join(repoPath, '.git');
    const configPath = path.join(repoPath, '.openpublishing.publish.config.json');

    if (fileExists(gitPath) && fileExists(configPath)) {
        const adminRepoDir = path.join(adminBaseDir, repo);
        await createDirectory(adminRepoDir);

        const yamlMimeValues = collectYamlMimeValues(repoPath);
        if (yamlMimeValues.length === 0) {
            console.log(`No YamlMime values found in repository: ${repo}`);
            return;
        }

        const collections = yamlMimeValues.map(schema => ({
            import: `collection learn-${schema}`,
            collection_type: 'folder',
            folder: repo
        }));

        const indexFilePath = path.join(adminRepoDir, 'index.md');
        const frontmatter = {
            title: `${repo} CMS`,
            description: `CMS for ${repo} repository`,
            collections
        };

        const yamlContent = yaml.dump(frontmatter);
        const markdownContent = `---\n${yamlContent}---\n`;

        fs.writeFileSync(indexFilePath, markdownContent);
        console.log(`Generated: ${indexFilePath}`);
    } else {
        console.log(`Skipping repository: ${repo} (missing .git or .openpublishing.publish.config.json)`);
    }
}

// Function to process repositories from a content base directory
async function processContentBaseDir(contentBaseDir, adminBaseDir) {
    if (!fileExists(contentBaseDir)) {
        console.error(`Content base directory does not exist: ${contentBaseDir}`);
        return;
    }

    const repos = fs.readdirSync(contentBaseDir).filter(repo => {
        const repoPath = path.join(contentBaseDir, repo);
        return fs.statSync(repoPath).isDirectory();
    });

    if (repos.length === 0) {
        console.log(`No repositories found in content base directory: ${contentBaseDir}`);
        return;
    }

    for (const repo of repos) {
        await generateIndexFile(repo, contentBaseDir, adminBaseDir);
    }
}

// Function to process repositories from a code-workspace.json file
async function processWorkspaceFile(workspaceFilePath, adminBaseDir) {
    if (!fileExists(workspaceFilePath)) {
        console.error(`Workspace file does not exist: ${workspaceFilePath}`);
        return;
    }

    const workspaceContent = JSON.parse(fs.readFileSync(workspaceFilePath, 'utf8'));
    const folders = workspaceContent.folders.map(folder => folder.path);

    for (const folder of folders) {
        const repoPath = path.resolve(path.dirname(workspaceFilePath), folder);
        const repoName = path.basename(repoPath);
        await generateIndexFile(repoName, path.dirname(repoPath), adminBaseDir);
    }
}

// Main function
async function main() {
    const cwd = process.cwd();
    const isGitRepo = fileExists(path.join(cwd, '.git'));
    const isAdminLearnRepo = fileExists(path.join(cwd, 'admin-learn-marker-file')); // Replace with an actual marker file or directory specific to admin-learn

    console.log(`Current working directory: ${cwd}`);
    console.log(`Is Git repository: ${isGitRepo}`);
    console.log(`Is admin-learn repository: ${isAdminLearnRepo}`);

    let contentBaseDir;
    let adminBaseDir;

    const args = process.argv.slice(2);
    let input = args[0];

    if (!input) {
        input = await askQuestion('Enter the content base directory or path to code-workspace.json: ');
    }

    adminBaseDir = path.join(cwd, 'admin');

    if (input.endsWith('.code-workspace')) {
        await processWorkspaceFile(input, adminBaseDir);
    } else {
        contentBaseDir = input;
        await processContentBaseDir(contentBaseDir, adminBaseDir);
    }
}

main().catch(err => console.error(err));