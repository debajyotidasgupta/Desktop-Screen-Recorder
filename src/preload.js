
const { contextBridge, ipcRenderer, desktopCapturer, remote } = require('electron');
const { Menu, dialog } = remote;
const { writeFile } = require('fs');

// Get the available video sources
async function getVideoSources(selectSource) {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );
    videoOptionsMenu.popup();
}

contextBridge.exposeInMainWorld(
    "api", {
    getVideoSources: selectSource => getVideoSources(selectSource),
    getFileFromDialog: async () => {
        const { filePath } = await dialog.showSaveDialog({
            buttonLabel: 'Save video',
            defaultPath: `vid-${Date.now()}.webm`
        })
        return filePath;
    },
    write: async (filePath, buffer) => await writeFile(filePath, buffer, () => console.log('Video was saved successfully!')),
    buffer: args => { return Buffer.from(args); },
});