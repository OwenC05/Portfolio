"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getRootDirs", {
    enumerable: true,
    get: function() {
        return getRootDirs;
    }
});
var _tinyglobby = require("tinyglobby");
var _path = require("node:path");
var _fs = require("node:fs");
/**
 * Process a Next.js root directory glob.
 */ var processRootDir = function(rootDir) {
    var pattern = rootDir.replace(/\\/g, '/');
    // Unlike fast-glob, a terminal globstar includes its base in tinyglobby.
    var globPattern = pattern.replace(/(^|\/)(?:\*\*\/)*\*\*\/?$/, '$1**/*');
    var wildcard = _tinyglobby.isDynamicPattern(pattern) && /[*?[\]]|[+@!]\(/.test(pattern);
    // fdir suppresses filesystem errors; preserve fast-glob's non-ENOENT errors.
    var filesystemError;
    var fs = {};
    ['readdirSync', 'realpathSync', 'statSync'].forEach(function(method) {
        fs[method] = function() {
            try {
                return _fs[method].apply(_fs, arguments);
            } catch (error) {
                if (error.code !== 'ENOENT' && !filesystemError) filesystemError = error;
                throw error;
            }
        };
    });
    var directories = (0, _tinyglobby.globSync)(globPattern, {
        onlyDirectories: true,
        expandDirectories: false,
        absolute: _path.isAbsolute(pattern),
        // tinyglobby treats a root-only pattern relative to cwd otherwise.
        cwd: pattern === _path.parse(pattern).root ? pattern : undefined,
        fs: fs
    });
    if (filesystemError) throw filesystemError;
    return directories.map(function(dir) {
        // Match fast-glob's literal vs wildcard separator conventions.
        if (pattern === './' && dir === '.') return './';
        if (!pattern.endsWith('/') || wildcard) dir = dir.replace(/(.+)\/$/, '$1');
        if (pattern.startsWith('./') && !dir.startsWith('./')) dir = './' + dir;
        return dir;
    });
};
var getRootDirs = function(context) {
    var rootDirs = [
        context.cwd
    ];
    var nextSettings = context.settings.next || {};
    var rootDir = nextSettings.rootDir;
    if (typeof rootDir === 'string') {
        rootDirs = processRootDir(rootDir);
    } else if (Array.isArray(rootDir)) {
        rootDirs = rootDir.map(function(dir) {
            return typeof dir === 'string' ? processRootDir(dir) : [];
        }).flat();
    }
    return rootDirs;
};
