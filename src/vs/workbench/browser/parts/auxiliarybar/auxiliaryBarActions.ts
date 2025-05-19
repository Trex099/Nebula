/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ActiveAuxiliaryContext, AuxiliaryBarFocusContext, AuxiliaryBarVisibleContext, FocusedViewContext, IsAuxiliaryWindowContext } from '../../../common/contextkeys.js';
import { ViewContainerLocation, ViewContainerLocationToString } from '../../../common/views.js';
import { ActivityBarPosition, IWorkbenchLayoutService, LayoutSettings, Parts } from '../../../services/layout/browser/layoutService.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.js';
import { SwitchCompositeViewAction } from '../compositeBarActions.js';
import { closeIcon } from '../panel/panelActions.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';

// Define a new context key for the AI Chat Panel visibility
export const AIChatPanelVisibleContext = new RawContextKey<boolean>('aiChatPanelVisible', false, localize('aiChatPanelVisibleContext', "Whether the AI Chat panel is visible"));

const auxiliaryBarRightIcon = registerIcon('auxiliarybar-right-layout-icon', Codicon.layoutSidebarRight, localize('auxiliaryBarRightLayoutIcon', 'Icon for the secondary side bar layout action in the right position.'));
const auxiliaryBarLeftIcon = registerIcon('auxiliarybar-left-layout-icon', Codicon.layoutSidebarLeft, localize('auxiliaryBarLeftLayoutIcon', 'Icon for the secondary side bar layout action in the left position.'));
const auxiliaryBarRightOffIcon = registerIcon('auxiliarybar-right-layout-icon-off', Codicon.layoutSidebarRightOff, localize('auxiliaryBarRightOffLayoutIcon', 'Icon for the secondary side bar layout action in the right position when off.'));
const auxiliaryBarLeftOffIcon = registerIcon('auxiliarybar-left-layout-icon-off', Codicon.layoutSidebarLeftOff, localize('auxiliaryBarLeftOffLayoutIcon', 'Icon for the secondary side bar layout action in the left position when off.'));

// Placeholder icons for AI Chat
const aiChatPanelIcon = registerIcon('ai-chat-panel-icon', Codicon.commentDiscussion, localize('aiChatPanelIcon', "Icon for the AI Chat panel button."));

export class ToggleAIChatPanelAction extends Action2 {

	static readonly ID = 'workbench.action.toggleAIChatPanel';

	constructor() {
		super({
			id: ToggleAIChatPanelAction.ID,
			title: localize2('toggleAIChatPanel', 'Toggle AI Chat Panel'),
			category: Categories.View,
			f1: true,
			toggled: AIChatPanelVisibleContext,
			menu: [
				{
					id: MenuId.MenubarAppearanceMenu,
					group: '2_workbench_layout',
					order: 2
				},
				{
					id: MenuId.LayoutControlMenuSubmenu,
					group: '0_workbench_layout',
					order: 2
				}
			]
		});
	}

	override async run(accessor: ServicesAccessor): Promise<void> {
		const layoutService = accessor.get(IWorkbenchLayoutService);
		const isVisible = layoutService.isVisible(Parts.AUXILIARYBAR_PART);
		layoutService.setPartHidden(isVisible, Parts.AUXILIARYBAR_PART);
	}
}

registerAction2(ToggleAIChatPanelAction);

MenuRegistry.appendMenuItems([
	{
		id: MenuId.LayoutControlMenu,
		item: {
			group: '2_pane_toggles',
			command: {
				id: ToggleAIChatPanelAction.ID, // Changed from ToggleAuxiliaryBarAction.ID
				title: localize('toggleAIChatPanelButton', "Toggle AI Chat Panel"), // Changed title
				toggled: {
					condition: AIChatPanelVisibleContext, // Changed context key
					icon: aiChatPanelIcon, // Use new AI chat icon (on state)
					title: localize('hideAIChatPanel', "Hide AI Chat Panel")
				},
				icon: aiChatPanelIcon, // Use new AI chat icon (off state) - can refine later for distinct off state
			},
			when: ContextKeyExpr.and(
				IsAuxiliaryWindowContext.negate(),
				ContextKeyExpr.or(
					ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'),
					ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')
				),
				// Retain original logic for placement based on primary sidebar, though this icon might always be at the end.
				ContextKeyExpr.equals('config.workbench.sideBar.location', 'right')
			),
			order: 0 // This order might need adjustment. Original was 0 if sidebar right, 2 if sidebar left.
		}
	}, {
		id: MenuId.LayoutControlMenu,
		item: {
			group: '2_pane_toggles',
			command: {
				id: ToggleAIChatPanelAction.ID, // Changed from ToggleAuxiliaryBarAction.ID
				title: localize('toggleAIChatPanelButton', "Toggle AI Chat Panel"), // Changed title
				toggled: {
					condition: AIChatPanelVisibleContext, // Changed context key
					icon: aiChatPanelIcon, // Use new AI chat icon (on state)
					title: localize('hideAIChatPanel', "Hide AI Chat Panel")
				},
				icon: aiChatPanelIcon, // Use new AI chat icon (off state)
			},
			when: ContextKeyExpr.and(
				IsAuxiliaryWindowContext.negate(),
				ContextKeyExpr.or(
					ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'),
					ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')
				),
				ContextKeyExpr.equals('config.workbench.sideBar.location', 'left')
			),
			order: 2 // This order might need adjustment.
		}
	}, /*{
		id: MenuId.ViewContainerTitleContext,
		item: {
			group: '3_workbench_layout_move',
			command: {
				id: ToggleAuxiliaryBarAction.ID,
				title: localize2('hideAuxiliaryBar', 'Hide Secondary Side Bar'),
			},
			when: ContextKeyExpr.and(AuxiliaryBarVisibleContext, ContextKeyExpr.equals('viewContainerLocation', ViewContainerLocationToString(ViewContainerLocation.AuxiliaryBar))),
			order: 2
		}
	}*/
]);

registerAction2(class extends SwitchCompositeViewAction {
	constructor() {
		super({
			id: 'workbench.action.previousAuxiliaryBarView',
			title: localize2('previousAuxiliaryBarView', 'Previous Secondary Side Bar View'),
			category: Categories.View,
			f1: true
		}, ViewContainerLocation.AuxiliaryBar, -1);
	}
});

registerAction2(class extends SwitchCompositeViewAction {
	constructor() {
		super({
			id: 'workbench.action.nextAuxiliaryBarView',
			title: localize2('nextAuxiliaryBarView', 'Next Secondary Side Bar View'),
			category: Categories.View,
			f1: true
		}, ViewContainerLocation.AuxiliaryBar, 1);
	}
});
