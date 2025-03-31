import { useParams } from 'react-router-dom';
import { useSpaces } from '../contexts/SpaceContext';
import { Box, CircularProgress, Stack, useTheme } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import { getContrastColor } from '../utilities';
import '../styles/pages/SingleSpace.scss';

const SingleSpace = () => {
	const { id } = useParams<{ id: string }>();
	const { spaces } = useSpaces();
	const space = spaces.find((space) => space.id === `/spaces/${id}`);
	const IconComponent = space?.icon ? (MuiIcons as any)[space.icon] : null;
	const theme = useTheme();

	if (!space) {
		return <CircularProgress className="loading" />;
	}

	return (
		<>
			<Stack
				className="space-header"
				direction="row"
			>
				<Box
					className="space-icon"
					style={{ '--background-color': space.color } as React.CSSProperties}
					sx={{
						backgroundColor: space.color,
						color: space.color ? getContrastColor(space.color, theme) : 'inherit',
					}}
				>
					{space.icon ? <IconComponent /> : space.name.charAt(0).toUpperCase()}
				</Box>
				<h1>{space.name}</h1>
			</Stack>
			<p>Ceci est le contenu principal de l'espace.</p>
		</>
	);
};

export default SingleSpace;
