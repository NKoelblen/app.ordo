import { useState } from 'react';
import { Drawer, Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Box, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { MoreHoriz as MoreHorizIcon, Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSpaces } from '../contexts/SpaceContext';
import AddSpaceModal from './SpaceForm';
import '../styles/components/Sidebar.scss';

const Sidebar = () => {
	const { spaces, deleteSpace, updateSpaceName } = useSpaces();
	const [selectedSpace, setSelectedSpace] = useState<string | null>(null);

	const [isEditingSpace, setIsEditingSpace] = useState<{ [key: string]: boolean }>({});
	const [currentSpaceName, setCurrentSpaceName] = useState<string>('');
	const [newSpaceName, setNewSpaceName] = useState<string>(currentSpaceName);

	if (!Array.isArray(spaces)) {
		return <div>Chargement...</div>;
	}

	const handleUpdateSpaceName = (spaceId: string) => {
		if (newSpaceName !== currentSpaceName) {
			updateSpaceName(spaceId, newSpaceName);
			setIsEditingSpace((prev) => ({ ...prev, [spaceId]: false }));
		}
	};
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			handleUpdateSpaceName(String(selectedSpace));
		}
	};

	const handleDelete = () => {
		if (selectedSpace !== null) {
			deleteSpace(String(selectedSpace));
		}
		handleMenuClose(`spaceMenu-${selectedSpace}`);
	};

	const [anchorEls, setAnchorEls] = useState<{ [key: string]: HTMLElement | null }>({});
	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, menuId: string) => {
		setAnchorEls((prev) => ({ ...prev, [menuId]: event.currentTarget }));
	};
	const handleMenuClose = (menuId: string) => {
		setAnchorEls((prev) => ({ ...prev, [menuId]: null }));
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
				{/* Titre */}
				<span>Espaces</span>

				{/* Bouton du menu */}
				<IconButton onClick={(e) => handleMenuOpen(e, 'mainMenu')}>
					<MoreHorizIcon />
				</IconButton>

				{/* Menu déroulant */}
				<Menu
					anchorEl={anchorEls['mainMenu']}
					open={Boolean(anchorEls['mainMenu'])}
					onClose={() => handleMenuClose('mainMenu')}
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
						onClick={() => {
							setModalOpen(true); // Ouvre le modal
							handleMenuClose('mainMenu'); // Ferme le menu
						}}
					>
						<ListItemIcon>
							<AddIcon />
						</ListItemIcon>
						<ListItemText>Ajouter un espace</ListItemText>
					</MenuItem>
					<MenuItem onClick={() => handleMenuClose('mainMenu')}>Item 2</MenuItem>
				</Menu>
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
								// onBlur={() => handleUpdateSpaceName(String(selectedSpace))}
								onKeyDown={handleKeyDown}
								fullWidth
							/>
						) : (
							<span>{space.name}</span> // Afficher le nom actuel de l'espace
						)}
						{/* Bouton du menu */}
						<IconButton
							onClick={(e) => {
								handleMenuOpen(e, `spaceMenu-${space.id}`);
								setSelectedSpace(space.id);
							}}
						>
							<MoreHorizIcon />
						</IconButton>

						{/* Menu déroulant */}
						<Menu
							anchorEl={anchorEls[`spaceMenu-${space.id}`]}
							open={Boolean(anchorEls[`spaceMenu-${space.id}`])}
							onClose={() => handleMenuClose(`spaceMenu-${space.id}`)}
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
								onClick={() => {
									setIsEditingSpace((prev) => ({ ...prev, [space.id]: true }));
									setCurrentSpaceName(space.name);
									setNewSpaceName(space.name);
									handleMenuClose(`spaceMenu-${space.id}`);
								}}
							>
								<ListItemIcon>
									<EditIcon />
								</ListItemIcon>
								<ListItemText>Renommer</ListItemText>
							</MenuItem>
							<MenuItem onClick={handleDelete}>
								<ListItemIcon>
									<DeleteIcon />
								</ListItemIcon>
								<ListItemText>Supprimer</ListItemText>
							</MenuItem>
						</Menu>
					</li>
				))}
			</ul>

			<AddSpaceModal
				open={modalOpen}
				handleClose={() => setModalOpen(false)}
			/>
		</Drawer>
	);
};

export default Sidebar;
