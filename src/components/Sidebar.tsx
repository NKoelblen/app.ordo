import React, { useState } from 'react';
import { Drawer, Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Box, TextField, Checkbox, FormControlLabel, List, ListItem, Collapse, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import {
	MoreHoriz as MoreHorizIcon,
	Add as AddIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Archive as ArchiveIcon,
	Unarchive as UnarchiveIcon,
	ExpandMore as ExpandMoreIcon,
	ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useSpaces, Space } from '../contexts/SpaceContext';
import AddSpaceModal from './SpaceForm';
import '../styles/components/Sidebar.scss';

const Sidebar = () => {
	const { spaces, updateSpaceName, updateSpaceProfessional, updateSpaceStatus, deleteSpace, setStatusFilter } = useSpaces();
	const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
	const [showArchivedSpaces, setShowrchivedSpaces] = useState(false);
	const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

	const [isEditingSpace, setIsEditingSpace] = useState<{ [key: string]: boolean }>({});
	const [currentSpaceName, setCurrentSpaceName] = useState<string>('');
	const [newSpaceName, setNewSpaceName] = useState<string>(currentSpaceName);

	if (!Array.isArray(spaces)) {
		return <div>Chargement...</div>;
	}

	const buildHierarchy = (spaces: Space[]): (Space & { children: Space[] })[] => {
		const spaceMap: Map<string, Space & { children: Space[] }> = new Map();

		// Initialiser chaque espace avec un tableau `children`
		spaces.forEach((space) => {
			spaceMap.set(space.id, { ...space, children: [] });
		});

		const rootSpaces: (Space & { children: Space[] })[] = [];

		// Construire la hiérarchie
		spaces.forEach((space) => {
			if (space.parent?.id) {
				const parentSpace = spaceMap.get(space.parent.id);
				if (parentSpace) {
					parentSpace.children.push(spaceMap.get(space.id)!);
				}
			} else {
				rootSpaces.push(spaceMap.get(space.id)!);
			}
		});

		return rootSpaces;
	};

	const renderSpaces = (spaces: (Space & { children: Space[] })[], level: number = 2) => {
		return (
			<List>
				{spaces.map((space) => (
					<React.Fragment key={space.id}>
						<ListItem className="nav-item">
							{space.children.length > 0 && (
								<IconButton
									className="expand-icon"
									size="small"
									onClick={() => toggleExpandSpace(space.id)}
								>
									{expandedSpaces.has(space.id) ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
								</IconButton>
							)}

							{isEditingSpace[space.id] ? (
								<TextField
									inputRef={(el) => {
										if (el && isEditingSpace[space.id]) {
											el.focus();
										}
									}}
									value={newSpaceName}
									onChange={(event) => setNewSpaceName(event.target.value)}
									onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(event, space.id)}
									fullWidth
								/>
							) : (
								<Box className="nav-item-summary">
									<span>{space.name}</span>
									{space.status === 'archived' && <ArchiveIcon />}
								</Box>
							)}

							<IconButton
								size="small"
								className="menu-icon"
								onClick={(e) => handleMenuOpen(e, space.status === 'archived' ? 'archivedSpaceMenu' : 'spaceMenu', space)}
							>
								<MoreHorizIcon fontSize="inherit" />
							</IconButton>
						</ListItem>

						{space.children.length > 0 && (
							<Collapse
								in={expandedSpaces.has(space.id)}
								timeout="auto"
								unmountOnExit
								style={{ paddingLeft: `${level * 0.5}rem` }}
							>
								{renderSpaces(space.children, level + 1)}
							</Collapse>
						)}
					</React.Fragment>
				))}
			</List>
		);
	};

	const handleShowArchivedSpaces = () => {
		setShowrchivedSpaces((prev) => !prev);
		setStatusFilter((prev) => (prev === 'open' ? null : 'open'));
	};

	const handleUpdateSpaceName = (spaceId: string) => {
		if (newSpaceName !== currentSpaceName) {
			updateSpaceName(spaceId, newSpaceName);
			setIsEditingSpace((prev) => ({ ...prev, [spaceId]: false }));
		}
	};
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, spaceId: string) => {
		if (event.key === 'Enter') {
			handleUpdateSpaceName(spaceId);
		}
	};

	const handleUpdateSpaceProfessional = (spaceId: string, isSpaceProfessional: boolean) => {
		updateSpaceProfessional(spaceId, isSpaceProfessional);
		handleMenuClose();
	};

	const handleUpdateSpaceStatus = (spaceId: string, spaceStatus: 'open' | 'archived') => {
		updateSpaceStatus(spaceId, spaceStatus);
		handleMenuClose();
	};

	const handleDeleteSpace = (spaceId: string) => {
		deleteSpace(spaceId);
		handleMenuClose();
	};

	const toggleExpandSpace = (spaceId: string) => {
		setExpandedSpaces((prev) => {
			const newExpandedSpaces = new Set(prev);
			if (newExpandedSpaces.has(spaceId)) {
				newExpandedSpaces.delete(spaceId);
			} else {
				newExpandedSpaces.add(spaceId);
			}
			return newExpandedSpaces;
		});
	};

	const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
	const [menuType, setMenuType] = useState<string | null>(null);
	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, type: string, space?: Space) => {
		setMenuAnchorEl(event.currentTarget);
		setMenuType(type);
		if (space) {
			setSelectedSpace(space);
		}
	};
	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setSelectedSpace(null);
	};

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<Drawer
			anchor="left"
			variant="permanent"
			className="sidebar"
		>
			<Link
				to="/"
				className="sidebar-link sidebar-title"
			>
				Ordo
			</Link>

			<Box className="nav-item nav-title">
				<span>Espaces</span>

				<IconButton
					className="menu-icon"
					size="small"
					onClick={(e) => handleMenuOpen(e, 'spacesMenu')}
				>
					<MoreHorizIcon fontSize="inherit" />
				</IconButton>
			</Box>

			{renderSpaces(buildHierarchy(spaces))}

			{/* Menu */}
			<Menu
				className="menu"
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
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
				{menuType === 'spacesMenu' && [
					<MenuItem
						key="add-space"
						onClick={() => {
							setModalOpen(true);
							handleMenuClose();
						}}
					>
						<ListItemIcon>
							<AddIcon />
						</ListItemIcon>
						<ListItemText>Ajouter un espace</ListItemText>
					</MenuItem>,
					<MenuItem
						key="show-archived-spaces"
						onClick={() => {
							handleShowArchivedSpaces();
						}}
					>
						<ListItemIcon>
							<ArchiveIcon />
						</ListItemIcon>
						<ListItemText>{showArchivedSpaces ? 'Masquer' : 'Afficher '} les espaces archivés</ListItemText>
					</MenuItem>,
				]}
				{menuType === 'spaceMenu' &&
					selectedSpace && [
						<MenuItem
							key={`rename-space-${selectedSpace.id}`}
							onClick={() => {
								if (selectedSpace) {
									setIsEditingSpace((prev) => ({ ...prev, [selectedSpace.id]: true }));
									setCurrentSpaceName(selectedSpace.name);
									setNewSpaceName(selectedSpace.name);
								}
								handleMenuClose();
							}}
						>
							<ListItemIcon>
								<EditIcon />
							</ListItemIcon>
							<ListItemText>Renommer</ListItemText>
						</MenuItem>,
						<MenuItem
							className="menu-item-checkbox"
							key={`update-space-professional-${selectedSpace.id}`}
						>
							<FormControlLabel
								control={
									<Checkbox
										className="menu-item-checkbox-input"
										checked={selectedSpace?.professional || false}
										onChange={(event, checked) => {
											if (selectedSpace) {
												handleUpdateSpaceProfessional(selectedSpace.id, checked);
											}
										}}
										disabled={selectedSpace?.parent !== null}
									/>
								}
								label="Professionnel"
							/>
						</MenuItem>,
						<Divider />,
						<MenuItem
							key={`archive-space-${selectedSpace.id}`}
							onClick={() => {
								handleUpdateSpaceStatus(selectedSpace.id, 'archived');
							}}
						>
							<ListItemIcon>
								<ArchiveIcon />
							</ListItemIcon>
							<ListItemText>Archiver</ListItemText>
						</MenuItem>,
						<MenuItem
							key={`delete-space-${selectedSpace.id}`}
							onClick={() => handleDeleteSpace(selectedSpace.id)}
						>
							<ListItemIcon>
								<DeleteIcon />
							</ListItemIcon>
							<ListItemText>Supprimer</ListItemText>
						</MenuItem>,
					]}
				{menuType === 'archivedSpaceMenu' &&
					selectedSpace && [
						<MenuItem
							key={`archive-space-${selectedSpace.id}`}
							onClick={() => {
								handleUpdateSpaceStatus(selectedSpace.id, 'open');
							}}
						>
							<ListItemIcon>
								<UnarchiveIcon />
							</ListItemIcon>
							<ListItemText>Restaurer</ListItemText>
						</MenuItem>,
						<MenuItem
							key={`delete-space-${selectedSpace.id}`}
							onClick={() => handleDeleteSpace(selectedSpace.id)}
						>
							<ListItemIcon>
								<DeleteIcon />
							</ListItemIcon>
							<ListItemText>Supprimer</ListItemText>
						</MenuItem>,
					]}
			</Menu>

			<AddSpaceModal
				open={modalOpen}
				handleClose={() => setModalOpen(false)}
			/>
		</Drawer>
	);
};

export default Sidebar;
