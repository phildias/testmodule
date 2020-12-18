## FoundryVTT project template

This is a guide on setting up FoundryVTT module development with Electron.

### Electron debugging configuration for VSCode

Here's an overview of the configuration for my debugging workflow. It uses Electron, which is faster and more responsive (in my experience) than a browser. Unfortunately, hooking onto its rendering process isn't that simple, so I'll show you how to do it.

##### Goals and limitations
What I wanted to have was a non-browser dependent pipeline that can be fully debugged from within VSCode (mostly because I really dislike the Firefox debugger). I also wanted to mirror the console output. One key difficulty is that Electron uses a main and a renderer process and we need access to both. Another hurdle was getting auto-reload to work without having to change source code for it, which is why we need a VSCode extension for it. Finally, this all needs to work with a hardlink between Foundry's data folder and my workspace.

I did not set this up for TypeScript development, although making that work is just a matter of adding the correct source map configuration.

Something that is not possible with this setup is external HTML and CSS inspection. For that, you still need the browser debugger (Electron is based on Chromium, so it works the same way). Live injection of stylesheets is also not possible, reloading is required to apply changes.

##### Prerequisites
This guide assumes that you are using Visual Studio Code and that you already have some basic project structure (e.g. the one created by the [Foundry Project Creator](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project)) with hardlink deployment. It also wasn't written for newcomers, but if you just started out, you probably don't need this kind of pipeline anyway - check the **Simple configuration** section for a less complicated setup.

For VSCode extensions, you'll need [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (included with the default installation), [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) and [Trigger Task on Save](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave). You can skip the last one if you don't want auto-reload, although you'll then need to remove some configuration to avoid errors.

Electron also must be available in the project dependencies. For most setups, run `npm install electron --save-dev` and you're good to go. I'd recommend not using a global installation, but that's up to you.

Another thing worth mentioning is that I use environment variables to locate the default Foundry directories. This will not work if you are not on Windows or if you chose non-default locations for your installation or data. In that case, be ready to adjust some paths.

##### Simple configuration

Just getting started and don't need all the fancy stuff? I got you covered. Start with the aforementioned [Foundry Project Creator](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project), create a ***launch.json*** file in your *.vscode* folder and replace its contents with this:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run in browser",
            "program": "${env:ProgramFiles}/FoundryVTT/resources/app/main.js",
            "args": ["--world=testWorld"],
            "request": "launch",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "type": "pwa-node",
            "outputCapture": "std",
            "preLaunchTask": "${defaultBuildTask}",
            "serverReadyAction": {
              "pattern": "listening on port ([0-9]+)",
              "uriFormat": "http://localhost:%s",
              "action": "openExternally"
            }
        }
    ]
}
```

Make sure to adjust the *program* path if you're not using Windows with the default Foundry location. Congratulations, you can now select *Run in browser* in the debugger tab and run Foundry by pressing F5.

##### Advanced configuration

Let's get to the good stuff. All configurations are placed within your project folder's *.vscode* directory. The first is the ***extensions.json***, a convenience for recommending the required extensions when the project is opened:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "msjsdiag.debugger-for-chrome",
    "gruntfuggly.triggertaskonsave"
  ]
}
```

---

Next is the workspace configuration, located in ***settings.json***. We use this to set up the file watcher extension and to disable the preview debugger, which fails to reassociate breakpoints on script files loaded from absolute paths.

This example only sets this up for "Less" stylesheets, if you use SCSS, TypeScript or any other transpiler, you should create your own watch tasks (here and later in the task configuration). Also make sure that the observed paths match your directory structure.

The status bar setting adds a button on the bottom bar to quickly disable the file watcher until you restart the debugger.
```json
{
    "debug.javascript.usePreview": false,
    "triggerTaskOnSave.tasks": {
        "watch: reload": [
            "dist/**/*.js",
            "dist/templates/*.html"
        ],
        "watch: less": [
            "src/styles/*.less"
        ]
    },
    "triggerTaskOnSave.showStatusBarToggle": true
}
```

---

Speaking of tasks: Here's my ***tasks.json***, which allows us to connect the file watcher, VSCode and your build tools (I use Gulp, but anything task based will do).

