import React, { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Box, Checkbox, FormControlLabel, Divider } from '@mui/material';
import { RichTreeView, TreeItem2, TreeItem2Label, TreeItem2Props, TreeItem2LabelInput, UseTreeItem2LabelSlotOwnProps, UseTreeItem2LabelInputSlotOwnProps } from '@mui/x-tree-view';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { useTreeItem2Utils } from '@mui/x-tree-view/hooks';
import { MoreHoriz as MoreHorizIcon, Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Archive as ArchiveIcon, Unarchive as UnarchiveIcon } from '@mui/icons-material';
import { useSpaces, Space } from '../contexts/SpaceContext';
import SpaceForm from './SpaceForm';

const SpacesTree = () => {
	const { spaces, updateName, updateProfessional, updateStatus, deleteSpace, setStatusFilter, updateParent } = useSpaces();
	const [showArchived, setShowArchived] = useState(false);

	const [parentSpace, setParentSpace] = useState<Space | null>(null);

	type Editable = {
		editable?: boolean;
		id: string;
		label: string;
	};

	const formatSpaces = (spaces: Space[]): TreeViewBaseItem<Editable>[] => {
		const spaceMap: Map<string, TreeViewBaseItem> = new Map();

		spaces.forEach((space) => {
			spaceMap.set(space.id, {
				id: space.id,
				label: space.name,
				editable: space.status === 'open',
				children: [],
				professional: space.professional,
				status: space.status,
			});
		});

		const rootSpaces: TreeViewBaseItem[] = [];

		spaces.forEach((space) => {
			if (space.parent?.id) {
				const parentSpace = spaceMap.get(space.parent.id);
				if (parentSpace) {
					if (!parentSpace.children) {
						parentSpace.children = [];
					}
					parentSpace.children.push(spaceMap.get(space.id)!);
				}
			} else {
				rootSpaces.push(spaceMap.get(space.id)!);
			}
		});

		return rootSpaces;
	};

	interface CustomLabelProps {
		space: Space;
		editable: boolean;
		editing: boolean;
		toggleItemEditing: () => void;
		onMenuOpen?: (event: React.MouseEvent) => void;
	}
	function CustomLabel({ space, editable, editing, children, toggleItemEditing, ...other }: CustomLabelProps) {
		return (
			<TreeItem2Label
				{...other}
				editable={editable}
				className="nav-item"
			>
				<Box className="nav-item-summary">
					<span>{children}</span>
					{space.status === 'archived' && <ArchiveIcon />}
				</Box>

				<IconButton
					id={`menu-button-${space.id}`}
					size="small"
					className="menu-icon"
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
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					sx={{ mt: -0.75 }}
				>
					{space?.status === 'open' && [
						<MenuItem
							key={`add-child-space-to-${space.id}`}
							onClick={() => {
								setParentSpace(space);
								setModalOpen(true);
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
							key={`update-space-professional-${space.id}`}
							className="menu-item-checkbox"
						>
							<FormControlLabel
								control={
									<Checkbox
										className="menu-item-checkbox-input"
										checked={space.professional || false}
										onChange={(event, checked) => {
											updateProfessional(space.id, checked);
											handleMenuClose();
										}}
										disabled={space.parent !== null}
									/>
								}
								label="Professionnel"
							/>
						</MenuItem>,
						<Divider key={`divider-${space.id}`} />,
					]}
					<MenuItem
						key={`archive-space-${space.id}`}
						onClick={() => {
							updateStatus(space.id, space.status === 'open' ? 'archived' : 'open');
							handleMenuClose();
						}}
					>
						<ListItemIcon>{space.status === 'open' ? <ArchiveIcon /> : <UnarchiveIcon />}</ListItemIcon>
						<ListItemText>{space.status === 'open' ? 'Archiver' : 'Restaurer'}</ListItemText>
					</MenuItem>
					<MenuItem
						key={`delete-space-${space.id}`}
						onClick={() => {
							deleteSpace(space.id);
							handleMenuClose();
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

	interface CustomLabelInputProps extends UseTreeItem2LabelInputSlotOwnProps {
		handleCancelItemLabelEditing: (event: React.SyntheticEvent) => void;
		handleSaveItemLabel: (event: React.SyntheticEvent, spaceId: string, newName: string) => void;
		value: string;
		spaceId: string;
	}
	function CustomLabelInput(props: Omit<CustomLabelInputProps, 'ref'>) {
		const { handleCancelItemLabelEditing, handleSaveItemLabel, value, spaceId, ...other } = props;

		return (
			<Box className="nav-item">
				<TreeItem2LabelInput
					defaultValue={value}
					{...other}
				/>
			</Box>
		);
	}

	const CustomTreeItem = React.forwardRef(function CustomTreeItem(props: TreeItem2Props, ref: React.Ref<HTMLLIElement>) {
		const space = spaces.find((space) => space.id === props.itemId);
		if (!space) return null;

		const { interactions, status } = useTreeItem2Utils({
			itemId: props.itemId,
			children: props.children,
		});

		return (
			<TreeItem2
				{...props}
				ref={ref}
				slots={{ label: CustomLabel, labelInput: CustomLabelInput }}
				slotProps={{
					label: {
						space: space,
						editable: status.editable,
						editing: status.editing,
						toggleItemEditing: interactions.toggleItemEditing,
					} as unknown as UseTreeItem2LabelSlotOwnProps & { space: Space; children?: React.ReactNode },
					labelInput: {
						spaceId: props.itemId,
						value: props.label,
						handleCancelItemLabelEditing: interactions.handleCancelItemLabelEditing,
						handleSaveItemLabel: interactions.handleSaveItemLabel,
					} as CustomLabelInputProps,
				}}
			/>
		);
	});

	const handleShowArchived = () => {
		setShowArchived((prev) => !prev);
		setStatusFilter((prev) => (prev === 'open' ? null : 'open'));
	};

	// function Droppable(props: { id: string; children: React.ReactNode }) {
	// 	const { setNodeRef } = useDroppable({
	// 		id: props.id,
	// 	});

	// 	return <div ref={setNodeRef}>{props.children}</div>;
	// }

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

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<>
			<Box className="nav-item nav-title">
				<span>Espaces</span>

				<IconButton
					className="menu-icon"
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
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					sx={{ mt: -0.75 }}
				>
					<MenuItem
						key="add-space"
						onClick={() => {
							setParentSpace(null);
							setModalOpen(true);
							handleMenuClose();
						}}
					>
						<ListItemIcon>
							<AddIcon />
						</ListItemIcon>
						<ListItemText>Ajouter un espace</ListItemText>
					</MenuItem>
					<MenuItem
						key="show-archived-spaces"
						onClick={() => {
							handleShowArchived();
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

			<RichTreeView
				id="spaces-nav"
				items={formatSpaces(spaces)}
				slots={{ item: CustomTreeItem }}
				isItemEditable={(item) => Boolean(item?.editable)}
				experimentalFeatures={{ labelEditing: true }}
				onItemLabelChange={(itemId, label) => updateName(itemId, label)}
			/>

			<SpaceForm
				open={modalOpen}
				handleClose={() => {
					setModalOpen(false);
					setParentSpace(null);
				}}
				parentSpace={parentSpace}
			/>
		</>
	);
};

export default SpacesTree;
