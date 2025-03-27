import { Link } from 'react-router-dom';
import { Drawer } from '@mui/material';
import SpacesTree from './SpacesTree/SpacesTree';
import '../styles/components/Sidebar.scss';
import '../styles/components/menu.scss';

const Sidebar = () => {
	return (
		<Drawer
			anchor="left"
			variant="permanent"
			id="sidebar"
		>
			<Link
				to="/"
				id="sidebar-title"
				className="sidebar-link"
			>
				Ordo
			</Link>

			<SpacesTree />
		</Drawer>
	);
};

export default Sidebar;
