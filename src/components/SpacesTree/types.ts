import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { UseTreeItem2LabelInputSlotOwnProps } from '@mui/x-tree-view';
import { MutableRefObject } from 'react';

export interface TreeItem extends TreeViewBaseItem {
	editable: boolean;
	professional: boolean;
	status: 'open' | 'archived';
	color: string | null;
	icon: string | null;
	personalizedIconUrl: string | null;
	descendants: TreeItem[];
	collapsed: boolean;
}
export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
	parentId: string | null;
	depth: number;
	index: number;
}
export type FlattenedItems = FlattenedItem[];

export type SensorContext = MutableRefObject<{
	items: FlattenedItem[];
	offset: number;
}>;

export interface CustomLabelProps {
	space: FlattenedItem;
	editable: boolean;
	editing: boolean;
	toggleItemEditing: () => void;
	onMenuOpen?: (event: React.MouseEvent) => void;
	onCollapse: () => void | undefined;
	collapsed: boolean;
	children: React.ReactNode;
}

export interface CustomLabelInputProps extends UseTreeItem2LabelInputSlotOwnProps {
	handleCancelItemLabelEditing: (event: React.SyntheticEvent) => void;
	handleSaveItemLabel: (event: React.SyntheticEvent, spaceId: string, newName: string) => void;
	value: string;
	spaceId: string;
}
