import type FolderNotesPlugin from '../main';
import { getExcludedFolder } from '../ExcludeFolders/functions/folderFunctions';

/**
 * The storage location in force for a folder.
 *
 * The global setting is the default; a per-folder rule may override it, which lets
 * one subtree keep its folder notes beside their folders while the rest of the
 * vault keeps them inside. A rule with `subFolders` covers a whole tree, so one
 * entry is usually enough.
 *
 * `folderPath` is the folder the note belongs to — not the note's own path.
 */
export function getStorageLocation(
	plugin: FolderNotesPlugin,
	folderPath?: string | null,
): string {
	if (!folderPath) return plugin.settings.storageLocation;

	// `includeDetached` false: a detached rule describes a note that has been moved
	// away deliberately and should not redefine where new notes are written.
	const rule = getExcludedFolder(plugin, folderPath, false);
	const override = rule?.storageLocation;

	return typeof override === 'string' && override ? override : plugin.settings.storageLocation;
}
