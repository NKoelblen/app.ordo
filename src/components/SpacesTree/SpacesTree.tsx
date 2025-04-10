import React, { useEffect, useMemo, useRef, useState, CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Box, Divider, CircularProgress } from '@mui/material';
import { RichTreeView, TreeItem2, TreeItem2Label, TreeItem2Props, TreeItem2LabelInput, UseTreeItem2LabelSlotOwnProps } from '@mui/x-tree-view';
import { useTreeItem2Utils } from '@mui/x-tree-view/hooks';
import {
	MoreHoriz as MoreHorizIcon,
	Add as AddIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Archive as ArchiveIcon,
	Unarchive as UnarchiveIcon,
	Settings as SettingsIcon,
} from '@mui/icons-material';
import * as MuiIcons from '@mui/icons-material';
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragMoveEvent,
	DragEndEvent,
	DragOverEvent,
	MeasuringStrategy,
	UniqueIdentifier,
	DragOverlay,
	DropAnimation,
	defaultDropAnimation,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TreeItem, TreeItems, SensorContext, CustomLabelProps, CustomLabelInputProps } from './types';
import { getProjection, flattenTree, removeChildrenOf } from './utilities';
import { CollapseButton } from '../CollapseButton';
import '../../styles/components/TreeItem.scss';

import { Space, useSpaceActions } from '../../services/spaceActions';
import SpaceForm from './SpaceForm';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAlerts } from '../../contexts/AlertContext';
import { ReactSVG } from 'react-svg';
import GlobalSettingsModal from '../GlobalSettingsModal';