If you want to change the file watcher behavior, this is where you need to create the tasks that define its actions. In my default case, I simply tell the debugger to restart (which, for this particular debugger, doesn't actually restart, but reloads the window). In order to do that, we need the `${command:<>}` syntax, which allows starting VSCode commands from tasks. We also use this to enable and disable the file watcher so we don't restart the debugger when we're not debugging.

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "npm",
            "script": "build",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "label": "npm: build",
            "detail": "gulp build && gulp link"
        },
        {
            "label": "watch: enable",
            "type": "shell",
            "command": "${command:triggerTaskOnSave.enable}"
        },
        {
            "label": "watch: disable",
            "type": "shell",
            "command": "${command:triggerTaskOnSave.disable}"
        },
        {
            "label": "watch: reload",
            "type": "shell",
            "command": "${command:workbench.action.debug.restart}"
        },
        {
            "label": "watch: less",
            "dependsOrder": "sequence",
            "dependsOn": [
                "gulp: buildLess",
                "watch: reload"
            ]
        }
    ]
}
```

---

Alright, one more to go. Now we need to launch all of this stuff, appropriately done in the ***launch.json*** file. This one is complicated, so I'll put comments into the example (VSCode is smart enough to filter them out, so you don't need to remove them).

```javascript
{
    "version": "0.2.0",
    // This compound configuration is the one you will ultimately start.
    "compounds": [
        {
            "name": "Debug in Electron",
            "configurations": [
                // Launch Electron ...
                "FoundryVTT Launcher",
                // ... and then attach the debugger.
                "FoundryVTT Game"
            ]
        }
    ],
    "configurations": [
        {
            // Electron launcher configuration.
            "name": "FoundryVTT Launcher",
            // Paths to your Foundry installation, adjust as required.
            "cwd": "${env:ProgramFiles}/FoundryVTT/resources/app",
            "program": "${env:ProgramFiles}/FoundryVTT/resources/app/main.js",
            // Example for passing arguments, e.g. to load a world immediately.
            "args": ["--world=myTestWorld"],
            // Build before launching - you can use the default or any task name.
            "preLaunchTask": "${defaultBuildTask}",
            // Start Electron through Node.js.
            "type": "node",
            "request": "launch",
            "protocol": "inspector",
            "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
            "windows": {
                "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
            },
            "runtimeArgs": [
                "--remote-debugging-port=9223",
            ],
            // List of file globs that we don't want to debug.
            "skipFiles": [
                "<node_internals>/**/*.js",
                "node_modules/**/*.js"
            ],
            // Capture Foundry's console output.
            "outputCapture": "std",
            // Source map configuration - set this to true and add paths for TypeScript.
            "sourceMaps": false,
        },
        {
            // Renderer debugging configuration.
            "name": "FoundryVTT Game",
            // Attach to our launcher instance.
            "type": "chrome",
            "request": "attach",
            "port": 9223,
            // Tell the debugger where to find stuff. May need adjustments.
            "webRoot": "${env:ProgramFiles}/FoundryVTT/resources/app/public",
            "pathMapping": {
                // Override the path for your own system or module ...
                "/systems/mySystem": "${workspaceFolder}/dist",
                // ... and use the default for everything else.
                // Note the slightly different formats - swap them for a module.
                "/systems/*": "${env:AppData}/../Local/FoundryVTT/Data/systems/*",
                "/modules": "${env:AppData}/../Local/FoundryVTT/Data/modules",
                "/worlds": "${env:AppData}/../Local/FoundryVTT/Data/worlds",
            },
            // Again, we don't want to debug into dependencies.
            "skipFiles": [
                "<node_internals>/**/*.js",
                "node_modules/**/*.js"
            ],
            // How long to wait for the launcher. Increase this for potato debugging.
            "timeout": 30000,
            // Only watch files when we're debugging.
            "preLaunchTask": "watch: enable",
            "postDebugTask": "watch: disable",
        }
    ]
}
```

If you dilligently adjusted all the paths, all that's left is to select the *Debug in Electron* run configuration in the debug menu. Default start hotkey is F5 (*Debug: Start Debugging* command), manual reloads can be done with Ctrl + Shift + F5 (*Debug: Restart* command).