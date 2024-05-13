# Burpm Parser

I have created this tool to parse the .XML generaged by burp suite when "saving" items from the site's map. (Export function)

This is mostly usefull in Bug Bounty programme where scanner or automation are prohibited.
So Using Tools to extract/Fuzz for JS file is not allowed.

So I wanted to be able to extract them all in single files.

First version support javascript extraction, to help me used them with other tool likes

- https://github.com/RetireJS/retire.js
- https://github.com/maK-/parameth/blob/master/parameth.py

# Installation

Requires nodejs 20 LTS

```shell
npm install
```

# Usage

```
usage: node main.js [-h] [-v] [--file SomeFile.XML]
```