const SpacesTree = () => {
	const { spaces, setStatusFilter, updateSpace, deleteSpace, spaceLoading } = useSpaceActions();
	const [showArchived, setShowArchived] = useState(false);
	const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
	const [parentSpace, setParentSpace] = useState<Space | null>(null);

	const navigate = useNavigate();
	const location = useLocation();
	const { showAlert } = useAlerts();

	// Drag and drop
	const initialItems = useMemo(() => {
		const spaceMap: Map<string, TreeItem> = new Map();

		spaces.forEach((space) => {
			spaceMap.set(space.id, {
				id: space.id,
				label: space.name,
				status: space.status,
				professional: space.professional,
				color: space.color ?? null,
				icon: space.icon ?? null,
				personalizedIconUrl: space.personalizedIconUrl ?? null,
				descendants: [],
				editable: space.status === 'open',
				collapsed: true,
			});
		});

		const rootSpaces: TreeItems = [];

		spaces.forEach((space) => {
			if (space.parent?.id) {
				const parentSpace = spaceMap.get(space.parent.id);
				if (parentSpace) {
					if (!parentSpace.descendants) {
						parentSpace.descendants = [];
					}
					parentSpace.descendants.push(spaceMap.get(space.id)!);
				}
			} else {
				rootSpaces.push(spaceMap.get(space.id)!);
			}
		});

		return rootSpaces;
	}, [spaces]);
	const measuring = {
		droppable: {
			strategy: MeasuringStrategy.Always,
		},
	};
	const dropAnimationConfig: DropAnimation = {
		keyframes({ transform }) {
			return [
				{ opacity: 1, transform: CSS.Transform.toString(transform.initial) },
				{
					opacity: 0,
					transform: CSS.Transform.toString({
						...transform.final,
						x: transform.final.x + 5,
						y: transform.final.y + 5,
					}),
				},
			];
		},
		easing: 'ease-out',
		sideEffects({ active }) {
			active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: defaultDropAnimation.duration,
				easing: defaultDropAnimation.easing,
			});
		},
	};
	const [items, setItems] = useState<TreeItems>([]);
	useEffect(() => {
		if (spaces.length > 0) {
			setItems(initialItems);
		}
	}, [spaces]);
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
	const [offsetLeft, setOffsetLeft] = useState(0);
	const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({});
	const flattenedItems = useMemo(() => {
		if (spaces.length === 0) return [];
		const flattenedTree = flattenTree(items);
		const collapsedItems = flattenedTree.reduce<string[]>((acc, { descendants, id }) => (collapsedState[id] && descendants.length ? [...acc, id] : acc), []);
		return removeChildrenOf(flattenedTree, activeId != null ? [activeId, ...collapsedItems] : collapsedItems);
	}, [activeId, items, spaces]);

	const projected = activeId && overId ? getProjection(flattenedItems, activeId, overId, offsetLeft, 24) : null;
	const sensorContext: SensorContext = useRef({
		items: flattenedItems,
		offset: offsetLeft,
	});
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 250, // Attente avant activation
				tolerance: 0, // Distance minimale avant activation
			},
		})
	);
	const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);
	useEffect(() => {
		sensorContext.current = {
			items: flattenedItems,
			offset: offsetLeft,
		};
	}, [flattenedItems, offsetLeft]);
	function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
		setActiveId(activeId);
		setOverId(activeId);
	}
	function handleDragMove({ delta }: DragMoveEvent) {
		setOffsetLeft(delta.x);
	}
	function handleDragOver({ over }: DragOverEvent) {
		setOverId(over?.id ?? null);
	}
	async function handleDragEnd({ active, over }: DragEndEvent) {
		if (projected && over) {
			const { parentId } = projected;
			const { errors } = await updateSpace({
				variables: { id: String(active.id), parent: parentId },
			});
			if (errors) {
				showAlert({ severity: 'error', message: "Une erreur est survenue lors de la mise à jour de l'arborescence.", date: Date.now().toString() });
			} else {
				showAlert({ severity: 'success', message: "L'arborescence a été mise à jour avec succès.", date: Date.now().toString() });
			}
		}
		resetState();
	}
	function resetState() {
		setOverId(null);
		setActiveId(null);
		setOffsetLeft(0);

		document.body.style.setProperty('cursor', '');
	}
	function updateCollapsedState(items: TreeItems, collapsedState: Record<string, boolean>): TreeItems {
		return items.map((item) => ({
			...item,
			collapsed: collapsedState[item.id] ?? item.collapsed,
			descendants: updateCollapsedState(item.descendants || [], collapsedState), // Mise à jour récursive
		}));
	}
	useEffect(() => {
		if (spaces.length > 0) {
			setCollapsedState((prevState) => {
				const newCollapsedState: Record<string, boolean> = { ...prevState };
				spaces.forEach((space) => {
					if (!(space.id in newCollapsedState)) {
						newCollapsedState[space.id] = true;
					}
				});
				return newCollapsedState;
			});

			setItems((prevItems) => {
				const spaceMap: Map<string, TreeItem> = new Map();

				// Ajouter les espaces existants à la map
				prevItems.forEach((item) => {
					spaceMap.set(item.id, item);
				});

				// Ajouter les nouveaux espaces à la map
				spaces.forEach((space) => {
					if (!spaceMap.has(space.id)) {
						spaceMap.set(space.id, {
							id: space.id,
							label: space.name,
							status: space.status,
							professional: space.professional,
							color: space.color ?? null,
							icon: space.icon ?? null,
							personalizedIconUrl: space.personalizedIconUrl ?? null,
							descendants: [],
							editable: space.status === 'open',
							collapsed: collapsedState[space.id] ?? true,
						});
					}
				});

				// Construire la hiérarchie des espaces
				const rootSpaces: TreeItems = [];
				spaces.forEach((space) => {
					const currentItem = spaceMap.get(space.id)!;
					if (space.parent?.id) {
						const parentItem = spaceMap.get(space.parent.id);
						if (parentItem && !parentItem.descendants.some((descendant) => descendant.id === currentItem.id)) {
							parentItem.descendants.push(currentItem);
						}
					} else if (!rootSpaces.some((rootItem) => rootItem.id === currentItem.id)) {
						rootSpaces.push(currentItem);
					}
				});

				// Mettre à jour `collapsed` pour tous les espaces et leurs descendants
				return updateCollapsedState(rootSpaces, collapsedState);
			});
		}
	}, [spaces]);
	useEffect(() => {
		localStorage.setItem('collapsedState', JSON.stringify(collapsedState));
	}, [collapsedState]);
	useEffect(() => {
		const savedCollapsedState = localStorage.getItem('collapsedState');
		if (savedCollapsedState) {
			setCollapsedState(JSON.parse(savedCollapsedState));
		}
	}, []);
	function handleCollapse(id: UniqueIdentifier) {
		setCollapsedState((prevState) => ({
			...prevState,
			[id]: !prevState[id],
		}));

		const toggleCollapse = (items: TreeItems): TreeItems =>
			items.map((item) => ({
				...item,
				collapsed: item.id === id ? !item.collapsed : item.collapsed,
				descendants: toggleCollapse(item.descendants || []),
			}));

		setItems((prevItems) => toggleCollapse(prevItems));
	}

	// Menu
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [menuOpen, setMenuOpen] = useState<string | null>(null);
	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, menuId: string) => {
		setAnchorEl(event.currentTarget);
		setMenuOpen(menuId);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
		setMenuOpen(null);
	};

	// Modal
	const [spaceModalOpen, setSpaceModalOpen] = useState(false);
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);

	// Tree
	function CustomLabel({ space, editable, editing, children, toggleItemEditing, onCollapse, collapsed, ...other }: CustomLabelProps) {
		const id = space.id.split('/').pop();
		const IconComponent = (MuiIcons as any)[space.icon || ''];

		return (
			<TreeItem2Label
				{...other}
				editable={editable}
				className="nav-item"
			>
				{onCollapse && (
					<CollapseButton
						onClick={onCollapse}
						collapsed={collapsed}
					/>
				)}
				<Box
					className="space-icon"
					sx={{ color: space.color }}
				>
					{space.personalizedIconUrl ? (
						<ReactSVG src={`https://localhost${space.personalizedIconUrl}`} />
					) : space.icon ? (
						<IconComponent />
					) : (
						space.label.charAt(0).toUpperCase()
					)}
				</Box>

				<Link
					to={`/space/${id}`}
					className="nav-item-summary sidebar-link"
				>
					<span>{children}</span>
					{space.status === 'archived' && <ArchiveIcon />}
				</Link>

				<IconButton
					id={`menu-button-${space.id}`}
					size="small"
					className="menu-button"
					onClick={(event) => handleMenuOpen(event, `space-menu-${space.id}`)}
				>
					<MoreHorizIcon fontSize="inherit" />
				</IconButton>

				<Menu
					className="menu"
					anchorEl={document.getElementById(`menu-button-${space.id}`)}
					open={Boolean(menuOpen === `space-menu-${space.id}`)}
					onClose={handleMenuClose}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					sx={{ mt: -1.75 }}
				>
					{space?.status === 'open' && [
						<MenuItem
							key={`add-child-space-to-${space.id}`}
							onClick={() => {
								setParentSpace(() => spaces.find((parentSpace) => parentSpace.id === space.id) || null);
								setSpaceModalOpen(true);
								handleMenuClose();
							}}
						>
							<ListItemIcon>
								<AddIcon />
							</ListItemIcon>
							<ListItemText>Ajouter un sous-espace</ListItemText>
						</MenuItem>,
						<MenuItem
							key={`rename-space-${space.id}`}
							onClick={() => {
								toggleItemEditing();
								handleMenuClose();
							}}
						>
							<ListItemIcon>
								<EditIcon />
							</ListItemIcon>
							<ListItemText>Renommer</ListItemText>
						</MenuItem>,
						<MenuItem
							key={`update-space-${space.id}`}
							onClick={() => {
								setSelectedSpace(() => spaces.find((selectedSpace) => selectedSpace.id === space.id) || null);
								setSpaceModalOpen(true);
								handleMenuClose();
							}}
						>
							<ListItemIcon>
								<SettingsIcon />
							</ListItemIcon>
							<ListItemText>Paramètres</ListItemText>
						</MenuItem>,
						<Divider key={`divider-${space.id}`} />,
					]}
					<MenuItem
						key={`archive-space-${space.id}`}
						onClick={async () => {
							const { errors } = await updateSpace({
								variables: {
									id: space.id,
									status: space.status === 'open' ? 'archived' : 'open',
								},
							});
							if (errors) {
								showAlert({
									severity: 'error',
									message: `Une erreur est survenue lors de ${space.status === 'open' ? "l'archivage" : 'la restauration'} de l'espace.`,
									date: Date.now().toString(),
								});
							} else {
								showAlert({
									severity: 'success',
									message: `L'espace a été ${space.status === 'open' ? 'archivé' : 'restauré'} avec succès.`,
									date: Date.now().toString(),
								});
							}

							handleMenuClose();
						}}
					>
						<ListItemIcon>{space.status === 'open' ? <ArchiveIcon /> : <UnarchiveIcon />}</ListItemIcon>
						<ListItemText>{space.status === 'open' ? 'Archiver' : 'Restaurer'}</ListItemText>
					</MenuItem>
					<MenuItem
						key={`delete-space-${space.id}`}
						onClick={() => {
							if (window.confirm('Êtes-vous sûr de vouloir supprimer cet espace ?')) {
								deleteSpace({ variables: { id: space.id } });
							}
							handleMenuClose();
							const currentSpaceId = location.pathname.split('/').pop();
							if (space.id === `/api/spaces/${currentSpaceId}`) {
								navigate('/');
							}
						}}
					>
						<ListItemIcon>
							<DeleteIcon />
						</ListItemIcon>
						<ListItemText>Supprimer</ListItemText>
					</MenuItem>
				</Menu>
			</TreeItem2Label>
		);
	}
	function CustomLabelInput(props: Omit<CustomLabelInputProps, 'ref'>) {
		const { handleCancelItemLabelEditing, handleSaveItemLabel, value, spaceId, ...other } = props;

		return (
			<Box className="nav-item">
				<TreeItem2LabelInput
					defaultValue={value}
					{...other}
					className="label-input"
				/>
			</Box>
		);
	}
	const CustomTreeItem = React.forwardRef(function CustomTreeItem(props: TreeItem2Props, _) {
		const space = flattenedItems.find((space) => space.id === props.itemId);
		if (!space) return null;

		const { interactions, status } = useTreeItem2Utils({
			itemId: props.itemId,
			children: props.children,
		});

		const { attributes, isDragging, isSorting, listeners, setDraggableNodeRef, setDroppableNodeRef, transform, transition } = useSortable({
			id: props.itemId,
			animateLayoutChanges: ({ isSorting, wasDragging }) => (isSorting || wasDragging ? false : true),
		});
		const style: CSSProperties = {
			transform: CSS.Translate.toString(transform),
			transition,
		};
		const depth = space.id === activeId && projected ? projected.depth : space.depth;

		return (
			<div
				id={activeId ? String(activeId) : undefined}
				{...attributes}
				{...listeners}
				className={`wrapper ${isDragging ? 'ghost' : ''} ${isSorting ? 'disableInteraction' : ''}`}
				ref={setDroppableNodeRef}
				onFocus={undefined}
				style={
					{
						'--spacing': `${24 * depth}px`,
					} as React.CSSProperties
				}
			>
				<TreeItem2
					className="nav-item-container"
					{...props}
					ref={setDraggableNodeRef}
					slots={{ label: CustomLabel, labelInput: CustomLabelInput }}
					slotProps={{
						label: {
							space: space,
							editable: status.editable,
							editing: status.editing,
							toggleItemEditing: interactions.toggleItemEditing,
							collapsed: Boolean(space.collapsed && space.descendants.length),
							onCollapse: space.descendants.length ? () => handleCollapse(props.itemId) : undefined,
						} as unknown as UseTreeItem2LabelSlotOwnProps & { space: Space; children?: React.ReactNode },
						labelInput: {
							spaceId: props.itemId,
							value: props.label,
							handleCancelItemLabelEditing: interactions.handleCancelItemLabelEditing,
							handleSaveItemLabel: interactions.handleSaveItemLabel,
						} as CustomLabelInputProps,
					}}
					style={style}
				/>
			</div>
		);
	});

	return (
		<>
			<Box className="nav-item nav-title">
				<span>Espaces</span>

				<IconButton
					className="menu-button"
					size="small"
					onClick={(event) => handleMenuOpen(event, 'spaces-menu')}
				>
					<MoreHorizIcon fontSize="inherit" />
				</IconButton>
				<Menu
					className="menu"
					anchorEl={anchorEl}
					open={Boolean(menuOpen === 'spaces-menu')}
					onClose={() => handleMenuClose()}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					sx={{ mt: -1.75 }}
				>
					<MenuItem
						key="add-space"
						onClick={() => {
							setParentSpace(null);
							setSpaceModalOpen(true);
							handleMenuClose();
						}}
					>
						<ListItemIcon>
							<AddIcon />
						</ListItemIcon>
						<ListItemText>Ajouter un espace</ListItemText>
					</MenuItem>
					<MenuItem
						key="global-settings"
						onClick={() => {
							// setParentSpace(null);
							setSettingsModalOpen(true);
							handleMenuClose();
						}}
					>
						<ListItemIcon>
							<SettingsIcon />
						</ListItemIcon>
						<ListItemText>Paramètres</ListItemText>
					</MenuItem>
					<MenuItem
						key="show-archived-spaces"
						onClick={() => {
							setShowArchived((prev) => !prev);
							setStatusFilter((prev) => (prev === 'open' ? null : 'open'));
							handleMenuClose();
						}}
					>
						<ListItemIcon>
							<ArchiveIcon />
						</ListItemIcon>
						<ListItemText>{showArchived ? 'Masquer' : 'Afficher '} les espaces archivés</ListItemText>
					</MenuItem>
				</Menu>
			</Box>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				measuring={measuring}
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={sortedIds}
					strategy={verticalListSortingStrategy}
				>
					<RichTreeView
						id="spaces-nav"
						items={flattenedItems}
						slots={{ item: CustomTreeItem }}
						isItemEditable={(item) => Boolean(item?.editable)}
						experimentalFeatures={{ labelEditing: true }}
						onItemLabelChange={async (itemId, label) => {
							const { errors } = await updateSpace({
								variables: { id: itemId, name: label },
							});
							if (errors) {
								showAlert({ severity: 'error', message: "Une erreur est survenue lors de la mise à jour du nom de l'espace.", date: Date.now().toString() });
							} else {
								showAlert({ severity: 'success', message: "L'espace a été renomé avec succès.", date: Date.now().toString() });
							}
						}}
					/>
					{createPortal(<DragOverlay dropAnimation={dropAnimationConfig} />, document.body)}
				</SortableContext>
			</DndContext>

			{spaceLoading && spaces.length === 0 && <CircularProgress className="loading" />}

			<SpaceForm
				open={spaceModalOpen}
				handleClose={() => {
					setSpaceModalOpen(false);
					setSelectedSpace(null);
					setParentSpace(null);
				}}
				space={selectedSpace}
				parentSpace={parentSpace}
			/>

			<GlobalSettingsModal
				open={settingsModalOpen}
				handleClose={() => setSettingsModalOpen(false)}
			/>
		</>
	);
};

export default SpacesTree;
