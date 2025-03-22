import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Assure-toi que le chemin est correct

const rootElement = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(rootElement);

root.render(
	<React.StrictMode>
		{/* Le Router doit encapsuler l'ensemble de l'application */}
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);
