import { CancellationToken, Event, FileDecoration, FileDecorationProvider, ProviderResult, ThemeColor, Uri, EventEmitter } from "vscode";

export class TreeDecorationProvider implements FileDecorationProvider {
    _onDidChangeFileDecorations = new EventEmitter<Uri | Uri[]>();
    onDidChangeFileDecorations?: Event<Uri | Uri[] | undefined> | undefined = this._onDidChangeFileDecorations.event;

    provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
        console.log('logging uri...', uri);
        if (uri.toString().startsWith('validator:')) {
            return new FileDecoration("!", "Node dep", new ThemeColor("list.warningForeground"));
        }
        return null;
    }

    async updateDepTree(uri: Uri) {
        this._onDidChangeFileDecorations.fire(uri);
    }
}