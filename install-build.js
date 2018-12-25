// Dependencies
var replace = require('replace');
var fs = require('fs');

// Paths
var buildFolder = './build/';
var configFolder = './config/';
var configFilePath = configFolder + 'config.js';
var installFile = buildFolder + 'install-page.html';
var srcFolder = './src/';


// Get entire contents of processed bookmarklet code as var
var bookmarkletContent = fs.readFileSync(buildFolder + 'bookmarklet_export.js');

// Copy template install page to build folder
fs.copyFileSync(srcFolder + 'install-page-template.html',installFile);

// Check if config already exists, and set value in installer page
var alreadyHasConfig = fs.existsSync(configFilePath);
if (alreadyHasConfig){
    alreadyHasConfig = /registryID\s*:\s*'\w{13}'|registryID%3A%22\w{13}|\.registryID%3D%22\w{13}%/.test(bookmarkletContent);
}
replace({
    regex : "'{{already_has_config}}'",
    replacement : alreadyHasConfig.toString(),
    paths : [installFile],
    recursive : true,
    silent : false
});

// Replace placeholder variable in install HTML file with raw contents
replace({
    regex : "{{bookmarklet_code}}",
    replacement : bookmarkletContent,
    paths : [installFile],
    recursive : true,
    silent : false
});