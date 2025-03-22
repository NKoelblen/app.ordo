import { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from './theme/theme';
import '@mui/material/styles';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './styles/base/base.scss';
import ThemeToggle from './components/ThemeToggle';
import Sidebar from './components/Sidebar';

const App = () => {
	const [isDarkMode, setIsDarkMode] = useState(true); // Par défaut, mode sombre

	// Bascule entre les modes sombre et clair
	const toggleTheme = () => {
		setIsDarkMode((prevMode) => !prevMode);
	};

	return (
		<ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
			<CssBaseline />
			<div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
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
