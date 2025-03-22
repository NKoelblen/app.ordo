// src/theme.ts
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
	palette: {
		mode: 'dark', // Active le mode sombre
	},
});

const lightTheme = createTheme({
	palette: {
		mode: 'light', // Mode clair
	},
});

export { darkTheme, lightTheme };
