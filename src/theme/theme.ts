// src/theme.ts
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
	colorSchemes: {
		dark: true,
		light: false,
	},
	palette: {
		mode: 'dark',
	},
});

const lightTheme = createTheme({
	colorSchemes: {
		dark: false,
		light: true,
	},
	palette: {
		mode: 'light',
	},
});

export { darkTheme, lightTheme };
