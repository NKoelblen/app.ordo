import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FlattenedItem, FlattenedItems, TreeItems } from './types';

function getDragDepth(offset: number, indentationWidth: number) {
	return Math.round(offset / indentationWidth);
}
function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
	if (previousItem) {
		return previousItem.depth + 1;
	}

	return 0;
}
function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
	if (nextItem) {
		return nextItem.depth;
	}

	return 0;
}
export function getProjection(items: FlattenedItems, activeId: UniqueIdentifier, overId: UniqueIdentifier, dragOffset: number, indentationWidth: number) {
	const overItemIndex = items.findIndex(({ id }) => id === overId);
	const activeItemIndex = items.findIndex(({ id }) => id === activeId);
	const activeItem = items[activeItemIndex];
	const newItems = arrayMove(items, activeItemIndex, overItemIndex);
	const previousItem = newItems[overItemIndex - 1];
	const nextItem = newItems[overItemIndex + 1];
	const dragDepth = getDragDepth(dragOffset, indentationWidth);
	const projectedDepth = activeItem.depth + dragDepth;
	const maxDepth = getMaxDepth({
		previousItem,
	});
	const minDepth = getMinDepth({ nextItem });
	let depth = projectedDepth;

	if (projectedDepth >= maxDepth) {
		depth = maxDepth;
	} else if (projectedDepth < minDepth) {
		depth = minDepth;
	}

	return { depth, maxDepth, minDepth, parentId: getParentId() };

	function getParentId() {
		if (depth === 0 || !previousItem) {
			return null;
		}

		if (depth === previousItem.depth) {
			return previousItem.parentId;
		}

		if (depth > previousItem.depth) {
			return previousItem.id;
		}

		const newParent = newItems
			.slice(0, overItemIndex)
			.reverse()
			.find((item) => item.depth === depth)?.parentId;

		return newParent ?? null;
	}
}

export function flatten(items: TreeItems, parentId: UniqueIdentifier | null = null, depth = 0): FlattenedItems {
	return items.reduce<FlattenedItems>((acc, item, index) => {
		return [
			...acc,
			{
				id: item.id,
				parentId: parentId as string | null,
				depth,
				index,
				descendants: item.descendants, // Force children à être un tableau vide
				editable: item.editable,
				collapsed: item.collapsed,
				professional: item.professional,
				color: item.color,
				icon: item.icon,
				personalizedIconUrl: item.personalizedIconUrl,
				status: item.status,
				label: item.label,
			},
			...flatten(item.descendants || [], item.id, depth + 1), // Appel récursif direct
		];
	}, []);
}
export function flattenTree(items: TreeItems): FlattenedItems {
	return flatten(items);
}
export function removeChildrenOf(items: FlattenedItems, ids: UniqueIdentifier[]) {
	const excludeParentIds = [...ids];

	return items.filter((item) => {
		if (item.parentId && excludeParentIds.includes(item.parentId)) {
			if (item.descendants.length) {
				excludeParentIds.push(item.id);
			}
			return false;
		}

		return true;
	});
}
