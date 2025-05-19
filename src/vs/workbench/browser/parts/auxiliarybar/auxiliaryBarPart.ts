/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/auxiliaryBarPart.css';
import { localize } from '../../../../nls.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { contrastBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { AIChatPanelVisibleContext } from './auxiliaryBarActions.js';
import { TAB_ACTIVE_BORDER } from '../../../common/theme.js';
import { IViewDescriptorService, ViewContainerLocation } from '../../../common/views.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ActivityBarPosition, IWorkbenchLayoutService, LayoutSettings, Parts, Position } from '../../../services/layout/browser/layoutService.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { Part } from '../../../browser/part.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { Emitter } from '../../../../base/common/event.js';

export class AIChatPart extends Part {

	static readonly activeViewSettingsKey = 'workbench.aichat.placeholder';

	readonly minimumWidth: number = 170;
	readonly maximumWidth: number = Number.POSITIVE_INFINITY;
	readonly minimumHeight: number = 0;
	readonly maximumHeight: number = Number.POSITIVE_INFINITY;

	protected override readonly _onDidVisibilityChange = this._register(new Emitter<boolean>());
	public override readonly onDidVisibilityChange = this._onDidVisibilityChange.event;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IContextMenuService private readonly contextMenuService: IContextMenuService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IViewDescriptorService private readonly viewDescriptorService: IViewDescriptorService,
		@IPaneCompositePartService private readonly paneCompositePartService: IPaneCompositePartService,
		@IExtensionService private readonly extensionService: IExtensionService
	) {
		super(
			Parts.AUXILIARYBAR_PART,
			{ hasTitle: true },
			themeService,
			storageService,
			layoutService
		);
	}

	protected override createContentArea(parent: HTMLElement, options?: object): HTMLElement {
		this.element = parent;

		// Clear any existing content (like "Drag a view here...")
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}

		const placeholder = document.createElement('div');
		placeholder.style.padding = '20px';
		placeholder.textContent = 'AI Chat Panel Placeholder';
		parent.appendChild(placeholder);

		return this.element;
		}

	public override updateStyles(): void {
		super.updateStyles();
		const container = assertIsDefined(this.getContainer());
		const borderColor = this.getColor(contrastBorder) || this.getColor(TAB_ACTIVE_BORDER);
		container.style.setProperty('--auxiliary-bar-border-color', borderColor ? borderColor.toString() : 'transparent');
	}

	public override layout(width: number, height: number, top: number, left: number): void {
		if (!this.layoutService.isVisible(Parts.AUXILIARYBAR_PART)) {
			return;
			}

		super.layout(width, height, top, left);
	}

	public override setVisible(visible: boolean): void {
		super.setVisible(visible);
		AIChatPanelVisibleContext.bindTo(this.contextKeyService).set(visible);
	}

	public override toJSON(): object {
		return {
			type: Parts.AUXILIARYBAR_PART
		};
	}
}
