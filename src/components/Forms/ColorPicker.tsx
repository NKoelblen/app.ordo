import { Grid2 as Grid, Stack, Typography, useTheme } from '@mui/material';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import { getContrastColor } from '../../utilities';
import Picker from './Picker';
import '../../styles/components/colorPicker.scss';

interface ColorPickerProps {
	color: string | undefined;
	onColorChange: (color: string) => void;
}
const ColorPicker = ({ color, onColorChange }: ColorPickerProps) => {
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

	return (
		<Picker
			className="color-picker"
			label="Couleur"
			icon={<InvertColorsIcon />}
			sx={{ backgroundColor: color, border: `1px solid ${theme.palette.divider}`, color: color ? getContrastColor(color, theme) : 'inherit' }}
		>
			<Grid
				container
				className="color-grid"
			>
				{Object.entries(colorValues).map(([colorName, shades]) => (
					<Grid
						className="color-item"
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
										onColorChange(shade);
									}}
								>
									<Stack
										className="shade"
										sx={{ border: `1px solid ${color === shade ? getContrastColor(shade, theme) : 'transparent'}` }}
									>
										<Typography sx={{ color: getContrastColor(shade, theme) }}>{shade}</Typography>
									</Stack>
								</Stack>
							))}
						</Stack>
					</Grid>
				))}
			</Grid>
		</Picker>
	);
};

export default ColorPicker;
