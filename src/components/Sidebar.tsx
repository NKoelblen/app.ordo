import { useState } from 'react';
import { Drawer, Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Box, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { MoreHoriz as MoreHorizIcon, Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Archive as ArchiveIcon, Unarchive as UnarchiveIcon } from '@mui/icons-material';
import { useSpaces, Space } from '../contexts/SpaceContext';
import AddSpaceModal from './SpaceForm';
import '../styles/components/Sidebar.scss';

const Sidebar = () => {
	const { spaces, updateSpaceName, updateSpaceProfessional, updateSpaceStatus, deleteSpace, setStatusFilter } = useSpaces();
	const [showArchivedSpaces, setShowrchivedSpaces] = useState(false);
	const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

	const [isEditingSpace, setIsEditingSpace] = useState<{ [key: string]: boolean }>({});
	const [currentSpaceName, setCurrentSpaceName] = useState<string>('');
	const [newSpaceName, setNewSpaceName] = useState<string>(currentSpaceName);

	if (!Array.isArray(spaces)) {
		return <div>Chargement...</div>;
	}

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

				<IconButton onClick={(e) => handleMenuOpen(e, 'spacesMenu')}>
					<MoreHorizIcon />
				</IconButton>
			</Box>

			<ul>
				{spaces.map((space) => (
					<li
						key={space.id}
						className="nav-item"
					>
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
							<Box>
								<span>{space.name}</span>
								{space.status === 'archived' && <ArchiveIcon />}{' '}
							</Box>
						)}
						{/* Bouton du menu */}
						<IconButton onClick={(e) => handleMenuOpen(e, space.status === 'archived' ? 'archivedSpaceMenu' : 'spaceMenu', space)}>
							<MoreHorizIcon />
						</IconButton>
					</li>
				))}
			</ul>

			{/* Menu */}
			<Menu
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
						<MenuItem key={`update-space-professional-${selectedSpace.id}`}>
							<FormControlLabel
								control={
									<Checkbox
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
