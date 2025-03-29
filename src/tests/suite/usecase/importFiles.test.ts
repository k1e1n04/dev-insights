import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as getFilesModule from '../../../utils/getFiles';
import { importFiles } from '../../../usecases/importFiles';
import { VectorDBClient } from '../../../db-clients/vectorDBClient';

suite('importFiles Tests', () => {
  let showOpenDialogStub: sinon.SinonStub;
  let getFilesStub: sinon.SinonStub;
  let chromaDBClientStub: VectorDBClient;
  let streamStub: vscode.ChatResponseStream;

  setup(() => {
    streamStub = {
      markdown: sinon.stub().resolves(),
    } as unknown as vscode.ChatResponseStream;

    showOpenDialogStub = sinon.stub(vscode.window, 'showOpenDialog');
    getFilesStub = sinon.stub(getFilesModule, 'getFiles');

    chromaDBClientStub = {
      importFiles: sinon.stub().resolves(true),
    } as unknown as VectorDBClient;
  });

  teardown(() => {
    sinon.restore();
  });

  test('should import files from selected folder', async () => {
    const mockFolderUri = [{ fsPath: '/path/to/folder' }];
    showOpenDialogStub.resolves(mockFolderUri);

    const mockFiles = ['/path/to/folder/file1.md', '/path/to/folder/file2.md'];
    getFilesStub.returns(mockFiles);

    await importFiles(streamStub, chromaDBClientStub);

    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledOnce(getFilesStub);
    sinon.assert.calledWith(getFilesStub, '/path/to/folder');

    sinon.assert.callCount(chromaDBClientStub.importFiles as sinon.SinonStub, 2);
    sinon.assert.calledWith(chromaDBClientStub.importFiles as sinon.SinonStub, '/path/to/folder/file1.md');
    sinon.assert.calledWith(chromaDBClientStub.importFiles as sinon.SinonStub, '/path/to/folder/file2.md');

    sinon.assert.calledWith(streamStub.markdown as sinon.SinonStub, 'ディレクトリ内のすべてのファイルをベクターデータベースにインポートしました。');
  });

  test('should show message when no files are found in selected folder', async () => {
    const mockFolderUri = [{ fsPath: '/path/to/folder' }];
    showOpenDialogStub.resolves(mockFolderUri);

    getFilesStub.returns([]);

    await importFiles(streamStub, chromaDBClientStub);

    sinon.assert.calledWith(streamStub.markdown as sinon.SinonStub,'選択したディレクトリに対象ファイルは見つかりませんでした。');
  });

  test('should handle the case when no folder is selected', async () => {
    showOpenDialogStub.resolves([]);

    await importFiles(streamStub, chromaDBClientStub);

    sinon.assert.notCalled(chromaDBClientStub.importFiles as sinon.SinonStub);
    sinon.assert.notCalled(streamStub.markdown as sinon.SinonStub);
  });
});
