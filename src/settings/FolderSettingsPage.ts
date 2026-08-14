import { Setting, Modal, App } from 'obsidian';
import type { SettingsTab } from './SettingsTab';
import type FolderNotesPlugin from '../main';
import { FolderSetting } from 'src/FolderSettings/FolderSetting';
import { FolderSuggest } from 'src/suggesters/FolderSuggester';

/** Per-folder overrides that are not about disabling anything. */
export async function renderFolderSettings(settingsTab: SettingsTab): Promise<void> {
	const containerEl = settingsTab.settingsPage;
	const plugin = settingsTab.plugin;

	new Setting(containerEl)
		.setHeading()
		.setName('Folder settings')
		.setDesc(
			'Per-folder overrides of the global settings. Unlike excluded folders, a rule here '
			+ 'does not disable anything — it only changes how the plugin behaves for that folder.',
		);

	new Setting(containerEl)
		.setName('Add folder')
		.addButton((cb) => {
			cb.setButtonText('Add');
			cb.setCta();
			cb.onClick(async () => {
				const rule = new FolderSetting('', plugin.settings.folderSettings.length, undefined, plugin);
				plugin.settings.folderSettings.push(rule);
				await plugin.saveSettings(true);
				settingsTab.display();
			});
		});

	for (const rule of plugin.settings.folderSettings) {
		const row = new Setting(containerEl);
		row.addSearch((cb) => {
			new FolderSuggest(cb.inputEl, plugin, false);
			cb.setPlaceholder('Folder path')
				.setValue(rule.path)
				.onChange(async (value) => {
					rule.path = value.trim().replace(/\/+$/, '');
					await plugin.saveSettings(true);
				});
		});
		row.addButton((cb) => {
			cb.setIcon('settings');
			cb.setTooltip('Settings for this folder');
			cb.onClick(() => new FolderSettingModal(settingsTab.app, plugin, rule, settingsTab).open());
		});
		row.addButton((cb) => {
			cb.setIcon('trash-2');
			cb.setTooltip('Remove');
			cb.onClick(async () => {
				plugin.settings.folderSettings = plugin.settings.folderSettings.filter((r) => r.id !== rule.id);
				await plugin.saveSettings(true);
				settingsTab.display();
			});
		});
	}
}

class FolderSettingModal extends Modal {
	constructor(
		app: App,
		private plugin: FolderNotesPlugin,
		private rule: FolderSetting,
		private settingsTab: SettingsTab,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: this.rule.path || 'Folder settings' });

		new Setting(contentEl)
			.setName('Include subfolders')
			.setDesc('Apply these settings to everything beneath this folder too.')
			.addToggle((toggle) =>
				toggle.setValue(this.rule.subFolders).onChange(async (value) => {
					this.rule.subFolders = value;
					await this.plugin.saveSettings(true);
				}),
			);

		new Setting(contentEl)
			.setName('Storage location')
			.setDesc(
				'Where folder notes are kept for this folder. Inherit uses the global setting; '
				+ 'an override lets one subtree differ from the rest of the vault.',
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption('', 'Inherit global setting')
					.addOption('insideFolder', 'Inside the folder')
					.addOption('parentFolder', 'In the parent folder')
					.setValue(this.rule.storageLocation ?? '')
					.onChange(async (value) => {
						// Empty means inherit, so the key is cleared rather than set to ''.
						this.rule.storageLocation = value === '' ? undefined : value;
						await this.plugin.saveSettings(true);
					}),
			);
	}

	onClose(): void {
		this.contentEl.empty();
		this.settingsTab.display();
	}
}
