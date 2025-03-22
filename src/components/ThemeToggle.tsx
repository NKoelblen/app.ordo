// components/ThemeToggle.tsx
import { IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import '../styles/components/ThemeToggle.scss';

interface ThemeToggleProps {
	toggleTheme: () => void;
	isDarkMode: boolean;
}

const ThemeToggleButton = ({ toggleTheme, isDarkMode }: ThemeToggleProps) => {
	return (
		<IconButton
			onClick={toggleTheme}
			className="theme-toggle"
		>
			{isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
		</IconButton>
	);
};

export default ThemeToggleButton;
