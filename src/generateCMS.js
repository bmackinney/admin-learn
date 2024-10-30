const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load the CMS data from cms.yml
const cmsData = yaml.load(fs.readFileSync('cms.yml', 'utf8'));

// Function to create directories recursively
function createDirectoryRecursively(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Loop through each CMS object and generate the markdown files
for (const [key, value] of Object.entries(cmsData)) {
  const dirPath = path.join('admin', key);
  createDirectoryRecursively(dirPath);

  // Add collection_type: import to each entry in collections array
  if (Array.isArray(value.collections)) {
    value.collections = value.collections.map(collection => ({
      ...collection,
      collection_type: 'import'
    }));
  }

  // Convert the rest of the key's data to YAML frontmatter
  const frontmatter = yaml.dump(value);
  const markdownContent = `---\n${frontmatter}---\n`;

  // Write the markdown file
  fs.writeFileSync(path.join(dirPath, 'index.md'), markdownContent);
}