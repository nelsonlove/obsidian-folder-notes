import type FolderNotesPlugin from '../main';

/**
 * A per-folder override that is not about disabling anything.
 *
 * Deliberately separate from excluded and whitelisted folders: those describe where
 * the plugin should do *less*, and a whitelist entry only takes effect against an
 * exclusion. A folder that merely wants different settings should not have to be
 * excluded first.
 */
export class FolderSetting {
	type: string;
	id: string;
	path: string;
	string: string;
	subFolders: boolean;
	position: number;
	hideInSettings: boolean;
	/** Overrides the global storage location for this folder. Unset = inherit. */
	storageLocation?: string;

	constructor(path: string, position: number, id: string | undefined, plugin: FolderNotesPlugin) {
		this.type = 'folder';
		this.id = id || crypto.randomUUID();
		this.path = path;
		this.string = '';
		this.subFolders = true;
		this.position = position;
		this.hideInSettings = false;
		void plugin;
	}
}

/** The rule governing a folder: the deepest matching path wins. */
export function getFolderSetting(
	plugin: FolderNotesPlugin,
	path: string | null | undefined,
): FolderSetting | undefined {
	if (!path) return undefined;
	const rules = plugin.settings.folderSettings ?? [];
	let best: FolderSetting | undefined;
	for (const rule of rules) {
		if (!rule.path) continue;
		const exact = rule.path === path;
		const under = rule.subFolders && path.startsWith(`${rule.path}/`);
		if (!exact && !under) continue;
		if (!best || rule.path.length > best.path.length) best = rule;
	}
	return best;
}
