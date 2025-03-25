import { Link } from 'react-router-dom';
import { Drawer } from '@mui/material';
import SpacesTree from './SpacesTree';
import '../styles/components/Sidebar.scss';

const Sidebar = () => {
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

			<SpacesTree />
		</Drawer>
	);
};

export default Sidebar;
