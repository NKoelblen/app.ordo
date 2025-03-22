import { Drawer } from '@mui/material';
import { Link } from 'react-router-dom';
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
		</Drawer>
	);
};

export default Sidebar;
