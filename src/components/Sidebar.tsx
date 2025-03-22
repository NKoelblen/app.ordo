import { useState } from 'react';
import { Drawer, Menu, MenuItem, IconButton, Box } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Link } from 'react-router-dom';
import '../styles/components/Sidebar.scss';

const Sidebar = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

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

			<Box
				display="flex"
				alignItems="center"
				gap={2}
				className="nav-item nav-title"
			>
				{/* Titre */}
				<span>Espaces</span>

				{/* Bouton du menu */}
				<IconButton onClick={handleClick}>
					<MoreHorizIcon />
				</IconButton>

				{/* Menu déroulant */}
				<Menu
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
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
					<MenuItem onClick={handleClose}>Item 1</MenuItem>
					<MenuItem onClick={handleClose}>Item 2</MenuItem>
				</Menu>
			</Box>
		</Drawer>
	);
};

export default Sidebar;
