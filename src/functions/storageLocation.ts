import type FolderNotesPlugin from '../main';
import { getFolderSetting } from '../FolderSettings/FolderSetting';

/**
 * The storage location in force for a folder.
 *
 * The global setting is the default; a per-folder rule may override it, which lets
 * one subtree keep its folder notes beside their folders while the rest of the
 * vault keeps them inside. A rule with `subFolders` covers a whole tree, so one
 * entry is usually enough, and the deepest matching rule wins.
 *
 * `folderPath` is the folder the note belongs to — not the note's own path.
 */
export function getStorageLocation(
	plugin: FolderNotesPlugin,
	folderPath?: string | null,
): string {
	const override = getFolderSetting(plugin, folderPath)?.storageLocation;
	return typeof override === 'string' && override ? override : plugin.settings.storageLocation;
}
