/**
 * Copyright 2018-2026 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';

const { existsSync, copyFileSync, writeFileSync, readFileSync } = require('node:fs');
const { fork } = require('node:child_process');
const { deleteFoldersRecursive, npmInstall, buildReact, copyFiles, patchHtmlFile } = require('@iobroker/build-tools');

/** Compile the back-end (src/**\/*.ts) into `build/` */
function compileTypeScript() {
    return new Promise((resolve, reject) => {
        const child = fork(`${__dirname}/node_modules/typescript/bin/tsc`, ['-p', 'tsconfig.build.json'], {
            stdio: 'inherit',
            cwd: __dirname,
        });
        child.on('error', reject);
        child.on('close', code =>
            code ? reject(new Error(`tsc exited with code ${code}`)) : resolve(),
        );
    });
}

/**
 * `langModel` is used in the back-end and in the GUI.
 * The GUI loads it as a simple script (see `src-admin/index.html`), so the compiled CommonJS module
 * is wrapped here into a function that exports `commands` and `findMatched` as globals on `window`.
 */
function buildGuiLangModel() {
    const compiled = readFileSync(`${__dirname}/build/lib/langModel.js`)
        .toString('utf8')
        .replace(/^\/\/# sourceMappingURL=.*$/m, '')
        .trimEnd();

    writeFileSync(
        `${__dirname}/src-admin/public/langModel.js`,
        `/* This file is generated from "src/lib/langModel.ts" by "node tasks". Do not edit it! */\n` +
            `(function (exports) {\n${compiled}\n})(window);\n`,
    );
}

async function buildBackend() {
    await compileTypeScript();
    buildGuiLangModel();
}

async function copyAllFiles() {
    deleteFoldersRecursive(`${__dirname}/admin`);

    copyFiles(['src-admin/build/**/*', '!src-admin/build/index.html'], 'admin/');
    copyFileSync('src-admin/build/index.html', 'admin/tab.html');
    await patchHtmlFile('admin/tab.html');
}

if (process.argv.includes('--0-clean')) {
    deleteFoldersRecursive(`${__dirname}/admin`);
    deleteFoldersRecursive(`${__dirname}/build`);
    deleteFoldersRecursive(`${__dirname}/src-admin/build`);
} else if (process.argv.includes('--1-npm')) {
    if (!existsSync(`${__dirname}/src-admin/node_modules`)) {
        npmInstall(`${__dirname}/src-admin`).catch(e => {
            console.log(`Error: ${e.toString()}`);
            process.exit(2);
        });
    }
} else if (process.argv.includes('--2-compile')) {
    buildBackend().catch(e => {
        console.log(`Error: ${e.toString()}`);
        process.exit(2);
    });
} else if (process.argv.includes('--3-build')) {
    buildReact(`${__dirname}/src-admin`, { rootDir: `${__dirname}/src-admin`, vite: true }).catch(e => {
        console.log(`Error: ${e.toString()}`);
        process.exit(2);
    });
} else if (process.argv.includes('--4-copy')) {
    copyAllFiles().catch(e => {
        console.log(`Error: ${e.toString()}`);
        process.exit(2);
    });
} else {
    deleteFoldersRecursive(`${__dirname}/admin`);
    deleteFoldersRecursive(`${__dirname}/build`);
    deleteFoldersRecursive(`${__dirname}/src-admin/build`);
    let npm;
    if (!existsSync(`${__dirname}/src-admin/node_modules`)) {
        npm = npmInstall(`${__dirname}/src-admin`);
    } else {
        npm = Promise.resolve();
    }
    npm.then(() => buildBackend())
        .then(() => buildReact(`${__dirname}/src-admin`, { rootDir: `${__dirname}/src-admin`, vite: true }))
        .then(() => copyAllFiles())
        .catch(e => {
            console.log(`Error: ${e.toString()}`);
            process.exit(2);
        });
}
