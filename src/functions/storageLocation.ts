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

/**
 * The storage location in force for a *note* whose folder is not yet known.
 *
 * The reverse lookup is chicken-and-egg: which folder a note belongs to depends on
 * the mode, and the mode depends on the folder. Both candidates are tried, most
 * specific first — under `parentFolder` the folder is `<parent>/<basename>`, which
 * is deeper than the note's own parent and is where a rule declared on that folder
 * exactly will be found. Falling back to the parent covers `insideFolder`.
 */
export function getStorageLocationForNote(
	plugin: FolderNotesPlugin,
	parentPath: string,
	basename: string,
): string {
	const candidate = parentPath ? `${parentPath}/${basename}` : basename;
	const asFolder = getFolderSetting(plugin, candidate)?.storageLocation;
	if (asFolder) return asFolder;
	const asParent = getFolderSetting(plugin, parentPath)?.storageLocation;
	return asParent || plugin.settings.storageLocation;
}
