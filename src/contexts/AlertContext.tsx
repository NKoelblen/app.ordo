import { createContext, useContext, useState } from 'react';
import { Alert, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Définition du type Space
export interface AlertType {
	date: string;
	severity: 'success' | 'error' | 'warning' | 'info';
	message: string | undefined;
}

// Type du contexte
interface AlertsContextType {
	alerts: AlertType[];
	showAlert: (alert: AlertType) => void;
	removeAlert: (index: string) => void;
}

// Création du contexte
const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// Provider du contexte
export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [alerts, setAlerts] = useState<AlertType[]>([]);
	const [displayed, setdisplayed] = useState<string[]>([]);

	const showAlert = (alert: AlertType) => {
		setTimeout(() => {
			setdisplayed((prevDisplayed) => [...prevDisplayed, alert.date]);
		}, 300);
		setAlerts((prevAlerts) => [...prevAlerts, alert]);
		setTimeout(() => {
			handleRemoveWithTransition(alert.date);
		}, 3000);
	};

	const handleRemoveWithTransition = (date: string) => {
		setdisplayed((prevDisplayed) => prevDisplayed.filter((alert) => alert !== date));
		setTimeout(() => removeAlert(date), 300); // 300ms correspond à la durée de la transition
	};

	const removeAlert = (date: string) => {
		setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.date !== date));
	};

	return (
		<AlertsContext.Provider value={{ alerts, showAlert, removeAlert }}>
			{alerts.map((alert) => (
				<Collapse
					key={alert.date}
					in={displayed.includes(alert.date)}
				>
					<Alert
						className="alert"
						key={alert.date}
						variant="filled"
						severity={alert.severity}
						action={
							<IconButton
								aria-label="close"
								color="inherit"
								size="small"
								onClick={() => {
									handleRemoveWithTransition(alert.date);
								}}
							>
								<CloseIcon fontSize="inherit" />
							</IconButton>
						}
					>
						{alert.message}
					</Alert>
				</Collapse>
			))}
			{children}
		</AlertsContext.Provider>
	);
};

// Hook pour utiliser le contexte
export const useAlerts = (): AlertsContextType => {
	const context = useContext(AlertsContext);
	if (!context) {
		throw new Error("useAlerts doit être utilisé à l'intérieur d'un AlertsProvider");
	}
	return context;
};
