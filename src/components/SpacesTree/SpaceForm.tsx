import { useRef, useState } from 'react';
import {
	Modal,
	Box,
	TextField,
	Button,
	Typography,
	Fade,
	Backdrop,
	FormControlLabel,
	Checkbox,
	InputLabel,
	Popover,
	Grid2 as Grid,
	Stack,
	IconButton,
	useTheme,
} from '@mui/material';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
// import { SwatchesPicker } from 'react-color';
import { useSpaces } from '../../contexts/SpaceContext';
import '../../styles/components/colorPicker.scss';
import { Space } from '../../contexts/SpaceContext';

const modalStyle = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
	borderRadius: '8px',
};

interface SpaceFormProps {
	open: boolean;
	handleClose: () => void;
	parentSpace?: Space | null;
}

const SpaceForm = ({ open, handleClose, parentSpace }: SpaceFormProps) => {
	const { addSpace } = useSpaces();
	const [name, setName] = useState('');
	const [professional, setProfessional] = useState(false);
	const [color, setColor] = useState<string | null>(null);
	const colorValues = {
		Rouge: {
			100: '#ffcdd2',
			300: '#e57373',
			500: '#f44336',
			700: '#d32f2f',
			900: '#b71c1c',
		},
		Rose: {
			100: '#f8bbd0',
			300: '#f06292',
			500: '#e91e63',
			700: '#c2185b',
			900: '#880e4f',
		},
		Violet: {
			100: '#e1bee7',
			300: '#ba68c8',
			500: '#9c27b0',
			700: '#7b1fa2',
			900: '#4a148c',
		},
		'Violet foncé': {
			100: '#d1c4e9',
			300: '#9575cd',
			500: '#673ab7',
			700: '#512da8',
			900: '#311b92',
		},
		Indigo: {
			100: '#c5cae9',
			300: '#7986cb',
			500: '#3f51b5',
			700: '#303f9f',
			900: '#1a237e',
		},
		Bleu: {
			100: '#bbdefb',
			300: '#64b5f6',
			500: '#2196f3',
			700: '#1976d2',
			900: '#0d47a1',
		},
		'Bleu clair': {
			100: '#b3e5fc',
			300: '#4fc3f7',
			500: '#03a9f4',
			700: '#0288d1',
			900: '#01579b',
		},
		Cyan: {
			100: '#b2ebf2',
			300: '#4dd0e1',
			500: '#00bcd4',
			700: '#0097a7',
			900: '#006064',
		},
		Sarcelle: {
			100: '#b2dfdb',
			300: '#4db6ac',
			500: '#009688',
			700: '#00796b',
			900: '#004d40',
		},
		Vert: {
			100: '#c8e6c9',
			300: '#81c784',
			500: '#4caf50',
			700: '#388e3c',
			900: '#1b5e20',
		},
		'Vert clair': {
			100: '#dcedc8',
			300: '#aed581',
			500: '#8bc34a',
			700: '#689f38',
			900: '#33691e',
		},
		'Citron vert': {
			100: '#f0f4c3',
			300: '#dce775',
			500: '#cddc39',
			700: '#afb42b',
			900: '#827717',
		},
		Jaune: {
			100: '#fff9c4',
			300: '#fff176',
			500: '#ffeb3b',
			700: '#fbc02d',
			900: '#f57f17',
		},
		Ambre: {
			100: '#ffecb3',
			300: '#ffd54f',
			500: '#ffc107',
			700: '#ffa000',
			900: '#ff6f00',
		},
		Orange: {
			100: '#ffe0b2',
			300: '#ffb74d',
			500: '#ff9800',
			700: '#f57c00',
			900: '#e65100',
		},
		'Orange foncé': {
			100: '#ffccbc',
			300: '#ff8a65',
			500: '#ff5722',
			700: '#e64a19',
			900: '#bf360c',
		},
		Marron: {
			100: '#d7ccc8',
			300: '#a1887f',
			500: '#795548',
			700: '#5d4037',
			900: '#3e2723',
		},
		Doré: {
			100: '#e3d0b4',
			300: '#ac936e',
			500: '#806536',
			700: '#674d27',
			900: '#4b3114',
		},
		Gris: {
			100: '#cfd8dc',
			300: '#90a4ae',
			500: '#607d8b',
			700: '#455a64',
			900: '#263238',
		},
	};
	const theme = useTheme();
	function getContrastColor(hexColor: string): string {
		// Supprime le "#" si présent
		const color = hexColor.replace('#', '');

		// Convertit les composantes hexadécimales en valeurs décimales
		const r = parseInt(color.substring(0, 2), 16);
		const g = parseInt(color.substring(2, 4), 16);
		const b = parseInt(color.substring(4, 6), 16);

		// Calcule la luminosité relative (selon la formule WCAG)
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		// Retourne blanc pour les couleurs sombres, noir pour les couleurs claires
		return luminance > 0.5
			? theme.palette.mode === 'light'
				? theme.palette.text.primary
				: theme.palette.background.default
			: theme.palette.mode === 'light'
			? theme.palette.background.default
			: theme.palette.text.primary;
	}
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [icon, setIcon] = useState<string | null>(null);
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await addSpace({
			name,
			status: 'open',
			professional,
			color,
			icon,
			parent: parentSpace || null,
		});
		setName('');
		setProfessional(false);
		handleClose();
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			closeAfterTransition
			BackdropComponent={Backdrop}
			BackdropProps={{ timeout: 500 }}
		>
			<Fade in={open}>
				<Box sx={modalStyle}>
					<Typography
						variant="h6"
						component="h2"
						gutterBottom
					>
						{parentSpace ? `Ajouter un sous-espace à ${parentSpace.name}` : 'Ajouter un espace'}
					</Typography>
					<form onSubmit={handleSubmit}>
						<TextField
							fullWidth
							label="Nom"
							value={name}
							onChange={(e) => setName(e.target.value)}
							margin="normal"
							required
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={parentSpace ? parentSpace.professional : professional}
									onChange={(e) => setProfessional(e.target.checked)}
									disabled={!!parentSpace}
								/>
							}
							label="Professionnel"
						/>
						<Stack
							className="color-picker-container"
							direction="row"
						>
							<InputLabel>Couleur</InputLabel>
							<IconButton
								size="small"
								sx={{ backgroundColor: color, border: `1px solid ${theme.palette.divider}`, color: color ? getContrastColor(color) : 'inherit' }}
								className="color-input"
								onClick={(event) => setAnchorEl(event.currentTarget)}
							>
								<InvertColorsIcon />
							</IconButton>
							<Popover
								className="color-picker"
								open={Boolean(anchorEl)}
								anchorEl={anchorEl}
								onClose={() => setAnchorEl(null)}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'center',
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'center',
								}}
							>
								<Grid
									container
									className="color-grid"
								>
									{Object.entries(colorValues).map(([colorName, shades]) => (
										<Grid
											className="color-item"
											size={3}
											key={`${colorName}`}
										>
											<Typography className="color-name">{colorName}</Typography>
											<Stack className="shades">
												{Object.entries(shades).map(([index, shade]) => (
													<Stack
														className="shade-container"
														id={`${colorName}-${index}`}
														key={`${colorName}-${index}`}
														sx={{ backgroundColor: shade }}
														onClick={() => {
															setColor(shade);
														}}
													>
														<Stack
															className="shade"
															sx={{ border: color === shade ? `1px solid ${getContrastColor(shade)}` : '' }}
														>
															<Typography sx={{ color: getContrastColor(shade) }}>{shade}</Typography>
														</Stack>
													</Stack>
												))}
											</Stack>
										</Grid>
									))}
								</Grid>
							</Popover>
						</Stack>

						<Box
							display="flex"
							justifyContent="flex-end"
							mt={2}
						>
							<Button
								onClick={handleClose}
								color="secondary"
								sx={{ mr: 1 }}
							>
								Annuler
							</Button>
							<Button
								type="submit"
								variant="contained"
								color="primary"
							>
								Ajouter
							</Button>
						</Box>
					</form>
				</Box>
			</Fade>
		</Modal>
	);
};

export default SpaceForm;
