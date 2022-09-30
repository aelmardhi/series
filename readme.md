# Series

> a cli tool to open files in series starting from a base folder

## Prequisites
This project requires NodeJS (version 8 or later) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ npm -v && node -v
6.4.1
v8.16.0
```

## Table of Contents

- [Project Name](#project-name)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Commands](#commands)
    - [include](#include)
    - [set](#set)
    - [current](#current)
    - [next](#next)
  - [Authors](#authors)
  - [License](#license)
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

To install and set up the tool, run:

```sh
$ install -g https://github.com/aelmardhi/series.git
$ cd series
```

## Usage
the package will use files named `.series.config` 

to use the tool run
``` sh
series <command> [args]
```
* `<command>` : one of the commands in [Commands](#commands)
* `[args]` : command argumnts

## Commands

list of commands:

### include
Creates a config file in provided path, and then save it to `MAIN` config file.

```sh
series include <path>
```
* `<path>` : folder path to save config file.

the tool will use the closest config file to store configuration data.

### set
sets a path of a series, or creates a new series.
```sh
series set <name> <path>
```
* `<name>` : name of a series.
* `<path>` : path to a series folder.

### current
Opens the last opend file in a series. open the first file in the series if it is the first time opend.
```sh
series current <name>
```
* `<name>` : name of a series.

### next
Opens the next file in a series. open the first file in the series if it is the first time opend. 
```sh
series next <name>
```
* `<name>` : name of a series.

## Authors
* **Abdalla Elmardhi** - [aelmardhi](https://github.com/aelmardhi)

## License
[MIT License](LICENSE) © aelmardhi
