import { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from './theme/theme';
import '@mui/material/styles';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
// import './App.css';
import './styles/base/base.scss';
import ThemeToggle from './components/ThemeToggle';
import Sidebar from './components/Sidebar';

const App = () => {
	const [isDarkMode, setIsDarkMode] = useState(true);
	const toggleTheme = () => {
		setIsDarkMode((prevMode) => !prevMode);
	};
	const theme = isDarkMode ? darkTheme : lightTheme;

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<div
				className={isDarkMode ? 'dark-mode' : 'light-mode'}
				style={{ '--border-color': theme.palette.divider } as React.CSSProperties}
			>
				<Sidebar />
				<ThemeToggle
					toggleTheme={toggleTheme}
					isDarkMode={isDarkMode}
				/>
				<h1>Bienvenue sur Ordo</h1>
				<p>Ceci est le contenu principal de l'application.</p>
			</div>
		</ThemeProvider>
	);
};

export default App;
